export function reorderLatinSquare<T>(arr: T[], latinSquare: number): T[] {
    const sliceAt = latinSquare % arr.length;
    return [...arr.slice(sliceAt), ...arr.slice(0, sliceAt)];
}

export function reorderRandom<T>(original: T[]): T[] {
    const arr = [...original];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
