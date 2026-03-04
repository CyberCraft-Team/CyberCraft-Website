"use client";

import type React from "react";

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
import { useAdminNews, getAdminToken } from "@/lib/api/hooks";

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export default function NewsPage() {
  const { news, isLoading, mutate } = useAdminNews();
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
    image_url: "",
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getAdminToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/admin/categories/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category: data[0].id.toString(),
            }));
          }
        }
      } catch (error) {
        console.error("Kategoriyalarni yuklashda xato:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate category is selected
    if (
      !formData.category ||
      formData.category === "loading" ||
      formData.category === "empty"
    ) {
      alert("Iltimos, kategoriyani tanlang");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAdminToken();
      const categoryId = parseInt(formData.category);

      // Validate category ID is a valid number
      if (isNaN(categoryId)) {
        alert("Kategoriya noto'g'ri tanlangan");
        setIsSubmitting(false);
        return;
      }

      const requestBody = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: categoryId,
      };

      console.log("Sending request:", requestBody);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/admin/news/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (response.ok) {
        setIsCreateOpen(false);
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          category: categories.length > 0 ? categories[0].id.toString() : "",
          image_url: "",
        });
        mutate();
      } else {
        // Log the error response for debugging
        const errorData = await response.json();
        console.error("Server error:", errorData);
        alert(`Xato: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Yangilik yaratishda xato:", error);
      alert(`Xato: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    if (!confirm("Yangilikni o'chirishni tasdiqlaysizmi?")) return;

    try {
      const token = getAdminToken();
      await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/admin/news/${newsId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      mutate();
    } catch (error) {
      console.error("Yangilik o'chirishda xato:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Yangiliklar
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Yangiliklar va e'lonlarni boshqarish
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="cyber-btn">
              <Plus className="w-4 h-4 mr-2" />
              Yangi yangilik
            </Button>
          </DialogTrigger>
          <DialogContent className="cyber-card border-[var(--border-color)] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[var(--text-primary)]">
                Yangi yangilik yaratish
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateNews} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">Sarlavha</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Yangilik sarlavhasi"
                  className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">
                    Kategoriya
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category: v })
                    }
                  >
                    <SelectTrigger className="bg-[var(--bg-dark)] border-[var(--border-color)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Yuklanmoqda...
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
                          Kategoriyalar topilmadi
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-secondary)]">
                    Rasm URL (ixtiyoriy)
                  </Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="bg-[var(--bg-dark)] border-[var(--border-color)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">
                  Qisqa tavsif
                </Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Yangilik haqida qisqacha..."
                  className="bg-[var(--bg-dark)] border-[var(--border-color)] min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-secondary)]">
                  To'liq matn
                </Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Yangilik to'liq matni..."
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
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="cyber-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    "Yaratish"
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
          placeholder="Yangiliklar qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-[var(--bg-card)] border-[var(--border-color)]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Newspaper className="w-16 h-16 text-[var(--text-secondary)] mb-4 opacity-50" />
          <p className="text-[var(--text-secondary)] text-lg">
            {searchQuery
              ? "Hech qanday yangilik topilmadi"
              : "Hali yangilik yo'q"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNews.map((item) => (
            <Card
              key={item.id}
              className="group cyber-card border-[var(--border-color)] overflow-hidden hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/20 cursor-pointer"
            >
              <CardContent className="p-0">
                {/* Image/Thumbnail with Gradient Overlay */}
                <div className="relative h-48 overflow-hidden">
                  {item.image_url ? (
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${item.image_url})` }}
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
                        backgroundColor: `${item.category_color}40`,
                        color: item.category_color,
                        border: `1px solid ${item.category_color}60`,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Actions Menu - Floating */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md hover:bg-[var(--bg-card)] shadow-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="cyber-card border-[var(--border-color)]"
                      >
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Ko'rish
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-600"
                          onClick={() => handleDeleteNews(item.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          O'chirish
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
                      {new Date(item.date).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]" />
                    <span className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-[10px] font-bold text-white">
                        {item.author?.charAt(0).toUpperCase() || "A"}
                      </div>
                      {item.author}
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
                  <div className="flex items-center gap-2 mt-4 text-sm font-medium text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-0 group-hover:translate-x-1">
                    <span>To'liq o'qish</span>
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
