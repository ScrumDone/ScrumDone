import React, { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import Avatar from './Avatar'

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

interface PersonFilter {
    id: string
    initials: string
    fullName: string
}

interface PersonFilterSectionProps {
    people: PersonFilter[]
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

const PersonFilterSection: React.FC<PersonFilterSectionProps> = ({ people }) => {
    const [selectedPeople, setSelectedPeople] = useState<Record<string, boolean>>(
        () => Object.fromEntries(people.map((person) => [person.id, true])),
    )

    const togglePerson = (personId: string) => {
        setSelectedPeople((current) => ({
            ...current,
            [personId]: !current[personId],
        }))
    }

    return (
        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">Osoby</h3>
            <div className="flex flex-col gap-3">
                {people.map((person) => {
                    const isSelected = selectedPeople[person.id]

                    return (
                        <button
                            key={person.id}
                            type="button"
                            onClick={() => togglePerson(person.id)}
                            className="flex items-center gap-3 text-left"
                            aria-pressed={isSelected}
                        >
                            <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] border transition-colors ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                                <CheckIcon className="h-5 w-5" strokeWidth={2.5} />
                            </span>
                            <Avatar initials={person.initials} size="md" />
                            <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{person.fullName}</span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({ mode }) => {
    return (
        <aside className="flex w-44 flex-col gap-3 pr-1">
            {mode === 'Team' ? <PersonFilterSection people={personFilterOptions} /> : null}

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