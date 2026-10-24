import React, { useEffect, useRef, useState } from 'react'
import SideBar from '../../components/layout/SideBar'
import TopBar from '../../components/layout/TopBar'
import { ApiError, type ApiValidationErrors } from '../../api/client'
import { getRoles, invite, type AuthRole } from '../../api/auth'

const ROLE_LABELS: Record<string, string> = {
    Admin: 'Admin',
    ProjectManager: 'Project Manager',
    StandardUser: 'Standard User',
}

const ROLE_ORDER = ['Admin', 'ProjectManager', 'StandardUser']

const fieldClassName = (invalid: boolean) =>
    `h-11 w-full rounded-[10px] border bg-white px-3 font-segoe-ui text-[14px] text-[#0A0A0A] outline-none placeholder:text-[#94A3B8] ${
        invalid ? 'border-[#e7000b] focus:border-[#e7000b]' : 'border-[#E2E8F0] focus:border-[#00BFFF]'
    }`

type FieldErrors = {
    userName?: string
    email?: string
}

/** Zgodne z domyślnym Identity AllowedUserNameCharacters. */
const IDENTITY_USERNAME_PATTERN = /^[a-zA-Z0-9._@+-]+$/
const USERNAME_MAX_LENGTH = 50
const EMAIL_MAX_LENGTH = 128

function messagesFor(errors: ApiValidationErrors | undefined, names: string[]) {
    if (!errors) return []

    return names.flatMap((name) => errors[name] ?? [])
}

function preferredMessage(messages: string[]) {
    const empty = messages.find((message) => /must not be empty|at least 1 character/i.test(message))
    const invalidEmail = messages.find((message) => /not a valid email/i.test(message))

    if (empty && invalidEmail) return empty
    return messages[0]
}

function fieldMessage(messages: string[], field: 'userName' | 'email') {
    const message = preferredMessage(messages)
    if (!message) return undefined

    if (/at least 1 character/i.test(message) || /must not be empty/i.test(message)) {
        return field === 'userName' ? 'Login jest wymagany.' : 'E-mail jest wymagany.'
    }

    if (/not a valid email/i.test(message)) return 'Podaj poprawny adres e-mail.'
    if (/50 characters or fewer/i.test(message)) return 'Login może mieć najwyżej 50 znaków.'
    if (/128 characters or fewer/i.test(message)) return 'E-mail może mieć najwyżej 128 znaków.'
    if (/is invalid, can only contain letters or digits/i.test(message)) {
        return 'Login może zawierać tylko litery, cyfry oraz znaki - . _ @ +'
    }

    return message
}

