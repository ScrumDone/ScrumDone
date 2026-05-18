import React, { useState } from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import CompanyCard from '../components/CompanyCard';
import CompanyCreateModal from '../components/CompanyCreateModal';
import { companies as companiesSeed, type Company } from '../data/companies';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { CompanyEditDraft } from '../components/CompanyEditModal';

const slugifyCompanyName = (name: string) => {
    const normalized = name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return normalized || `firma-${Date.now()}`;
};

const CompaniesPage: React.FC = () => {
    const [companiesList, setCompaniesList] = useState<Company[]>(companiesSeed);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [createDraft, setCreateDraft] = useState<CompanyEditDraft>({
        name: '',
        nip: '',
        krs: '',
        regon: '',
        address: '',
    });

    const openCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateDraft({
            name: '',
            nip: '',
            krs: '',
            regon: '',
            address: '',
        });
    };

    const handleCreateCompany = () => {
        const trimmedName = createDraft.name.trim();
        if (!trimmedName) return;

        const nextId = companiesList.reduce((max, c) => Math.max(max, c.id), 0) + 1;

        const newCompany: Company = {
            id: nextId,
            name: trimmedName,
            slug: slugifyCompanyName(trimmedName),
            nip: createDraft.nip.trim() || '—',
            regon: createDraft.regon.trim() || '—',
            companyNumber: createDraft.krs.trim() || '—',
            address: createDraft.address.trim() || '—',
            emails: [''],
            phone: '—',
            projectsCount: 0,
            mainContactName: '—',
            mainContactRole: '—',
            contactsCount: 0,
            contacts: [],
        };

        setCompaniesList((prev) => [newCompany, ...prev]);
        closeCreateModal();
    };

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <CompanyCreateModal
                isOpen={isCreateModalOpen}
                draft={createDraft}
                onClose={closeCreateModal}
                onSave={handleCreateCompany}
                onDraftChange={setCreateDraft}
            />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col px-8 py-6">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal antialiased">
                            Firmy
                        </h1>
                        
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-scrumdone-blue-main hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-4 text-sm font-normal transition-all active:scale-95 cursor-pointer"
                        >
                            <PlusIcon className="w-4 h-4 stroke-2" />
                            Dodaj firmę
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        {companiesList.map((company) => (
                            <CompanyCard 
                                key={company.id}
                                slug={company.slug}
                                name={company.name}
                                nip={company.nip}
                                email={company.emails[0] ?? ''}
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