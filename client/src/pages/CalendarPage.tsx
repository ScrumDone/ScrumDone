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
                <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col px-8 py-6">
                    <div className="flex flex-1 items-stretch gap-3">
                        <div className="min-w-0 flex flex-1 flex-col">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <h1 className="font-segoe-ui text-[24px] leading-8 font-normal text-slate-900 antialiased">Kalendarz</h1>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="rounded-lg border border-slate-200 p-2 text-slate-900"
                                            aria-label="Poprzedni tydzień"
                                        >
                                            <ChevronLeftIcon className="h-2.5 w-2.5" />
                                        </button>

                                        <p className="font-segoe-ui text-[14px] leading-5 font-normal text-slate-900 antialiased">
                                            6 kwietnia - 12 kwietnia 2026
                                        </p>

                                        <button
                                            type="button"
                                            className="rounded-lg border border-slate-200 p-2 text-slate-900"
                                            aria-label="Następny tydzień"
                                        >
                                            <ChevronRightIcon className="h-2.5 w-2.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center rounded-[10px]  bg-[#F3F3F5] p-1">
                                        <button
                                            type="button"
                                            className="rounded-lg bg-[#ECEEF2] px-3 py-1.5 font-segoe-ui text-[14px] leading-5 text-slate-900 antialiased"
                                        >
                                            Tydzień
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-lg px-3 py-1.5 font-segoe-ui text-[14px] leading-5 text-slate-900 antialiased transition-colors hover:bg-[#ECEEF2]"
                                        >
                                            Miesiąc
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className="flex items-center  rounded-lg  bg-[#F3F3F5] hover:bg-[#ECEEF2]  px-3 py-2 gap-16 font-segoe-ui text-[14px] leading-5 text-slate-900 antialiased"
                                    >
                                        Personal
                                        <ChevronDownIcon className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="h-[calc(100vh-22rem)] min-h-96">
                                    <WeekCalendar />
                                </div>
                                <div className="bg-white w-full mt-6 mb-6 rounded-xl border border-slate-200 p-4 min-h-35">

                                </div>
                            </div>
                        </div>
                        <CalendarFilters />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CalendarPage