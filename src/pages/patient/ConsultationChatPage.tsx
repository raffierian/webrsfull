import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout'; // Or PatientLayout? Usually chat is full screen or in portal
import ChatRoom from '@/components/chat/ChatRoom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ConsultationChatPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        console.log('Chat page loaded with sessionId:', sessionId);

        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            navigate('/login');
        }

        if (!sessionId) {
            console.error('No sessionId found in URL!');
            toast.error('Session tidak valid');
            navigate('/patient/consultation');
        }
    }, [navigate, sessionId]);

    if (!user || !sessionId) return null;

    return (
        <div className="p-4 lg:p-8 h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-4">
                <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
                </Button>
            </div>

            <div className="flex-1">
                <ChatRoom sessionId={sessionId} currentUser={user} />
            </div>
        </div>
    );
};

export default ConsultationChatPage;
