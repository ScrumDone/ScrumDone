import React from 'react'
import CalendarTaskItem from './calendarTaskItem'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTask {
    id: string
    title: string
    colorVariant: TaskColor
}

interface CalendarDay {
    id: string
    shortName: string
    date: number
    isSelected?: boolean
    tasks?: CalendarTask[]
}

const days: CalendarDay[] = [
    { id: 'mon', shortName: 'pon.', date: 6 },
    {
        id: 'tue',
        shortName: 'wt.',
        date: 7,
        isSelected: true,
        tasks: [
            { id: 'task-1', title: 'Quotes Generation Module', colorVariant: 'red' },
            { id: 'task-2', title: 'Database schema design', colorVariant: 'yellow' },
        ],
    },
    { id: 'wed', shortName: 'śr.', date: 8 },
    { id: 'thu', shortName: 'czw.', date: 9 },
    { id: 'fri', shortName: 'pt.', date: 10 },
    {
        id: 'sat',
        shortName: 'sob.',
        date: 11,
        tasks: [{ id: 'task-3', title: 'Real-time notifications', colorVariant: 'green' }],
    },
    { id: 'sun', shortName: 'niedz.', date: 12 },
]

const WeekCalendar: React.FC = () => {
    return (
        <section className="h-full overflow-hidden rounded-[10px] border border-gray-200 bg-white">
            <div className="grid h-full grid-cols-7">
                {days.map((day) => (
                    <article
                        key={day.id}
                        className="h-full min-h-[calc(100vh-16rem)] border-r-2 border-gray-100 last:border-r-0 bg-white"
                    >
                        <header className={`border-b border-slate-200 gap-1 px-3 py-4 text-center ${day.isSelected ? 'bg-scrumdone-blue-200' : 'bg-white'}`}>
                            <p className="font-segoe-ui text-[14px] leading-5 font-normal text-slate-700 antialiased">{day.shortName}</p>
                            <p className={`font-segoe-ui text-[18px] leading-7 font-normal ${day.isSelected ? 'text-scrumdone-blue-main' : 'text-slate-900'} antialiased`}>{day.date}</p>
                        </header>

                        <div className={`flex h-full flex-col gap-2 px-2 py-2 ${day.isSelected ? 'bg-scrumdone-blue-200/30' : 'bg-white'}`}>
                            {day.tasks?.map((task) => (
                                <CalendarTaskItem key={task.id} title={task.title} colorVariant={task.colorVariant} />
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default WeekCalendar