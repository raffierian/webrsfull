import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { config } from '../config/index.js';

// Initialize AI providers
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Determine which AI provider to use (prioritize OpenAI as it's more reliable)
const AI_PROVIDER = process.env.AI_PROVIDER || (openai ? 'openai' : 'gemini');

export const handleChat = async (req, res, next) => {
    try {
        const { message, history } = req.body;

        // Check if any AI provider is configured
        if (!openai && !genAI) {
            return errorResponse(res, 'Sistem Chatbot belum siap. API Key belum dikonfigurasi.', 503);
        }

        if (!message || !message.trim()) {
            return errorResponse(res, 'Pesan tidak boleh kosong', 400);
        }

        // Fetch context from DB
        const [polis, services] = await Promise.all([
            prisma.poli.findMany({ where: { isActive: true }, select: { name: true } }),
            prisma.service.findMany({ where: { isActive: true }, select: { name: true } })
        ]);

        const systemPrompt = `Anda adalah asisten virtual RS Soewandhie yang ramah dan profesional. 
Bantu pengunjung dengan informasi tentang:
- Poli: ${polis.map(p => p.name).join(', ')}
- Layanan: ${services.map(s => s.name).join(', ')}

Jawab dalam Bahasa Indonesia yang sopan dan singkat.`;

        let reply;
        let newHistory;

        // Use OpenAI if available and selected
        if (AI_PROVIDER === 'openai' && openai) {
            const messages = [
                { role: 'system', content: systemPrompt },
                ...(history || []).map(h => ({
                    role: h.role === 'model' ? 'assistant' : h.role,
                    content: h.parts[0].text
                })),
                { role: 'user', content: message }
            ];

            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
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
        // Fallback to Gemini with proper systemInstruction
        else if (genAI) {
            // 1. Use systemInstruction directly in model initialization
            // gemini-1.5-flash is faster and better at following instructions
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: systemPrompt
            });

            // 2. Validate and normalize history format
            // Gemini is strict: role must be 'user' or 'model', structure must be correct
            const validHistory = (history || []).map(h => ({
                role: h.role === 'assistant' ? 'model' : h.role, // Handle OpenAI format
                parts: h.parts || [{ text: h.content || h.text }] // Handle both formats
            }));

            const chat = model.startChat({
                history: validHistory,
                generationConfig: {
                    maxOutputTokens: 400,
                    temperature: 0.7,
                },
            });

            // 3. Send message (no need to prepend system prompt anymore)
            const result = await chat.sendMessage(message);
            const response = await result.response;
            reply = response.text();

            // 4. Update history for frontend
            newHistory = [
                ...validHistory,
                { role: 'user', parts: [{ text: message }] },
                { role: 'model', parts: [{ text: reply }] }
            ];
        } else {
            throw new Error('No AI provider available');
        }

        return successResponse(res, {
            reply: reply,
            history: newHistory
        });
    } catch (error) {
        console.error('Chat AI Error:', error);
        console.error('Error details:', error.message);

        // Return user-friendly error
        return errorResponse(res, 'Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti ya.', 500);
    }
};
