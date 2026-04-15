import React from 'react'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTaskItemProps {
    title: string
    colorVariant: TaskColor
}

const colorVariantMap: Record<TaskColor, { border: string; bg: string }> = {
    red: {
        border: 'border-l-scrumdone-red-500',
        bg: 'bg-scrumdone-red-100',
    },
    yellow: {
        border: 'border-l-scrumdone-yellow-500',
        bg: 'bg-scrumdone-yellow-100',
    },
    green: {
        border: 'border-l-scrumdone-green-500',
        bg: 'bg-scrumdone-green-100',
    },
    orange: {
        border: 'border-l-scrumdone-orange',
        bg: 'bg-orange-600',
    },
    blue: {
        border: 'border-l-scrumdone-blue-main',
        bg: 'bg-scrumdone-blue-200',
    },
}

const CalendarTaskItem: React.FC<CalendarTaskItemProps> = ({ title, colorVariant }) => {
    const colors = colorVariantMap[colorVariant]

    return (
        <div 
            className={`flex items-center gap-2 rounded-lg border-l-4 px-3 py-2 ${colors.border} ${colors.bg}`}        >
            <span className="h-2 w-2 rounded-full bg-current" />
            <p className="truncate font-segoe-ui text-[12px] leading-4 font-normal text-slate-900 antialiased">{title}</p>
        </div>
    )
}

export default CalendarTaskItem
