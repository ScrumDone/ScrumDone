import React from 'react'
import { format, startOfMonth, startOfWeek, addDays, isSameDay, isSameMonth, parseISO } from 'date-fns'
import CalendarTaskItem from './calendarTaskItem'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTask {
    id: string
    title: string
    colorVariant: TaskColor
    date: string 
}

interface MonthCalendarProps {
    currentDate: Date
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ currentDate }) => {
    const allTasks: CalendarTask[] = [
        { id: 'task-1', title: 'Quotes Generation', colorVariant: 'red', date: '2026-04-08' },
        { id: 'task-2', title: 'Database schema', colorVariant: 'yellow', date: '2026-04-08' },
        { id: 'task-3', title: 'Real-time notification', colorVariant: 'green', date: '2026-04-12' },
    ]

    const monthStart = startOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
    
    const days: Date[] = Array.from({ length: 35 }, (_, i) => addDays(calendarStart, i))
    const isWeekend = (dayIndex: number) => dayIndex === 5 || dayIndex === 6

    return (
        <section className="flex flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm w-full">
            {/* Nagłówek dni tygodnia */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-white shrink-0">
                {dayNames.map((dayName) => (
                    <div key={dayName} className="border-r border-slate-200 last:border-r-0 py-4 text-center">
                        <p className="font-segoe-ui text-[14px] leading-5 font-normal text-slate-700 antialiased">
                            {dayName}
                        </p>
                    </div>
                ))}
            </div>

            {/* Siatka kalendarza */}
            <div className="grid grid-cols-7 grid-rows-5">
                {days.map((day, index) => {
                    const dayOfWeek = index % 7
                    const isCurrentMonth = isSameMonth(day, currentDate)
                    const isWeekendDay = isWeekend(dayOfWeek)
                    const tasksForThisDay = allTasks.filter(task => 
                        isSameDay(parseISO(task.date), day)
                    )

                    return (
                        <div
                            key={day.toISOString()}
                            className={`h-[120px] border-r border-b border-slate-200 last:border-r-0 p-2 flex flex-col overflow-hidden ${
                                isCurrentMonth && !isWeekendDay ? 'bg-white' : 'bg-slate-50/50'
                            } ${index >= 28 ? 'border-b-0' : ''}`}
                        >
                            <p className={`font-segoe-ui text-[13px] leading-tight font-normal ${
                                isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                            } antialiased mb-1.5`}
                            >
                                {format(day, 'd')}
                            </p>
                            
                            {/* Scroll zadań wewnątrz komórki */}
                            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                                {tasksForThisDay.map((task) => (
                                    <CalendarTaskItem 
                                        key={task.id} 
                                        title={task.title} 
                                        colorVariant={task.colorVariant} 
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default MonthCalendar