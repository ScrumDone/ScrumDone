import React from 'react'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTaskItemProps {
    title: string
    colorVariant: TaskColor
}

const colorVariantMap: Record<TaskColor, { border: string; bg: string; dot: string }> = {
    red: {
        border: 'border-l-scrumdone-red-500',
        bg: 'bg-scrumdone-red-100',
        dot: 'bg-scrumdone-red-500',
    },
    yellow: {
        border: 'border-l-scrumdone-yellow-500',
        bg: 'bg-scrumdone-yellow-400/15',
        dot: 'bg-scrumdone-yellow-500',
    },
    green: {
        border: 'border-l-scrumdone-green-500',
        bg: 'bg-scrumdone-green-100',
        dot: 'bg-scrumdone-green-500',
    },
    orange: {
        border: 'border-l-scrumdone-orange',
        bg: 'bg-scrumdone-orange/15',
        dot: 'bg-scrumdone-orange',
    },
    blue: {
        border: 'border-l-scrumdone-blue-main',
        bg: 'bg-scrumdone-blue-200',
        dot: 'bg-scrumdone-blue-main',
    },
}

const CalendarTaskItem: React.FC<CalendarTaskItemProps> = ({ title, colorVariant }) => {
    const colors = colorVariantMap[colorVariant]

    return (
        <div
            className={`flex items-center gap-2 rounded-sm border-l-4 px-3 py-2 ${colors.border} ${colors.bg}`}
        >
            <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
            <p className="truncate font-segoe-ui text-[12px] leading-4 font-normal text-slate-900 antialiased">{title}</p>
        </div>
    )
}

export default CalendarTaskItem
