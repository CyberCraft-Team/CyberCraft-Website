"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Calendar,
    User,
    Tag,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { News } from "@/lib/api/types";

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [news, setNews] = useState<News | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
                const res = await fetch(`${apiUrl}/public/news/${params.id}/`);
                if (!res.ok) throw new Error("Yangilik topilmadi");
                const data = await res.json();
                setNews(data);
            } catch (err: any) {
                setError(err.message || "Xatolik yuz berdi");
            } finally {
                setIsLoading(false);
            }
        };
        fetchNews();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center cyber-card p-8 max-w-md">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[var(--error)]" />
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        {error || "Yangilik topilmadi"}
                    </h1>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Kechirasiz, bu yangilikni yuklashda xatolik yuz berdi.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="border-[var(--border-color)]"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Orqaga
                        </Button>
                        <Link href="/">
                            <Button className="cyber-btn">Bosh sahifa</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-dark)] to-[#0f0f1a] -z-10" />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Orqaga qaytish</span>
                </button>

                {/* Header */}
                <article>
                    <div className="mb-6">
                        <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                            style={{
                                backgroundColor: `${news.category_color}20`,
                                color: news.category_color,
                            }}
                        >
                            <Tag className="w-3 h-3 inline mr-1" />
                            {news.category}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6">
                        {news.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-[var(--text-secondary)] text-sm mb-8">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{news.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {new Date(news.date).toLocaleDateString("uz-UZ", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Image */}
                    {news.image_url && (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 border border-[var(--border-color)]">
                            <Image
                                src={news.image_url}
                                alt={news.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="cyber-card p-6 md:p-10">
                        {news.excerpt && (
                            <p className="text-lg text-[var(--text-secondary)] italic border-l-4 border-[var(--primary)] pl-4 mb-8">
                                {news.excerpt}
                            </p>
                        )}
                        <div
                            className="prose prose-invert max-w-none
                prose-headings:text-[var(--text-primary)]
                prose-p:text-[var(--text-secondary)]
                prose-a:text-[var(--primary)] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[var(--text-primary)]
                prose-code:text-[var(--primary)]
                prose-pre:bg-[var(--bg-dark)] prose-pre:border prose-pre:border-[var(--border-color)]"
                            dangerouslySetInnerHTML={{ __html: news.content }}
                        />
                    </div>

                    {/* Back to home */}
                    <div className="mt-10 text-center">
                        <Link href="/">
                            <Button
                                variant="outline"
                                className="border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Bosh sahifaga qaytish
                            </Button>
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
}
