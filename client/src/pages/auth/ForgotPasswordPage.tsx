import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthTextField, authPrimaryButtonClassName, authTextLinkClassName } from '../../components/auth/AuthFields';
import { ApiError, type ApiValidationErrors } from '../../api/client';
import { forgotPassword } from '../../api/auth';

const EMAIL_MAX_LENGTH = 128;
const SUCCESS_MESSAGE =
    'Jeśli konto z tym adresem istnieje, wysłaliśmy link do ustawienia nowego hasła.';

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateEmailLocal(email: string): string | null {
    if (email.length < 1) return 'E-mail jest wymagany.';
    if (email.length > EMAIL_MAX_LENGTH) return 'E-mail może mieć najwyżej 128 znaków.';
    if (!isValidEmail(email)) return 'Podaj poprawny adres e-mail.';
    return null;
}

function messagesFor(errors: ApiValidationErrors | undefined, names: string[]) {
    if (!errors) return [];
    return names.flatMap((name) => errors[name] ?? []);
}

function mapEmailValidationMessage(message: string): string {
    if (/at least 1 character/i.test(message) || /must not be empty/i.test(message)) {
        return 'E-mail jest wymagany.';
    }
    if (/not a valid email/i.test(message)) return 'Podaj poprawny adres e-mail.';
    if (/128 characters or fewer/i.test(message)) return 'E-mail może mieć najwyżej 128 znaków.';
    return message;
}

function mapApiError(error: ApiError): string {
    const emailMessages = messagesFor(error.errors, ['Email', 'email']);
    const preferred =
        emailMessages.find((message) => /must not be empty|at least 1 character/i.test(message)) ??
        emailMessages.find((message) => /not a valid email/i.test(message)) ??
        emailMessages[0];

    if (preferred) return mapEmailValidationMessage(preferred);

    return error.message || 'Nie udało się wysłać linku.';
}

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    if (sent) {
        return (
            <AuthLayout title="Nie pamiętasz hasła?" subtitle="Sprawdź skrzynkę e-mail.">
                <div className="flex w-full flex-col gap-5">
                    <p className="text-[14px] leading-[21px] font-normal text-[#334155]" role="status">
                        {SUCCESS_MESSAGE}
                    </p>
                    <Link to="/login" className={`${authTextLinkClassName} text-center`}>
                        Wróć do logowania
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Nie pamiętasz hasła?"
            subtitle="Podaj adres e-mail, a wyślemy link do ustawienia nowego hasła."
        >
            <form
                className="flex w-full flex-col gap-5"
                noValidate
                onSubmit={async (event) => {
                    event.preventDefault();
                    if (isSubmitting) return;

                    const trimmedEmail = email.trim();
                    const localError = validateEmailLocal(trimmedEmail);
                    if (localError) {
                        setErrorMessage(localError);
                        return;
                    }

                    setErrorMessage(null);
                    setIsSubmitting(true);

                    try {
                        await forgotPassword({ email: trimmedEmail });
                        setSent(true);
                    } catch (error) {
                        setErrorMessage(
                            error instanceof ApiError
                                ? mapApiError(error)
                                : 'Nie udało się wysłać linku.',
                        );
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
            >
                <AuthTextField
                    label="E-mail"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="nina.kowalska@firma.pl"
                    value={email}
                    error={errorMessage ?? undefined}
                    onChange={(event) => {
                        setEmail(event.target.value);
                        if (errorMessage) setErrorMessage(null);
                    }}
                />
                <button
                    type="submit"
                    className={`${authPrimaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                    disabled={isSubmitting}
                >
                    Wyślij link
                </button>
                <Link to="/login" className={`${authTextLinkClassName} text-center`}>
                    Wróć do logowania
                </Link>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
