/**
 * Returns a random value from an enum.
 */
export const getRandomEnumValue = <T extends object>(anEnum: T): T[keyof T] => {
  const enumValues = (Object.keys(anEnum)
    .map(n => Number.parseInt(n))
    .filter(n => !Number.isNaN(n)) as unknown) as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  const randomEnumValue = enumValues[randomIndex];
  return randomEnumValue;
};
