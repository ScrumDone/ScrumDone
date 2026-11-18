import { createContext } from 'react'

/**
 * true = raport pokazywany bez szarego tła i marginesu wokół karty (pełny widok raportu).
 * false = podgląd w popupie, z tłem jak w makiecie.
 */
export const ReportBareContext = createContext(false)
