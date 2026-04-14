import React from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import CompanyCard from '../components/CompanyCard';
import { PlusIcon } from '@heroicons/react/24/outline';

// Przykładowe dane
const mockCompanies = [
  { id: 1, name: 'Adoddle', nip: '1234567890', email: 'anna@adoddle.com', phone: '+48 123 456 789', projectsCount: 1 },
  { id: 2, name: 'Nexus Tech', nip: '0987654321', email: 'piotr@nexus.com', phone: '+48 987 654 321', projectsCount: 1 },
  { id: 3, name: 'Hadar Solutions', nip: '1122334455', email: 'katarzyna@hadar.com', phone: '+48 555 666 777', projectsCount: 1 },
];

const CompaniesPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            {/* Side bary */}
            <SideBar />
            <TopBar />

            {/* Główna sekcja */}
            <main className="ml-64 pt-(--app-header-h)">
                <div className="max-w-6xl mx-auto px-8 py-6">
                    
                    {/* Nagłówek strony i przycisk dodaj */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-[0em] antialiased">
                            Firmy
                        </h1>
                        
                        <button className="bg-[#00aaff] hover:bg-[#0099ee] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm transition-all active:scale-95">
                            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                            Dodaj firmę
                        </button>
                    </div>

                    {/* Siatka z kartami firm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockCompanies.map((company) => (
                            <CompanyCard 
                                key={company.id}
                                name={company.name}
                                nip={company.nip}
                                email={company.email}
                                phone={company.phone}
                                projectsCount={company.projectsCount}
                            />
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CompaniesPage;