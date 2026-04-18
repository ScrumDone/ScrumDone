import React from 'react'
import CalendarPeopleFilter, { type PersonFilter } from './calendarPeopleFilter'

type CalendarMode = 'Personal' | 'Team'

interface FilterOption {
    id: string
    label: string
    colorClass: string
}

interface FilterSectionProps {
    title: string
    options: FilterOption[]
}

interface CalendarFiltersProps {
    mode: CalendarMode
}

const personFilterOptions: PersonFilter[] = [
    { id: 'artur-nowak', initials: 'AN', fullName: 'Artur Nowak' },
    { id: 'eryk-baczynski', initials: 'EB', fullName: 'Eryk Baczyński' },
    { id: 'maria-kowalska', initials: 'MK', fullName: 'Maria Kowalska' },
    { id: 'jan-nowicki', initials: 'JN', fullName: 'Jan Nowicki' },
]

const FilterSection: React.FC<FilterSectionProps> = ({ title, options }) => {
    return (
        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">{title}</h3>
            <div className="flex flex-col gap-3">
                {options.map((option) => (
                    <label key={option.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900"
                            aria-label={option.label}
                        />
                        <span className={`h-2 w-2 rounded-full ${option.colorClass}`} />
                        <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{option.label}</span>
                    </label>
                ))}
            </div>
        </section>
    )
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({ mode }) => {
    return (
        <aside className="flex w-44 flex-col gap-3 pr-1">
            {mode === 'Team' ? <CalendarPeopleFilter people={personFilterOptions} /> : null}

            <FilterSection
                title="Projekty"
                options={[
                    { id: 'adoddle', label: 'Adoddle', colorClass: 'bg-scrumdone-yellow-500' },
                    { id: 'nexus', label: 'Nexus', colorClass: 'bg-scrumdone-red-500' },
                    { id: 'hadar', label: 'Hadar', colorClass: 'bg-scrumdone-green-500' },
                ]}
            />

            <FilterSection
                title="Priorytet"
                options={[
                    { id: 'wysoki', label: 'Wysoki', colorClass: 'bg-scrumdone-red-500' },
                    { id: 'sredni', label: 'Średni', colorClass: 'bg-scrumdone-yellow-500' },
                    { id: 'niski', label: 'Niski', colorClass: 'bg-scrumdone-green-500' },
                ]}
            />
        </aside>
    )
}

export default CalendarFilters