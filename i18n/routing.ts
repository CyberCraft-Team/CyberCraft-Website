import { defineRouting } from "next-intl/routing";

export const locales = ["uz", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "uz",
  // Bare URLs always open in Uzbek, regardless of browser language or cookies.
  // Visitors can still select Russian or English through their prefixed URLs.
  localeDetection: false,
  // The site has always been Uzbek-only and its URLs are already shared and
  // indexed without a prefix, so uz keeps its bare paths and ru/en get one.
  localePrefix: "as-needed",
});
