import React from 'react'
import Avatar from '../common/Avatar'
import type { ReportsQuickStats } from '../../data/reports'

interface ReportQuickStatsProps {
    stats: ReportsQuickStats
}

const ReportQuickStats: React.FC<ReportQuickStatsProps> = ({ stats }) => {
    const { topUserThisMonth: topUser } = stats

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Projekty">
                <div className="flex">
                    <div className="pr-6">
                        <StatValue>{stats.activeProjectsCount}</StatValue>
                        <p className="text-xs leading-4 text-emerald-700">aktywne</p>
                    </div>
                    <div className="border-l border-slate-200 pl-6">
                        <StatValue>{stats.completedProjectsCount}</StatValue>
                        <p className="text-xs leading-4 text-slate-500">zakończone</p>
                    </div>
                </div>
            </StatCard>

            <StatCard title="Zagrożone opóźnieniem">
                <StatValue className="text-scrumdone-red-600">{stats.atRiskProjects.length}</StatValue>
                <p className="text-xs leading-4 text-slate-600">{stats.atRiskProjects.join(', ')}</p>
            </StatCard>

            <StatCard title="Zadania ukończone w tym miesiącu">
                <StatValue>{stats.tasksCompletedThisMonth}</StatValue>
                <p className="text-xs leading-4 text-slate-600">we wszystkich projektach</p>
            </StatCard>

            <StatCard title="Najwięcej godzin w tym miesiącu">
                <div className="flex items-center gap-3">
                    <Avatar initials={topUser.initials} size="md" className="shrink-0" />
                    <div className="min-w-0">
                        <p className="break-words text-base leading-6 text-slate-900">{topUser.name}</p>
                        <p className="text-xs leading-4 text-slate-600">{topUser.hours} h</p>
                    </div>
                </div>
            </StatCard>
        </div>
    )
}

interface StatCardProps {
    title: string
    children: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, children }) => {
    return (
        <section className="rounded-[14px] border border-slate-200 bg-white p-5">
            <h3 className="mb-2 font-segoe-ui text-[13px] leading-5 font-normal text-slate-600 antialiased">
                {title}
            </h3>
            {children}
        </section>
    )
}

interface StatValueProps {
    className?: string
    children: React.ReactNode
}

const StatValue: React.FC<StatValueProps> = ({ className = 'text-slate-900', children }) => {
    return <p className={`font-segoe-ui text-2xl leading-8 font-normal antialiased ${className}`}>{children}</p>
}

export default ReportQuickStats
