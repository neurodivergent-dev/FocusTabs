import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAIStore } from "../store/aiStore";

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private lastRequestTime: number = 0;
  private readonly COOLDOWN_MS = 5000; // 5 saniye bekleme süresi
  
  // Önbellek
  private cache: Record<string, { msg: string, time: number }> = {};

  private init() {
    const { apiKey, isAIEnabled } = useAIStore.getState();
    if (apiKey && isAIEnabled) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.genAI = null;
    }
  }

  private readonly MODEL_NAME = "gemini-2.5-flash";
  private readonly FALLBACK_MODEL = "gemini-1.5-flash";

  // Genel istek fonksiyonu (Hata yönetimi ve kota kontrolü ile)
  private async requestAI(prompt: string, cacheKey: string, forceRefresh = false, useFallback = false): Promise<string> {
    this.init();
    if (!this.genAI) return "";

    const now = Date.now();
    
    // 1. Önbellek kontrolü (Eğer zorla yenileme yoksa ve son 1 saat içindeyse aynısını ver)
    if (!forceRefresh && this.cache[cacheKey] && (now - this.cache[cacheKey].time < 3600000)) {
      return this.cache[cacheKey].msg;
    }

    // 2. Cooldown kontrolü (Eğer zorla yenileme yoksa ve çok sık istek atılıyorsa engelle)
    if (!forceRefresh && (now - this.lastRequestTime < this.COOLDOWN_MS)) {
      console.log(`[AI SERVICE] Cooldown aktif. Kalan süre: ${Math.round((this.COOLDOWN_MS - (now - this.lastRequestTime))/1000)}s`);
      return this.cache[cacheKey]?.msg || "";
    }

    try {
      console.log(`[AI SERVICE] Gemini'ye istek gönderiliyor (${useFallback ? this.FALLBACK_MODEL : this.MODEL_NAME})... ForceRefresh: ${forceRefresh}`);
      this.lastRequestTime = now;
      const model = this.genAI.getGenerativeModel({ model: useFallback ? this.FALLBACK_MODEL : this.MODEL_NAME });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().replace(/^"|"$/g, '');
      
      // Önbelleğe al
      this.cache[cacheKey] = { msg: text, time: now };
      return text;
    } catch (e: any) {
      if (e.message?.includes('429')) {
        console.log("Kota doldu, fallback veya cache deneniyor...");
        if (!useFallback) {
          return this.requestAI(prompt, cacheKey, forceRefresh, true);
        }
      }
      return "";
    }
  }

  async refineGoal(goal: string, language: string = 'en'): Promise<string> {
    const prompt = `Rewrite this specific user input into a more actionable and concrete single-sentence daily goal.
    USER INPUT: "${goal}"
    RULES:
    1. RESPOND ONLY with the rewritten goal.
    2. LANGUAGE: ${language}.
    3. NEVER give advice like "be more specific" or "clarify your goal".
    4. If you don't understand an abbreviation (like 'mtmk'), just keep it as is but make the sentence structure better.
    5. Max 8 words. No quotes.`;
    
    return this.requestAI(prompt, `refine_${goal}_${language}`);
  }

  async getCelebrationMessage(goals: string[], language: string = 'en'): Promise<string> {
    const prompt = `User completed these 3 goals today: ${goals.map(g => `"${g}"`).join(", ")}. 
    Write a very short, highly motivating one-sentence celebration message in ${language} that acknowledges their specific effort or the combination of these tasks. 
    Make it feel personal and smart. DO NOT use quotes. Max 15 words.`;
    
    const today = new Date().toISOString().split('T')[0];
    const goalsKey = goals.join("_").substring(0, 30);
    return this.requestAI(prompt, `celebration_${today}_${goalsKey}_${language}`);
  }

  async getPerformanceInsight(stats: any, language: string = 'en', forceRefresh = false): Promise<string> {
    const prompt = `Analyze these productivity stats: ${JSON.stringify(stats)}. 
    Give one very short (max 15 words), encouraging advice or insight in ${language}. 
    YOU CAN use basic Markdown like **bold** for emphasis. 
    DO NOT use quotes. Be direct and helpful.`;
    const today = new Date().toISOString().split('T')[0];
    return this.requestAI(prompt, `insight_${today}_${language}`, forceRefresh);
  }

  // Haftalık başarıları analiz etme (Achievements kartı için)
  async getWeeklyInsights(stats: any, language: string = 'en', forceRefresh = false): Promise<any[]> {
    const prompt = `Analyze these productivity stats: ${JSON.stringify(stats)}. 
    Create THREE specific achievement badges.
    RULES:
    1. Title: Very short (max 2 words, e.g. "Early Bird", "Streak King").
    2. Desc: Short explanation (max 6 words).
    3. Type: Choose one: streak, focus, speed, consistency, variety.
    4. Language: ${language}.
    Return ONLY JSON: [{"title": "...", "desc": "...", "type": "..."}]`;
    
    const today = new Date().toISOString().split('T')[0];
    const result = await this.requestAI(prompt, `achievements_${today}_${language}`, forceRefresh);
    try {
      return result ? JSON.parse(result) : [];
    } catch (e) {
      return [];
    }
  }

  // Yeni hedef önerisi oluşturma
  async suggestGoal(existingGoals: string[], language: string = 'en'): Promise<{ text: string, category: any }> {
    this.init();
    if (!this.genAI) return { text: "", category: "other" };

    try {
      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });
      const prompt = `You are a productivity coach. Existing goals: ${existingGoals.length > 0 ? existingGoals.join(", ") : "None"}. 
      Suggest ONE new, specific, and creative daily goal. 
      RULES:
      1. MUST be concrete (e.g., "Read 10 pages", "Do 20 pushups", "Clean your desk", "Write 1 function").
      2. AVOID generic advice like "be productive" or "work hard".
      3. Max 6 words. Language: ${language}.
      4. Pick one category: work, health, personal, finance, other.
      5. Return ONLY a JSON object: {"text": "Specific Goal", "category": "category_name"}.
      6. No markdown, no quotes around the JSON.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonStr = response.text().trim().replace(/```json|```/g, '');
      const parsed = JSON.parse(jsonStr);
      return {
        text: parsed.text.replace(/^"|"$/g, ''),
        category: parsed.category || "other"
      };
    } catch (e) {
      console.error("AI Suggestion Hatası:", e);
      return { text: "10 sayfa kitap oku", category: "personal" };
    }
  }

  // Hedefi alt adımlara bölme
  async decomposeGoal(goal: string, language: string = 'en'): Promise<string[]> {
    const prompt = `Break down this main goal into EXACTLY 3 small, tactical, and actionable sub-steps.
    MAIN GOAL: "${goal}"
    RULES:
    1. Steps must be concrete and very short (max 5 words each).
    2. RETURN ONLY a JSON array of strings: ["Step 1", "Step 2", "Step 3"].
    3. LANGUAGE: ${language}.
    4. NO markdown, NO numbered lists, ONLY the JSON array.`;

    const result = await this.requestAI(prompt, `decompose_${goal}_${language}`);
    
    if (!result || result.trim() === "") {
      return [];
    }

    try {
      // JSON temizleme: Markdown bloklarını ve gereksiz boşlukları temizle
      let cleanJson = result.trim();
      if (cleanJson.includes("```")) {
        cleanJson = cleanJson.replace(/```json|```/g, "").trim();
      }
      
      // Sadece dizi kısmını bulmaya çalış (bazen AI açıklama ekleyebiliyor)
      const arrayStart = cleanJson.indexOf("[");
      const arrayEnd = cleanJson.lastIndexOf("]");
      if (arrayStart !== -1 && arrayEnd !== -1) {
        cleanJson = cleanJson.substring(arrayStart, arrayEnd + 1);
      }

      const parsed = JSON.parse(cleanJson);
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch (e) {
      console.error("AI Decompose Hatası (Ham Yanıt):", result);
      console.error("AI Decompose Hatası (Detay):", e);
      return [];
    }
  }
}

export const aiService = new AIService();
