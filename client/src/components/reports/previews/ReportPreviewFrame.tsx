import React, { useLayoutEffect, useRef, useState } from 'react'
import { ReportBareContext } from './reportPreviewContext'

/** Szerokość, w której narysowane są wszystkie podglądy (1032 px karta + 2 × 24 px tła). */
const PREVIEW_DESIGN_WIDTH = 1080
/** Szerokość samej karty raportu, bez szarego tła (tryb bare). */
const BARE_DESIGN_WIDTH = 1032

interface ReportPreviewFrameProps {
    children: React.ReactNode
    /** Pokaż sam raport, bez szarego tła wokół karty (pełny widok raportu). */
    bare?: boolean
}

/**
 * Skaluje podgląd raportu do szerokości kontenera, zachowując dokładny wygląd makiety.
 * Użycie: <ReportPreviewFrame><ProjectStatusPreview /></ReportPreviewFrame>
 * Pełny widok bez tła: <ReportPreviewFrame bare>…</ReportPreviewFrame>
 */
const ReportPreviewFrame: React.FC<ReportPreviewFrameProps> = ({ children, bare = false }) => {
    const designWidth = bare ? BARE_DESIGN_WIDTH : PREVIEW_DESIGN_WIDTH
    const outerRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [height, setHeight] = useState<number | undefined>(undefined)

    useLayoutEffect(() => {
        const outer = outerRef.current
        const inner = innerRef.current
        if (!outer || !inner) return

        const update = () => {
            const s = Math.min(1, outer.clientWidth / designWidth)
            setScale(s)
            setHeight(inner.offsetHeight * s)
        }

        update()
        const ro = new ResizeObserver(update)
        ro.observe(outer)
        ro.observe(inner)
        return () => ro.disconnect()
    }, [designWidth])

    return (
        <div ref={outerRef} className="w-full overflow-hidden" style={{ height }} aria-label="Podgląd raportu z przykładowymi danymi">
            <div ref={innerRef} style={{ width: designWidth, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <ReportBareContext.Provider value={bare}>{children}</ReportBareContext.Provider>
            </div>
        </div>
    )
}

export default ReportPreviewFrame
