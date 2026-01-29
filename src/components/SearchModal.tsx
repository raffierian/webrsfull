import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, FileText, UserCircle, Briefcase, Stethoscope, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { debounce } from 'lodash';

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Debounced search function
    const performSearch = useCallback(
        debounce(async (searchQuery: string) => {
            if (searchQuery.trim().length < 2) {
                setResults(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const data = await api.search.global(searchQuery);
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
                setResults(null);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        performSearch(query);
    }, [query, performSearch]);

    const handleResultClick = (type: string, slug?: string, id?: string) => {
        onOpenChange(false);
        setQuery('');
        setResults(null);

        switch (type) {
            case 'article':
                navigate(`/articles/${slug}`);
                break;
            case 'doctor':
                navigate(`/doctors#${id}`);
                break;
            case 'service':
                navigate(`/services#${slug}`);
                break;
            case 'career':
                navigate(`/careers/${slug}`);
                break;
        }
    };

    const hasResults = results && (
        results.articles?.length > 0 ||
        results.doctors?.length > 0 ||
        results.services?.length > 0 ||
        results.careers?.length > 0
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Pencarian</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari artikel, dokter, layanan, karir..."
                        className="pl-10"
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}

                    {!isLoading && query.length >= 2 && !hasResults && (
                        <div className="text-center py-8 text-muted-foreground">
                            Tidak ada hasil ditemukan untuk "{query}"
                        </div>
                    )}

                    {!isLoading && hasResults && (
                        <div className="space-y-6 py-4">
                            {/* Articles */}
                            {results.articles?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Artikel ({results.articles.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.articles.map((article: any) => (
                                            <button
                                                key={article.id}
                                                onClick={() => handleResultClick('article', article.slug)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className="font-medium">{article.title}</div>
                                                {article.excerpt && (
                                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                                        {article.excerpt}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Doctors */}
                            {results.doctors?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" />
                                        Dokter ({results.doctors.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.doctors.map((doctor: any) => (
                                            <button
                                                key={doctor.id}
                                                onClick={() => handleResultClick('doctor', undefined, doctor.id)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                                            >
                                                {doctor.photoUrl ? (
                                                    <img src={doctor.photoUrl} alt={doctor.name} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <UserCircle className="w-6 h-6 text-primary" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{doctor.name}</div>
                                                    <div className="text-sm text-muted-foreground">{doctor.specialization}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services */}
                            {results.services?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" />
                                        Layanan ({results.services.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.services.map((service: any) => (
                                            <button
                                                key={service.id}
                                                onClick={() => handleResultClick('service', service.slug)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className="font-medium">{service.name}</div>
                                                <div className="text-sm text-muted-foreground capitalize">{service.type}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Careers */}
                            {results.careers?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" />
                                        Karir ({results.careers.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.careers.map((career: any) => (
                                            <button
                                                key={career.id}
                                                onClick={() => handleResultClick('career', career.slug)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className="font-medium">{career.title}</div>
                                                <div className="text-sm text-muted-foreground">{career.department}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Tekan <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> untuk menutup
                </div>
            </DialogContent>
        </Dialog>
    );
}
