import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {
    AuthPasswordField,
    AuthTextField,
    authPrimaryButtonClassName,
    authTextLinkClassName,
} from '../../components/auth/AuthFields';
import PasswordRequirements, {
    isPasswordStrong,
    PASSWORD_MIN_LENGTH,
} from '../../components/auth/PasswordRequirements';
import { ApiError, type ApiValidationErrors } from '../../api/client';
import { register } from '../../api/auth';

type FieldErrors = {
    name?: string;
    password?: string;
    passwordRepeat?: string;
};

const NAME_MAX_LENGTH = 50;

function messagesFor(errors: ApiValidationErrors | undefined, names: string[]) {
    if (!errors) return [];

    return names.flatMap((name) => errors[name] ?? []);
}

function nameFieldMessage(messages: string[]) {
    const message = messages[0];
    if (!message) return undefined;

    if (/at least 1 character/i.test(message) || /must not be empty/i.test(message)) {
        return 'Imię i nazwisko jest wymagane.';
    }

    if (/50 characters or fewer/i.test(message)) {
        return 'Imię i nazwisko może mieć najwyżej 50 znaków.';
    }

    return message;
}

function translateIdentityPasswordMessage(message: string) {
    if (/at least \d+ characters/i.test(message)) {
        return `Hasło musi mieć co najmniej ${PASSWORD_MIN_LENGTH} znaków.`;
    }
    if (/non alphanumeric/i.test(message)) {
        return 'Hasło musi zawierać co najmniej jeden znak specjalny.';
    }
    if (/one digit/i.test(message)) {
        return 'Hasło musi zawierać co najmniej jedną cyfrę.';
    }
    if (/one lowercase/i.test(message)) {
        return 'Hasło musi zawierać co najmniej jedną małą literę.';
    }
    if (/one uppercase/i.test(message)) {
        return 'Hasło musi zawierać co najmniej jedną wielką literę.';
    }

    return message;
}

function passwordFieldMessageFromDetail(detail: string) {
    if (!/Passwords must/i.test(detail)) return undefined;

    const parts = detail
        .split(/(?<=\.)\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map(translateIdentityPasswordMessage);

    return parts[0];
}

function mapInvitationFormError(detail: string) {
    if (/no invitation for this id/i.test(detail)) {
        return 'Brak zaproszenia lub link jest nieprawidłowy.';
    }

    if (/invitation has expired/i.test(detail)) {
        return 'To zaproszenie wygasło.';
    }

    return detail;
}

function validateName(name: string): string | undefined {
    if (name.length < 1) return 'Imię i nazwisko jest wymagane.';
    if (name.length > NAME_MAX_LENGTH) return 'Imię i nazwisko może mieć najwyżej 50 znaków.';
    return undefined;
}

function validatePassword(password: string): string | undefined {
    if (password.length < 1) return 'Hasło jest wymagane.';
    if (!isPasswordStrong(password)) return 'Hasło nie spełnia wszystkich wymagań.';
    return undefined;
}

function validateLocal(name: string, password: string, passwordRepeat: string): FieldErrors {
    const errors: FieldErrors = {};
    const nameError = validateName(name);
    const passwordError = validatePassword(password);

    if (nameError) errors.name = nameError;
    if (passwordError) errors.password = passwordError;
    if (password !== passwordRepeat) errors.passwordRepeat = 'Hasła nie są takie same.';

    return errors;
}

function mapApiError(error: ApiError): { fieldErrors: FieldErrors; formError: string | null } {
    const name = nameFieldMessage(messagesFor(error.errors, ['Name', 'name']));
    if (name) {
        return { fieldErrors: { name }, formError: null };
    }

    const passwordFromValidation = messagesFor(error.errors, ['Password', 'password'])[0];
    if (passwordFromValidation) {
        return {
            fieldErrors: { password: translateIdentityPasswordMessage(passwordFromValidation) },
            formError: null,
        };
    }

    const passwordFromDetail = passwordFieldMessageFromDetail(error.message);
    if (passwordFromDetail) {
        return { fieldErrors: { password: passwordFromDetail }, formError: null };
    }

    return {
        fieldErrors: {},
        formError: mapInvitationFormError(error.message),
    };
}

const RegisterInvitationPage: React.FC = () => {
    const navigate = useNavigate();
    const { invitationId: invitationIdParam } = useParams<{ invitationId: string }>();
    const invitationId = invitationIdParam?.trim() ?? '';
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);

    if (!invitationId) {
        return (
            <AuthLayout title="Utwórz konto">
                <div className="flex w-full flex-col gap-5">
                    <p className="text-[14px] leading-[21px] font-normal text-[#64748B]">Link jest niekompletny.</p>
                    <Link to="/login" className={authTextLinkClassName}>
                        Wróć do logowania
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Utwórz konto" subtitle="Uzupełnij dane, żeby dołączyć do workspace">
            <form
                className="flex w-full flex-col gap-5"
                noValidate
                onSubmit={async (event) => {
                    event.preventDefault();
                    if (isSubmitting) return;

                    const localErrors = validateLocal(fullName, password, passwordRepeat);
                    if (localErrors.name || localErrors.password || localErrors.passwordRepeat) {
                        setFieldErrors(localErrors);
                        setFormError(null);
                        return;
                    }

                    setFieldErrors({});
                    setFormError(null);
                    setIsSubmitting(true);

                    try {
                        await register(invitationId, {
                            name: fullName,
                            password,
                        });
                        navigate('/login');
                    } catch (error) {
                        if (error instanceof ApiError) {
                            const mapped = mapApiError(error);
                            setFieldErrors(mapped.fieldErrors);
                            setFormError(mapped.formError);
                        } else {
                            setFieldErrors({});
                            setFormError('Nie udało się utworzyć konta.');
                        }
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
            >
                <AuthTextField
                    label="Imię i nazwisko"
                    name="fullName"
                    autoComplete="name"
                    placeholder="Nina Kowalska"
                    value={fullName}
                    error={fieldErrors.name}
                    onChange={(event) => {
                        setFullName(event.target.value);
                        setFieldErrors((current) => ({ ...current, name: undefined }));
                    }}
                />
                <div className="flex w-full flex-col gap-2.5">
                    <AuthPasswordField
                        label="Hasło"
                        name="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={password}
                        error={fieldErrors.password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setFieldErrors((current) => ({ ...current, password: undefined }));
                        }}
                    />
                    <PasswordRequirements password={password} />
                </div>
                <AuthPasswordField
                    label="Powtórz hasło"
                    name="passwordRepeat"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={passwordRepeat}
                    error={fieldErrors.passwordRepeat}
                    onChange={(event) => {
                        setPasswordRepeat(event.target.value);
                        setFieldErrors((current) => ({ ...current, passwordRepeat: undefined }));
                    }}
                />
                {formError && (
                    <p className="text-[13px] leading-[19.5px] text-[#e7000b]" role="alert">
                        {formError}
                    </p>
                )}
                <button
                    type="submit"
                    className={`${authPrimaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                    disabled={isSubmitting}
                >
                    Utwórz konto
                </button>
            </form>
            <p className="text-center text-[13px] leading-[19.5px] font-normal text-[#64748B]">
                Masz już konto?{' '}
                <Link to="/login" className={authTextLinkClassName}>
                    Zaloguj się
                </Link>
            </p>
        </AuthLayout>
    );
};

export default RegisterInvitationPage;
