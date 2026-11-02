import React from 'react'
import type { GeneratedReport } from '../../data/reports'

interface ReportsTableProps {
    reports: GeneratedReport[]
}

const columns = ['Nazwa', 'Typ', 'Projekt', 'Okres', 'Autor', 'Utworzono']

const ReportsTable: React.FC<ReportsTableProps> = ({ reports }) => {
    return (
        <section className="overflow-x-auto rounded-[14px] border border-slate-200 bg-white">
            <table className="w-full min-w-225 border-collapse text-left font-segoe-ui text-sm leading-5 antialiased">
                <thead>
                    <tr className="border-b border-slate-200">
                        {columns.map((column) => (
                            <th key={column} scope="col" className="px-4 py-3 text-xs leading-4 font-normal text-slate-500">
                                {column}
                            </th>
                        ))}
                        <th scope="col" aria-label="Akcje" className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id} className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50">
                            <td className="whitespace-nowrap px-4 py-3.5 text-slate-900">{report.name}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{report.type}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{report.project}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{report.period}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{report.author}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{report.createdAt}</td>
                            <td className="px-4 py-3.5 text-right">
                                <button
                                    type="button"
                                    className="cursor-pointer text-sky-600 underline underline-offset-2 transition-colors hover:text-sky-700"
                                >
                                    Otwórz
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    )
}

export default ReportsTable
