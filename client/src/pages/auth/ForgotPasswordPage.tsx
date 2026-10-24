import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthTextField, authPrimaryButtonClassName, authTextLinkClassName } from '../../components/auth/AuthFields';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');

    return (
        <AuthLayout
            title="Nie pamiętasz hasła?"
            subtitle="Podaj adres e-mail, a wyślemy link do ustawienia nowego hasła."
        >
            <form
                className="flex w-full flex-col gap-5"
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                }}
            >
                <AuthTextField
                    label="E-mail"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="nina.kowalska@firma.pl"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <button type="button" className={authPrimaryButtonClassName}>
                    Wyślij link
                </button>
                <Link to="/logowanie" className={`${authTextLinkClassName} text-center`}>
                    Wróć do logowania
                </Link>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
