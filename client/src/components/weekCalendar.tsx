import React from 'react'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import CalendarTaskItem from './calendarTaskItem'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTask {
    id: string
    title: string
    colorVariant: TaskColor
    date: string 
}

interface WeekCalendarProps {
    startDate: Date
    tasks?: CalendarTask[]
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ startDate, tasks = [] }) => {
    const dayNames = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.']

    return (
        <div className="grid grid-cols-7 overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
            {dayNames.map((shortName, index) => {
                const columnDate = addDays(startDate, index)
                const isToday = isSameDay(columnDate, new Date()) 
                const isWeekend = index >= 5
                
                const bodyBgClass = isToday || isWeekend ? 'bg-slate-50' : 'bg-white'

                const tasksForThisDay = tasks.filter(task => 
                    isSameDay(parseISO(task.date), columnDate)
                )

                return (
                    <article
                        key={columnDate.toISOString()}
                        className="flex flex-col border-r border-b border-slate-200 min-h-[350px]"
                    >
                        {/* Header dnia */}
                        <header className={`flex flex-col items-center justify-center gap-1 py-4 border-b border-slate-200 ${isToday ? 'bg-[#eef9ff]' : 'bg-white'}`}>
                            <p className="text-[14px] text-slate-400 font-normal">
                                {shortName}
                            </p>
                            <p className={`text-[18px] ${isToday ? 'text-[#00aaff] font-medium' : 'text-slate-800 font-normal'}`}>
                                {format(columnDate, 'd')}
                            </p>
                        </header>

                        {/* Body kalendarza */}
                        <div className={`flex-1 p-2 ${bodyBgClass}`}>
                            <div className="flex flex-col gap-2">
                                {tasksForThisDay.map((task) => (
                                    <CalendarTaskItem 
                                        key={task.id} 
                                        title={task.title} 
                                        colorVariant={task.colorVariant} 
                                    />
                                ))}
                            </div>
                        </div>
                    </article>
                )
            })}
        </div>
    )
}

export default WeekCalendar