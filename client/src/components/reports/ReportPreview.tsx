import React from 'react'
import type { ReportPreviewSample, ReportPreviewTaskTone } from '../../data/reports'

interface ReportPreviewProps {
    sample: ReportPreviewSample
}

const TONE_CLASS: Record<ReportPreviewTaskTone, string> = {
    overdue: 'text-[#DC2626]',
    inProgress: 'text-[#2563EB]',
    inReview: 'text-[#A16207]',
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ sample }) => {
    const { burnup, taskCounts } = sample
    const progressSegments = [
        { key: 'done', count: taskCounts.done, className: 'bg-[#22C55E]' },
        { key: 'inProgress', count: taskCounts.inProgress, className: 'bg-[#3B82F6]' },
        { key: 'inReview', count: taskCounts.inReview, className: 'bg-[#EAB308]' },
        { key: 'todo', count: taskCounts.todo, className: 'bg-[#CBD5E1]' },
    ]

    return (
        <div className="flex h-full flex-col rounded-[14px] border border-slate-200 bg-slate-50 px-[15px] py-[14px]">
            <h3 className="mb-[9px] font-segoe-ui text-[13px] leading-5 font-normal text-slate-700 antialiased">Podgląd</h3>

            <article className="flex-1 rounded-[10px] lg:min-h-[364px] border border-slate-200 bg-white p-4">
                <h4 className="font-segoe-ui text-base leading-[22px] font-normal text-slate-900 antialiased">{sample.title}</h4>
                <p className="text-[11px] leading-[14px] text-slate-500">{sample.subtitle}</p>

                <div className="mt-3 grid grid-cols-1 gap-[7px] sm:grid-cols-3">
                    {sample.stats.map((stat) => (
                        <div key={stat.label} className="rounded-[10px] bg-slate-50 px-3 py-[11px]">
                            <p className="text-[11px] leading-4 text-slate-500">{stat.label}</p>
                            <p className="font-segoe-ui text-base leading-[22px] text-slate-900 antialiased">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div
                    role="img"
                    aria-label={`Zadania: ${taskCounts.done} ukończone, ${taskCounts.inProgress} w toku, ${taskCounts.inReview} w przeglądzie, ${taskCounts.todo} do zrobienia`}
                    className="mt-[11px] flex h-2 overflow-hidden rounded-full"
                >
                    {progressSegments.map((segment) => (
                        <span key={segment.key} className={segment.className} style={{ flexGrow: segment.count }} />
                    ))}
                </div>

                <div className="mt-[25px] grid grid-cols-1 gap-[19px] sm:grid-cols-[minmax(0,294fr)_minmax(0,299fr)]">
                    <div className="pl-6">
                        <svg
                            viewBox="0 0 270 115"
                            role="img"
                            aria-label="Wykres burnup: zakres zadań i zadania ukończone w kolejnych dniach sprintu"
                            className="block h-auto w-full overflow-visible"
                        >
                            <line x1="0" y1={burnup.baselineY} x2="270" y2={burnup.baselineY} stroke="#E2E8F0" strokeWidth="1.5" />
                            <polyline points={burnup.scopeLine} fill="none" stroke="#FF8C00" strokeWidth="2.5" />
                            <polyline points={burnup.doneLine} fill="none" stroke="#00BFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-1 flex justify-between text-[11px] leading-4 text-slate-500">
                            <span>{burnup.firstDayLabel}</span>
                            <span>{burnup.lastDayLabel}</span>
                        </div>
                    </div>

                    <div className="-mt-3">
                        <p className="text-xs leading-[18px] text-slate-700">Niedokończone ({sample.unfinishedCount})</p>
                        <ul className="divide-y divide-slate-100">
                            {sample.unfinishedTasks.map((task) => (
                                <li key={task.title} className="flex items-center justify-between gap-3 py-[7px] text-xs leading-4">
                                    <span className="min-w-0 truncate text-slate-800">{task.title}</span>
                                    <span className={`shrink-0 ${TONE_CLASS[task.tone]}`}>{task.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </article>
        </div>
    )
}

export default ReportPreview
