import React from 'react'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import WeekCalendar from '../components/weekCalendar'
import CalendarFilters from '../components/calendarFilters'

const CalendarPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar/>
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto max-w-350 px-8 py-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h1 className="font-segoe-ui text-[24px] leading-8 font-normal text-slate-900 antialiased">Kalendarz</h1>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="rounded border border-slate-200 p-1 text-slate-500"
                                    aria-label="Poprzedni tydzień"
                                >
                                    <ChevronLeftIcon className="h-3.5 w-3.5" />
                                </button>

                                <p className="font-segoe-ui text-[11px] leading-4 font-normal text-slate-600 antialiased">
                                    6 kwietnia - 12 kwietnia 2026
                                </p>

                                <button
                                    type="button"
                                    className="rounded border border-slate-200 p-1 text-slate-500"
                                    aria-label="Następny tydzień"
                                >
                                    <ChevronRightIcon className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="rounded border border-slate-200 bg-white px-3 py-1.5 font-segoe-ui text-[11px] leading-4 text-slate-700 antialiased"
                            >
                                Tydzień
                            </button>
                            <button
                                type="button"
                                className="rounded border border-slate-200 bg-white px-3 py-1.5 font-segoe-ui text-[11px] leading-4 text-slate-700 antialiased"
                            >
                                Miesiąc
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 font-segoe-ui text-[11px] leading-4 text-slate-700 antialiased"
                            >
                                Persona
                                <ChevronDownIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <WeekCalendar />
                        </div>
                        <CalendarFilters />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CalendarPage