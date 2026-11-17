import React, { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ReportPreviewFrame from './previews/ReportPreviewFrame'
import { REPORT_TYPES, getReportType, type ReportTypeId } from './previews/reportTypes'
import {
    ALL_PROJECTS_OPTION,
    reportGenerateDefaults,
    reportProjectOptions,
    reportSprintOptions,
} from '../../data/reports'

interface ReportGenerateModalProps {
    onClose: () => void
}

const LABEL_CLASS = 'mb-[6px] block font-segoe-ui text-sm leading-5 text-slate-700 antialiased'
const FIELD_CLASS =
    'h-9 w-full rounded-[10px] border border-slate-200 bg-gray-100 px-3 font-segoe-ui text-sm leading-5 text-slate-800 outline-none transition-colors placeholder:text-slate-500 focus:border-scrumdone-blue-main'
const SELECT_CLASS = `${FIELD_CLASS} cursor-pointer appearance-none`
// Projekt nie ma ikony kalendarza: niewidoczny wskaźnik rozciągnięty na całe pole nadal otwiera wybór daty po kliknięciu.
const DATE_CLASS = `${FIELD_CLASS} relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`

const ReportGenerateModal: React.FC<ReportGenerateModalProps> = ({ onClose }) => {
    const [name, setName] = useState('')
    const [type, setType] = useState<ReportTypeId>('SprintSummary')
    const [project, setProject] = useState(reportGenerateDefaults.project)
    const [sprint, setSprint] = useState(reportGenerateDefaults.sprint)
    const [onlyMine, setOnlyMine] = useState(reportGenerateDefaults.onlyMine)
    const [dateFrom, setDateFrom] = useState(reportGenerateDefaults.dateFrom)
    const [dateTo, setDateTo] = useState(reportGenerateDefaults.dateTo)

    const selected = getReportType(type)
    const showProject = selected.params.includes('project')
    const showPeriod = selected.params.includes('period')
    const showSprint = selected.params.includes('sprint')
    const showOnlyMine = selected.params.includes('onlyMine')
    // „Wszystkie” ma sens tylko dla raportów z samym projektem (Zaangażowanie zespołu, Terminy);
    // Status projektu i Podsumowanie sprintu dotyczą jednego projektu.
    const allowAllProjects = showProject && !showPeriod && !showSprint
    const projectOptions = allowAllProjects
        ? reportProjectOptions
        : reportProjectOptions.filter((option) => option !== ALL_PROJECTS_OPTION)
    const projectValue = projectOptions.includes(project) ? project : (projectOptions[0] ?? '')

    return (
        <div
            className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/35 sm:items-center sm:px-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-generate-title"
                className="flex h-full w-full max-w-[1480px] flex-col bg-white sm:h-auto sm:max-h-[94vh] sm:rounded-[14px] sm:shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 px-6 pt-[17px] pb-6">
                    <div>
                        <h2
                            id="report-generate-title"
                            className="font-segoe-ui text-lg leading-6 font-semibold text-slate-900 antialiased"
                        >
                            Wygeneruj raport
                        </h2>
                        <p className="mt-0.5 font-segoe-ui text-sm leading-5 text-slate-500">
                            Wybierz rodzaj raportu i zakres danych. Po prawej zobaczysz, jak będzie wyglądał.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Zamknij okno generowania raportu"
                        className="cursor-pointer rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="space-y-[14px]">
                        <div>
                            <label className={LABEL_CLASS} htmlFor="report-name">
                                Nazwa raportu
                            </label>
                            <input
                                id="report-name"
                                type="text"
                                value={name}
                                placeholder={reportGenerateDefaults.namePlaceholder}
                                onChange={(event) => setName(event.target.value)}
                                className={FIELD_CLASS}
                            />
                        </div>

                        <div>
                            <label className={LABEL_CLASS} htmlFor="report-type">
                                Typ raportu
                            </label>
                            <select
                                id="report-type"
                                value={type}
                                onChange={(event) => setType(event.target.value as ReportTypeId)}
                                className={SELECT_CLASS}
                            >
                                {REPORT_TYPES.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 font-segoe-ui text-xs leading-4 text-slate-500">{selected.question}</p>
                        </div>

                        {showProject && (
                            <div>
                                <label className={LABEL_CLASS} htmlFor="report-project">
                                    Projekt
                                </label>
                                <select
                                    id="report-project"
                                    value={projectValue}
                                    onChange={(event) => setProject(event.target.value)}
                                    className={SELECT_CLASS}
                                >
                                    {projectOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {showSprint && (
                            <div>
                                <label className={LABEL_CLASS} htmlFor="report-sprint">
                                    Sprint
                                </label>
                                <select
                                    id="report-sprint"
                                    value={sprint}
                                    onChange={(event) => setSprint(event.target.value)}
                                    className={SELECT_CLASS}
                                >
                                    {reportSprintOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {showOnlyMine && (
                            <label className="flex cursor-pointer items-center gap-2 font-segoe-ui text-sm leading-5 text-slate-700 antialiased">
                                <input
                                    type="checkbox"
                                    checked={onlyMine}
                                    onChange={(event) => setOnlyMine(event.target.checked)}
                                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-scrumdone-blue-main"
                                />
                                Tylko moje zadania
                            </label>
                        )}

                        {showPeriod && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={LABEL_CLASS} htmlFor="report-date-from">
                                        Okres od
                                    </label>
                                    <input
                                        id="report-date-from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(event) => setDateFrom(event.target.value)}
                                        className={DATE_CLASS}
                                    />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS} htmlFor="report-date-to">
                                        Okres do
                                    </label>
                                    <input
                                        id="report-date-to"
                                        type="date"
                                        value={dateTo}
                                        onChange={(event) => setDateTo(event.target.value)}
                                        className={DATE_CLASS}
                                    />
                                </div>
                            </div>
                        )}

                        {selected.params.length === 0 && (
                            <p className="font-segoe-ui text-xs leading-4 text-slate-500">
                                Ten raport obejmuje wszystkie projekty i nie wymaga dodatkowych parametrów.
                            </p>
                        )}
                    </div>

                    <div className="flex h-full min-w-0 flex-col rounded-[14px] border border-slate-200 bg-slate-50 px-[15px] py-[14px]">
                        <h3 className="mb-[9px] font-segoe-ui text-[13px] leading-5 font-normal text-slate-700 antialiased">Podgląd</h3>
                        <ReportPreviewFrame key={selected.id}>
                            <selected.Preview />
                        </ReportPreviewFrame>
                        <p className="mt-2 font-segoe-ui text-xs leading-4 text-slate-500">{selected.description}</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 px-6 pt-5 pb-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-[42px] w-[91px] cursor-pointer rounded-[10px] border border-slate-200 bg-white font-segoe-ui text-sm text-slate-800 hover:bg-slate-50"
                    >
                        Anuluj
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-[42px] w-[116px] cursor-pointer rounded-[10px] bg-scrumdone-blue-main font-segoe-ui text-sm text-white hover:bg-[#00A0DD]"
                    >
                        Wygeneruj
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReportGenerateModal
