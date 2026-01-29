// Quick test for OpenAI
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

console.log('🔍 Testing OpenAI...');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env');
    console.log('\n💡 Get API key from: https://platform.openai.com/api-keys');
    process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function testOpenAI() {
    try {
        console.log('\n📡 Testing ChatGPT...');

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say hello in Indonesian' }
            ],
            max_tokens: 50
        });

        const response = completion.choices[0].message.content;

        console.log('✅ SUCCESS!');
        console.log('Response:', response);
        console.log('\n🎉 OpenAI is working correctly!');
        console.log('💡 Chatbot will use OpenAI by default.');

    } catch (error) {
        console.error('❌ ERROR:', error.message);

        if (error.message.includes('Incorrect API key')) {
            console.log('\n💡 Solution: Check your API key at https://platform.openai.com/api-keys');
        } else if (error.message.includes('insufficient_quota')) {
            console.log('\n💡 Solution: Add billing at https://platform.openai.com/settings/organization/billing/overview');
        }

        process.exit(1);
    }
}

testOpenAI();
