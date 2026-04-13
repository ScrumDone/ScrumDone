
import React from 'react'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'

const Homepage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />

            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="max-w-6xl mx-auto px-8 py-6">
                    <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-[0em] antialiased mb-6">Strona Główna</h1>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h1 className="font-segoe-ui  text-slate-800 text-[1.125rem] leading-7 font-normal tracking-[0em] antialiased mb-6">
                                Dzisiaj
                            </h1>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="font-segoe-ui text-slate-800 text-[0.875rem] leading-6 font-normal tracking-[0em] antialiased">
                                        Quotes Generation Module
                                    </h1>
                                    <span className="mt-[0.1rem] h-2 w-2 rounded-full bg-scrumdone-red-500" />
                                </div>
                                <div className="border border-scrumdone-red-300 rounded-lg py-0.5 px-2 w-min mb-2">
                                    <p className="font-segoe-ui text-scrumdone-red-300 text-[0.75rem] leading-5 font-normal tracking-[0em] antialiased">
                                        Adoddle
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-segoe-ui text-slate-600 text-[0.75rem] leading-6 font-normal tracking-[0em] antialiased">from:</h1>
                                    <h1 className="font-segoe-ui text-slate-600 text-[0.75rem] leading-6 font-normal tracking-[0em] antialiased">Artur Nowak</h1>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h1 className="font-segoe-ui text-slate-800 text-[1.125rem] leading-7 font-normal tracking-[0em] antialiased mb-6">
                                Aktualności
                            </h1>
                            <div className="border border-gray-200 rounded-lg p-4">

                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h1 className="font-segoe-ui text-slate-800 text-[1.125rem] leading-7 font-normal tracking-[0em] antialiased mb-6">
                                Projekty
                            </h1>
                            <div className="border border-gray-200 rounded-lg p-4">

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Homepage 