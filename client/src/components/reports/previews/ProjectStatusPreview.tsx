import React from 'react'
import { Kpi, KpiRow, Legend, MiniBar, PreviewCard, SectionTitle, StackedBar, Td, Th } from './ReportPreviewParts'

// Przykładowe dane podglądu (nie z API).
const sprints = [
    { name: 'Sprint 2', h: 34 },
    { name: 'Sprint 3', h: 38 },
    { name: 'Sprint 4', h: 31 },
    { name: 'Sprint 5', h: 40 },
    { name: 'Sprint 6', h: 36 },
    { name: 'Sprint 7', h: 42 },
]
const AVG = 37

const openTasks = [
    { name: 'Integracja z płatnościami', priority: 'High', pClass: 'text-scrumdone-red-600', due: '12.11 (po terminie)', dueClass: 'text-scrumdone-red-600', who: 'A. Radecki' },
    { name: 'Eksport faktur do CSV', priority: 'Medium', pClass: 'text-scrumdone-yellow-500', due: '21.11', dueClass: '', who: 'J. Baczyński' },
    { name: 'Panel administratora', priority: 'Low', pClass: 'text-scrumdone-green-500', due: '28.11', dueClass: '', who: 'A. Kowalska' },
]

const next30 = [
    { date: '21.11', what: 'Eksport faktur do CSV' },
    { date: '24.11', what: 'Koniec Sprintu 8' },
    { date: '28.11', what: 'Panel administratora' },
]

// Wykres słupkowy: oś Y 0–50 h, wysokość obszaru 120 px (y = 140 − h × 2,4).
const yOf = (h: number) => 140 - h * 2.4

const SprintBars: React.FC = () => (
    <svg width="100%" viewBox="0 0 470 170" role="img" aria-label="Praca zrobiona w ostatnich sprintach">
        <line x1="30" y1="140" x2="465" y2="140" className="stroke-slate-300" />
        <g fontSize="10" className="fill-slate-500" textAnchor="end">
            <text x="24" y="144">0</text>
            <text x="24" y="84">25</text>
            <text x="24" y="24">50</text>
        </g>
        <g className="stroke-slate-100">
            <line x1="30" y1="80" x2="465" y2="80" />
            <line x1="30" y1="20" x2="465" y2="20" />
        </g>
        {sprints.map((s, i) => (
            <rect key={s.name} x={48 + i * 70} y={yOf(s.h)} width="40" height={140 - yOf(s.h)} rx="3" className="fill-scrumdone-blue-main" />
        ))}
        <line x1="30" y1={yOf(AVG)} x2="465" y2={yOf(AVG)} className="stroke-scrumdone-orange" strokeWidth="2" strokeDasharray="6 4" />
        <g fontSize="10" className="fill-slate-600" textAnchor="middle">
            {sprints.map((s, i) => (
                <text key={s.name} x={68 + i * 70} y="158">{s.name}</text>
            ))}
        </g>
    </svg>
)

const ProjectStatusPreview: React.FC = () => (
    <PreviewCard title="Status projektu – Portal klienta" subtitle="Bankowo SA • 01.09.2026 – 20.01.2027 • wygenerowano 17.11.2026">
        <KpiRow>
            <Kpi label="Postęp" value="46%" sub="54 z 117 gotowe" />
            <Kpi label="Otwarte zadania" value="63" sub="w tym 4 po terminie" subTone="red" />
            <Kpi label="Planowany koniec" value="20.01.2027" sub="za 64 dni" />
            <Kpi label="Prognoza końca" value="ok. 02.02.2027" sub="opóźnienie +13 dni" tone="red" subTone="red" />
        </KpiRow>

        <div className="grid grid-cols-2 gap-[22px]">
            <div>
                <SectionTitle>Postęp</SectionTitle>
                <StackedBar
                    segments={[
                        { value: 46, className: 'bg-scrumdone-green-600' },
                        { value: 30, className: 'bg-scrumdone-blue-600' },
                        { value: 24, className: 'bg-slate-300' },
                    ]}
                />
                <Legend
                    items={[
                        { label: 'gotowe 54', className: 'bg-scrumdone-green-600' },
                        { label: 'w toku 35', className: 'bg-scrumdone-blue-600' },
                        { label: 'do zrobienia 28', className: 'bg-slate-300' },
                    ]}
                />
                <p className="m-0 mt-4 mb-2 text-[14px] text-slate-800">
                    Praca zrobiona w ostatnich sprintach (h wg estymat) <span className="text-[12px] text-scrumdone-orange">– – średnio {AVG} h</span>
                </p>
                <SprintBars />
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3.5">
                <SectionTitle>Prognoza zakończenia</SectionTitle>
                <p className="m-0 text-[22px]">
                    ok. 02.02.2027 <span className="text-[13px] text-scrumdone-red-600">+13 dni wobec planu</span>
                </p>
                <p className="m-0 mt-1 mb-3 text-[12px] text-slate-500">najszybciej 26.01.2027 • najwolniej 16.02.2027</p>
                <div className="mb-3.5 grid grid-cols-2 gap-2.5">
                    <div>
                        <p className="m-0 text-[12px] text-slate-500">Tempo zespołu</p>
                        <p className="m-0 text-[15px]">37 h / 9 zadań na sprint</p>
                    </div>
                    <div>
                        <p className="m-0 text-[12px] text-slate-500">Zostało</p>
                        <p className="m-0 text-[15px]">185 h / 63 zadania</p>
                    </div>
                </div>
                <p className="m-0 mb-1.5 text-[12px] text-slate-500">Czas vs praca</p>
                <div className="mb-1.5 flex items-center gap-2 text-[12px]">
                    <span className="w-11 text-slate-500">czas</span>
                    <MiniBar percent={61} colorClass="bg-slate-400" className="flex-1" />
                    <span className="w-[34px]">61%</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                    <span className="w-11 text-slate-500">praca</span>
                    <MiniBar percent={46} colorClass="bg-scrumdone-red-500" className="flex-1" />
                    <span className="w-[34px]">46%</span>
                </div>
                <p className="m-0 mt-3 text-[11px] text-scrumdone-yellow-500">5 otwartych zadań nie ma estymaty – prognoza może być zaniżona</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div>
                <SectionTitle>Otwarte zadania</SectionTitle>
                <table className="w-full border-collapse">
                    <thead>
                        <tr><Th>Zadanie</Th><Th>Priorytet</Th><Th>Termin</Th><Th>Osoba</Th></tr>
                    </thead>
                    <tbody>
                        {openTasks.map((t) => (
                            <tr key={t.name}>
                                <Td>{t.name}</Td>
                                <Td className={t.pClass}>{t.priority}</Td>
                                <Td className={t.dueClass}>{t.due}</Td>
                                <Td>{t.who}</Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-l border-slate-200 pl-8">
                <SectionTitle>Najbliższe 30 dni</SectionTitle>
                <table className="w-full border-collapse">
                    <thead>
                        <tr><Th>Termin</Th><Th>Co</Th></tr>
                    </thead>
                    <tbody>
                        {next30.map((t) => (
                            <tr key={t.what}>
                                <Td>{t.date}</Td>
                                <Td>{t.what}</Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </PreviewCard>
)

export default ProjectStatusPreview
