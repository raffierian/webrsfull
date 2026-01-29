// Simple test script untuk verify Gemini API Key
// Hardcode key di sini untuk test cepat (jangan commit ke git!)

import { GoogleGenerativeAI } from "@google/generative-ai";

// INSTRUKSI:
// 1. Buka https://aistudio.google.com/app/apikey
// 2. Buat API Key baru
// 3. Copy key dan paste di bawah ini (ganti YOUR_API_KEY_HERE)
// 4. Jalankan: node test-gemini-simple.js

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA6C_mHmkH0cUssr28PBWTpnDGaruHaRDc";

if (API_KEY === "YOUR_API_KEY_HERE") {
    console.error("❌ ERROR: Silakan ganti YOUR_API_KEY_HERE dengan API Key dari AI Studio");
    console.log("\n📝 Cara mendapatkan API Key:");
    console.log("1. Buka: https://aistudio.google.com/app/apikey");
    console.log("2. Login dengan Google");
    console.log("3. Klik 'Create API Key'");
    console.log("4. Copy key dan paste di file ini");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testGemini() {
    console.log("🔍 Testing Gemini API...");
    console.log("API Key:", API_KEY.substring(0, 10) + "...\n");

    try {
        // Test 1: gemini-1.5-flash (recommended)
        console.log("📡 Test 1: gemini-1.5-flash");
        const model1 = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are a helpful assistant."
        });

        const result1 = await model1.generateContent("Say hello in Indonesian");
        const text1 = result1.response.text();

        console.log("✅ SUKSES!");
        console.log("Response:", text1);
        console.log("\n🎉 Gemini API berfungsi dengan baik!");
        console.log("💡 Silakan copy API Key ini ke file .env backend\n");

    } catch (error) {
        console.error("❌ ERROR:", error.message);

        if (error.message.includes("404")) {
            console.log("\n🔍 Diagnosa: Error 404 - Model tidak ditemukan");
            console.log("\n💡 Kemungkinan penyebab:");
            console.log("1. API Key dari Google Cloud Console (bukan AI Studio)");
            console.log("2. API Key belum aktif");
            console.log("\n✅ Solusi:");
            console.log("- Buat API Key BARU di: https://aistudio.google.com/app/apikey");
            console.log("- Pilih 'Create API key in new project'");
            console.log("- Copy key baru dan paste di file ini");

            // Try fallback to gemini-pro
            console.log("\n🔄 Mencoba model alternatif: gemini-pro...");
            try {
                const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result2 = await model2.generateContent("Hi");
                console.log("✅ gemini-pro BERHASIL!");
                console.log("💡 Gunakan model 'gemini-pro' di chat.controller.js");
            } catch (err2) {
                console.log("❌ gemini-pro juga gagal");
                console.log("⚠️ API Key kemungkinan besar dari tempat yang salah");
            }

        } else if (error.message.includes("API key not valid")) {
            console.log("\n💡 Solusi: API Key tidak valid");
            console.log("- Pastikan key dimulai dengan 'AIza'");
            console.log("- Tidak ada spasi di awal/akhir");
            console.log("- Buat key baru di: https://aistudio.google.com/app/apikey");
        }

        process.exit(1);
    }
}

testGemini();
