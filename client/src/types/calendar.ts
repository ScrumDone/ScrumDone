export type CalendarMode = 'Personal' | 'Team'

export type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

// Zadanie z terminem wyświetlane w siatce kalendarza
export type CalendarTask = {
    id: string
    title: string
    colorVariant: TaskColor
    date: string // yyyy-MM-dd w strefie lokalnej, patrz toDayKey
    priorityHexColor?: string | null | undefined
}
