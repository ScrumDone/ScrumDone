import React from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { useDroppable } from '@dnd-kit/core'
import DraggableCalendarTask from './DraggableCalendarTask'
import CalendarShowMoreButton from './CalendarShowMoreButton'
import { toDayKey } from '../../lib/calendarRange'
import type { CalendarTask } from '../../types/calendar'

interface WeekCalendarProps {
    startDate: Date
    tasks: CalendarTask[]
    // Liczba wszystkich zadań dla dni, które mogły nie zostać w pełni wczytane
    dayTotals?: Record<string, number>
    onShowMore?: (dayKey: string) => void
}

const CalendarDayColumn: React.FC<{
    columnDate: Date
    shortName: string
    isToday: boolean
    bodyBgClass: string
    tasks: CalendarTask[]
    dayTotal?: number | undefined
    onShowMore?: ((dayKey: string) => void) | undefined
}> = ({ columnDate, shortName, isToday, bodyBgClass, tasks, dayTotal, onShowMore }) => {
    const dateString = toDayKey(columnDate)
    const { setNodeRef } = useDroppable({
        id: dateString,
        data: { type: 'calendar-day', date: dateString },
    })

    return (
        <article
            ref={setNodeRef}
            className="flex flex-col border-r border-b border-slate-200 min-h-[350px]"
        >
            <header className={`flex flex-col items-center justify-center gap-1 py-4 border-b border-slate-200 ${isToday ? 'bg-[#eef9ff]' : 'bg-white'}`}>
                <p className="text-[14px] text-slate-400 font-normal">{shortName}</p>
                <p className={`text-[18px] ${isToday ? 'text-[#00aaff] font-medium' : 'text-slate-800 font-normal'}`}>
                    {format(columnDate, 'd')}
                </p>
            </header>

            <div className={`flex-1 p-2 ${bodyBgClass}`}>
                <div className="flex flex-col gap-2">
                    {tasks.map((task) => (
                        <DraggableCalendarTask key={task.id} task={task} />
                    ))}
                    <CalendarShowMoreButton
                        dayKey={dateString}
                        dayTotal={dayTotal}
                        shownCount={tasks.length}
                        onShowMore={onShowMore}
                    />
                </div>
            </div>
        </article>
    )
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ startDate, tasks, dayTotals, onShowMore }) => {
    const dayNames = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.']

    return (
        <div className="grid grid-cols-7 overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
            {dayNames.map((shortName, index) => {
                const columnDate = addDays(startDate, index)
                const isToday = isSameDay(columnDate, new Date())
                const isWeekend = index >= 5
                const bodyBgClass = isToday || isWeekend ? 'bg-slate-50' : 'bg-white'

                const dayKey = toDayKey(columnDate)
                const tasksForThisDay = tasks.filter(task => task.date === dayKey)

                return (
                    <CalendarDayColumn
                        key={columnDate.toISOString()}
                        columnDate={columnDate}
                        shortName={shortName}
                        isToday={isToday}
                        bodyBgClass={bodyBgClass}
                        tasks={tasksForThisDay}
                        dayTotal={dayTotals?.[dayKey]}
                        onShowMore={onShowMore}
                    />
                )
            })}
        </div>
    )
}

export default WeekCalendar
