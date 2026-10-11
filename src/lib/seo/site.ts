import { env } from "@/env";

export const SITE_NAME = "VerifyRishta";
export const SITE_DESCRIPTION =
  "Plain-language guides for Indian families on marriage background verification, matrimonial fraud and checking a rishta respectfully.";

export const absoluteUrl = (path: string) => `${env.SITE_URL}${path}`;
