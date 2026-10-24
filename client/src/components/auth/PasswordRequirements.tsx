import React from 'react';

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRule = {
    id: string;
    label: string;
    test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
    {
        id: 'length',
        label: `Co najmniej ${PASSWORD_MIN_LENGTH} znaków`,
        test: (password) => password.length >= PASSWORD_MIN_LENGTH,
    },
    {
        id: 'upper',
        label: 'Wielka litera (A–Z)',
        test: (password) => /[A-Z]/.test(password),
    },
    {
        id: 'lower',
        label: 'Mała litera (a–z)',
        test: (password) => /[a-z]/.test(password),
    },
    {
        id: 'digit',
        label: 'Cyfra (0–9)',
        test: (password) => /[0-9]/.test(password),
    },
    {
        id: 'special',
        label: 'Znak specjalny (!@#…)',
        test: (password) => /[^a-zA-Z0-9]/.test(password),
    },
];

export function getPasswordRuleStatus(password: string) {
    return PASSWORD_RULES.map((rule) => ({
        ...rule,
        met: rule.test(password),
    }));
}

export function isPasswordStrong(password: string) {
    return PASSWORD_RULES.every((rule) => rule.test(password));
}

type PasswordRequirementsProps = {
    password: string;
};

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
    const started = password.length > 0;
    const statuses = getPasswordRuleStatus(password);
    const metCount = statuses.filter((rule) => rule.met).length;

    return (
        <div className="flex w-full flex-col gap-2.5" aria-live="polite">
            <div className="flex items-center gap-1.5" aria-hidden="true">
                {PASSWORD_RULES.map((rule, index) => {
                    const filled = index < metCount;
                    return (
                        <span
                            key={rule.id}
                            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                                filled ? 'bg-[#00BFFF]' : 'bg-[#E2E8F0]'
                            }`}
                        />
                    );
                })}
            </div>

            <ul className="flex flex-col gap-1.5">
                {statuses.map((rule) => {
                    const lampClass = rule.met
                        ? 'bg-[#00BFFF] shadow-[0_0_0_3px_rgba(0,191,255,0.16)]'
                        : started
                          ? 'bg-[#F87171]'
                          : 'bg-[#CBD5E1]';
                    const textClass = rule.met ? 'text-[#0F172A]' : started ? 'text-[#64748B]' : 'text-[#94A3B8]';

                    return (
                        <li key={rule.id} className="flex items-center gap-2">
                            <span
                                className={`size-2 shrink-0 rounded-full transition-all duration-200 ${lampClass}`}
                                aria-hidden="true"
                            />
                            <span className={`text-[12px] leading-[18px] transition-colors duration-200 ${textClass}`}>
                                {rule.label}
                                <span className="sr-only">{rule.met ? ' — spełnione' : ' — niespełnione'}</span>
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PasswordRequirements;
