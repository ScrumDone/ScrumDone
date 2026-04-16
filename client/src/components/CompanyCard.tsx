import React from 'react';
import { Building2, Mail, Phone } from 'lucide-react';

interface CompanyCardProps {
  name: string;
  nip: string;
  email: string;
  phone: string;
  projectsCount: number;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ name, nip, email, phone, projectsCount }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-6 hover:shadow-lg transition-shadow h-full">
      
      {/* NAZWA FIRMY */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-scrumdone-blue-main/15 rounded-[10px] flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-scrumdone-blue-main stroke-2" />
          </div>
          <div>
            <h3 className="text-[18px] leading-[28px] text-black-900">{name}</h3>
            <p className="text-[12px] leading-[16px] text-gray-500">NIP: {nip}</p>
          </div>
        </div>
      </div>

      {/* DANE KONTAKTOWE */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-[14px] leading-[20px] text-gray-700">
          <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600 stroke-2" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px] leading-[20px] text-gray-700">
          <Phone className="w-4 h-4 flex-shrink-0 text-gray-600 stroke-2" />
          <span>{phone}</span>
        </div>
      </div>

      {/* PROJEKTY */}
      <div className="pt-4 border-t border-gray-300 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-[14px] leading-[20px] text-gray-600 font-normal">
            Projekty
          </span>
          <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[12px] leading-[16px] font-medium min-w-[24px] bg-gray-200 text-gray-900">
            {projectsCount}
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default CompanyCard;