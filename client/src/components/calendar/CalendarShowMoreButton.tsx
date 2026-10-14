import React from 'react'

interface CalendarShowMoreButtonProps {
    dayKey: string
    // Liczba wszystkich zadań w dniu (totalCount z API); brak = dzień wczytany w całości
    dayTotal?: number | undefined
    shownCount: number
    onShowMore?: ((dayKey: string) => void) | undefined
    className?: string
}

// "+N więcej" pod zadaniami dnia, gdy limit zapytania kalendarza obciął część zadań
const CalendarShowMoreButton: React.FC<CalendarShowMoreButtonProps> = ({
    dayKey,
    dayTotal,
    shownCount,
    onShowMore,
    className = '',
}) => {
    const hiddenCount = dayTotal === undefined ? 0 : dayTotal - shownCount
    if (hiddenCount <= 0 || !onShowMore) return null

    return (
        <button
            type="button"
            onClick={() => onShowMore(dayKey)}
            className={`w-full rounded-md px-2 py-1 text-left font-segoe-ui text-[12px] leading-4 font-medium text-scrumdone-blue-main transition-colors hover:bg-slate-100 ${className}`}
        >
            +{hiddenCount} więcej
        </button>
    )
}

export default CalendarShowMoreButton
