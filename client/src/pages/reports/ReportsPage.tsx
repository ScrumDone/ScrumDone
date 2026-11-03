import React, { useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import SideBar from '../../components/layout/SideBar'
import TopBar from '../../components/layout/TopBar'
import ReportGenerateModal from '../../components/reports/ReportGenerateModal'
import ReportQuickStats from '../../components/reports/ReportQuickStats'
import ReportsTable from '../../components/reports/ReportsTable'
import { generatedReports, reportsQuickStats } from '../../data/reports'

const ReportsPage: React.FC = () => {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="pt-(--app-header-h) lg:ml-64">
                <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col px-4 py-6 sm:px-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-[0em] antialiased">
                            Raporty
                        </h1>

                        <button
                            type="button"
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="h-9 cursor-pointer whitespace-nowrap rounded-[8px] bg-scrumdone-blue-main px-4 text-sm font-medium leading-[10px] text-white transition-all hover:bg-[#00A0DD] active:scale-95"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                <PlusIcon className="h-4 w-4 stroke-2" />
                                Wygeneruj raport
                            </span>
                        </button>
                    </div>

                    <div className="mb-3 flex items-baseline gap-3">
                        <h2 className="font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">
                            Szybki podgląd
                        </h2>
                        <span className="text-xs leading-4 text-slate-500">stan na dziś</span>
                    </div>

                    <ReportQuickStats stats={reportsQuickStats} />

                    <div className="mb-3 mt-7 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">
                            Wygenerowane raporty
                        </h2>

                        <div className="relative w-full sm:w-60">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                aria-label="Szukaj raportu"
                                placeholder="Szukaj raportu"
                                className="h-9 w-full rounded-lg border border-transparent bg-[#F3F5F5] py-1 pl-9 pr-3 font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-[#0A0A0A] outline-none placeholder:text-slate-500 focus:border-slate-300"
                            />
                        </div>
                    </div>

                    <ReportsTable reports={generatedReports} />
                </div>
            </main>

            {isGenerateModalOpen && <ReportGenerateModal onClose={() => setIsGenerateModalOpen(false)} />}
        </div>
    )
}

export default ReportsPage
