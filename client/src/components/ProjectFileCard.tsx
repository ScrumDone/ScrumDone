import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  LockClosedIcon, 
  PhotoIcon, 
  GlobeAltIcon,
  TableCellsIcon 
} from '@heroicons/react/24/outline';
import FilePreviewModal from './ProjectFilePreviewModal'; // Nasz nowy modal

export interface FileItem {
  id: number;
  name: string;
  size: string;
  author: string;
  date: string;
  type: string;
  url?: string;
  isPublic?: boolean;
}

interface ProjectFileRowProps {
  file: FileItem;
}

const ProjectFileRow: React.FC<ProjectFileRowProps> = ({ file }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const renderIcon = () => {
    const t = file.type.toUpperCase();
    if (t === 'PNG' || t === 'JPG' || t === 'JPEG') return <PhotoIcon className="h-7 w-7 text-slate-500" />;
    if (t === 'EXCEL' || t === 'XLSX') return <TableCellsIcon className="h-7 w-7 text-slate-500" />;
    return <DocumentTextIcon className="h-7 w-7 text-slate-500" />;
  };

  return (
    <>
      <li className="flex flex-col gap-4 px-6 py-5 md:grid md:grid-cols-[5rem_2fr_1fr_1fr_16rem] md:items-center md:gap-30 hover:bg-slate-50/50 transition-colors">
        <div className="flex items-center">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex h-16 w-16 items-center justify-center rounded-[4px] border border-slate-300 bg-white transition hover:border-scrumdone-blue-main hover:scale-105 active:scale-95"
          >
            {renderIcon()}
          </button>
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="text-left font-segoe-ui text-sm font-medium text-black hover:text-scrumdone-blue-main truncate pr-4"
          >
            {file.name}
          </button>
          <p className="mt-1 text-xs text-slate-500">{file.size}</p>
        </div>

        <div className="text-sm text-black">{file.author}</div>
        <div className="text-sm text-slate-700">{file.date}</div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-slate-50">
            {file.isPublic ? <GlobeAltIcon className="h-4 w-4" /> : <LockClosedIcon className="h-4 w-4" />}
            Dostęp
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-slate-50">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Pobierz
          </button>
        </div>
      </li>

      <FilePreviewModal 
        isOpen={isPreviewOpen} 
        file={file} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </>
  );
};

export default ProjectFileRow;