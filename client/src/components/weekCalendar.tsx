import React from 'react'

interface CalendarTask {
    id: string
    title: string
    colorClass: string
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
            { id: 'task-1', title: 'Quotes Generation Module', colorClass: 'bg-scrumdone-red-500' },
            { id: 'task-2', title: 'Database schema design', colorClass: 'bg-scrumdone-yellow-500' },
        ],
    },
    { id: 'wed', shortName: 'śr.', date: 8 },
    { id: 'thu', shortName: 'czw.', date: 9 },
    { id: 'fri', shortName: 'pt.', date: 10 },
    {
        id: 'sat',
        shortName: 'sob.',
        date: 11,
        tasks: [{ id: 'task-3', title: 'Real-time notifications', colorClass: 'bg-scrumdone-green-500' }],
    },
    { id: 'sun', shortName: 'niedz.', date: 12 },
]

const WeekCalendar: React.FC = () => {
    return (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="grid grid-cols-7">
                {days.map((day) => (
                    <article
                        key={day.id}
                        className={`min-h-[515px] border-r border-slate-200 last:border-r-0 ${day.isSelected ? 'bg-scrumdone-blue-300/40' : 'bg-white'}`}
                    >
                        <header className="border-b border-slate-200 px-3 py-2 text-center">
                            <p className="font-segoe-ui text-[10px] leading-4 font-normal text-slate-500 antialiased">{day.shortName}</p>
                            <p className="font-segoe-ui text-[20px] leading-7 font-normal text-slate-700 antialiased">{day.date}</p>
                        </header>

                        <div className="flex flex-col gap-2 px-2 py-2">
                            {day.tasks?.map((task) => (
                                <div key={task.id} className="flex items-center gap-1 rounded-sm bg-slate-100 px-1.5 py-1">
                                    <span className={`h-2 w-0.5 rounded-full ${task.colorClass}`} />
                                    <p className="truncate font-segoe-ui text-[9px] leading-3 font-normal text-slate-700 antialiased">
                                        {task.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default WeekCalendar