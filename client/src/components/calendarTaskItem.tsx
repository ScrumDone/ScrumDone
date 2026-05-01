import React from 'react'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTaskItemProps {
    title: string
    colorVariant: TaskColor
}

const colorVariantMap: Record<TaskColor, { dot: string }> = {
    red: {
        dot: 'bg-scrumdone-red-500',
    },
    yellow: {
        dot: 'bg-scrumdone-yellow-500',
    },
    green: {
        dot: 'bg-scrumdone-green-500',
    },
    orange: {
        dot: 'bg-scrumdone-orange',
    },
    blue: {
        dot: 'bg-scrumdone-blue-main',
    },
}

const CalendarTaskItem: React.FC<CalendarTaskItemProps> = ({ title, colorVariant }) => {
    const colors = colorVariantMap[colorVariant]

    return (
        <div
            className={`
                flex items-center gap-2 
                rounded-lg border-l-[3px] 
                px-2 py-2 
                transition-colors cursor-pointer
                border-l-[#00aaff] 
                bg-[#eef9ff] 
                hover:bg-[#e0f2fe]
            `}
        >
            {/* Kropka zachowuje swój unikalny kolor zależny od wariantu */}
            <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
            
            <p className="truncate font-segoe-ui text-[12px] leading-4 font-medium text-slate-700 antialiased">
                {title}
            </p>
        </div>
    )
}

export default CalendarTaskItem