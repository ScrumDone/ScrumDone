import type { ComponentType } from 'react'
import ProjectStatusPreview from './ProjectStatusPreview'
import ProjectPortfolioPreview from './ProjectPortfolioPreview'
import SprintSummaryPreview from './SprintSummaryPreview'
import TeamWorkloadPreview from './TeamWorkloadPreview'
import DeadlinesPreview from './DeadlinesPreview'

/** Identyfikatory typów raportów. Wartości odpowiadają enumowi ReportType na backendzie. */
export type ReportTypeId = 'ProjectStatus' | 'ProjectPortfolio' | 'SprintSummary' | 'TeamWorkload' | 'Deadlines'

/** Pola, które popup „Wygeneruj raport” pokazuje dla danego typu. */
type ReportParam = 'project' | 'period' | 'sprint' | 'onlyMine'

interface ReportTypeDefinition {
    id: ReportTypeId
    /** Nazwa na liście wyboru i w nagłówku raportu. */
    name: string
    /** Pytanie, na które raport odpowiada (podpis pod nazwą). */
    question: string
    /** Krótki opis pokazywany obok podglądu. */
    description: string
    /** Parametry wymagane / dostępne w popupie. */
    params: ReportParam[]
    /** Statyczny podgląd z przykładowymi danymi. Owijać w <ReportPreviewFrame>. */
    Preview: ComponentType
}

export const REPORT_TYPES: ReportTypeDefinition[] = [
    {
        id: 'ProjectStatus',
        name: 'Status projektu',
        question: 'Jak idzie projekt i kiedy się skończy?',
        description:
            'Postęp projektu, otwarte zadania i ile z nich jest po terminie, planowany koniec i prognoza zakończenia z tempa zespołu i estymat. Do tego otwarte zadania, terminy na 30 dni i notatki o kliencie z okresu.',
        params: ['project', 'period'],
        Preview: ProjectStatusPreview,
    },
    {
        id: 'ProjectPortfolio',
        name: 'Portfel projektów',
        question: 'Które projekty są zagrożone opóźnieniem?',
        description:
            'Wszystkie projekty z kondycją (dobrze / uwaga / zagrożony) i jej powodem, postępem, zadaniami po terminie, porównaniem czasu z wykonaną pracą i prognozą. Najbardziej zagrożone na górze.',
        params: [],
        Preview: ProjectPortfolioPreview,
    },
    {
        id: 'SprintSummary',
        name: 'Podsumowanie sprintu',
        question: 'Czy postępy zgadzają się z deklaracjami zespołu?',
        description:
            'Co zrobiono w sprincie, co jest w toku, co czeka na kogoś i co jest po terminie. Najbliższe terminy i zalecany zakres pracy na następny sprint z sygnałem przeładowania.',
        params: ['project', 'sprint', 'onlyMine'],
        Preview: SprintSummaryPreview,
    },
    {
        id: 'TeamWorkload',
        name: 'Zaangażowanie zespołu',
        question: 'Kto ile ma pracy?',
        description:
            'Obciążenie każdej osoby w bieżącym miesiącu i 5 kolejnych, w podziale na projekty. Godziny z estymat otwartych zadań względem pełnego etatu (168 h). Przeciążeni i osoby z wolnymi mocami wyróżnieni.',
        params: ['project'],
        Preview: TeamWorkloadPreview,
    },
    {
        id: 'Deadlines',
        name: 'Terminy',
        question: 'Co i kiedy trzeba oddać?',
        description:
            'Terminy zadań i końce sprintów w najbliższych 12 tygodniach, tydzień po tygodniu. Lista zadań po terminie i terminów na najbliższe 30 dni.',
        params: ['project'],
        Preview: DeadlinesPreview,
    },
]

export const getReportType = (id: ReportTypeId): ReportTypeDefinition =>
    REPORT_TYPES.find((t) => t.id === id) ?? (REPORT_TYPES[0] as ReportTypeDefinition)
