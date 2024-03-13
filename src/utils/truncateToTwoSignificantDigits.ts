export const truncateToTwoSignificantDigits = (number: string) => {
  const [wholePart, decimalPart] = number.split(".");

  if (!decimalPart) {
    return number;
  }

  let nonNullDigits = "";
  let foundDigits = 0;
  let i = 0;
  for (const digit of decimalPart) {
    nonNullDigits += digit;
    if (digit !== "0") {
      foundDigits++;
    }
    if (foundDigits === 2) {
      break;
    }
    i++;
  }

  return wholePart + "." + nonNullDigits.slice(0, i + 1);
};