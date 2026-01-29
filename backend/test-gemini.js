// Test script untuk verify Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Testing Gemini API...');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
    try {
        console.log('\n📡 Testing model: gemini-1.5-flash with systemInstruction');
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are a helpful assistant for RS Soewandhie hospital."
        });

        const result = await model.generateContent("Say hello in Indonesian");
        const response = result.response;
        const text = response.text();

        console.log('✅ SUCCESS!');
        console.log('Response:', text);
        console.log('\n🎉 Gemini API is working correctly with gemini-1.5-flash!');
        console.log('💡 Chatbot will use Gemini by default if OPENAI_API_KEY is not set.');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('\nFull error:', error);

        if (error.message.includes('API key not valid')) {
            console.log('\n💡 Solution: Get a new API key from https://aistudio.google.com/app/apikey');
        } else if (error.message.includes('not found')) {
            console.log('\n💡 Solution: Model not available. Try OpenAI instead.');
        }

        process.exit(1);
    }
}

testGemini();
