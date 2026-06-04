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

interface ProjectMonthCalendarProps {
    currentDate: Date
    tasks: CalendarTask[]
}

const ProjectMonthCalendar: React.FC<ProjectMonthCalendarProps> = ({ currentDate, tasks }) => {
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
                    <div key={dayName} className="border-r border-slate-200 last:border-r-0 py-2 text-center">
                        <p className="font-segoe-ui text-[13px] font-medium text-slate-500 antialiased">
                            {dayName}
                        </p>
                    </div>
                ))}
            </div>

            {/* Siatka kalendarza */}
            <div className="grid grid-cols-7">
                {days.map((day, index) => {
                    const dayOfWeek = index % 7
                    const isCurrentMonth = isSameMonth(day, currentDate)
                    const isWeekendDay = isWeekend(dayOfWeek)
                    const tasksForThisDay = tasks.filter(task => 
                        isSameDay(parseISO(task.date), day)
                    )

                    return (
                        <div
                            key={day.toISOString()}
                            className={`h-[90px] border-r border-b border-slate-200 last:border-r-0 p-1.5 flex flex-col overflow-hidden ${
                                isCurrentMonth && !isWeekendDay ? 'bg-white' : 'bg-slate-50/50'
                            } ${index >= 28 ? 'border-b-0' : ''}`}
                        >
                            <p className={`font-segoe-ui text-[12px] leading-tight mb-1 ${
                                isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                            } antialiased`}
                            >
                                {format(day, 'd')}
                            </p>
                            
                            {/* Scroll zadań */}
                            <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-hide">
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

export default ProjectMonthCalendar