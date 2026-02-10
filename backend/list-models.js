import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
        console.log('Saved model list to models_list.json');
    } catch (error) {
        console.error('Fetch failed:', error.message);
    }
}

listModels();
