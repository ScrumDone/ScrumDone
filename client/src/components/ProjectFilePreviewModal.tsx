import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { type FileItem } from './ProjectFileCard';

type FilePreviewModalProps = {
  isOpen: boolean;
  file: FileItem;
  onClose: () => void;
};

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, file, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isImage = ['PNG', 'JPG', 'JPEG', 'SVG'].includes(file.type.toUpperCase());

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 pr-8">{file.name}</h2>
          <button 
            onClick={onClose} 
            className="rounded-md border border-slate-200 p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-center overflow-hidden rounded-xl">
          {isImage && file.url ? (
            <img 
              src={file.url} 
              alt={file.name} 
              className="max-h-[70vh] w-full rounded-xl object-cover" 
            />
          ) : (
            <div className="py-20 text-slate-400 font-medium border-2 border-dashed border-slate-100 w-full text-center rounded-xl">
              Podgląd niedostępny
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;