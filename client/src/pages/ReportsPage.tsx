import React from 'react'
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'

const ReportsPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col px-8 py-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-[0em] antialiased">
                            Raporty
                        </h1>

                        <button
                            type="button"
                            className="h-9 whitespace-nowrap rounded-[8px] bg-scrumdone-blue-main px-4 text-sm font-medium leading-[10px] text-white transition-all hover:bg-[#00A0DD] active:scale-95"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                <PlusIcon className="h-4 w-4 stroke-2" />
                                Wygeneruj raport
                            </span>
                        </button>
                    </div>

                    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12">
                        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                            <DocumentTextIcon className="mb-4 h-16 w-16 stroke-2 text-slate-400" />
                            <h2 className="mb-3 font-segoe-ui text-[18px] tracking-[-0.44px] leading-7 font-medium text-slate-900 antialiased">
                                Brak raportow
                            </h2>
                            <p className="mb-8 font-segoe-ui text-[16px] leading-6 tracking-[-0.31px] font-normal text-slate-600 antialiased">
                                Nie masz jeszcze zadnych wygenerowanych raportow.
                                <br />
                                Kliknij przycisk powyzej, aby utworzyc pierwszy raport.
                            </p>
                            <button
                                type="button"
                                className="h-9 whitespace-nowrap rounded-lg bg-scrumdone-blue-main px-4 text-sm font-medium leading-3 text-white transition-all hover:bg-[#00A0DD] active:scale-95"
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <PlusIcon className="h-4 w-4 stroke-2" />
                                    Stworz pierwszy raport
                                </span>
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default ReportsPage
