import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User as UserIcon, MoreVertical, Lock, Paperclip, File, Download, Image as ImageIcon, Loader2, Pill } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ChatRoomProps {
    sessionId: string;
    currentUser: any; // User object
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';

const ChatRoom: React.FC<ChatRoomProps> = ({ sessionId, currentUser }) => {
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket(sessionId);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Fetch initial messages
    const { data: initialMessages } = useQuery({
        queryKey: ['chat-messages', sessionId],
        queryFn: () => api.consultationChat.getMessages(sessionId),
        enabled: !!sessionId
    });

    // Fetch session details to get doctor info
    const { data: sessionData, refetch: refetchSession } = useQuery({
        queryKey: ['chat-session', sessionId],
        queryFn: () => api.consultationChat.getSession(sessionId),
        enabled: !!sessionId
    });

    const { data: prescription } = useQuery({
        queryKey: ['prescription', sessionId],
        queryFn: () => api.prescription.getBySession(sessionId!),
        enabled: !!sessionId
    });

    const session = sessionData;
    const doctor = session?.doctor;

    // Check payment status
    const [isPaid, setIsPaid] = useState(true);

    useEffect(() => {
        if (initialMessages && Array.isArray(initialMessages)) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        if (sessionData) {
            setIsPaid(sessionData.isPaid);
        }
    }, [sessionData]);

    // Handle real-time messages
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message: any) => {
            setMessages((prev) => [...prev, message]);
            // If the message is about prescription being issued, refetch session/prescription
            if (message.content?.includes('Resep digital telah diterbitkan')) {
                queryClient.invalidateQueries({ queryKey: ['prescription', sessionId] });
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket, sessionId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !socket || !isPaid) return;

        const messageData = {
            sessionId,
            senderId: currentUser.id,
            content: newMessage,
        };

        // Emit to server (optimistic UI update could be done here too)
        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !socket || !isPaid) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const uploadData = await api.upload(formData);

            const fileType = file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT';

            const messageData = {
                sessionId,
                senderId: currentUser.id,
                content: `Sent a ${fileType.toLowerCase()}: ${file.name}`,
                type: fileType,
                fileUrl: uploadData.url,
                fileName: file.name,
                fileSize: file.size,
            };

            socket.emit('send_message', messageData);
        } catch (error: any) {
            console.error('File upload error:', error);
            toast.error('Gagal mengunggah file: ' + error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Payment required UI
    if (!isPaid) {
        return (
            <div className="flex flex-col h-[600px] border rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">Pembayaran Diperlukan</h3>
                        <p className="text-slate-600 mb-6">
                            Silakan selesaikan pembayaran untuk memulai konsultasi dengan dokter.
                        </p>
                        <Button
                            onClick={() => navigate(`/patient/consultation/payment/${sessionId}`)}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            Bayar Sekarang
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-2xl bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                            <UserIcon className="w-6 h-6" />
                        </div>
                        {isConnected && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">
                            {doctor?.name ? `dr. ${doctor.name}` : 'Konsultasi Dokter'}
                        </h3>
                        {doctor?.specialization && (
                            <p className="text-[10px] text-slate-500 font-medium">
                                {doctor.specialization}
                            </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                            {isConnected ? '• Online' : '• Menghubungkan...'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {prescription?.status === 'ISSUED' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPrescriptionOpen(true)}
                            className="bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100"
                        >
                            <Pill className="w-4 h-4 mr-1 text-teal-600" />
                            Lihat Resep
                        </Button>
                    )}
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {Array.isArray(messages) && messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe
                                ? 'bg-teal-600 text-white rounded-tr-none shadow-md shadow-teal-600/10'
                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                                }`}>
                                {msg.type === 'IMAGE' ? (
                                    <div className="space-y-2">
                                        <img
                                            src={msg.fileUrl}
                                            alt={msg.fileName}
                                            className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                                            onClick={() => window.open(msg.fileUrl, '_blank')}
                                        />
                                        <p className="text-xs italic opacity-80">{msg.fileName}</p>
                                    </div>
                                ) : msg.type === 'DOCUMENT' ? (
                                    <div className="flex items-center gap-3 p-2 bg-black/5 rounded-lg border border-black/10">
                                        <File className="w-8 h-8 opacity-60" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-medium truncate">{msg.fileName}</p>
                                            <p className="text-[10px] opacity-60">
                                                {(msg.fileSize / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <a
                                            href={msg.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-1.5 rounded-full ${isMe ? 'bg-teal-500 hover:bg-teal-400' : 'bg-slate-200 hover:bg-slate-300'} transition-colors`}
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm">{msg.content}</p>
                                )}
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
                                    {format(new Date(msg.createdAt || Date.now()), 'HH:mm', { locale: idLocale })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {session?.status === 'CLOSED' ? (
                <div className="p-4 bg-yellow-50 border-t border-yellow-200 text-center">
                    <p className="text-yellow-800 font-medium text-sm flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Sesi konsultasi ini telah ditutup.
                    </p>
                </div>
            ) : (
                <div className="p-4 bg-white border-t">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleFileClick}
                            disabled={!isConnected || isUploading}
                            className="border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-200"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                        </Button>
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ketik pesan..."
                            className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-teal-500"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!isConnected || (!newMessage.trim() && !isUploading)}
                            className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
            {/* Prescription Dialog */}
            <Dialog open={isPrescriptionOpen} onOpenChange={setIsPrescriptionOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pill className="w-5 h-5 text-teal-600" />
                            Resep Digital
                        </DialogTitle>
                    </DialogHeader>
                    {prescription ? (
                        <div className="space-y-4 py-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                                <div className="space-y-3">
                                    {(prescription.items || []).map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-start pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-bold text-slate-800">{item.medicineName}</p>
                                                <p className="text-xs text-slate-500">{item.dosage} • {item.instruction}</p>
                                            </div>
                                            <p className="text-sm font-bold text-teal-600">x{item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                {prescription.notes && (
                                    <div className="pt-2 border-t border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Catatan Tambahan</p>
                                        <p className="text-sm text-slate-600 italic">"{prescription.notes}"</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                                    <Download className="w-4 h-4 mr-2" /> Unduh PDF
                                </Button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 italic">
                                * Tunjukkan resep digital ini ke bagian Farmasi RS Soewandhie.
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-500">Resep belum diterbitkan.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChatRoom;
