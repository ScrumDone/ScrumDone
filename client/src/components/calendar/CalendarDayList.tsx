import React from 'react'
import { format, isSameDay } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useDroppable } from '@dnd-kit/core'
import DraggableCalendarTask from './DraggableCalendarTask'
import CalendarShowMoreButton from './CalendarShowMoreButton'
import { toDayKey } from '../../lib/calendarRange'
import type { CalendarTask } from '../../types/calendar'

interface CalendarDayListProps {
    days: Date[]
    tasks: CalendarTask[]
    // Liczba wszystkich zadań dla dni, które mogły nie zostać w pełni wczytane
    dayTotals?: Record<string, number>
    onShowMore?: (dayKey: string) => void
    // Widok miesiąca: pomijamy dni bez zadań, żeby lista nie miała 30 pustych pozycji
    hideEmptyDays?: boolean
}

const CalendarDayListItem: React.FC<{
    day: Date
    tasks: CalendarTask[]
    dayTotal?: number | undefined
    onShowMore?: ((dayKey: string) => void) | undefined
}> = ({ day, tasks, dayTotal, onShowMore }) => {
    const dayKey = toDayKey(day)
    // Ten sam identyfikator co kolumna w siatce - na telefonie siatka nie jest renderowana, więc nie ma konfliktu
    const { setNodeRef, isOver } = useDroppable({
        id: dayKey,
        data: { type: 'calendar-day', date: dayKey },
    })
    const isToday = isSameDay(day, new Date())

    return (
        <section
            ref={setNodeRef}
            className={`overflow-hidden rounded-[10px] border bg-white transition-colors ${isOver ? 'border-scrumdone-blue-main' : 'border-slate-200'}`}
        >
            <header className={`flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 ${isToday ? 'bg-[#eef9ff]' : ''}`}>
                <p className={`font-segoe-ui text-[14px] leading-5 antialiased first-letter:uppercase ${isToday ? 'font-medium text-[#00aaff]' : 'text-slate-900'}`}>
                    {format(day, 'EEEE, d MMMM', { locale: pl })}
                </p>
                {isToday ? <span className="text-[12px] font-medium text-[#00aaff]">Dziś</span> : null}
            </header>

            <div className="flex flex-col gap-2 p-2">
                {tasks.length === 0 ? (
                    <p className="px-1 py-1 font-segoe-ui text-[12px] text-slate-400">Brak zadań</p>
                ) : (
                    tasks.map((task) => <DraggableCalendarTask key={task.id} task={task} />)
                )}
                <CalendarShowMoreButton
                    dayKey={dayKey}
                    dayTotal={dayTotal}
                    shownCount={tasks.length}
                    onShowMore={onShowMore}
                />
            </div>
        </section>
    )
}

// Kalendarz na telefonie: dni jeden pod drugim zamiast siatki 7 kolumn
const CalendarDayList: React.FC<CalendarDayListProps> = ({ days, tasks, dayTotals, onShowMore, hideEmptyDays = false }) => {
    const items = days
        .map((day) => {
            const dayKey = toDayKey(day)
            return {
                day,
                dayKey,
                tasks: tasks.filter((task) => task.date === dayKey),
                dayTotal: dayTotals?.[dayKey],
            }
        })
        .filter((item) => !hideEmptyDays
            || item.tasks.length > 0
            || (item.dayTotal ?? 0) > 0
            || isSameDay(item.day, new Date()))

    if (items.length === 0) {
        return (
            <p className="rounded-[10px] border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                Brak zadań w tym okresie.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map((item) => (
                <CalendarDayListItem
                    key={item.dayKey}
                    day={item.day}
                    tasks={item.tasks}
                    dayTotal={item.dayTotal}
                    onShowMore={onShowMore}
                />
            ))}
        </div>
    )
}

export default CalendarDayList