function validationFieldErrors(errors: ApiValidationErrors | undefined): FieldErrors {
    return {
        userName: fieldMessage(messagesFor(errors, ['UserName', 'userName']), 'userName'),
        email: fieldMessage(messagesFor(errors, ['Email', 'email']), 'email'),
    }
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateInviteLocal(userName: string, email: string): FieldErrors {
    const errors: FieldErrors = {}

    if (userName.length < 1) {
        errors.userName = 'Login jest wymagany.'
    } else if (userName.length > USERNAME_MAX_LENGTH) {
        errors.userName = 'Login może mieć najwyżej 50 znaków.'
    } else if (!IDENTITY_USERNAME_PATTERN.test(userName)) {
        errors.userName = 'Login może zawierać tylko litery, cyfry oraz znaki - . _ @ +'
    }

    if (email.length < 1) {
        errors.email = 'E-mail jest wymagany.'
    } else if (email.length > EMAIL_MAX_LENGTH) {
        errors.email = 'E-mail może mieć najwyżej 128 znaków.'
    } else if (!isValidEmail(email)) {
        errors.email = 'Podaj poprawny adres e-mail.'
    }

    return errors
}

const primaryButtonClassName =
    'inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] bg-[#00BFFF] px-4 font-segoe-ui text-[14px] leading-5 font-semibold text-white transition-colors hover:bg-[#00A8E0] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#00BFFF]'

const copiedButtonClassName =
    'inline-flex h-10 min-w-[96px] shrink-0 items-center justify-center rounded-[10px] bg-[#16A34A] px-4 font-segoe-ui text-[14px] leading-5 font-semibold text-white transition-colors hover:bg-[#15803D]'

function roleLabel(name: string) {
    return ROLE_LABELS[name] ?? name
}

function sortRoles(roles: AuthRole[]) {
    return [...roles].sort((left, right) => {
        const leftIndex = ROLE_ORDER.indexOf(left.name)
        const rightIndex = ROLE_ORDER.indexOf(right.name)

        if (leftIndex === -1 && rightIndex === -1) {
            return left.name.localeCompare(right.name)
        }

        if (leftIndex === -1) return 1
        if (rightIndex === -1) return -1
        return leftIndex - rightIndex
    })
}

const AdminPanelPage: React.FC = () => {
    const [roles, setRoles] = useState<AuthRole[]>([])
    const [rolesReady, setRolesReady] = useState(false)
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
    const [userName, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [formError, setFormError] = useState<string | null>(null)
    const [invitationId, setInvitationId] = useState<string | null>(null)
    const [linkCopied, setLinkCopied] = useState(false)
    const copyResetTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        let cancelled = false

        getRoles()
            .then((loadedRoles) => {
                if (cancelled) return

                const ordered = sortRoles(loadedRoles)
                const admin = ordered.find((role) => role.name === 'Admin')

                setRoles(ordered)
                setSelectedRoleId(admin?.id ?? ordered[0]?.id ?? null)
                setRolesReady(true)
            })
            .catch((error: unknown) => {
                if (cancelled) return
                setRolesReady(true)
                setFormError(error instanceof ApiError ? error.message : 'Nie udało się pobrać ról.')
            })

        return () => {
            cancelled = true
            if (copyResetTimeoutRef.current !== null) {
                window.clearTimeout(copyResetTimeoutRef.current)
            }
        }
    }, [])

    const invitationUrl = invitationId ? `${window.location.origin}/rejestracja/${invitationId}` : null

    const handleGenerateLink = async () => {
        if (isSubmitting || !rolesReady) return

        const localErrors = validateInviteLocal(userName, email)
        if (localErrors.userName || localErrors.email) {
            setFieldErrors(localErrors)
            setFormError(null)
            return
        }

        if (!selectedRoleId) {
            setFieldErrors({})
            setFormError('Wybierz rolę.')
            return
        }

        setFieldErrors({})
        setFormError(null)
        setIsSubmitting(true)

        try {
            const id = await invite({
                userName,
                email,
                roles: [selectedRoleId],
            })
            const admin = roles.find((role) => role.name === 'Admin')

            setInvitationId(id)
            setUserName('')
            setEmail('')
            setSelectedRoleId(admin?.id ?? roles[0]?.id ?? null)
            setFieldErrors({})
            setFormError(null)
            setLinkCopied(false)
            if (copyResetTimeoutRef.current !== null) {
                window.clearTimeout(copyResetTimeoutRef.current)
                copyResetTimeoutRef.current = null
            }
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
                setFieldErrors({ email: error.message })
            } else if (error instanceof ApiError) {
                const nextFieldErrors = validationFieldErrors(error.errors)
                if (nextFieldErrors.userName || nextFieldErrors.email) {
                    setFieldErrors(nextFieldErrors)
                } else {
                    setFormError(error.message)
                }
            } else {
                setFormError('Nie udało się wygenerować linku.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCopy = async () => {
        if (!invitationUrl) return

        try {
            await navigator.clipboard.writeText(invitationUrl)
            setLinkCopied(true)
            if (copyResetTimeoutRef.current !== null) {
                window.clearTimeout(copyResetTimeoutRef.current)
            }
            copyResetTimeoutRef.current = window.setTimeout(() => {
                setLinkCopied(false)
                copyResetTimeoutRef.current = null
            }, 2000)
        } catch {
            setFormError('Nie udało się skopiować linku.')
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="px-8 py-6">
                    <h1 className="mb-6 font-segoe-ui text-[24px] leading-8 font-normal text-[#0A0A0A] antialiased">
                        Panel administratora
                    </h1>

                    <section className="max-w-[880px] rounded-[14px] border border-[#E5E7EB] bg-white p-6">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-segoe-ui text-[16px] leading-6 font-semibold text-[#0A0A0A] antialiased">
                                Dodaj nowego użytkownika
                            </h2>
                            <button
                                type="button"
                                className={primaryButtonClassName}
                                disabled={isSubmitting}
                                onClick={() => {
                                    void handleGenerateLink()
                                }}
                            >
                                Generuj link
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="admin-login" className="font-segoe-ui text-[14px] leading-5 text-[#0A0A0A]">
                                    Login
                                </label>
                                <input
                                    id="admin-login"
                                    type="text"
                                    placeholder="nina.kowalska"
                                    value={userName}
                                    autoComplete="off"
                                    maxLength={USERNAME_MAX_LENGTH}
                                    aria-invalid={Boolean(fieldErrors.userName)}
                                    aria-describedby={
                                        fieldErrors.userName ? 'admin-login-error' : 'admin-login-hint'
                                    }
                                    onChange={(event) => {
                                        setUserName(event.target.value)
                                        setFieldErrors((current) => ({ ...current, userName: undefined }))
                                    }}
                                    className={fieldClassName(Boolean(fieldErrors.userName))}
                                />
                                {fieldErrors.userName ? (
                                    <p id="admin-login-error" className="font-segoe-ui text-[13px] leading-5 text-[#e7000b]" role="alert">
                                        {fieldErrors.userName}
                                    </p>
                                ) : (
                                    <p id="admin-login-hint" className="font-segoe-ui text-[12px] leading-[18px] text-[#94A3B8]">
                                        Litery, cyfry oraz znaki - . _ @ + (bez spacji)
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="admin-email" className="font-segoe-ui text-[14px] leading-5 text-[#0A0A0A]">
                                    E-mail
                                </label>
                                <input
                                    id="admin-email"
                                    type="email"
                                    placeholder="nina.kowalska@firma.pl"
                                    value={email}
                                    aria-invalid={Boolean(fieldErrors.email)}
                                    aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
                                    onChange={(event) => {
                                        setEmail(event.target.value)
                                        setFieldErrors((current) => ({ ...current, email: undefined }))
                                    }}
                                    className={fieldClassName(Boolean(fieldErrors.email))}
                                />
                                {fieldErrors.email && (
                                    <p id="admin-email-error" className="font-segoe-ui text-[13px] leading-5 text-[#e7000b]" role="alert">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="font-segoe-ui text-[14px] leading-5 text-[#0A0A0A]">Rola</p>
                                <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Rola">
                                    {roles.map((option) => {
                                        const selected = selectedRoleId === option.id

                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                onClick={() => setSelectedRoleId(option.id)}
                                                className={`inline-flex h-8 items-center rounded-full border bg-white px-4 font-segoe-ui text-[14px] leading-none transition-colors ${
                                                    selected
                                                        ? 'border-[#00BFFF] text-[#00BFFF] hover:border-[#00A8E0] hover:text-[#00A8E0]'
                                                        : 'border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                                                }`}
                                            >
                                                {roleLabel(option.name)}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {formError && (
                            <p className="mt-5 font-segoe-ui text-[14px] leading-5 text-[#e7000b]" role="alert">
                                {formError}
                            </p>
                        )}
                    </section>

                    {invitationUrl && (
                        <section className="mt-6 max-w-[880px] rounded-[14px] border border-[#E5E7EB] bg-white p-6">
                            <div className="flex items-center justify-between gap-4">
                                <p className="min-w-0 break-all font-segoe-ui text-[14px] leading-5 text-[#0A0A0A]">
                                    {invitationUrl}
                                </p>
                                <button
                                    type="button"
                                    className={linkCopied ? copiedButtonClassName : primaryButtonClassName}
                                    onClick={() => {
                                        void handleCopy()
                                    }}
                                    aria-live="polite"
                                >
                                    {linkCopied ? 'Skopiowano!' : 'Kopiuj'}
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    )
}

export default AdminPanelPage
