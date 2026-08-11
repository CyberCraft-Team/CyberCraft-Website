import { defineRouting } from "next-intl/routing";

export const locales = ["uz", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "uz",
  // The site has always been Uzbek-only and its URLs are already shared and
  // indexed without a prefix, so uz keeps its bare paths and ru/en get one.
  localePrefix: "as-needed",
});
