import React, { useLayoutEffect, useRef, useState } from 'react'

/** Szerokość, w której narysowane są wszystkie podglądy (1032 px karta + 2 × 24 px tła). */
const PREVIEW_DESIGN_WIDTH = 1080

/**
 * Skaluje podgląd raportu do szerokości kontenera, zachowując dokładny wygląd makiety.
 * Użycie: <ReportPreviewFrame><ProjectStatusPreview /></ReportPreviewFrame>
 */
const ReportPreviewFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const outerRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [height, setHeight] = useState<number | undefined>(undefined)

    useLayoutEffect(() => {
        const outer = outerRef.current
        const inner = innerRef.current
        if (!outer || !inner) return

        const update = () => {
            const s = Math.min(1, outer.clientWidth / PREVIEW_DESIGN_WIDTH)
            setScale(s)
            setHeight(inner.offsetHeight * s)
        }

        update()
        const ro = new ResizeObserver(update)
        ro.observe(outer)
        ro.observe(inner)
        return () => ro.disconnect()
    }, [])

    return (
        <div ref={outerRef} className="w-full overflow-hidden" style={{ height }} aria-label="Podgląd raportu z przykładowymi danymi">
            <div ref={innerRef} style={{ width: PREVIEW_DESIGN_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                {children}
            </div>
        </div>
    )
}

export default ReportPreviewFrame
