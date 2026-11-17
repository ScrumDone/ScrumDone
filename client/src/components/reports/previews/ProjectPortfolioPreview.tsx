import React from 'react'
import { Badge, Kpi, KpiRow, Legend, MiniBar, PreviewCard, SectionTitle, StackedBar, Td, Th } from './ReportPreviewParts'

// Przykładowe dane podglądu (nie z API).
const progress = [
    { name: 'Portal klienta', done: 46, inProgress: 30, todo: 24 },
    { name: 'Nexus', done: 41, inProgress: 34, todo: 25 },
    { name: 'Adoddle', done: 62, inProgress: 25, todo: 13 },
    { name: 'Aplikacja HR', done: 48, inProgress: 22, todo: 30 },
]

type Health = 'red' | 'amber' | 'green'
const healthLabel: Record<Health, string> = { red: 'Zagrożony', amber: 'Uwaga', green: 'Dobrze' }
const workColor: Record<Health, string> = { red: 'bg-scrumdone-red-500', amber: 'bg-scrumdone-yellow-500', green: 'bg-scrumdone-green-500' }

const projects: {
    name: string
    client: string
    health: Health
    reason?: string
    overdue: number
    time: number
    work: number
    planned: string
    forecast: string
    forecastClass: string
}[] = [
    { name: 'Portal klienta', client: 'Bankowo SA', health: 'red', reason: 'prognoza po planowanym końcu', overdue: 4, time: 61, work: 46, planned: '20.01.2027', forecast: '02.02.2027', forecastClass: 'text-scrumdone-red-600' },
    { name: 'Nexus', client: 'Nexus Group', health: 'red', reason: '5 zadań po terminie', overdue: 5, time: 72, work: 41, planned: '30.11.2026', forecast: '22.12.2026', forecastClass: 'text-scrumdone-red-600' },
    { name: 'Adoddle', client: 'Acme sp. z o.o.', health: 'amber', reason: '1 zadanie zablokowane', overdue: 1, time: 70, work: 62, planned: '15.12.2026', forecast: '12.12.2026', forecastClass: '' },
    { name: 'Aplikacja HR', client: 'Kadry24', health: 'green', overdue: 0, time: 40, work: 48, planned: '28.02.2027', forecast: '10.02.2027', forecastClass: 'text-scrumdone-green-500' },
]

const ProjectPortfolioPreview: React.FC = () => (
    <PreviewCard title="Portfel projektów" subtitle="Wszystkie projekty • stan na 17.11.2026">
        <KpiRow>
            <Kpi label="Projekty" value="12" sub="w tym 8 aktywnych" />
            <Kpi label="Dobra kondycja" value="5" tone="green" />
            <Kpi label="Wymaga uwagi" value="1" tone="amber" />
            <Kpi label="Zagrożone" value="2" tone="red" />
        </KpiRow>

        <div>
            <SectionTitle>Postęp projektów</SectionTitle>
            <div className="flex flex-col gap-2 text-[12.5px]">
                {progress.map((p) => (
                    <div key={p.name} className="grid grid-cols-[130px_1fr_40px] items-center gap-2.5">
                        <span>{p.name}</span>
                        <StackedBar
                            segments={[
                                { value: p.done, className: 'bg-scrumdone-green-600' },
                                { value: p.inProgress, className: 'bg-scrumdone-blue-600' },
                                { value: p.todo, className: 'bg-slate-300' },
                            ]}
                        />
                        <span>{p.done}%</span>
                    </div>
                ))}
            </div>
            <Legend
                items={[
                    { label: 'gotowe', className: 'bg-scrumdone-green-600' },
                    { label: 'w toku', className: 'bg-scrumdone-blue-600' },
                    { label: 'do zrobienia', className: 'bg-slate-300' },
                ]}
            />
        </div>

        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <Th>Projekt</Th>
                    <Th>Kondycja</Th>
                    <Th>Po terminie</Th>
                    <Th className="w-[150px]">Czas vs praca</Th>
                    <Th>Planowany koniec</Th>
                    <Th>Prognoza</Th>
                </tr>
            </thead>
            <tbody>
                {projects.map((p) => (
                    <tr key={p.name}>
                        <Td>
                            {p.name}
                            <br />
                            <span className="text-[12px] text-slate-500">{p.client}</span>
                        </Td>
                        <Td>
                            <Badge tone={p.health}>{healthLabel[p.health]}</Badge>
                            {p.reason ? (
                                <>
                                    <br />
                                    <span className="text-[12px] text-slate-500">{p.reason}</span>
                                </>
                            ) : null}
                        </Td>
                        <Td className={p.overdue >= 3 ? 'text-scrumdone-red-600' : ''}>{p.overdue}</Td>
                        <Td>
                            <MiniBar percent={p.time} colorClass="bg-slate-400" />
                            <MiniBar percent={p.work} colorClass={workColor[p.health]} className="mt-1" />
                        </Td>
                        <Td>{p.planned}</Td>
                        <Td className={p.forecastClass}>{p.forecast}</Td>
                    </tr>
                ))}
            </tbody>
        </table>
    </PreviewCard>
)

export default ProjectPortfolioPreview
