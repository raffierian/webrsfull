// List available Gemini models
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Listing available Gemini models...\n');

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Try different model names that might work
        const modelsToTry = [
            'gemini-pro',
            'gemini-1.0-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'models/gemini-pro',
            'models/gemini-1.0-pro'
        ];

        console.log('Testing available models:\n');

        for (const modelName of modelsToTry) {
            try {
                console.log(`Testing: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                console.log(`✅ ${modelName} - WORKS!`);
                console.log(`   Response: ${result.response.text().substring(0, 50)}...\n`);

                // If we found one that works, use it!
                console.log(`\n🎉 Found working model: ${modelName}`);
                console.log(`Update chat.controller.js to use: "${modelName}"`);
                break;

            } catch (error) {
                console.log(`❌ ${modelName} - ${error.message.substring(0, 80)}...\n`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
