import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import { MapPin, Mail, UserPlus, Edit, Phone } from 'lucide-react';
import { companies, type Company } from '../data/companies';
import CompanyEditModal, { type CompanyEditDraft } from '../components/CompanyEditModal';
import CompanyContactAddModal, { type CompanyContactDraft } from '../components/CompanyContactAddModal';

const CompanyDetailsPage: React.FC = () => {
  const { companySlug } = useParams();
  const company = companies.find((item) => item.slug === companySlug);
  const [displayedCompany, setDisplayedCompany] = useState<Company | null>(company ?? null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactAddModalOpen, setIsContactAddModalOpen] = useState(false);
  const [draft, setDraft] = useState<CompanyEditDraft>({
    name: company?.name ?? '',
    nip: company?.nip ?? '',
    krs: company?.companyNumber ?? '',
    regon: company?.regon ?? '',
    address: company?.address ?? '',
  });
  const [contactDraft, setContactDraft] = useState<CompanyContactDraft>({
    name: '',
    role: '',
    email: '',
    phone: '',
    isMainContact: false,
  });
  const mainContact = displayedCompany?.contacts[0];

  useEffect(() => {
    setDisplayedCompany(company ?? null);
    setDraft({
      name: company?.name ?? '',
      nip: company?.nip ?? '',
      krs: company?.companyNumber ?? '',
      regon: company?.regon ?? '',
      address: company?.address ?? '',
    });
    setContactDraft({
      name: '',
      role: '',
      email: '',
      phone: '',
      isMainContact: false,
    });
    setIsEditModalOpen(false);
    setIsContactAddModalOpen(false);
  }, [company]);

  if (!displayedCompany) {
    return (
      <div className="min-h-screen w-full bg-[#F9FAFB]">
        <SideBar />
        <TopBar />

        <main className="ml-64 pt-(--app-header-h)">
          <section className="mx-8 mt-6 rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
            Nie znaleziono firmy o podanym adresie.
          </section>
        </main>
      </div>
    );
  }

  const openEditModal = () => {
    setDraft({
      name: displayedCompany.name,
      nip: displayedCompany.nip,
      krs: displayedCompany.companyNumber,
      regon: displayedCompany.regon,
      address: displayedCompany.address,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const openContactAddModal = () => {
    setContactDraft({
      name: '',
      role: '',
      email: '',
      phone: '',
      isMainContact: false,
    });
    setIsContactAddModalOpen(true);
  };

  const closeContactAddModal = () => {
    setIsContactAddModalOpen(false);
  };

  const saveCompanyChanges = () => {
    setDisplayedCompany((prev) =>
      prev
        ? {
            ...prev,
            name: draft.name,
            nip: draft.nip,
            companyNumber: draft.krs,
            regon: draft.regon,
            address: draft.address,
          }
        : prev,
    );
    setIsEditModalOpen(false);
  };

  const saveContactChanges = () => {
    setIsContactAddModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          <>
            <div className="mx-8 mt-6">
              <button className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium" onClick={() => window.history.back()}>
                <span>← Powrót do firm</span>
              </button>
            </div>

            <div className="mx-8 mt-6 rounded-[14px] border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between pb-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 mr-1 items-center justify-center rounded-lg bg-blue-100">
                    <span className="text-2xl font-bold text-blue-600">
                      {displayedCompany.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-medium leading-8 text-gray-900">{displayedCompany.name}</h1>
                    <div className="mt-3 grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs font-regular leading-4 text-gray-500 uppercase">NIP</p>
                        <p className="text-sm font-medium leading-5 text-gray-900">{displayedCompany.nip}</p>
                      </div>
                      <div>
                        <p className="text-xs font-regular leading-4 text-gray-500 uppercase">REGON</p>
                        <p className="text-sm font-medium leading-5 text-gray-900">{displayedCompany.regon}</p>
                      </div>
                      <div>
                        <p className="text-xs font-regular leading-4 text-gray-500 uppercase">Numer firmy</p>
                        <p className="text-sm font-medium leading-5 text-gray-900">{displayedCompany.companyNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={openContactAddModal}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <UserPlus className="w-4 h-4 text-gray-600" />
                    <span>Dodaj kontakt</span>
                  </button>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span>Edytuj</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h3 className="font-regular text-sm leading-5 text-gray-700">Adres</h3>
                  </div>
                  <p className="text-sm text-gray-800">{displayedCompany.address}</p>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <h3 className="font-regular text-sm leading-5  text-gray-700">Adresy email</h3>
                  </div>
                  <div className="space-y-1">
                    {displayedCompany.emails.map((email, index) => (
                      <p key={index} className="text-sm text-gray-800">
                        {email}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Osoby kontaktowe</h3>
                <div className="space-y-3">
                  {displayedCompany.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between bg-[#F9FAFB] rounded-[10px] p-4"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{contact.name}</h4>
                          {mainContact && contact.id === mainContact.id && (
                            <span className="rounded-full bg-scrumdone-blue-main px-2 py-1 text-xs font-medium text-white">
                              Główny kontakt
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{contact.role}</p>
                        <div className="mt-3 mx-auto flex max-w-180 items-center justify-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{contact.email}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        </div>
      </main>

      <CompanyEditModal
        isOpen={isEditModalOpen}
        draft={draft}
        onClose={closeEditModal}
        onSave={saveCompanyChanges}
        onDraftChange={setDraft}
      />

      <CompanyContactAddModal
        isOpen={isContactAddModalOpen}
        draft={contactDraft}
        onClose={closeContactAddModal}
        onSave={saveContactChanges}
        onDraftChange={setContactDraft}
      />
    </div>
  );
};

export default CompanyDetailsPage;
