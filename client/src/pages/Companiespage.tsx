import React from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import CompanyCard from '../components/CompanyCard';
import { companies } from '../data/companies';
import { PlusIcon } from '@heroicons/react/24/outline';

const CompaniesPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            {/* Side bary */}
            <SideBar />
            <TopBar />

            {/* Główna sekcja */}
            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col px-8 py-6">
                    
                    {/* Nagłówek strony i przycisk dodaj */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-[0em] antialiased">
                            Firmy
                        </h1>
                        
                        <button className="bg-scrumdone-blue-main hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-4 text-sm font-normal transition-all active:scale-95 cursor-pointer">
                            <PlusIcon className="w-4 h-4 stroke-2" />
                            Dodaj firmę
                        </button>
                    </div>

                    {/* Siatka z kartami firm - stałe 3 kolumny na desktopie */}
                    <div className="grid grid-cols-3 gap-8">
                        {companies.map((company) => (
                            <CompanyCard 
                                key={company.id}
                                slug={company.slug}
                                name={company.name}
                                nip={company.nip}
                                email={company.emails[0]}
                                phone={company.phone}
                                projectsCount={company.projectsCount}
                                mainContactName={company.mainContactName}
                                mainContactRole={company.mainContactRole}
                                contactsCount={company.contactsCount}
                            />
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CompaniesPage;