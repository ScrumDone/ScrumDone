
import React from 'react'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'

const Homepage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />

            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="max-w-6xl mx-auto px-14 py-10">
                    <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-[0em] antialiased">Strona Główna</h1>
                </div>
            </main>
        </div>
    )
}

export default Homepage 