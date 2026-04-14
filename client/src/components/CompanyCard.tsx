import React from 'react';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

interface CompanyCardProps {
  name: string;
  nip: string;
  email: string;
  phone: string;
  projectsCount: number;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ name, nip, email, phone, projectsCount }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 min-w-[320px] flex-1 transition-all hover:shadow-md">
      
      {/* NAZWA FIRMY */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
          <BuildingOfficeIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg text-gray-900">{name}</h3>
          <p className="text-xs text-gray-400 font-medium">NIP: {nip}</p>
        </div>
      </div>

      {/* DANE KONTAKTOWE */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <EnvelopeIcon className="w-5 h-5 text-gray-300" />
          <span className="text-sm">{email}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <PhoneIcon className="w-5 h-5 text-gray-300" />
          <span className="text-sm">{phone}</span>
        </div>
      </div>

      {/* PROJEKTY */}
      <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl mt-2">
        <div className="flex items-center gap-2 text-gray-500">
          <BriefcaseIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Projekty</span>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">
          {projectsCount}
        </span>
      </div>
    </div>
  );
};

export default CompanyCard;