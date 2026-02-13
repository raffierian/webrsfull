import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorId: string;
    doctorName: string;
    onSuccess?: () => void;
}

export function ReviewModal({ isOpen, onClose, doctorId, doctorName, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({
                title: "Error",
                description: "Silakan pilih rating bintang terlebih dahulu",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.doctors.createReview(doctorId, { rating, comment });
            toast({
                title: "Berhasil!",
                description: "Terima kasih atas ulasan Anda untuk " + doctorName,
            });
            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast({
                title: "Gagal mengirim ulasan",
                description: error.message || "Terjadi kesalahan",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Beri Ulasan Dokter</DialogTitle>
                    <DialogDescription>
                        Bagikan pengalaman Anda berkonsultasi dengan {doctorName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`w-8 h-8 ${(hoverRating || rating) >= star
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-slate-300 fill-slate-100"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="text-center text-sm font-medium text-slate-600">
                        {rating > 0 ? (
                            rating === 5 ? "Sangat Puas" :
                                rating === 4 ? "Puas" :
                                    rating === 3 ? "Cukup" :
                                        rating === 2 ? "Kurang" : "Sangat Kurang"
                        ) : "Pilih Bintang"}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Komentar (Opsional)</label>
                        <Textarea
                            placeholder="Tulis ulasan Anda di sini..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
