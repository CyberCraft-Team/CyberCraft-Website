"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ManagementToolbar,
  ManagementError,
  ManagementEmpty,
} from "@/components/dashboard/management";

import type React from "react";

import { Link } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  MoreVertical,
  Eye,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api/fetcher";
import { useAdminNews } from "@/lib/api/hooks";

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export default function NewsPage() {
  const t = useTranslations("dashboard.copy");
  const m = useTranslations("dashboard.management");
  const locale = useLocale();
  const { news, isLoading, isError: listError, mutate } = useAdminNews();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Through the proxy on this app's own origin, which attaches the
        // admin token from the HttpOnly cookie. Straight to Django it was a
        // credential-less cross-origin call, so it answered 401 and the
        // category list stayed empty.
        const data = await apiFetch<any>("admin/categories/");
        const list = Array.isArray(data) ? data : data?.results || [];
        setCategories(list);
        if (list.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: list[0].id.toString(),
          }));
        }
      } catch (error) {
        setCategoryError(true);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredNews = news.filter((item: any) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    // Validate category is selected
    if (
      !formData.category ||
      formData.category === "loading" ||
      formData.category === "empty"
    ) {
      setActionError(t("please_select_a_category"));
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryId = parseInt(formData.category);

      // Validate category ID is a valid number
      if (isNaN(categoryId)) {
        setActionError(t("invalid_category"));
        setIsSubmitting(false);
        return;
      }

      const requestBody = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: categoryId,
      };

      await apiFetch(
        editingId === null ? "admin/news/" : `admin/news/${editingId}/`,
        { method: editingId === null ? "POST" : "PATCH", json: requestBody },
      );

      setIsCreateOpen(false);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: categories.length > 0 ? categories[0].id.toString() : "",
      });
      mutate();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : t("could_not_create_the_news_post"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    if (!confirm(t("delete_this_news_post"))) return;

    try {
      await apiFetch(`admin/news/${newsId}/`, { method: "DELETE" });
      mutate();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : t("could_not_delete_the_news_post"),
      );
    }
  };

  return (
    <div className="management-page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {t("news")}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {t("manage_announcements_and_news_for_your_community")}
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="cyber-btn"
              onClick={() => {
                setEditingId(null);
                setActionError(null);
                setFormData({
                  title: "",
                  excerpt: "",
                  content: "",
                  category: categories[0]?.id.toString() || "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("add_news_post")}
            </Button>
          </DialogTrigger>
          <DialogContent className="management-dialog cyber-card border-[var(--border-color)] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[var(--text-primary)]">
                {editingId === null ? t("create_a_news_post") : t("edit")}
              </DialogTitle>
            </DialogHeader>
            {categoryError && (
              <p role="alert" className="text-destructive">
                {m("categoryFailed")}
              </p>
            )}
            {actionError && (
              <p role="alert" className="text-destructive">
                {actionError}
              </p>
            )}
            <form onSubmit={handleCreateNews} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label
                  htmlFor="news-field-1"
                  className="text-[var(--text-secondary)]"
                >
                  {t("title")}
                </Label>
                <Input
                  id="news-field-1"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder={t("news_post_title")}
                  aria-label={t("news_post_title")}
                  className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="news-field-2"
                    className="text-[var(--text-secondary)]"
                  >
                    {t("category")}
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category: v })
                    }
                  >
                    <SelectTrigger
                      id="news-field-2"
                      className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          {t("loading")}
                        </SelectItem>
                      ) : categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          {t("no_categories_found")}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="news-field-3"
                  className="text-[var(--text-secondary)]"
                >
                  {t("summary")}
                </Label>
                <Textarea
                  id="news-field-3"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder={t("a_short_introduction_to_the_news")}
                  className="bg-[var(--bg-dark)] border-[var(--border-color)] min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="news-field-4"
                  className="text-[var(--text-secondary)]"
                >
                  {t("full_content")}
                </Label>
                <Textarea
                  id="news-field-4"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder={t("write_the_full_news_post")}
                  className="bg-[var(--bg-dark)] border-[var(--border-color)] min-h-[200px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="border-[var(--border-color)]"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="cyber-btn"
                  disabled={
                    isSubmitting || categoriesLoading || categories.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("creating")}
                    </>
                  ) : editingId === null ? (
                    t("create")
                  ) : (
                    t("save")
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
        <Input
          placeholder={t("search_news")}
          aria-label={t("search_news")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-[var(--bg-card)] border-[var(--border-color)]"
        />
      </div>

      {actionError && !isCreateOpen && (
        <p role="alert" className="text-destructive">
          {actionError}
        </p>
      )}
      <ManagementToolbar
        count={news.length}
        shown={filteredNews.length}
        loading={isLoading || Boolean(listError)}
        onRefresh={async () => {
          await mutate();
        }}
      />

      {listError ? (
        <ManagementError
          onRetry={async () => {
            await mutate();
          }}
        />
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Newspaper className="w-16 h-16 text-[var(--text-secondary)] mb-4 opacity-50" />
          <p className="text-[var(--text-secondary)] text-lg">
            {searchQuery ? t("no_news_posts_found") : t("no_news_posts_yet")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredNews.map((item: any) => (
            <Card
              key={item.id}
              className="group cyber-card border-[var(--border-color)] overflow-hidden hover:border-[var(--primary)] transition-all duration-300 "
            >
              <CardContent className="p-0">
                {/* Image/Thumbnail with Gradient Overlay */}
                <div className="relative h-48 overflow-hidden">
                  {item.image ? (
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/50 to-transparent" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 via-[var(--bg-dark)] to-[var(--bg-card)]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Newspaper className="w-20 h-20 text-[var(--text-secondary)] opacity-20" />
                      </div>
                    </>
                  )}

                  {/* Category Badge - Floating */}
                  <div className="absolute top-4 left-4">
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg"
                      style={{
                        backgroundColor: "var(--bg-dark)",
                        color:
                          categories.find(
                            (category) => category.id === item.category,
                          )?.color || "var(--primary)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      {categories.find(
                        (category) => category.id === item.category,
                      )?.name || "—"}
                    </span>
                  </div>

                  {/* Actions Menu - Floating */}
                  <div className="absolute top-4 right-4 ">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={m("actionsFor", { name: item.title })}
                          className="h-11 w-11 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md hover:bg-[var(--bg-card)] shadow-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="cyber-card border-[var(--border-color)]"
                      >
                        <DropdownMenuItem asChild disabled={!item.is_published}>
                          <Link href={`/news/${item.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t("view")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingId(item.id);
                            setActionError(null);
                            setFormData({
                              title: item.title,
                              excerpt: item.excerpt,
                              content: item.content,
                              category: String(item.category),
                            });
                            setIsCreateOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-red-600"
                          onClick={() => handleDeleteNews(item.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  {/* Date & Author */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors duration-200">
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>

                  {/* Read More Indicator */}
                  {item.is_published ? (
                    <Link
                      href={`/news/${item.id}`}
                      className="flex min-h-11 items-center gap-2 mt-4 text-sm font-medium text-primary hover:underline"
                    >
                      <span>{t("read_full_post")}</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {m("draft")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
