
import React from 'react'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'

const Homepage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />

            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="p-6"></div>
            </main>
        </div>
    )
}

export default Homepage 