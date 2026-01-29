import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message;
        setMessage('');
        setIsLoading(true);

        // Update UI immediately
        const newUserMsg: Message = { role: 'user', parts: [{ text: userMsg }] };
        setHistory(prev => [...prev, newUserMsg]);

        try {
            const response = await api.chat.sendMessage(userMsg, history);
            setHistory(response.history);
        } catch (error) {
            console.error('Chat failed:', error);
            setHistory(prev => [...prev, {
                role: 'model',
                parts: [{ text: "Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti ya." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] sm:w-[400px] overflow-hidden rounded-2xl border bg-white shadow-2xl dark:bg-slate-900"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-white/20 p-2 text-white">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold leading-none">Asisten RS Soewandhie</h3>
                                    <p className="text-xs text-white/70 mt-1">Online | Siap Membantu</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Chat Area */}
                        <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {history.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="inline-block rounded-full bg-primary/10 p-4 mb-3 text-primary">
                                            <MessageCircle size={32} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">Halo! Ada yang bisa saya bantu hari ini tentang RS Soewandhie?</p>
                                    </div>
                                )}
                                {history.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex gap-3",
                                            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow",
                                            msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={cn(
                                            "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                                            msg.role === 'user'
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}>
                                            {msg.parts[0].text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                            <Bot size={16} />
                                        </div>
                                        <div className="rounded-lg bg-muted px-3 py-2 text-sm flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin" />
                                            Sedang mengetik...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                            <Input
                                placeholder="Tulis pesan..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                autoFocus
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !message.trim()}>
                                <Send size={18} />
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="lg"
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
                {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
            </Button>
        </div>
    );
};

export default ChatWidget;
