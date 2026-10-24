import React from 'react';

type AuthLayoutProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
    return (
        <div
            className="relative flex min-h-screen flex-col font-segoe-ui"
            style={{
                backgroundImage: 'linear-gradient(160deg, #F8FCFF 8.5%, #E6F7FF 50%, #F7FBFF 91.5%)',
            }}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 size-[480px]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 80% 20%, rgba(0, 191, 255, 0.08) 0%, rgba(0, 191, 255, 0) 70%)',
                }}
            />

            <main className="relative flex flex-1 items-center justify-center px-4 py-10">
                <section className="flex w-full max-w-[420px] flex-col gap-6 rounded-[16px] border border-[#E2E8F0] bg-white p-10 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center">
                        <span className="text-[20px] leading-[30px] font-normal tracking-[0.8px] text-[#00BFFF]">
                            scrum
                        </span>
                        <span className="text-[20px] leading-[30px] font-normal tracking-[0.8px] text-[#111827]">
                            done
                        </span>
                    </div>

                    <header className="flex flex-col gap-2">
                        <h1 className="text-[24px] leading-[30px] font-medium text-[#0F172A]">{title}</h1>
                        {subtitle ? (
                            <p className="text-[14px] leading-[21px] font-normal text-[#64748B]">{subtitle}</p>
                        ) : null}
                    </header>

                    {children}
                </section>
            </main>

            <p className="relative pb-8 text-center text-[12px] leading-[18px] font-normal tracking-[0.36px] text-[#94A3B8]">
                ScrumDone
            </p>
        </div>
    );
};

export default AuthLayout;
