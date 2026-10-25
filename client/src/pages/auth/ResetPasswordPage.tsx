import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthPasswordField, authPrimaryButtonClassName, authTextLinkClassName } from '../../components/auth/AuthFields';
import PasswordRequirements, {
    isPasswordStrong,
    PASSWORD_MIN_LENGTH,
} from '../../components/auth/PasswordRequirements';
import { ApiError, type ApiValidationErrors } from '../../api/client';
import { resetPassword } from '../../api/auth';

type FieldErrors = {
    password?: string;
    passwordRepeat?: string;
};

function messagesFor(errors: ApiValidationErrors | undefined, names: string[]) {
    if (!errors) return [];
    return names.flatMap((name) => errors[name] ?? []);
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

function mapNewPasswordMessage(message: string): string {
    if (/at least 1 character/i.test(message) || /must not be empty/i.test(message)) {
        return 'Hasło jest wymagane.';
    }
    if (/128 characters or fewer/i.test(message)) {
        return 'Hasło może mieć najwyżej 128 znaków.';
    }
    return translateIdentityPasswordMessage(message);
}

function mapTokenOrEmailMessage(message: string, field: 'token' | 'email'): string {
    if (/at least 1 character/i.test(message) || /must not be empty/i.test(message)) {
        return field === 'token' ? 'Link jest niekompletny.' : 'E-mail jest wymagany.';
    }
    if (/not a valid email/i.test(message)) return 'Podaj poprawny adres e-mail.';
    if (/128 characters or fewer/i.test(message)) return 'E-mail może mieć najwyżej 128 znaków.';
    if (/1024 characters or fewer/i.test(message)) return 'Link jest nieprawidłowy lub wygasł.';
    return message;
}

function validatePassword(password: string): string | undefined {
    if (password.length < 1) return 'Hasło jest wymagane.';
    if (!isPasswordStrong(password)) return 'Hasło nie spełnia wszystkich wymagań.';
    return undefined;
}

function validateLocal(password: string, passwordRepeat: string): FieldErrors {
    const errors: FieldErrors = {};
    const passwordError = validatePassword(password);

    if (passwordError) errors.password = passwordError;
    if (password !== passwordRepeat) errors.passwordRepeat = 'Hasła nie są takie same.';

    return errors;
}

function mapApiError(error: ApiError): { fieldErrors: FieldErrors; formError: string | null } {
    if (/invalid or has expired/i.test(error.message)) {
        return { fieldErrors: {}, formError: 'Link jest nieprawidłowy lub wygasł.' };
    }

    const newPasswordMessage = messagesFor(error.errors, ['NewPassword', 'newPassword'])[0];
    if (newPasswordMessage) {
        return {
            fieldErrors: { password: mapNewPasswordMessage(newPasswordMessage) },
            formError: null,
        };
    }

    const passwordFromDetail = passwordFieldMessageFromDetail(error.message);
    if (passwordFromDetail) {
        return { fieldErrors: { password: passwordFromDetail }, formError: null };
    }

    const tokenMessage = messagesFor(error.errors, ['Token', 'token'])[0];
    if (tokenMessage) {
        return {
            fieldErrors: {},
            formError: mapTokenOrEmailMessage(tokenMessage, 'token'),
        };
    }

    const emailMessage = messagesFor(error.errors, ['Email', 'email'])[0];
    if (emailMessage) {
        return {
            fieldErrors: {},
            formError: mapTokenOrEmailMessage(emailMessage, 'email'),
        };
    }

    return {
        fieldErrors: {},
        formError: error.message || 'Nie udało się ustawić nowego hasła.',
    };
}

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email] = useState(() => searchParams.get('email')?.trim() ?? '');
    const [token] = useState(() => searchParams.get('token')?.trim() ?? '');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const linkComplete = email.length > 0 && token.length > 0;

    if (!linkComplete) {
        return (
            <AuthLayout title="Ustaw nowe hasło">
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
        <AuthLayout title="Ustaw nowe hasło" subtitle="Wpisz i powtórz nowe hasło.">
            <form
                className="flex w-full flex-col gap-5"
                noValidate
                onSubmit={async (event) => {
                    event.preventDefault();
                    if (isSubmitting) return;

                    const localErrors = validateLocal(password, passwordRepeat);
                    if (localErrors.password || localErrors.passwordRepeat) {
                        setFieldErrors(localErrors);
                        setFormError(null);
                        return;
                    }

                    setFieldErrors({});
                    setFormError(null);
                    setIsSubmitting(true);

                    try {
                        await resetPassword({
                            email,
                            token,
                            newPassword: password,
                        });
                        navigate('/login', { replace: true, state: { passwordReset: true } });
                    } catch (error) {
                        if (error instanceof ApiError) {
                            const mapped = mapApiError(error);
                            setFieldErrors(mapped.fieldErrors);
                            setFormError(mapped.formError);
                        } else {
                            setFieldErrors({});
                            setFormError('Nie udało się ustawić nowego hasła.');
                        }
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
            >
                <div className="flex w-full flex-col gap-2.5">
                    <AuthPasswordField
                        label="Nowe hasło"
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
                    Zapisz hasło
                </button>
                <Link to="/login" className={`${authTextLinkClassName} text-center`}>
                    Wróć do logowania
                </Link>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
