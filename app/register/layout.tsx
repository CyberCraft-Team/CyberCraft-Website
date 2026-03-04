import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ro'yxatdan o'tish",
    description: "CyberCraft platformasida yangi hisob yarating",
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
