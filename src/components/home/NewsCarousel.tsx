import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

import { useSettings } from '@/hooks/useSettings';

const NewsCarousel: React.FC = () => {
  const { settings } = useSettings();
  const hospitalName = settings?.name || 'RS Harapan Sehat';

  const dummyNews = [
    {
      id: 1,
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
      category: 'Kesehatan',
      publishedAt: new Date().toISOString(),
      title: 'Tips Menjaga Kesehatan Jantung di Usia Muda',
      excerpt: 'Pelajari cara menjaga kesehatan jantung sejak dini untuk hidup yang lebih berkualitas.',
      slug: '#',
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
      category: 'Inovasi',
      publishedAt: new Date().toISOString(),
      title: `${hospitalName} Hadirkan Layanan Telemedicine`,
      excerpt: 'Konsultasi dokter kini lebih mudah dengan layanan telemedicine terbaru kami.',
      slug: '#',
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop',
      category: 'Event',
      publishedAt: new Date().toISOString(),
      title: 'Seminar Kesehatan: Pencegahan Diabetes',
      excerpt: 'Ikuti seminar gratis tentang pencegahan dan pengelolaan diabetes.',
      slug: '#',
    },
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['public-articles-home'],
    queryFn: () => api.articles.getAllPublic('limit=5'),
  });

  const articles = Array.isArray(articlesData) ? articlesData : (articlesData?.data || []);

  const processedArticles = articles.map((article: any) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    // Use createdAt as publishedAt
    publishedAt: article.createdAt || new Date().toISOString(),
    // Handle Image URL (add API base if relative)
    imageUrl: article.thumbnailUrl
      ? (article.thumbnailUrl.startsWith('http')
        ? article.thumbnailUrl
        : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${article.thumbnailUrl}`)
      : null,
    // Handle Category (take first tag or default)
    category: article.tags && article.tags.length > 0 ? article.tags[0] : 'Berita',
    // Create excerpt from content (strip HTML)
    excerpt: article.content
      ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...'
      : ''
  }));

  const displayArticles = processedArticles.length > 0 ? processedArticles : dummyNews;

  if (isLoading) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          Loading articles...
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Berita & Artikel
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Informasi Kesehatan Terkini</h2>
            <p className="text-muted-foreground max-w-xl">
              Dapatkan informasi terbaru seputar kesehatan, event, dan layanan rumah sakit.
            </p>
          </div>
          <Link to="/articles" className="mt-4 md:mt-0">
            <Button variant="outline" className="gap-2">
              Lihat Semua Artikel
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {displayArticles.map((item: any, idx: number) => (
              <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={item.slug !== '#' ? `/articles/${item.slug}` : '#'}>
                    <div className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden shrink-0">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/600x400'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.publishedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                          {item.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all mt-auto">
                          Baca Selengkapnya
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default NewsCarousel;
