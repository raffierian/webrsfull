import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

import { useSettings } from '@/hooks/useSettings';

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();

  const { data: articleData, isLoading } = useQuery({
    queryKey: ['public-article', slug],
    queryFn: () => slug ? api.articles.getBySlug(slug) : null,
    enabled: !!slug
  });

  const article = articleData;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h1>
            <Link to="/articles">
              <Button variant="medical">Kembali ke Daftar Artikel</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Image */}
      <section className="relative h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.thumbnailUrl || article.imageUrl || 'https://via.placeholder.com/1200x600'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-end pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white max-w-3xl"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-medium mb-4">
              {article.tags && article.tags.length > 0 ? article.tags[0] : (article.category || 'Umum')}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.createdAt || article.publishedAt || new Date()).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author?.name || 'Admin'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.ceil((article.content?.length || 0) / 1000)} menit baca
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Link to="/articles" className="inline-flex items-center gap-2 text-primary mb-8 hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Artikel
              </Link>

              <div className="prose prose-lg max-w-none">
                {/* Simple rendering for now, could use markdown parser if available or just whitespace-pre-line */}
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {article.content}
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {article.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-muted text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-8 pt-8 border-t">
                <p className="font-medium mb-4">Bagikan artikel ini:</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Author Card */}
              <div className="card-medical p-6">
                <h3 className="font-bold mb-4">Penulis</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{article.author?.name || 'Admin'}</p>
                    <p className="text-sm text-muted-foreground">{settings?.name || "RS Harapan Sehat"}</p>
                  </div>
                </div>
              </div>

              {/* Related Articles - Placeholder if not available */}
              {article.relatedArticles && article.relatedArticles.length > 0 && (
                <div className="card-medical p-6">
                  <h3 className="font-bold mb-4">Artikel Terkait</h3>
                  <div className="space-y-4">
                    {article.relatedArticles.map((related: any, idx: number) => (
                      <Link key={idx} to={`/articles/${related.slug}`} className="flex gap-3 group">
                        <img
                          src={related.imageUrl || 'https://via.placeholder.com/100'}
                          alt={related.title}
                          className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                          {related.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="card-medical p-6 bg-primary/5 border-primary/20">
                <h3 className="font-bold mb-2">Butuh Konsultasi?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Hubungi dokter kami untuk konsultasi lebih lanjut.
                </p>
                <Link to="/appointment">
                  <Button variant="medical" className="w-full">
                    Buat Janji Temu
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ArticleDetailPage;
