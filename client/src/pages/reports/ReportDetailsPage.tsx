import React from 'react'
import { Link, useParams } from 'react-router-dom'
import SideBar from '../../components/layout/SideBar'
import TopBar from '../../components/layout/TopBar'
import ReportPreviewFrame from '../../components/reports/previews/ReportPreviewFrame'
import { getReportType } from '../../components/reports/previews/reportTypes'
import { generatedReports } from '../../data/reports'

const BACK_LINK_CLASS = 'inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900'

/**
 * Pełny widok wygenerowanego raportu.
 * Na razie raporty są zahardkodowane: strona pokazuje ten sam statyczny podgląd co popup „Wygeneruj raport”,
 * tylko w naturalnym rozmiarze (1032 px) i bez szarego tła wokół karty. Na węższych ekranach <ReportPreviewFrame> zmniejsza go do szerokości strony.
 */
const ReportDetailsPage: React.FC = () => {
    const { reportId } = useParams<{ reportId: string }>()
    const report = generatedReports.find((r) => String(r.id) === reportId)
    const Preview = report ? getReportType(report.typeId).Preview : null

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="pt-(--app-header-h) lg:ml-64">
                <div className="mx-auto flex max-w-350 flex-col px-4 py-6 sm:px-8">
                    <div className="mb-4">
                        <Link to="/reports" className={BACK_LINK_CLASS}>
                            ← Powrót do raportów
                        </Link>
                    </div>

                    {report && Preview ? (
                        <>
                            <div className="mb-4">
                                <h1 className="font-segoe-ui text-[1.5rem] leading-8 font-normal text-black antialiased">
                                    {report.name}
                                </h1>
                                <p className="mt-1 font-segoe-ui text-sm leading-5 text-slate-500">
                                    {report.type} • {report.project} • {report.period} • {report.author}, {report.createdAt}
                                </p>
                            </div>

                            <div className="mx-auto w-full max-w-[1032px]">
                                <ReportPreviewFrame bare>
                                    <Preview />
                                </ReportPreviewFrame>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-[14px] border border-slate-200 bg-white px-6 py-10 text-center">
                            <h1 className="font-segoe-ui text-lg leading-6 font-semibold text-slate-900">Nie znaleziono raportu</h1>
                            <p className="mt-2 font-segoe-ui text-sm leading-5 text-slate-500">
                                Raport mógł zostać usunięty albo link jest nieprawidłowy.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ReportDetailsPage
