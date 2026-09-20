export function createStoneFrequencyData(stoneFrequencies: any[]) {
  let stonesTotalFrequency = 0;
  const frequencyValues: number[] = [];

  for (const stoneFrequency of stoneFrequencies) {
    stonesTotalFrequency += stoneFrequency.frequency;
    frequencyValues.push(stoneFrequency.frequency);
  }

  return {
    stoneFrequencies,
    frequencyValues,
    stonesTotalFrequency
  };
}