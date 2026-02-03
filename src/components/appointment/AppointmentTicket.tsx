import React, { useRef } from 'react';
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Heart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AppointmentTicketProps {
    appointment: any;
    patientName: string;
    serviceName?: string;
    doctorName?: string;
    settings?: any;
}

const AppointmentTicket: React.FC<AppointmentTicketProps> = ({
    appointment,
    patientName,
    serviceName,
    doctorName,
    settings
}) => {
    const ticketRef = useRef<HTMLDivElement>(null);

    const downloadTicket = async () => {
        if (ticketRef.current) {
            try {
                const canvas = await html2canvas(ticketRef.current, {
                    backgroundColor: "#ffffff",
                    scale: 2,
                    useCORS: true
                });
                const link = document.createElement("a");
                link.download = `Tiket-RS-${format(new Date(), 'yyyyMMddHHmmss')}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
                toast.success("Tiket berhasil disimpan!");
            } catch (err) {
                console.error("Failed to download ticket", err);
                toast.error("Gagal menyimpan tiket.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div
                ref={ticketRef}
                className="bg-white p-0 rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm border border-slate-100 relative"
            >
                {/* Ticket Header */}
                <div className="bg-[#0F766E] p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/20">
                        <Heart className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                    <h3 className="text-white font-bold text-lg tracking-wide uppercase">E-Tiket Antrean</h3>
                    <p className="text-teal-100 text-xs mt-1 opacity-80">{settings?.name || "RS Soewandhie"}</p>
                </div>

                {/* Ticket Body */}
                <div className="p-6 relative">
                    <div className="absolute top-[-10px] left-[-10px] w-5 h-5 bg-slate-50 rounded-full" />
                    <div className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-slate-50 rounded-full" />

                    <div className="text-center mb-6">
                        <p className="text-sm text-slate-400 font-medium">Nomor Antrean Anda</p>
                        <h2 className="text-5xl font-bold text-[#0F766E] tracking-tighter mt-1">
                            {appointment?.queueNumber ? (typeof appointment.queueNumber === 'number' ? `A-${appointment.queueNumber}` : appointment.queueNumber) : "A-00X"}
                        </h2>
                        <div className="inline-block px-3 py-1 bg-teal-50 text-[#0F766E] text-xs font-bold rounded-full mt-2">
                            {appointment?.status || "CONFIRMED"}
                        </div>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-white border-2 border-dashed border-slate-200 rounded-xl">
                            <QRCode
                                value={appointment?.id || "NO_ID"}
                                size={120}
                                fgColor="#0F172A"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Pasien</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[150px]">{patientName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Tanggal</span>
                            <span className="font-semibold text-slate-700">
                                {appointment?.appointmentDate ? format(new Date(appointment.appointmentDate), 'd MMM yyyy', { locale: id }) : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Poli/Layanan</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                                {serviceName || appointment?.service?.name || '-'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Jam Praktek</span>
                            <span className="font-semibold text-slate-700">{appointment?.appointmentTime || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400">
                        Simpan tiket ini dan tunjukkan kepada petugas saat check-in.
                    </p>
                </div>
            </div>

            <div className="mt-4 w-full max-w-sm">
                <Button
                    onClick={downloadTicket}
                    className="w-full bg-[#0F766E] hover:bg-[#0d655e] text-white shadow-lg shadow-teal-700/20"
                    size="lg"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Simpan Tiket (Gambar)
                </Button>
            </div>
        </div>
    );
};

export default AppointmentTicket;
