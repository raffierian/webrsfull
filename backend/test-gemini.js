import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        console.log('--- Testing gemini-flash-latest ---');
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("hello");
        const response = await result.response;
        console.log("✅ Success with gemini-flash-latest:", response.text());
    } catch (e) {
        console.log("❌ Failed with gemini-flash-latest:", e.message);

        try {
            console.log('--- Testing gemini-2.0-flash ---');
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent("hello");
            const response = await result.response;
            console.log("✅ Success with gemini-2.0-flash:", response.text());
        } catch (e2) {
            console.log("❌ Failed with gemini-2.0-flash:", e2.message);
        }
    }
}
check();
