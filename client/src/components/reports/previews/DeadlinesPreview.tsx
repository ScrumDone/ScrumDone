import React from 'react'
import { Kpi, KpiRow, Legend, PreviewCard, SectionTitle, Td, Th } from './ReportPreviewParts'

// Przykładowe dane podglądu (nie z API). Liczba terminów w tygodniu wg priorytetu + czy kończy się sprint.
const weeks: { label: string; low: number; medium: number; high: number; sprintEnd?: boolean }[] = [
    { label: '17.11', low: 6, medium: 2, high: 1 },
    { label: '24.11', low: 5, medium: 3, high: 2, sprintEnd: true },
    { label: '01.12', low: 7, medium: 4, high: 3 },
    { label: '08.12', low: 4, medium: 2, high: 1 },
    { label: '15.12', low: 5, medium: 2, high: 0, sprintEnd: true },
    { label: '22.12', low: 2, medium: 1, high: 0 },
    { label: '29.12', low: 4, medium: 2, high: 0 },
    { label: '05.01', low: 5, medium: 2, high: 0, sprintEnd: true },
    { label: '12.01', low: 3, medium: 0, high: 2 },
    { label: '19.01', low: 2, medium: 1, high: 0 },
    { label: '26.01', low: 3, medium: 0, high: 0, sprintEnd: true },
    { label: '02.02', low: 2, medium: 0, high: 0 },
]

const UNIT = 7.5 // px na jeden termin, oś 0–16
const BASE = 170

const WeeksChart: React.FC = () => (
    <svg width="100%" viewBox="0 0 980 200" role="img" aria-label="Terminy w kolejnych 12 tygodniach">
        <line x1="34" y1={BASE} x2="975" y2={BASE} className="stroke-slate-300" />
        <g fontSize="10" className="fill-slate-500" textAnchor="end">
            <text x="28" y="174">0</text>
            <text x="28" y="114">8</text>
            <text x="28" y="54">16</text>
        </g>
        <g className="stroke-slate-100">
            <line x1="34" y1="110" x2="975" y2="110" />
            <line x1="34" y1="50" x2="975" y2="50" />
        </g>
        {weeks.map((w, i) => {
            const x = 50 + i * 78
            const parts = [
                { n: w.low, c: 'fill-scrumdone-blue-600' },
                { n: w.medium, c: 'fill-scrumdone-yellow-500' },
                { n: w.high, c: 'fill-scrumdone-red-500' },
                { n: w.sprintEnd ? 1 : 0, c: 'fill-slate-900' },
            ]
            let y = BASE
            return (
                <g key={w.label}>
                    {parts.map((p, j) => {
                        if (!p.n) return null
                        const h = p.n * UNIT
                        y -= h
                        return <rect key={j} x={x} y={y} width="48" height={h} className={p.c} />
                    })}
                    <text x={x + 24} y="186" fontSize="10" className="fill-slate-600" textAnchor="middle">{w.label}</text>
                </g>
            )
        })}
    </svg>
)

const overdue = [
    { what: 'Raport sprzedaży', project: 'Nexus', days: '9 dni' },
    { what: 'Integracja z płatnościami', project: 'Portal klienta', days: '5 dni' },
    { what: 'Baner cookies', project: 'Adoddle', days: '2 dni' },
]

const next30 = [
    { date: '21.11', what: 'Eksport faktur do CSV', kind: 'zadanie' },
    { date: '24.11', what: 'Koniec Sprintu 8 – Adoddle', kind: 'koniec sprintu' },
    { date: '30.11', what: 'Nexus', kind: 'planowany koniec projektu' },
]

const DeadlinesPreview: React.FC = () => (
    <PreviewCard title="Terminy – najbliższe 12 tygodni" subtitle="Wszystkie projekty • 17.11.2026 – 09.02.2027">
        <KpiRow>
            <Kpi label="Terminy w 12 tygodniach" value="86" />
            <Kpi label="Po terminie" value="7" tone="red" />
            <Kpi label="Najbardziej obciążony tydzień" value="01.12 – 07.12" sub="14 terminów • 52 h wg estymat" />
            <Kpi label="Bez terminu" value="19" sub="otwartych zadań" />
        </KpiRow>

        <div>
            <SectionTitle>Terminy w tygodniach</SectionTitle>
            <WeeksChart />
            <Legend
                items={[
                    { label: 'High', className: 'bg-scrumdone-red-500' },
                    { label: 'Medium', className: 'bg-scrumdone-yellow-500' },
                    { label: 'Low / bez priorytetu', className: 'bg-scrumdone-blue-600' },
                    { label: 'koniec sprintu', className: 'bg-slate-900' },
                ]}
            />
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div>
                <SectionTitle>Po terminie</SectionTitle>
                <table className="w-full border-collapse">
                    <thead>
                        <tr><Th>Co</Th><Th>Projekt</Th><Th>Spóźnienie</Th></tr>
                    </thead>
                    <tbody>
                        {overdue.map((o) => (
                            <tr key={o.what}>
                                <Td>{o.what}</Td>
                                <Td>{o.project}</Td>
                                <Td className="text-scrumdone-red-600">{o.days}</Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-l border-slate-200 pl-8">
                <SectionTitle>Najbliższe 30 dni</SectionTitle>
                <table className="w-full border-collapse">
                    <thead>
                        <tr><Th>Termin</Th><Th>Co</Th><Th>Rodzaj</Th></tr>
                    </thead>
                    <tbody>
                        {next30.map((n) => (
                            <tr key={n.what}>
                                <Td>{n.date}</Td>
                                <Td>{n.what}</Td>
                                <Td className="text-slate-500">{n.kind}</Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </PreviewCard>
)

export default DeadlinesPreview
