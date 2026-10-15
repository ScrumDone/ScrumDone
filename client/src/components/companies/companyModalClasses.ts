// Modale firm: na telefonie zajmują cały ekran, od sm: wracają do okna na środku.
// Nakładka nie ma z-index - każdy modal dokłada swój (z-50, zagnieżdżony z-[60])
export const companyModalOverlayClass =
  'fixed inset-0 flex items-stretch justify-center bg-slate-900/35 sm:items-center sm:px-4';

export const companyModalPanelClass =
  'flex h-full w-full flex-col bg-white sm:h-auto sm:max-h-[86vh] sm:max-w-130 sm:rounded-[10px] sm:border sm:border-slate-200 sm:shadow-lg';
