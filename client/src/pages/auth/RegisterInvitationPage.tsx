import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {
    AuthPasswordField,
    AuthTextField,
    authPrimaryButtonClassName,
    authTextLinkClassName,
} from '../../components/auth/AuthFields';

const RegisterInvitationPage: React.FC = () => {
    const navigate = useNavigate();
    const { invitationId = '' } = useParams<{ invitationId: string }>();
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    void invitationId;

    return (
        <AuthLayout title="Utwórz konto" subtitle="Uzupełnij dane, żeby dołączyć do workspace">
            <form
                className="flex w-full flex-col gap-5"
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    navigate('/login');
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
                <button type="submit" className={authPrimaryButtonClassName}>
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
