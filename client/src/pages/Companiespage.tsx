import React, { useMemo, useState } from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import CompanyCard from '../components/CompanyCard';
import CompanyCreateModal from '../components/CompanyCreateModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { CompanyEditDraft } from '../components/CompanyEditModal';
import { useCompanies } from '../hooks/useCompanies';
import { useCreateCompany } from '../hooks/useCreateCompany';
import type { CompanyCreateDto } from '../types/company';
import { mapCompanyListItemToCard } from '../utils/companyDisplay';

const emptyToNull = (value: string): string | null => {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
};

const toCompanyCreateDto = (draft: CompanyEditDraft): CompanyCreateDto => ({
    name: draft.name.trim(),
    nip: emptyToNull(draft.nip),
    krs: emptyToNull(draft.krs),
    regon: emptyToNull(draft.regon),
    address: emptyToNull(draft.address),
});

const CompaniesPage: React.FC = () => {
    const { data, isLoading, isError, error } = useCompanies(1, 100);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {
        mutate: createCompany,
        isPending: isCreatingCompany,
        isError: isCreateCompanyError,
        error: createCompanyError,
        reset: resetCreateCompany,
    } = useCreateCompany();

    const [createDraft, setCreateDraft] = useState<CompanyEditDraft>({
        name: '',
        nip: '',
        krs: '',
        regon: '',
        address: '',
    });

    const companyCards = useMemo(
        () => (data?.items ?? []).map(mapCompanyListItemToCard),
        [data?.items],
    );

    const openCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        resetCreateCompany();
        setCreateDraft({
            name: '',
            nip: '',
            krs: '',
            regon: '',
            address: '',
        });
    };

    const handleCreateCompany = () => {
        const dto = toCompanyCreateDto(createDraft);
        if (!dto.name) return;

        createCompany(
            { data: dto },
            {
                onSuccess: () => {
                    closeCreateModal();
                },
            },
        );
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
                isSaving={isCreatingCompany}
                errorMessage={isCreateCompanyError ? createCompanyError?.message : null}
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

                    {isLoading && (
                        <p className="text-sm text-slate-500">Ładowanie firm...</p>
                    )}

                    {isError && (
                        <section className="rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
                            Błąd: {error.message}
                        </section>
                    )}

                    {!isLoading && !isError && companyCards.length === 0 && (
                        <section className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                            Brak firm. Dodaj pierwszą firmę przyciskiem powyżej.
                        </section>
                    )}

                    {!isLoading && !isError && companyCards.length > 0 && (
                        <div className="grid grid-cols-3 gap-8">
                            {companyCards.map((company) => (
                                <CompanyCard
                                    key={company.id}
                                    id={company.id}
                                    name={company.name}
                                    nip={company.nip}
                                    email={company.email}
                                    phone={company.phone}
                                    projectsCount={company.projectsCount}
                                    mainContactName={company.mainContactName}
                                    mainContactRole={company.mainContactRole}
                                    contactsCount={company.contactsCount}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CompaniesPage;
