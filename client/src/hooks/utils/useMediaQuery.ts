import { useSyncExternalStore } from 'react';

// Szerokość, od której kalendarz pokazuje siatkę zamiast listy dni (Tailwind md)
export const DESKTOP_CALENDAR_QUERY = '(min-width: 768px)';

// true, gdy media query pasuje; aktualizuje się przy zmianie rozmiaru okna
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}
