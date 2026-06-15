import React from 'react'
import { useNavigate } from 'react-router-dom'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTaskItemProps {
    id: string
    title: string
    colorVariant: TaskColor
    priorityHexColor?: string | null | undefined
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

const hexToRgba = (hexColor: string, alpha: number) => {
    const normalized = hexColor.replace('#', '').trim()

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return undefined
    }

    const r = Number.parseInt(normalized.slice(0, 2), 16)
    const g = Number.parseInt(normalized.slice(2, 4), 16)
    const b = Number.parseInt(normalized.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const CalendarTaskItem: React.FC<CalendarTaskItemProps> = ({ id, title, colorVariant, priorityHexColor }) => {
    const colors = colorVariantMap[colorVariant]
    const navigate = useNavigate()
    const priorityStyles = priorityHexColor
        ? {
            borderLeftColor: priorityHexColor,
            backgroundColor: hexToRgba(priorityHexColor, 0.1),
        }
        : undefined

    const handleClick = () => {
        navigate(`/task/${id}`)
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
            style={priorityStyles}
        >
            <span
                className={`inline-block h-2 w-2 shrink-0 rounded-full ${colors.dot}`}
                style={priorityHexColor ? { backgroundColor: priorityHexColor } : undefined}
            />
            <p className="truncate font-segoe-ui text-[12px] leading-4 font-medium text-slate-700 antialiased">
                {title}
            </p>
        </div>
    )
}

export default CalendarTaskItem
