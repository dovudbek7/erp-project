// Formats digits into Uzbek phone display: +998 90 123 45 67
export function formatUzPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  if (!digits) return "";

  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
  return `+998 ${parts.join(" ")}`;
}

export const stripPhoneFormatting = (value: string) => value.replace(/\s+/g, "");
