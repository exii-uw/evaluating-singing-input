export function insertBetween<T>(arr: T[], toInsert: (item: T) => T): T[] {
    const newArr: T[] = arr.slice(0, 1);
    arr.slice(1).forEach((item) => {
        newArr.push(toInsert(item), item);
    });
    return newArr;
}
