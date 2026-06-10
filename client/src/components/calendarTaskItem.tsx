import React from 'react'
import { useNavigate } from 'react-router-dom'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTaskItemProps {
    title: string
    colorVariant: TaskColor
}

const colorVariantMap: Record<TaskColor, { dot: string; border: string; bg: string }> = {
    red: {
        dot: 'bg-scrumdone-red-500',
        border: 'border-l-scrumdone-red-500',
        bg: 'bg-red-50',
    },
    yellow: {
        dot: 'bg-scrumdone-yellow-500',
        border: 'border-l-scrumdone-yellow-500',
        bg: 'bg-yellow-50',
    },
    green: {
        dot: 'bg-scrumdone-green-500',
        border: 'border-l-scrumdone-green-500',
        bg: 'bg-green-50',
    },
    orange: {
        dot: 'bg-scrumdone-orange',
        border: 'border-l-scrumdone-orange',
        bg: 'bg-orange-50',
    },
    blue: {
        dot: 'bg-scrumdone-blue-main',
        border: 'border-l-scrumdone-blue-main',
        bg: 'bg-blue-50',
    },
}

const CalendarTaskItem: React.FC<CalendarTaskItemProps> = ({ title, colorVariant }) => {
    const colors = colorVariantMap[colorVariant]
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/task')
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleClick()
                }
            }}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border-l-[3px] px-2 py-2 transition-colors hover:opacity-90 ${colors.border} ${colors.bg}`}
        >
            <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
            <p className="truncate font-segoe-ui text-[12px] leading-4 font-medium text-slate-700 antialiased">
                {title}
            </p>
        </div>
    )
}

export default CalendarTaskItem