import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {
    AuthPasswordField,
    AuthTextField,
    authPrimaryButtonClassName,
    authTextLinkClassName,
} from '../../components/auth/AuthFields';
import { ApiError } from '../../api/client';
import { register } from '../../api/auth';

const RegisterInvitationPage: React.FC = () => {
    const navigate = useNavigate();
    const { invitationId: invitationIdParam } = useParams<{ invitationId: string }>();
    const invitationId = invitationIdParam?.trim() ?? '';
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

                    if (password !== passwordRepeat) {
                        setErrorMessage('Hasła nie są takie same.');
                        return;
                    }

                    setErrorMessage(null);
                    setIsSubmitting(true);

                    try {
                        await register(invitationId, {
                            name: fullName,
                            password,
                        });
                        navigate('/login');
                    } catch (error) {
                        setErrorMessage(
                            error instanceof ApiError ? error.message : 'Nie udało się utworzyć konta.',
                        );
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
                    onChange={(event) => setFullName(event.target.value)}
                />
                <AuthPasswordField
                    label="Hasło"
                    name="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <AuthPasswordField
                    label="Powtórz hasło"
                    name="passwordRepeat"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={passwordRepeat}
                    onChange={(event) => setPasswordRepeat(event.target.value)}
                />
                {errorMessage && (
                    <p className="text-[13px] leading-[19.5px] text-[#e7000b]" role="alert">
                        {errorMessage}
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
