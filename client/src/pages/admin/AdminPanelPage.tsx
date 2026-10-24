import React, { useState } from 'react'
import SideBar from '../../components/layout/SideBar'
import TopBar from '../../components/layout/TopBar'

const ROLES = ['Admin', 'Project Manager', 'Standard User'] as const

type AdminRole = (typeof ROLES)[number]

const fieldClassName =
    'h-11 w-full rounded-[10px] border border-[#E2E8F0] bg-white px-3 font-segoe-ui text-[14px] text-[#0A0A0A] outline-none placeholder:text-[#94A3B8] focus:border-[#00BFFF]'

const AdminPanelPage: React.FC = () => {
    const [role, setRole] = useState<AdminRole>('Admin')

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="px-8 py-6">
                    <h1 className="mb-6 font-segoe-ui text-[24px] leading-8 font-normal text-[#0A0A0A] antialiased">
                        Panel administratora
                    </h1>

                    <section className="max-w-[880px] rounded-[14px] border border-[#E5E7EB] bg-white p-6">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-segoe-ui text-[16px] leading-6 font-semibold text-[#0A0A0A] antialiased">
                                Dodaj nowego użytkownika
                            </h2>
                            <button
                                type="button"
                                className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] bg-[#00BFFF] px-4 font-segoe-ui text-[14px] leading-5 font-semibold text-white"
                            >
                                Generuj link
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="admin-login" className="font-segoe-ui text-[14px] leading-5 text-[#0A0A0A]">
                                    Login
                                </label>
                                <input
                                    id="admin-login"
                                    type="text"
                                    placeholder="nina.kowalska"
                                    className={fieldClassName}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="admin-email" className="font-segoe-ui text-[14px] leading-5 text-[#0A0A0A]">
                                    E-mail
                                </label>
                                <input
                                    id="admin-email"
                                    type="email"
                                    placeholder="nina.kowalska@firma.pl"
                                    className={fieldClassName}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="font-segoe-ui text-[14px] leading-5 text-[#0A0A0A]">Rola</p>
                                <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Rola">
                                    {ROLES.map((option) => {
                                        const selected = role === option

                                        return (
                                            <button
                                                key={option}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                onClick={() => setRole(option)}
                                                className={`inline-flex h-8 items-center rounded-full border bg-white px-4 font-segoe-ui text-[14px] leading-none ${
                                                    selected
                                                        ? 'border-[#00BFFF] text-[#00BFFF]'
                                                        : 'border-[#E2E8F0] text-[#334155]'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default AdminPanelPage
