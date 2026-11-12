import React, { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ReportPreview from './ReportPreview'
import {
    reportGenerateDefaults,
    reportPreviewSample,
    reportProjectOptions,
    reportTypeOptions,
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
    const [type, setType] = useState(reportGenerateDefaults.type)
    const [project, setProject] = useState(reportGenerateDefaults.project)
    const [dateFrom, setDateFrom] = useState(reportGenerateDefaults.dateFrom)
    const [dateTo, setDateTo] = useState(reportGenerateDefaults.dateTo)

    return (
        <div
            className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/35 sm:items-center sm:px-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-generate-title"
                className="flex h-full w-full max-w-[1092px] flex-col bg-white sm:h-auto sm:max-h-[90vh] sm:rounded-[14px] sm:shadow-lg"
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

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 lg:grid-cols-[344px_minmax(0,1fr)]">
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
                                onChange={(event) => setType(event.target.value)}
                                className={SELECT_CLASS}
                            >
                                {reportTypeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={LABEL_CLASS} htmlFor="report-project">
                                Projekt
                            </label>
                            <select
                                id="report-project"
                                value={project}
                                onChange={(event) => setProject(event.target.value)}
                                className={SELECT_CLASS}
                            >
                                {reportProjectOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                    </div>

                    <ReportPreview sample={reportPreviewSample} />
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
