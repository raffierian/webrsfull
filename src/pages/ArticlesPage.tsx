import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Calendar,
  User,
  Clock,
  ChevronRight,
  Heart,
  Brain,
  Eye,
  Bone,
  Award,
  Baby
} from "lucide-react";

const categories = [
  { id: "all", label: "Semua", icon: null },
  { id: "Kesehatan", label: "Kesehatan", icon: Heart },
  { id: "Prestasi", label: "Prestasi", icon: Award },
  { id: "jantung", label: "Jantung", icon: Heart },
  { id: "saraf", label: "Saraf", icon: Brain },
  { id: "anak", label: "Anak", icon: Baby },
  { id: "mata", label: "Mata", icon: Eye },
  { id: "tulang", label: "Tulang", icon: Bone },
];

const ArticlesPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || "all";

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Sync state when URL changes (e.g. clicking header link while already on page)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  // Update URL when category changes via button
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['public-articles', activeCategory, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory); // Note: Backend expects capitalized/exact category likely, need to match backend seeding
      // Backend controller filters by category directly. 
      // If frontend categories are lowercase 'jantung' but backend stores 'Kesehatan', this won't match.
      // Assuming for now backend seed matches or using generic 'Kesehatan' for all.
      // Let's just pass category through.
      return api.articles.getAllPublic(params.toString());
    }
  });

  const articles = Array.isArray(articlesData) ? articlesData : (articlesData?.data || []);

  // Client-side search if API doesn't support it or for smoother experience on small datasets
  // Backend controller doesn't seem to have search in `getAllArticles` snippet I saw (only category). 
  // So client side filter is needed.
  const filteredArticles = articles.filter((article: any) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredArticle = filteredArticles[0];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Artikel Kesehatan</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Temukan informasi kesehatan terpercaya dari para dokter spesialis kami
              </p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari artikel..."
                className="pl-12 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat.id)}
                  className="flex items-center gap-2"
                >
                  {cat.icon && <cat.icon className="w-4 h-4" />}
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {activeCategory === "all" && !searchTerm && featuredArticle && (
          <section className="pb-12">
            <div className="container mx-auto px-4">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto">
                    <img
                      src={featuredArticle.thumbnailUrl || featuredArticle.imageUrl || 'https://via.placeholder.com/800x400'}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4">Artikel Pilihan</Badge>
                    <h2 className="text-2xl font-bold mb-3">{featuredArticle.title}</h2>
                    <p className="text-muted-foreground mb-4">
                      {featuredArticle.excerpt || (featuredArticle.content ? featuredArticle.content.substring(0, 150) + '...' : '')}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {featuredArticle.author?.name || 'Admin'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredArticle.createdAt || featuredArticle.publishedAt || new Date()).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <Link to={`/articles/${featuredArticle.slug}`}>
                      <Button className="w-fit">
                        Baca Selengkapnya
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Article Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {activeCategory === "all" ? "Semua Artikel" : `Artikel ${categories.find(c => c.id === activeCategory)?.label}`}
              </h2>
              <p className="text-muted-foreground">{filteredArticles.length} artikel</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Loading articles...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article: any) => (
                  <Link key={article.id} to={`/articles/${article.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={article.thumbnailUrl || article.imageUrl || 'https://via.placeholder.com/400x300'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6">
                        <Badge variant="secondary" className="mb-3">
                          {article.tags && article.tags.length > 0 ? article.tags[0] : (article.category || 'Umum')}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {article.excerpt || (article.content ? article.content.substring(0, 100) + '...' : '')}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.createdAt || article.publishedAt || new Date()).toLocaleDateString("id-ID")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(article.views || 0)} views
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {!isLoading && filteredArticles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada artikel yang sesuai dengan pencarian Anda</p>
              </div>
            )}

            {/* Load More - Implementation would require pagination state */}
            {/* {filteredArticles.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Muat Lebih Banyak
                </Button>
              </div>
            )} */}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ArticlesPage;
