import React, { useEffect, useRef, useState } from 'react'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    CheckIcon,
} from '@heroicons/react/24/outline'
import { format, startOfWeek, endOfWeek, startOfMonth, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { pl } from 'date-fns/locale' 
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import WeekCalendar from '../components/ProjectWeekCalendar'
import MonthCalendar from '../components/monthCalendar'
import CalendarFilters from '../components/calendarFilters'
import CalendarNoDeadlineTasks from '../components/calendarNoDeadlineTasks'


type CalendarMode = 'Personal' | 'Team'
type ViewMode = 'week' | 'month'
const modeOptions: CalendarMode[] = ['Personal', 'Team']
const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']

const CalendarPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('week')
    
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })

    const monthStart = startOfMonth(currentDate)
    const calendarGridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarGridEnd = addWeeks(calendarGridStart, 5) 

    const rangeFrom = viewMode === 'week' ? startDate : calendarGridStart
    const rangeTo = viewMode === 'week' ? endDate : calendarGridEnd

    const dueFrom = rangeFrom.toISOString()
    const dueTo = rangeTo.toISOString()

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

    const dateRangeText = viewMode === 'week' 
        ? `${format(startDate, 'd MMMM', { locale: pl })} - ${format(endDate, 'd MMMM yyyy', { locale: pl })}`
        : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`

    const [selectedMode, setSelectedMode] = useState<CalendarMode>('Personal')
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false)
    const modeDropdownRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!modeDropdownRef.current) return
            if (!modeDropdownRef.current.contains(event.target as Node)) {
                setIsModeDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
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
                                            onClick={viewMode === 'week' ? handlePrevWeek : handlePrevMonth}
                                            className="rounded-lg border border-slate-200 p-2 text-slate-900 hover:bg-white transition-colors"
                                            aria-label={viewMode === 'week' ? "Poprzedni tydzień" : "Poprzedni miesiąc"}
                                        >
                                            <ChevronLeftIcon className="h-2.5 w-2.5" />
                                        </button>

                                        <p className="font-segoe-ui text-[14px] leading-5 font-normal text-slate-900 antialiased min-w-[200px] text-center capitalize-first">
                                            {dateRangeText}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={viewMode === 'week' ? handleNextWeek : handleNextMonth}
                                            className="rounded-lg border border-slate-200 p-2 text-slate-900 hover:bg-white transition-colors"
                                            aria-label={viewMode === 'week' ? "Następny tydzień" : "Następny miesiąc"}
                                        >
                                            <ChevronRightIcon className="h-2.5 w-2.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center rounded-[10px] bg-[#F3F3F5] p-1">
                                        <button 
                                            onClick={() => setViewMode('week')}
                                            className={`rounded-lg px-3 py-1.5 font-segoe-ui text-[14px] leading-5 text-slate-900 antialiased transition-colors ${viewMode === 'week' ? 'bg-[#ECEEF2]' : 'hover:bg-[#ECEEF2]'}`}>
                                            Tydzień
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('month')}
                                            className={`rounded-lg px-3 py-1.5 font-segoe-ui text-[14px] leading-5 text-slate-900 antialiased transition-colors ${viewMode === 'month' ? 'bg-[#ECEEF2]' : 'hover:bg-[#ECEEF2]'}`}>
                                            Miesiąc
                                        </button>
                                    </div>

                                    <div className="relative" ref={modeDropdownRef}>
                                        <button
                                            type="button"
                                            className="flex items-center rounded-lg bg-[#F3F3F5] px-3 py-2 font-segoe-ui text-[14px] leading-5 text-slate-900 antialiased transition-colors hover:bg-[#ECEEF2]"
                                            onClick={() => setIsModeDropdownOpen((prev) => !prev)}
                                        >
                                            <span>{selectedMode}</span>
                                            <ChevronDownIcon className="ml-14 h-3.5 w-3.5" />
                                        </button>

                                        {isModeDropdownOpen && (
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
                                                        >
                                                            <span>{mode}</span>
                                                            {isSelected && <CheckIcon className="h-5 w-5 text-slate-500" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* POPRAWIONA SEKCJA: flex-col z gap-6 zamiast sztywnej wysokości */}
                            <div className="flex flex-1 flex-col gap-6">
                                <div className={viewMode === 'week' ? "h-[calc(100vh-22rem)] min-h-96" : "w-full"}>
                                    {viewMode === 'week' ? (
                                        <WeekCalendar startDate={startDate} dueFrom={dueFrom} dueTo={dueTo} />
                                    ) : (
                                        <MonthCalendar currentDate={currentDate} dueFrom={dueFrom} dueTo={dueTo} />
                                    )}
                                </div>
                                <CalendarNoDeadlineTasks />
                            </div>
                        </div>
                        <CalendarFilters mode={selectedMode} />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CalendarPage