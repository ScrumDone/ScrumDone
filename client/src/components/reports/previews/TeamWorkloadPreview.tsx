import React from 'react'
import { Kpi, KpiRow, Legend, PreviewCard, SectionTitle } from './ReportPreviewParts'

// Przykładowe dane podglądu (nie z API). Godziny = estymaty otwartych zadań, etat = 168 h.
const projectColors = { adoddle: 'bg-scrumdone-blue-main', nexus: 'bg-scrumdone-purple-600', portal: 'bg-scrumdone-orange' }

const people: { name: string; parts: { project: keyof typeof projectColors; width: number }[]; hours: number; tone?: 'red' | 'green' }[] = [
    { name: 'Eryk Baczyński', parts: [{ project: 'adoddle', width: 58 }, { project: 'nexus', width: 42 }], hours: 190, tone: 'red' },
    { name: 'Aleksander Radecki', parts: [{ project: 'nexus', width: 45 }, { project: 'portal', width: 40 }], hours: 143 },
    { name: 'Jan Baczyński', parts: [{ project: 'adoddle', width: 42 }, { project: 'portal', width: 38 }], hours: 134 },
    { name: 'Anna Kowalska', parts: [{ project: 'portal', width: 72 }], hours: 121 },
    { name: 'Piotr Nowak', parts: [{ project: 'nexus', width: 40 }, { project: 'adoddle', width: 25 }], hours: 109 },
    { name: 'Ola Wiśniewska', parts: [{ project: 'adoddle', width: 30 }], hours: 50, tone: 'green' },
]

const months = ['lis', 'gru', 'sty', 'lut', 'mar', 'kwi']
const heat: { name: string; values: number[]; noDue: number }[] = [
    { name: 'E. Baczyński', values: [113, 72, 35, 12, 0, 0], noDue: 14 },
    { name: 'A. Radecki', values: [85, 64, 48, 10, 0, 0], noDue: 6 },
    { name: 'J. Baczyński', values: [80, 52, 30, 22, 0, 0], noDue: 0 },
    { name: 'A. Kowalska', values: [72, 44, 26, 0, 0, 0], noDue: 9 },
    { name: 'P. Nowak', values: [65, 40, 15, 0, 0, 0], noDue: 3 },
    { name: 'O. Wiśniewska', values: [30, 18, 0, 0, 0, 0], noDue: 0 },
]

/** Klasy pola mapy cieplnej z % etatu (ciemniej = więcej). Odcienie z tokenów scrumdone-blue-*. */
const heatClass = (v: number): string => {
    if (v >= 100) return 'bg-scrumdone-blue-600 text-white'
    if (v >= 80) return 'bg-scrumdone-blue-main text-white'
    if (v >= 60) return 'bg-scrumdone-blue-main/75'
    if (v >= 40) return 'bg-scrumdone-blue-main/50'
    if (v >= 20) return 'bg-scrumdone-blue-100'
    if (v > 0) return 'bg-scrumdone-blue-200'
    return 'bg-slate-50'
}

const cell = 'border-b border-slate-100 px-2 py-[7px] text-[13px]'
const head = 'border-b border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-500'

const TeamWorkloadPreview: React.FC = () => (
    <PreviewCard title="Zaangażowanie zespołu" subtitle="Wszystkie projekty • godziny wg estymat otwartych zadań • pełny etat 168 h / miesiąc">
        <KpiRow>
            <Kpi label="Osoby" value="6" />
            <Kpi label="Średnie obciążenie (listopad)" value="74%" />
            <Kpi label="Przeciążeni (> 105%)" value="1" tone="red" />
            <Kpi label="Wolne moce (< 50%)" value="1" tone="green" />
        </KpiRow>

        <div className="grid grid-cols-[1.05fr_1fr] gap-[22px]">
            <div>
                <SectionTitle>Kto w czym pracuje – listopad</SectionTitle>
                <div className="flex flex-col gap-2.5 text-[12.5px]">
                    {people.map((p) => (
                        <div key={p.name} className="grid grid-cols-[120px_1fr_92px] items-center gap-2">
                            <span>{p.name}</span>
                            <div className="flex h-3.5 rounded bg-slate-100">
                                {p.parts.map((part, i) => (
                                    <div
                                        key={i}
                                        className={projectColors[part.project]}
                                        style={{
                                            width: `${part.width}%`,
                                            borderRadius:
                                                p.parts.length === 1 ? 4 : i === 0 ? '4px 0 0 4px' : i === p.parts.length - 1 ? '0 4px 4px 0' : 0,
                                        }}
                                    />
                                ))}
                            </div>
                            <span className={p.tone === 'red' ? 'text-scrumdone-red-600' : p.tone === 'green' ? 'text-scrumdone-green-500' : ''}>
                                {p.hours} h / 168 h
                            </span>
                        </div>
                    ))}
                </div>
                <Legend
                    items={[
                        { label: 'Adoddle', className: projectColors.adoddle },
                        { label: 'Nexus', className: projectColors.nexus },
                        { label: 'Portal klienta', className: projectColors.portal },
                    ]}
                />
            </div>

            <div>
                <SectionTitle>Obciążenie w kolejnych miesiącach (% z 168 h)</SectionTitle>
                <table className="w-full border-collapse text-center">
                    <thead>
                        <tr>
                            <th className={`${head} text-left`}>Osoba</th>
                            {months.map((m) => (
                                <th key={m} className={head}>{m}</th>
                            ))}
                            <th className={head}>bez terminu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {heat.map((row) => (
                            <tr key={row.name}>
                                <td className={`${cell} text-left`}>{row.name}</td>
                                {row.values.map((v, i) => (
                                    <td key={i} className={`${cell} ${heatClass(v)}`}>{v}</td>
                                ))}
                                <td className={`${cell} text-slate-500`}>{row.noDue} h</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </PreviewCard>
)

export default TeamWorkloadPreview
