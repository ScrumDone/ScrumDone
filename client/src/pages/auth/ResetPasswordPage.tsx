import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthPasswordField, authPrimaryButtonClassName, authTextLinkClassName } from '../../components/auth/AuthFields';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email] = useState(() => searchParams.get('email')?.trim() ?? '');
    const [token] = useState(() => searchParams.get('token')?.trim() ?? '');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const linkComplete = email.length > 0 && token.length > 0;

    if (!linkComplete) {
        return (
            <AuthLayout title="Ustaw nowe hasło">
                <div className="flex w-full flex-col gap-5">
                    <p className="text-[14px] leading-[21px] font-normal text-[#64748B]">Link jest niekompletny.</p>
                    <Link to="/logowanie" className={authTextLinkClassName}>
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
                onSubmit={(event) => {
                    event.preventDefault();
                    navigate('/logowanie');
                }}
            >
                <AuthPasswordField
                    label="Nowe hasło"
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
                    Zapisz hasło
                </button>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
