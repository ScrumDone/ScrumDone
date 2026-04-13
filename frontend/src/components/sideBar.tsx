
import React from 'react'

const SideBar: React.FC = () => {
    return (
        <aside className="fixed inset-y-0 left-0 h-screen w-64 overflow-hidden border-r border-slate-200 bg-white">
            <div className="h-full p-6">
                <h1 className="font-segoe-ui text-scrumdone-blue-main text-[16px] leading-6 font-normal tracking-[0em] antialiased">ScrumDone</h1>
            </div>
        </aside>
    )
}

export default SideBar