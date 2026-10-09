// Zamienia kolor #RRGGBB na rgba() z podaną przezroczystością; zwraca undefined dla innego formatu
export const hexToRgba = (hexColor: string, alpha: number) => {
    const normalized = hexColor.replace('#', '').trim()

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return undefined
    }

    const r = Number.parseInt(normalized.slice(0, 2), 16)
    const g = Number.parseInt(normalized.slice(2, 4), 16)
    const b = Number.parseInt(normalized.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
