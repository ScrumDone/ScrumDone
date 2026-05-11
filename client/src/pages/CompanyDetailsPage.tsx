import React from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import { companies } from '../data/companies';

const CompanyDetailsPage: React.FC = () => {
  const { companySlug } = useParams();
  const company = companies.find((item) => item.slug === companySlug);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          {company ? (
            <>
              {/* Back button */}
              <div className="mx-8 mt-6">
                <button className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium" onClick ={() => window.history.back()}>
                  <span>← Powrót do firm</span>
                </button>
              </div>

              {/* Main Content Box */}
              <div className="mx-8 mt-6 rounded-[14px] border border-gray-200 bg-white p-8">
                {/* Company Header */}
                <div className="flex items-start justify-between pb-8 border-b border-gray-200 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                      <span className="text-2xl font-bold text-blue-600">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                      <div className="mt-3 grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">NIP</p>
                          <p className="text-sm font-semibold text-gray-900">{company.nip}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">REGON</p>
                          <p className="text-sm font-semibold text-gray-900">{company.regon}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Numer firmy</p>
                          <p className="text-sm font-semibold text-gray-900">{company.companyNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Dodaj kontakt
                    </button>
                    <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Edytuj
                    </button>
                  </div>
                </div>

                {/* Top Section - Address and Emails */}
                <div className="grid grid-cols-2 gap-12 mb-12 pb-12 border-b border-gray-200">
                  {/* Address */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      <h3 className="font-medium text-gray-900">Adres</h3>
                    </div>
                    <p className="text-sm text-gray-600">{company.address}</p>
                  </div>

                  {/* Emails */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">✉️</span>
                      <h3 className="font-medium text-gray-900">Adresy email</h3>
                    </div>
                    <div className="space-y-2">
                      {company.emails.map((email, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {email}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Persons Section */}
                <div>
                  <h3 className="mb-6 text-lg font-semibold text-gray-900">Osoby kontaktowe</h3>
                  <div className="space-y-6">
                    {company.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start justify-between border-b border-gray-100 pb-6 last:border-b-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                            {contact.id === company.contacts[0].id && (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                Główny kontakt
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{contact.role}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">✉️</span> {contact.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">📱</span> {contact.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Edytuj
                          </button>
                          <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Usuń
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <section className="mx-8 mt-6 rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
              Nie znaleziono firmy o podanym adresie.
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyDetailsPage;
