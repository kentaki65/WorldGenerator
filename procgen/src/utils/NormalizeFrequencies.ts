export function normalizeFrequencies<T extends { frequency: number }>(
  items: T[],
  targetTotal: number
): T[] {
  let totalFrequency = 0;

  for (const item of items) {
    totalFrequency += item.frequency;
  }

  const scale = targetTotal / totalFrequency;

  return items.map(item => ({
    ...item,
    frequency: item.frequency * scale,
  }));
}