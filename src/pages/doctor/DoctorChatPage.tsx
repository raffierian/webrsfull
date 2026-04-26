import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Send, User, Phone, Calendar, X, Loader2, Paperclip, File, Download, ClipboardList, Save, CheckCircle, Pill, Plus, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { io, Socket } from 'socket.io-client';

const DoctorChatPage = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isPatientInfoOpen, setIsPatientInfoOpen] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const [closingNotes, setClosingNotes] = useState('');
    const [soap, setSoap] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
    });
    const [isSoapSaving, setIsSoapSaving] = useState(false);
    const [showSoapSidebar, setShowSoapSidebar] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'soap' | 'prescription'>('soap');
    const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
    const [prescriptionNotes, setPrescriptionNotes] = useState('');
    const [isPrescriptionLoading, setIsPrescriptionLoading] = useState(false);
    const [isIssuing, setIsIssuing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch consultation details
    const { data: consultation, isLoading } = useQuery({
        queryKey: ['doctor-consultation', sessionId],
        queryFn: () => api.doctor.getConsultationDetails(sessionId!),
        enabled: !!sessionId
    });

    // Close consultation mutation
    const closeMutation = useMutation({
        mutationFn: () => api.consultationChat.closeSession(sessionId!, {
            closingNotes,
            ...soap // Include current SOAP state to be saved on close
        }),
        onSuccess: () => {
            toast.success('Konsultasi ditutup');
            queryClient.invalidateQueries({ queryKey: ['doctor-consultation', sessionId] });
            queryClient.invalidateQueries({ queryKey: ['doctor-consultations'] });
            setIsCloseDialogOpen(false);
            navigate('/doctor/consultations');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal menutup konsultasi');
        }
    });

    // Socket.IO connection
    useEffect(() => {
        if (!sessionId) return;

        const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('connect', () => {
            console.log('Doctor connected to socket');
            newSocket.emit('join_session', sessionId);
        });

        newSocket.on('receive_message', (newMessage: any) => {
            queryClient.invalidateQueries({ queryKey: ['doctor-consultation', sessionId] });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [sessionId, queryClient]);

    // Update local SOAP state when consultation data loaded
    useEffect(() => {
        if (consultation) {
            setSoap({
                subjective: consultation.subjective || '',
                objective: consultation.objective || '',
                assessment: consultation.assessment || '',
                plan: consultation.plan || ''
            });
        }
    }, [consultation]);

    const saveSoapMutation = useMutation({
        mutationFn: (data: typeof soap) => api.consultationChat.updateSOAP(sessionId!, data),
        onSuccess: () => {
            toast.success('Rekam medis (SOAP) berhasil disimpan');
            queryClient.invalidateQueries({ queryKey: ['doctor-consultation', sessionId] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal menyimpan rekam medis');
        }
    });

    const handleSaveSoap = () => {
        saveSoapMutation.mutate(soap);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [consultation?.messages]);

    const handleSendMessage = () => {
        if (!message.trim() || !socket || !sessionId) return;

        socket.emit('send_message', {
            sessionId,
            senderId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : undefined,
            content: message.trim()
        });

        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Fetch initial prescription
    const { data: initialPrescription } = useQuery({
        queryKey: ['prescription', sessionId],
        queryFn: () => api.prescription.getBySession(sessionId!),
        enabled: !!sessionId
    });

    useEffect(() => {
        if (initialPrescription) {
            setPrescriptionItems(initialPrescription.items || []);
            setPrescriptionNotes(initialPrescription.notes || '');
        }
    }, [initialPrescription]);

    const upsertPrescriptionMutation = useMutation({
        mutationFn: () => api.prescription.upsert(sessionId!, {
            notes: prescriptionNotes,
            items: prescriptionItems
        }),
        onSuccess: () => {
            toast.success('Resep berhasil disimpan (Draft)');
            queryClient.invalidateQueries({ queryKey: ['prescription', sessionId] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal menyimpan resep');
        }
    });

    const issuePrescriptionMutation = useMutation({
        mutationFn: () => api.prescription.issue(sessionId!),
        onSuccess: () => {
            toast.success('Resep berhasil diterbitkan');
            queryClient.invalidateQueries({ queryKey: ['prescription', sessionId] });
            // Emit socket event so patient sees update immediately
            socket?.emit('send_message', {
                sessionId,
                senderId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : undefined,
                content: 'Resep digital telah diterbitkan oleh dokter.',
                type: 'TEXT'
            });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal menerbitkan resep');
        }
    });

    const addPrescriptionItem = () => {
        setPrescriptionItems([...prescriptionItems, { medicineName: '', dosage: '', instruction: '', quantity: 1 }]);
    };

    const removePrescriptionItem = (index: number) => {
        setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
    };

    const updatePrescriptionItem = (index: number, field: string, value: any) => {
        const newItems = [...prescriptionItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setPrescriptionItems(newItems);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!consultation) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-slate-600 mb-4">Konsultasi tidak ditemukan</p>
                <Button onClick={() => navigate('/doctor/consultations')}>Kembali</Button>
            </div>
        );
    }

    const patient = consultation.patient;
    const messages = consultation.messages || [];
    const isClosed = consultation.status === 'CLOSED';

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-slate-50 relative">
            {/* Soft background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-1 overflow-hidden relative z-10 w-full max-w-7xl mx-auto rounded-none md:rounded-2xl md:my-4 md:border md:shadow-xl bg-white/80 backdrop-blur-sm">
                {/* Main Chat Area */}
                <div className={`flex flex-col flex-1 transition-all duration-300 ${showSoapSidebar ? 'md:mr-80 lg:mr-96' : ''}`}>
                    {/* Header - Glassmorphism */}
                    <div className="bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between z-20 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-slate-100 rounded-full"
                                onClick={() => navigate('/doctor/consultations')}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => setIsPatientInfoOpen(true)}
                            >
                                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-800">{patient?.name}</h2>
                                    <p className="text-xs text-slate-500">Tap untuk info</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSoapSidebar(!showSoapSidebar)}
                                className={`hidden md:flex ${showSoapSidebar ? 'bg-teal-50 text-teal-600 border-teal-200' : ''}`}
                            >
                                <ClipboardList className="w-4 h-4 mr-1" />
                                SOAP
                            </Button>
                            {!isClosed && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCloseDialogOpen(true)}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Tutup
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Messages - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                        <div className="w-full mx-auto space-y-4 md:px-4">
                            {messages.map((msg: any) => {
                                const isFromMe = msg.senderId !== consultation.patientId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] md:max-w-[70%] px-5 py-3 shadow-sm ${isFromMe
                                                ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl rounded-tr-sm shadow-teal-600/10'
                                                : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm'
                                                }`}
                                        >
                                            {msg.type === 'IMAGE' ? (
                                                <div className="space-y-2 py-1">
                                                    <img
                                                        src={msg.fileUrl}
                                                        alt={msg.fileName}
                                                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.fileUrl, '_blank')}
                                                    />
                                                    <p className="text-[10px] italic opacity-75">{msg.fileName}</p>
                                                </div>
                                            ) : msg.type === 'DOCUMENT' ? (
                                                <div className={`flex items-center gap-3 p-2 rounded-lg border my-1 ${isFromMe ? 'bg-teal-500/50 border-teal-400' : 'bg-slate-50 border-slate-200'}`}>
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
                                                        className={`p-1.5 rounded-full ${isFromMe ? 'bg-teal-500 hover:bg-teal-400' : 'bg-slate-200 hover:bg-slate-300'} transition-colors`}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            ) : (
                                                <p className="break-words text-sm leading-relaxed">{msg.content}</p>
                                            )}
                                            <p className={`text-[10px] mt-1 text-right ${isFromMe ? 'text-teal-100' : 'text-slate-400'}`}>
                                                {format(new Date(msg.createdAt), 'HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input - Fixed Bottom */}
                    {!isClosed ? (
                        <div className="bg-white/90 backdrop-blur-md border-t p-4 px-4 md:px-6 z-20">
                            <div className="w-full mx-auto flex items-end gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                                <Textarea
                                    placeholder="Ketik balasan untuk pasien..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    rows={1}
                                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 resize-none min-h-[44px] py-3 px-2 shadow-none"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 w-11 p-0 shadow-md shadow-teal-600/20 shrink-0 mb-0.5"
                                >
                                    <Send className="w-5 h-5 ml-1" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50/90 backdrop-blur-md border-t border-yellow-200 p-4 text-center">
                            <p className="text-yellow-800 font-medium">Konsultasi telah ditutup</p>
                        </div>
                    )}
                </div>

                {/* SOAP & Prescription Sidebar */}
                {showSoapSidebar && (
                    <div className="hidden md:flex flex-col w-80 lg:w-96 bg-slate-50/50 backdrop-blur-xl border-l border-slate-200 absolute right-0 top-0 bottom-0 z-30 shadow-2xl transition-all duration-300">
                        <div className="p-3 border-b bg-white flex items-center justify-between shadow-sm relative z-10">
                            <div className="flex w-full bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setSidebarTab('soap')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${sidebarTab === 'soap' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <ClipboardList className="w-4 h-4" />
                                    SOAP
                                </button>
                                <button
                                    onClick={() => setSidebarTab('prescription')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${sidebarTab === 'prescription' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Pill className="w-4 h-4" />
                                    RESEP
                                </button>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={() => setShowSoapSidebar(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {sidebarTab === 'soap' ? (
                                <div className="p-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> S (Subjective)
                                        </label>
                                        <Textarea
                                            placeholder="Keluhan utama, riwayat sekarang..."
                                            value={soap.subjective}
                                            onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                                            className="min-h-[100px] text-xs focus:ring-teal-500"
                                            disabled={isClosed}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> O (Objective)
                                        </label>
                                        <Textarea
                                            placeholder="Hasil pemeriksaan fisik, tanda vital..."
                                            value={soap.objective}
                                            onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                                            className="min-h-[100px] text-xs focus:ring-teal-500"
                                            disabled={isClosed}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> A (Assessment)
                                        </label>
                                        <Textarea
                                            placeholder="Diagnosis (ICD-10 jika ada)..."
                                            value={soap.assessment}
                                            onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                                            className="min-h-[100px] text-xs focus:ring-teal-500"
                                            disabled={isClosed}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> P (Plan)
                                        </label>
                                        <Textarea
                                            placeholder="Terapi, obat, instruksi diet, kontrol..."
                                            value={soap.plan}
                                            onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                                            className="min-h-[100px] text-xs focus:ring-teal-500"
                                            disabled={isClosed}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">Daftar Obat</h4>
                                        {!isClosed && (
                                            <Button variant="outline" size="sm" onClick={addPrescriptionItem} className="h-7 text-[10px] border-dashed border-teal-300 text-teal-600 hover:bg-teal-50">
                                                <Plus className="w-3 h-3 mr-1" /> Tambah Obat
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {prescriptionItems.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                                                <Pill className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                <p className="text-[10px] text-slate-400">Belum ada obat yang ditambahkan</p>
                                            </div>
                                        ) : (
                                            prescriptionItems.map((item, idx) => (
                                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 relative group">
                                                    {!isClosed && (
                                                        <button
                                                            onClick={() => removePrescriptionItem(idx)}
                                                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Nama Obat"
                                                            value={item.medicineName}
                                                            onChange={(e) => updatePrescriptionItem(idx, 'medicineName', e.target.value)}
                                                            className="h-7 text-xs font-semibold focus:ring-teal-500"
                                                            disabled={isClosed}
                                                        />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Input
                                                                placeholder="Dosis (mis. 500mg)"
                                                                value={item.dosage}
                                                                onChange={(e) => updatePrescriptionItem(idx, 'dosage', e.target.value)}
                                                                className="h-7 text-[10px] focus:ring-teal-500"
                                                                disabled={isClosed}
                                                            />
                                                            <Input
                                                                type="number"
                                                                placeholder="Qty"
                                                                value={item.quantity}
                                                                onChange={(e) => updatePrescriptionItem(idx, 'quantity', e.target.value)}
                                                                className="h-7 text-[10px] focus:ring-teal-500"
                                                                disabled={isClosed}
                                                            />
                                                        </div>
                                                        <Input
                                                            placeholder="Aturan Pakai (mis. 3x1 sehari)"
                                                            value={item.instruction}
                                                            onChange={(e) => updatePrescriptionItem(idx, 'instruction', e.target.value)}
                                                            className="h-7 text-[10px] focus:ring-teal-500"
                                                            disabled={isClosed}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Catatan Resep</label>
                                        <Textarea
                                            placeholder="Instruksi khusus, pantangan..."
                                            value={prescriptionNotes}
                                            onChange={(e) => setPrescriptionNotes(e.target.value)}
                                            className="min-h-[80px] text-xs focus:ring-teal-500"
                                            disabled={isClosed}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isClosed && (
                            <div className="p-4 border-t bg-slate-50 space-y-2">
                                {sidebarTab === 'soap' ? (
                                    <Button
                                        className="w-full bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
                                        onClick={handleSaveSoap}
                                        disabled={saveSoapMutation.isPending}
                                    >
                                        {saveSoapMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Simpan Rekam Medis
                                    </Button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            className="text-xs h-9 border-teal-200 text-teal-600 hover:bg-teal-50"
                                            onClick={() => upsertPrescriptionMutation.mutate()}
                                            disabled={upsertPrescriptionMutation.isPending}
                                        >
                                            {upsertPrescriptionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                                            Draf
                                        </Button>
                                        <Button
                                            className="bg-teal-600 hover:bg-teal-700 text-xs h-9 shadow-md shadow-teal-600/10"
                                            onClick={() => issuePrescriptionMutation.mutate()}
                                            disabled={issuePrescriptionMutation.isPending || prescriptionItems.length === 0}
                                        >
                                            {issuePrescriptionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                            Terbitkan
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {isClosed && sidebarTab === 'prescription' && initialPrescription?.status === 'ISSUED' && (
                            <div className="p-4 border-t bg-slate-50">
                                <Button variant="outline" className="w-full text-xs h-9 border-slate-200 text-slate-600">
                                    <Printer className="w-3 h-3 mr-2" /> Cetak Resep
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Patient Info Dialog */}
            <Dialog open={isPatientInfoOpen} onOpenChange={setIsPatientInfoOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Informasi Pasien</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Nama</p>
                                <p className="font-semibold text-slate-800">{patient?.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">NIK</p>
                                <p className="font-semibold text-slate-800">{patient?.nik || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Telepon</p>
                                <p className="font-semibold text-slate-800">{patient?.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                                <p className="font-semibold text-slate-800 text-sm truncate">{patient?.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</p>
                                <p className="font-semibold text-slate-800 capitalize">
                                    {patient?.gender ? patient.gender.toLowerCase() : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Tgl Lahir</p>
                                <p className="font-semibold text-slate-800">
                                    {patient?.dateOfBirth
                                        ? format(new Date(patient.dateOfBirth), 'dd MMM yyyy', { locale: idLocale })
                                        : '-'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Close Consultation Dialog */}
            <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Selesaikan Konsultasi</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg flex gap-3">
                            <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
                            <p className="text-xs text-teal-800 leading-relaxed">
                                Sesi konsultasi akan berakhir. Pastikan Anda telah mengisi <strong>SOAP</strong> dengan lengkap. Catatan penutupan akan terlihat oleh pasien.
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kesimpulan/Catatan Pasien</label>
                            <Textarea
                                placeholder="Tuliskan saran atau kesimpulan akhir untuk pasien..."
                                value={closingNotes}
                                onChange={(e) => setClosingNotes(e.target.value)}
                                rows={4}
                                className="text-sm focus:ring-teal-500"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsCloseDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => closeMutation.mutate()}
                            disabled={closeMutation.isPending}
                        >
                            {closeMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <X className="w-4 h-4 mr-2" />
                            )}
                            Selesaikan & Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DoctorChatPage;
