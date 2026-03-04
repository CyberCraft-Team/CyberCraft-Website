import type { Metadata } from "next";
import CabinetLayout from "@/components/cabinet/CabinetLayout";

export const metadata: Metadata = {
  title: "Kabinet",
  description: "CyberCraft shaxsiy kabinet - profil, statistika, sozlamalar",
};

export default function CabinetRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CabinetLayout>{children}</CabinetLayout>;
}
