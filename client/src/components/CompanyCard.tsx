import React from 'react';
import { Building2, Mail, Phone } from 'lucide-react';

interface CompanyCardProps {
  name: string;
  nip: string;
  email: string;
  phone: string;
  projectsCount: number;
  mainContactName: string;
  mainContactRole: string;
  contactsCount: number;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ 
  name, 
  nip, 
  email, 
  phone, 
  projectsCount,
  mainContactName,
  mainContactRole,
  contactsCount
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col hover:shadow-lg transition-shadow h-full">
      
      {/* NAGŁÓWEK */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-scrumdone-blue-main/15 rounded-[10px] flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-scrumdone-blue-main stroke-2" />
        </div>
        <div>
          <h3 className="text-[18px] leading-7 text-gray-900 font-normal">{name}</h3>
          <p className="text-[12px] leading-4 text-gray-500 font-normal">NIP: {nip}</p>
        </div>
      </div>

      {/* SEKCJA KONTAKTU */}
      <div className="flex flex-col mb-6"> 
        <p className="text-[12px] leading-4 text-gray-500 font-normal">Główny kontakt</p>
        
        <div className="mt-2 mb-2">
          <p className="text-[14px] leading-5 text-gray-900 font-medium mb-1">{mainContactName}</p>
          <p className="text-[12px] leading-4 text-gray-500 font-normal tracking-tight">{mainContactRole}</p>
        </div>

        {/* Dane kontaktowe */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[14px] leading-5 text-gray-500 font-normal">
            <Mail className="w-4 h-4 flex-shrink-0 text-gray-400 stroke-[1.5]" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2 text-[14px] leading-5 text-gray-500 font-normal">
            <Phone className="w-4 h-4 flex-shrink-0 text-gray-400 stroke-[1.5]" />
            <span>{phone}</span>
          </div>
        </div>
      </div>

      {/* STOPKA */}
      <div className="pt-4 border-t border-gray-200 mt-auto space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] leading-5 text-gray-600 font-normal">
            Osoby kontaktowe
          </span>
          <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[12px] leading-4 font-medium min-w-6 bg-white border border-gray-200 text-gray-900">
            {contactsCount}
          </span>
        </div>
        
        {/* Projekty */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] leading-5 text-gray-600 font-normal">
            Projekty
          </span>
          <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[12px] leading-4 font-medium min-w-6 bg-gray-100 text-gray-900">
            {projectsCount}
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default CompanyCard;