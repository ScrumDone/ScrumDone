import React from 'react'
import { Kpi, KpiRow, Legend, ListRow, PreviewCard, SectionTitle, StackedBar } from './ReportPreviewParts'

// Przykładowe dane podglądu (nie z API).
const lists: { title: string; rows: { left: string; right?: string; rightClass?: string }[] }[] = [
    {
        title: 'Zrobione',
        rows: [
            { left: 'Logowanie Google', right: 'EB' },
            { left: 'Widok koszyka', right: 'AR' },
            { left: '+10 więcej' },
        ],
    },
    {
        title: 'W toku',
        rows: [
            { left: 'Eksport faktur', right: '21.11' },
            { left: 'Panel admina', right: '28.11' },
            { left: '+3 więcej' },
        ],
    },
    {
        title: 'Czeka na kogoś',
        rows: [
            { left: 'Testy formularza', right: 'sprawdzenie', rightClass: 'text-scrumdone-yellow-500' },
            { left: 'Migracja bazy', right: 'zablokowane', rightClass: 'text-scrumdone-red-600' },
            { left: '+1 więcej' },
        ],
    },
    {
        title: 'Po terminie',
        rows: [
            { left: 'Płatności', right: '5 dni', rightClass: 'text-scrumdone-red-600' },
            { left: 'Baner cookies', right: '2 dni', rightClass: 'text-scrumdone-red-600' },
        ],
    },
]

const NextTwoWeeks: React.FC = () => (
    <svg width="100%" viewBox="0 0 470 70" role="img" aria-label="Terminy w najbliższych 2 tygodniach">
        <line x1="10" y1="30" x2="460" y2="30" className="stroke-slate-200" strokeWidth="4" strokeLinecap="round" />
        {[40, 120, 210, 400].map((x) => (
            <circle key={x} cx={x} cy="30" r="6" className="fill-scrumdone-blue-main" />
        ))}
        <rect x="295" y="22" width="16" height="16" rx="3" className="fill-slate-900" />
        <g fontSize="10" className="fill-slate-600" textAnchor="middle">
            <text x="40" y="56">18.11</text>
            <text x="120" y="56">21.11</text>
            <text x="210" y="56">22.11</text>
            <text x="303" y="56">24.11 koniec sprintu</text>
            <text x="400" y="56">28.11</text>
        </g>
    </svg>
)

// Skala 0–60 h na szerokości 450 px (x = 10 + h × 7,5).
const xOf = (h: number) => 10 + h * 7.5

const Capacity: React.FC = () => (
    <svg width="100%" viewBox="0 0 470 70" role="img" aria-label="Zalecany zakres 31–42 h, zaplanowano 48 h">
        <rect x="10" y="24" width="450" height="14" rx="7" className="fill-slate-100" />
        <rect x={xOf(31)} y="24" width={xOf(42) - xOf(31)} height="14" className="fill-scrumdone-blue-100" />
        <line x1={xOf(37)} y1="16" x2={xOf(37)} y2="46" className="stroke-scrumdone-blue-600" strokeWidth="2" />
        <line x1={xOf(48)} y1="12" x2={xOf(48)} y2="50" className="stroke-scrumdone-red-500" strokeWidth="2.5" />
        <g fontSize="10">
            <text x={xOf(31)} y="60" textAnchor="middle" className="fill-slate-600">31 h</text>
            <text x={xOf(42)} y="60" textAnchor="middle" className="fill-slate-600">42 h</text>
            <text x={xOf(37)} y="10" textAnchor="middle" className="fill-scrumdone-blue-600">śr. 37 h</text>
            <text x={xOf(48) + 8} y="12" className="fill-scrumdone-red-600">zaplanowano 48 h</text>
        </g>
    </svg>
)

const SprintSummaryPreview: React.FC = () => (
    <PreviewCard
        title="Podsumowanie sprintu – Sprint 8"
        subtitle="Adoddle • 10.11 – 24.11.2026 • wygenerowano 17.11.2026"
        actions={
            <span className="inline-flex h-7 items-center self-center rounded-xl border border-scrumdone-blue-main bg-scrumdone-blue-200 px-3 text-[12px] text-scrumdone-blue-600">
                Tylko moje zadania
            </span>
        }
    >
        <KpiRow>
            <Kpi label="Zrobione" value="12" sub="28 h wg estymat" />
            <Kpi label="W toku" value="5" />
            <Kpi label="Czeka na kogoś" value="3" sub="2 na sprawdzenie • 1 zablokowane" />
            <Kpi label="Po terminie" value="2" valueTone="red" />
        </KpiRow>

        <div>
            <SectionTitle>Realizacja sprintu: zaplanowano 22 zadania (48 h) • zrobiono 12 (28 h) • 58%</SectionTitle>
            <StackedBar
                segments={[
                    { value: 55, className: 'bg-scrumdone-green-600' },
                    { value: 23, className: 'bg-scrumdone-blue-600' },
                    { value: 9, className: 'bg-scrumdone-yellow-400' },
                    { value: 5, className: 'bg-scrumdone-red-500' },
                    { value: 8, className: 'bg-slate-300' },
                ]}
            />
            <Legend
                items={[
                    { label: 'Done 12', className: 'bg-scrumdone-green-600' },
                    { label: 'In Progress 5', className: 'bg-scrumdone-blue-600' },
                    { label: 'In Review 2', className: 'bg-scrumdone-yellow-400' },
                    { label: 'Blocked 1', className: 'bg-scrumdone-red-500' },
                    { label: 'To Do 2', className: 'bg-slate-300' },
                ]}
            />
        </div>

        <div className="grid grid-cols-4 gap-4">
            {lists.map((l) => (
                <div key={l.title}>
                    <SectionTitle>{l.title}</SectionTitle>
                    {l.rows.map((r, i) => (
                        <ListRow
                            key={r.left}
                            left={r.right === undefined ? <span className="text-slate-500">{r.left}</span> : r.left}
                            right={r.right}
                            rightClass={r.rightClass}
                            last={i === l.rows.length - 1 && r.right === undefined}
                        />
                    ))}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-[22px]">
            <div>
                <SectionTitle>Najbliższe 2 tygodnie</SectionTitle>
                <NextTwoWeeks />
            </div>
            <div>
                <SectionTitle>Pojemność Sprintu 9</SectionTitle>
                <Capacity />
                <p className="m-0 mt-0.5 text-[12px] text-scrumdone-red-600">Sprint 9 jest przeładowany: o 6 h powyżej najlepszego wyniku zespołu.</p>
            </div>
        </div>
    </PreviewCard>
)

export default SprintSummaryPreview
