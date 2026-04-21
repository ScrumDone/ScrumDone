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
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ startDate }) => {
    
    const allTasks: CalendarTask[] = [
        { 
            id: 'task-1', 
            title: 'Quotes Generation Module', 
            colorVariant: 'red', 
            date: '2026-04-21' 
        },
        { 
            id: 'task-2', 
            title: 'Database schema design', 
            colorVariant: 'yellow', 
            date: '2026-04-21' 
        },
        { 
            id: 'task-3', 
            title: 'Real-time notifications', 
            colorVariant: 'green', 
            date: '2026-04-25' 
        },
    ]

    const dayNames = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.']

    return (
        <section className="h-full overflow-hidden rounded-[10px] border border-gray-200 bg-white">
            <div className="grid h-full grid-cols-7">
                {dayNames.map((shortName, index) => {
                    const columnDate = addDays(startDate, index)
                    const isToday = isSameDay(columnDate, new Date())

                    const tasksForThisDay = allTasks.filter(task => 
                        isSameDay(parseISO(task.date), columnDate)
                    )

                    return (
                        <article
                            key={columnDate.toISOString()}
                            className="h-full border-r-2 border-gray-100 last:border-r-0 bg-white flex flex-col"
                        >
                            <header className={`border-b border-slate-200 gap-1 px-3 py-4 text-center ${isToday ? 'bg-scrumdone-blue-200' : 'bg-white'}`}>
                                <p className="font-segoe-ui text-[14px] leading-5 font-normal text-slate-700 antialiased">
                                    {shortName}
                                </p>
                                <p className={`font-segoe-ui text-[18px] leading-7 font-normal ${isToday ? 'text-scrumdone-blue-main' : 'text-slate-900'} antialiased`}>
                                    {format(columnDate, 'd')}
                                </p>
                            </header>

                            <div className={`flex flex-1 flex-col gap-2 px-2 py-2 ${isToday ? 'bg-scrumdone-blue-200/30' : 'bg-white'}`}>
                                {tasksForThisDay.map((task) => (
                                    <CalendarTaskItem 
                                        key={task.id} 
                                        title={task.title} 
                                        colorVariant={task.colorVariant} 
                                    />
                                ))}
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}

export default WeekCalendar