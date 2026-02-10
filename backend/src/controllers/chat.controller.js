import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Initialize AI providers
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Determine which AI provider to use
const AI_PROVIDER = process.env.AI_PROVIDER || (openai ? 'openai' : 'gemini');

export const handleChat = async (req, res, next) => {
    try {
        const { message, history } = req.body;

        if (!openai && !genAI) {
            return errorResponse(res, 'Chatbot tidak siap. API Key belum dikonfigurasi.', 503);
        }

        if (!message || !message.trim()) {
            return errorResponse(res, 'Pesan tidak boleh kosong', 400);
        }

        // Fetch Context
        const [polis, services, knowledge] = await Promise.all([
            prisma.poli.findMany({ where: { isActive: true }, select: { name: true } }),
            prisma.service.findMany({ where: { isActive: true }, select: { name: true } }),
            prisma.knowledge.findMany({ where: { isActive: true } })
        ]);

        const knowledgeContext = knowledge.map(k => `${k.title}: ${k.content}`).join('\n\n');

        const systemPrompt = `Anda adalah asisten virtual RS Soewandhie yang ramah. 
Bantu pengunjung dengan informasi berikut:

${knowledgeContext}

Daftar Poli: ${polis.map(p => p.name).join(', ')}
Daftar Layanan: ${services.map(s => s.name).join(', ')}

Jawab dengan sopan dan singkat. Jika tidak tahu, arahkan ke Customer Service.`;

        let reply;
        let newHistory;

        // OpenAI
        if (AI_PROVIDER === 'openai' && openai) {
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...(history || []).map(h => ({
                        role: h.role === 'model' ? 'assistant' : h.role,
                        content: h.parts?.[0]?.text || h.content || h.text || ""
                    })),
                    { role: 'user', content: message }
                ],
                max_tokens: 400,
                temperature: 0.7,
            });

            reply = completion.choices[0].message.content;
            newHistory = [
                ...(history || []),
                { role: 'user', parts: [{ text: message }] },
                { role: 'model', parts: [{ text: reply }] }
            ];
        }
        // Gemini
        else if (genAI) {
            try {
                // Models found in list: gemini-flash-latest, gemini-2.0-flash, gemini-2.5-flash
                const model = genAI.getGenerativeModel({
                    model: "gemini-flash-latest",
                    systemInstruction: systemPrompt
                });

                const contents = (history || []).map(h => ({
                    role: h.role === 'assistant' ? 'model' : h.role,
                    parts: [{ text: h.parts?.[0]?.text || h.content || h.text || "" }]
                }));

                const result = await model.generateContent({
                    contents: [
                        ...contents,
                        { role: 'user', parts: [{ text: message }] }
                    ]
                });

                const response = await result.response;
                reply = response.text();

                newHistory = [
                    ...(history || []),
                    { role: 'user', parts: [{ text: message }] },
                    { role: 'model', parts: [{ text: reply }] }
                ];
            } catch (geminiError) {
                console.error('Gemini Error:', geminiError.message);
                throw geminiError;
            }
        }

        return successResponse(res, { reply, history: newHistory });
    } catch (error) {
        console.error('Chat Error:', error.message);
        return errorResponse(res, 'Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti ya.', 500);
    }
};
