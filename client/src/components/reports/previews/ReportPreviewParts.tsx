import React, { useContext } from 'react'
import { ReportBareContext } from './reportPreviewContext'
type Tone = 'default' | 'red' | 'amber' | 'green'

const toneBg: Record<Tone, string> = {
    default: 'bg-slate-50',
    red: 'bg-scrumdone-red-100',
    amber: 'bg-yellow-50',
    green: 'bg-scrumdone-green-100',
}

const toneText: Record<Tone, string> = {
    default: 'text-slate-500',
    red: 'text-scrumdone-red-600',
    amber: 'text-scrumdone-yellow-500',
    green: 'text-scrumdone-green-500',
}

// Wspólne klocki podglądów raportów.
// Podglądy są statyczne (przykładowe dane), rysowane w stałej szerokości 1080 px
// i skalowane do kontenera przez <ReportPreviewFrame>.
// Kolory to klasy Tailwinda: tokeny scrumdone-* z index.css albo paleta Tailwinda używana w reszcie aplikacji.

interface PreviewCardProps {
    title: string
    subtitle: string
    actions?: React.ReactNode
    children: React.ReactNode
}

/** Zewnętrzna ramka podglądu: szare tło + biała karta z nagłówkiem i przyciskiem „Eksportuj”. */
export const PreviewCard: React.FC<PreviewCardProps> = ({ title, subtitle, actions, children }) => {
    // W pełnym widoku raportu (bez szarego tła) karta ma te same 1032 px, tylko bez 24 px tła dookoła.
    const bare = useContext(ReportBareContext)
    return (
        <div className={`${bare ? 'w-[1032px]' : 'w-[1080px] bg-slate-50 p-6'} font-segoe-ui text-slate-900 antialiased`}>
            <div className="flex flex-col gap-[18px] rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="m-0 text-[18px] leading-7 font-normal text-slate-800">{title}</p>
                        <p className="m-0 text-[12px] text-slate-500">{subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                        {actions}
                        <span className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-[14px] text-slate-700">
                            Eksportuj
                        </span>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}

interface KpiProps {
    label: string
    value: React.ReactNode
    sub?: React.ReactNode
    tone?: Tone
    /** Kolor wartości/podpisu, gdy ma się różnić od tła (np. czerwona liczba na szarym kafelku). */
    valueTone?: Tone
    subTone?: Tone
}

/** Kafelek z liczbą (wiersz „liczby na górze”). */
export const Kpi: React.FC<KpiProps> = ({ label, value, sub, tone = 'default', valueTone, subTone }) => (
    <div className={`rounded-xl px-4 py-3 ${toneBg[tone]}`}>
        <p className={`m-0 text-[12px] ${toneText[tone]}`}>{label}</p>
        <p className={`m-0 mt-0.5 text-[22px] leading-7 ${valueTone ? toneText[valueTone] : 'text-slate-900'}`}>{value}</p>
        {sub ? <p className={`m-0 mt-0.5 text-[12px] ${subTone ? toneText[subTone] : 'text-slate-600'}`}>{sub}</p> : null}
    </div>
)

export const KpiRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-4 gap-3">{children}</div>
)

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="m-0 mb-2 text-[14px] text-slate-800">{children}</p>
)

interface Segment {
    value: number
    /** Klasa tła segmentu, np. bg-scrumdone-green-600. */
    className: string
}

/** Pasek 100% podzielony na segmenty (wartości w %). */
export const StackedBar: React.FC<{ segments: Segment[] }> = ({ segments }) => (
    <div className="flex h-2.5 overflow-hidden rounded-full">
        {segments.map((s, i) => (
            <div key={i} className={s.className} style={{ width: `${s.value}%` }} />
        ))}
    </div>
)

export const Legend: React.FC<{ items: { label: React.ReactNode; className: string }[] }> = ({ items }) => (
    <div className="mt-1.5 flex gap-3.5 text-[12px] text-slate-600">
        {items.map((it, i) => (
            <span key={i}>
                <span className={`mr-1 inline-block h-[9px] w-[9px] rounded-[2px] align-middle ${it.className}`} />
                {it.label}
            </span>
        ))}
    </div>
)

/** Cienki pasek procentowy (np. „czas vs praca”). */
export const MiniBar: React.FC<{ percent: number; colorClass: string; className?: string }> = ({ percent, colorClass, className = '' }) => (
    <div className={`h-1.5 rounded-full bg-slate-100 ${className}`}>
        <div className={`h-1.5 rounded-full ${colorClass}`} style={{ width: `${percent}%` }} />
    </div>
)

const badgeTone = {
    red: 'border-scrumdone-red-300 text-scrumdone-red-600',
    amber: 'border-scrumdone-yellow-500 text-scrumdone-yellow-500',
    green: 'border-scrumdone-green-500 text-scrumdone-green-500',
}

export const Badge: React.FC<{ tone: keyof typeof badgeTone; children: React.ReactNode }> = ({ tone, children }) => (
    <span className={`whitespace-nowrap rounded-xl border px-2.5 py-px text-[11px] ${badgeTone[tone]}`}>{children}</span>
)

export const Th: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <th className={`border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-medium text-slate-500 ${className}`}>{children}</th>
)

export const Td: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <td className={`border-b border-slate-100 px-2 py-[7px] text-[13px] ${className}`}>{children}</td>
)

/** Wiersz listy „nazwa — wartość” (listy zadań w Podsumowaniu sprintu). */
export const ListRow: React.FC<{ left: React.ReactNode; right?: React.ReactNode | undefined; rightClass?: string | undefined; last?: boolean | undefined }> = ({
    left,
    right,
    rightClass = 'text-slate-500',
    last,
}) => (
    <div className={`flex justify-between gap-2 py-1.5 text-[12.5px] ${last ? '' : 'border-b border-slate-100'}`}>
        <span>{left}</span>
        {right !== undefined ? <span className={rightClass}>{right}</span> : null}
    </div>
)
