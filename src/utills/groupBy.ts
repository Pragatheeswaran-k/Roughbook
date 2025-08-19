// src/utills/groupBy.ts
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K
): [K, T[]][] {
  const map = new Map<K, T[]>();
  arr.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  return Array.from(map.entries());
}
