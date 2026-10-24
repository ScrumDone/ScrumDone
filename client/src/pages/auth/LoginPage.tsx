import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {
    AuthPasswordField,
    AuthTextField,
    authPrimaryButtonClassName,
    authTextLinkClassName,
} from '../../components/auth/AuthFields';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <AuthLayout title="Zaloguj się" subtitle="Wróć do swojego workspace">
            <form
                className="flex w-full flex-col gap-5"
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    navigate('/');
                }}
            >
                <AuthTextField
                    label="E-mail"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="nina.kowalczyk@firma.pl"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <AuthPasswordField
                    label="Hasło"
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                            className="size-[15px] shrink-0 rounded-[2px] border border-[#94A3B8] accent-[#00BFFF]"
                        />
                        <span className="text-[13px] leading-[19.5px] font-medium text-[#334155]">
                            Zapamiętaj mnie
                        </span>
                    </label>
                    <Link to="/zapomnialem-hasla" className={authTextLinkClassName}>
                        Nie pamiętasz hasła?
                    </Link>
                </div>
                <button type="submit" className={authPrimaryButtonClassName}>
                    Zaloguj się
                </button>
            </form>
            <p className="text-center text-[13px] leading-[19.5px] font-normal text-[#64748B]">
                Nie masz konta? Poproś administratora o dostęp.
            </p>
        </AuthLayout>
    );
};

export default LoginPage;
