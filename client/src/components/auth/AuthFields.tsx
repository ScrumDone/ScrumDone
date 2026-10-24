import React, { useId, useState } from 'react';
import eyeIcon from '../../assets/auth/password-eye.svg';

const fieldClassName =
    'h-11 w-full rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#00BFFF] focus:shadow-[0_0_0_4px_rgba(0,191,255,0.18)]';

type AuthTextFieldProps = {
    label: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>;

export const AuthTextField: React.FC<AuthTextFieldProps> = ({ label, id, ...inputProps }) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
        <div className="flex w-full flex-col gap-1.5">
            <label htmlFor={fieldId} className="text-[13px] leading-[19.5px] font-medium text-[#334155]">
                {label}
            </label>
            <input id={fieldId} className={fieldClassName} {...inputProps} />
        </div>
    );
};

type AuthPasswordFieldProps = {
    label: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'>;

export const AuthPasswordField: React.FC<AuthPasswordFieldProps> = ({
    label,
    id,
    placeholder = '••••••••',
    ...inputProps
}) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [visible, setVisible] = useState(false);

    return (
        <div className="flex w-full flex-col gap-1.5">
            <label htmlFor={fieldId} className="text-[13px] leading-[19.5px] font-medium text-[#334155]">
                {label}
            </label>
            <div className="relative">
                <input
                    id={fieldId}
                    type={visible ? 'text' : 'password'}
                    placeholder={placeholder}
                    className={`${fieldClassName} pr-10`}
                    {...inputProps}
                />
                <button
                    type="button"
                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center"
                    aria-label={visible ? 'Ukryj hasło' : 'Pokaż hasło'}
                    aria-pressed={visible}
                    onClick={() => setVisible((current) => !current)}
                >
                    <span className="relative block h-4 w-4">
                        <img src={eyeIcon} alt="" width={16} height={16} />
                        {visible ? (
                            <span
                                aria-hidden="true"
                                className="absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 rotate-45 bg-[#94A3B8]"
                            />
                        ) : null}
                    </span>
                </button>
            </div>
        </div>
    );
};

export const authPrimaryButtonClassName =
    'flex h-11 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#00BFFF] text-[15px] leading-[22.5px] font-semibold text-white transition-colors hover:bg-[#00A8E0] focus-visible:shadow-[0_0_0_4px_rgba(0,191,255,0.18)] focus-visible:outline-none';

export const authTextLinkClassName =
    'text-[13px] leading-[19.5px] font-normal text-[#00BFFF] hover:text-[#00A8E0]';
