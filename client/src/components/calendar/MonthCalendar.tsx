import React from 'react'
import { format, isSameMonth } from 'date-fns'
import { useDroppable } from '@dnd-kit/core'
import DraggableCalendarTask from './DraggableCalendarTask'
import { getCalendarRange, toDayKey } from '../../lib/calendarRange'
import type { CalendarTask } from '../../types/calendar'

interface MonthCalendarProps {
    currentDate: Date
    tasks: CalendarTask[]
    // Mniejsze komórki - używane w kalendarzu projektu
    compact?: boolean
}

const sizeClasses = {
    regular: {
        headerCell: 'py-4',
        headerText: 'text-[14px] leading-5 font-normal text-slate-700',
        grid: 'grid-rows-5',
        dayCell: 'h-[120px] p-2',
        dayNumber: 'text-[13px] font-normal mb-1.5',
        taskList: 'space-y-1',
    },
    compact: {
        headerCell: 'py-2',
        headerText: 'text-[13px] font-medium text-slate-500',
        grid: '',
        dayCell: 'h-[90px] p-1.5',
        dayNumber: 'text-[12px] mb-1',
        taskList: 'space-y-0.5',
    },
}

type SizeClasses = typeof sizeClasses.regular

const MonthDayCell: React.FC<{
    day: Date
    index: number
    currentDate: Date
    tasks: CalendarTask[]
    classes: SizeClasses
}> = ({ day, index, currentDate, tasks, classes }) => {
    const dateString = toDayKey(day)
    const { setNodeRef } = useDroppable({
        id: dateString,
        data: { type: 'calendar-day', date: dateString },
    })
    const dayOfWeek = index % 7
    const isCurrentMonth = isSameMonth(day, currentDate)
    const isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6
    const tasksForThisDay = tasks.filter(task => task.date === dateString)

    return (
        <div
            ref={setNodeRef}
            className={`${classes.dayCell} border-r border-b border-slate-200 last:border-r-0 flex flex-col overflow-hidden ${
                isCurrentMonth && !isWeekendDay ? 'bg-white' : 'bg-slate-50/50'
            } ${index >= 35 ? 'border-b-0' : ''}`}
        >
            <p className={`font-segoe-ui ${classes.dayNumber} leading-tight ${
                isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
            } antialiased`}
            >
                {format(day, 'd')}
            </p>

            <div className={`flex-1 overflow-y-auto ${classes.taskList} scrollbar-hide`}>
                {tasksForThisDay.map((task) => (
                    <DraggableCalendarTask key={task.id} task={task} />
                ))}
            </div>
        </div>
    )
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ currentDate, tasks, compact = false }) => {
    const { days } = getCalendarRange('month', currentDate)
    const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
    const classes = compact ? sizeClasses.compact : sizeClasses.regular

    return (
        <section className="flex flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm w-full">
            {/* Nagłówek dni tygodnia */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-white shrink-0">
                {dayNames.map((dayName) => (
                    <div key={dayName} className={`border-r border-slate-200 last:border-r-0 ${classes.headerCell} text-center`}>
                        <p className={`font-segoe-ui ${classes.headerText} antialiased`}>
                            {dayName}
                        </p>
                    </div>
                ))}
            </div>

            {/* Siatka kalendarza */}
            <div className={`grid grid-cols-7 ${classes.grid}`}>
                {days.map((day, index) => (
                    <MonthDayCell
                        key={day.toISOString()}
                        day={day}
                        index={index}
                        currentDate={currentDate}
                        tasks={tasks}
                        classes={classes}
                    />
                ))}
            </div>
        </section>
    )
}

export default MonthCalendar
