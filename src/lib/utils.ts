import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 校验香港 8 位手机号码
 * 香港常见移动号段开头：4, 5, 6, 7, 8, 9
 */
export function isValidHkPhone(phone: string): boolean {
  const cleaned = phone.trim().replace(/\D/g, "");
  return /^[456789]\d{7}$/.test(cleaned);
}

/**
 * 掩码展示香港手机号：91234567 -> 9123****
 */
export function maskHkPhone(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  return `${phone.slice(0, 4)}****`;
}

/**
 * 格式化时间
 */
export function formatHkDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("zh-HK", {
      timeZone: "Asia/Hong_Kong",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}
