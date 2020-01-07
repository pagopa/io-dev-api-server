/**
 * generate a n chars pseudo-random string (n value is 26 as default)
 */
export const getRandomStringId = (chars: number = 26): string => {
    const randomSlice = () =>
      Math.random()
        .toString(36)
        .substring(2, 15);
    return (randomSlice() + randomSlice() + randomSlice())
      .substring(0, chars)
      .toUpperCase();
  };

/**
 * generate a n chars pseudo-random integer number
 */
export const getRandomIntId = (length: number) => {
    const num = Math.random() * 10^length;
    return Math.floor(num)
}