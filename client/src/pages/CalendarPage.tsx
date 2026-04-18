import React, { useEffect, useRef, useState } from 'react'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    CheckIcon,
} from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import WeekCalendar from '../components/weekCalendar'
import CalendarFilters from '../components/calendarFilters'
import CalendarNoDeadlineTasks from '../components/calendarNoDeadlineTasks'

type CalendarMode = 'Personal' | 'Team'

const modeOptions: CalendarMode[] = ['Personal', 'Team']

const CalendarPage: React.FC = () => {
    const [selectedMode, setSelectedMode] = useState<CalendarMode>('Personal')
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false)
    const modeDropdownRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!modeDropdownRef.current) {
                return
            }

            if (!modeDropdownRef.current.contains(event.target as Node)) {
                setIsModeDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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
                                    <div className="relative" ref={modeDropdownRef}>
                                        <button
                                            type="button"
                                            className="flex items-center rounded-lg bg-[#F3F3F5] px-3 py-2 font-segoe-ui text-[14px] leading-5 text-slate-900 antialiased transition-colors hover:bg-[#ECEEF2]"
                                            onClick={() => setIsModeDropdownOpen((previous) => !previous)}
                                            aria-haspopup="menu"
                                            aria-expanded={isModeDropdownOpen}
                                            aria-label="Wybierz tryb kalendarza"
                                        >
                                            <span>{selectedMode}</span>
                                            <ChevronDownIcon className="ml-14 h-3.5 w-3.5" />
                                        </button>

                                        {isModeDropdownOpen ? (
                                            <div className="absolute left-0 z-20 mt-2 w-48 rounded-lg shadow-md bg-white p-1">
                                                {modeOptions.map((mode) => {
                                                    const isSelected = mode === selectedMode

                                                    return (
                                                        <button
                                                            key={mode}
                                                            type="button"
                                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-segoe-ui text-[14px] leading-5 text-slate-900 antialiased ${isSelected ? 'bg-[#ECEEF2]' : 'hover:bg-slate-50'}`}
                                                            onClick={() => {
                                                                setSelectedMode(mode)
                                                                setIsModeDropdownOpen(false)
                                                            }}
                                                            role="menuitem"
                                                        >
                                                            <span>{mode}</span>
                                                            {isSelected ? <CheckIcon className="h-5 w-5 text-slate-500" /> : null}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="h-[calc(100vh-22rem)] min-h-96">
                                    <WeekCalendar />
                                </div>
                                <CalendarNoDeadlineTasks />
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