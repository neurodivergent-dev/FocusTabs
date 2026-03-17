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

    // 1. Önbellek kontrolü
    if (!forceRefresh && this.cache[cacheKey] && (now - this.cache[cacheKey].time < 3600000)) {
      return this.cache[cacheKey].msg;
    }

    // 2. Cooldown kontrolü (Chat için cooldown'u esnetelim)
    const isChat = cacheKey.startsWith('chat_');
    const cooldown = isChat ? 1000 : this.COOLDOWN_MS;

    if (!forceRefresh && (now - this.lastRequestTime < cooldown)) {
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
    } catch (e) {
      if (e instanceof Error && e.message?.includes('429')) {
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

    const nowLocal = new Date();
    const today = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    const goalsKey = goals.join("_").substring(0, 30);
    return this.requestAI(prompt, `celebration_${today}_${goalsKey}_${language}`);
  }

  async getPerformanceInsight(stats: Record<string, unknown>, language: string = 'en', forceRefresh = false): Promise<string> {
    const prompt = `Analyze these productivity stats: ${JSON.stringify(stats)}. 
    Give one very short (max 15 words), encouraging advice or insight in ${language}. 
    YOU CAN use basic Markdown like **bold** for emphasis. 
    DO NOT use quotes. Be direct and helpful.`;
    const nowLocal = new Date();
    const today = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    return this.requestAI(prompt, `insight_${today}_${language}`, forceRefresh);
  }

  // Haftalık başarıları analiz etme (Achievements kartı için)
  async getWeeklyInsights(stats: Record<string, unknown>, language: string = 'en', forceRefresh = false): Promise<import('../screens/StatsScreen').DynamicAIInsight[]> {
    const prompt = `Analyze these productivity stats: ${JSON.stringify(stats)}. 
    Create THREE specific achievement badges.
    RULES:
    1. Title: Very short (max 2 words, e.g. "Early Bird", "Streak King").
    2. Desc: Short explanation (max 6 words).
    3. Type: Choose one: streak, focus, speed, consistency, variety.
    4. Language: ${language}.
    Return ONLY JSON: [{"title": "...", "desc": "...", "type": "..."}]`;

    const nowLocal = new Date();
    const today = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    const result = await this.requestAI(prompt, `achievements_${today}_${language}`, forceRefresh);
    try {
      return result ? JSON.parse(result) : [];
    } catch (e) {
      return [];
    }
  }

  // Yeni hedef önerisi oluşturma
  async suggestGoal(existingGoals: string[], language: string = 'en'): Promise<{ text: string, category: import('../types/goal').GoalCategory }> {
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

  // AI Chatbot fonksiyonu
  async chat(message: string, history: { role: string, parts: { text: string }[] }[], goalContext: string, language: string = 'en', customPrompt?: string | null): Promise<string> {
    this.init();
    if (!this.genAI) return "";

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.MODEL_NAME,
        systemInstruction: `${customPrompt || `You are an expert Productivity Coach but also a very close, informal friend for the "FocusTabs" user.
        Your tone is EXTREMELY casual, intimate (samimi), and brotherly. Use slang like "aga", "kanka", "bro", "reis" naturally. 
        Don't be a cold corporate bot; talk like you've known the user for years.
        
        RULES:
        1. Keep responses helpful but VERY casual and informal (max 250 words).
        2. Use Markdown for readability.
        3. Language: ${language}.
        4. Be supportive like a best friend, but keep the focus on their tasks.
        5. If asked about something unrelated, answer like a buddy but remind them of their goals.`}

        CONTEXT:
        You have access to the user's current goals and subtasks:
        ${goalContext}
        
        ACTIONS:
        1. CREATE GOAL: Append this at the end if the user wants to add a new task:
           - Format: [ACTION:CREATE_GOAL:{"text": "Goal Text", "category": "work|health|personal|...", "date": "YYYY-MM-DD"}]
           - ALWAYS specify the date if the user mentions "tomorrow", "next Monday", etc. Default is today.
           
        2. START TIMER: Append this if the user wants to start a timer for an EXISTING goal.
           - Format: [ACTION:START_TIMER:{"goalId": "EXACT_ID", "duration": seconds}]
           
        3. DECOMPOSE GOAL: Append this if the user wants to break down an EXISTING goal into subtasks.
           - Format: [ACTION:DECOMPOSE_GOAL:{"goalId": "EXACT_ID"}]
           
        4. DELETE GOAL: Append this if the user asks to REMOVE a goal.
           - Format: [ACTION:DELETE_GOAL:{"goalId": "EXACT_ID"}]
           
        5. UPDATE GOAL: Append this if the user wants to EDIT an existing goal.
           - Format: [ACTION:UPDATE_GOAL:{"goalId": "EXACT_ID", "text": "New Text", "category": "category", "date": "YYYY-MM-DD"}]
           - You can change the text, category, or even MOVE it to another date.
           
        6. UPDATE SUBTASK: Append this if the user wants to edit the text of a subtask.
           - Format: [ACTION:UPDATE_SUBTASK:{"goalId": "EXACT_ID", "subTaskId": "SUB_ID", "text": "New Subtask Text"}]
           
        7. DELETE SUBTASK: Append this if the user wants to remove a subtask.
           - Format: [ACTION:DELETE_SUBTASK:{"goalId": "EXACT_ID", "subTaskId": "SUB_ID"}]

        8. SET DARK MODE: Append this to change light/dark mode.
           - Format: [ACTION:SET_DARK_MODE:{"isDark": true|false}]

        9. SET APP THEME: Append this to change the color theme.
           - Format: [ACTION:SET_APP_THEME:{"themeId": "ID"}]
           - Available IDs: default, neon, matrix, plasma, sunset, ocean, forest, sakura, vaporwave, bordeaux, emerald.

        10. SET LANGUAGE: Append this to change the app language.
            - Format: [ACTION:SET_LANGUAGE:{"lang": "tr|en"}]

        11. SET SOUNDS: Append this to enable/disable sound effects.
            - Format: [ACTION:SET_SOUNDS:{"enabled": true|false}]

        12. RESET ALL DATA: Append this if the user wants to WIPE or RESET everything.
            - Format: [ACTION:RESET_ALL_DATA]

        13. SET BACKGROUND EFFECT: Append this to change background visual effect.
            - Format: [ACTION:SET_BACKGROUND_EFFECT:{"effect": "none|shapes|particles|waves|crystals|tesseract"}]

        14. EXPORT DATA: Append this if the user wants to export or backup their data as JSON.
            - Format: [ACTION:EXPORT_DATA]

        15. OPEN BACKUP SETTINGS: Append this if the user wants to IMPORT data or see backup settings.
            - Format: [ACTION:OPEN_BACKUP_SETTINGS]

        16. NAVIGATE: Use this to direct the user to a specific screen.
            - Format: [ACTION:NAVIGATE:{"route": "ROUTE_NAME"}]
            - Available Routes: / (Home), /calendar, /stats, /ai-chat, /settings, /about, /ai-settings, /backup-settings, /theme-settings, /privacy-policy, /timer, /pomodoro, /easter-egg.
            - Use /easter-egg only if the user specifically asks for secret modes, 4D raymarching, or "reality breach".

        17. RATE APP: Append this if the user wants to rate the app.
            - Format: [ACTION:RATE_APP]

        18. CLEAR CHAT: Append this if the user wants to delete their chat history.
            - Format: [ACTION:CLEAR_CHAT]
            - A confirmation will be shown to the user.

        19. CREATE THEME: Append this to create and apply a custom color theme. Use valid HEX colors.
            - Format: [ACTION:CREATE_THEME:{"name": "...", "colors": {"primary": "#...", "secondary": "#...", "background": "#...", "card": "#...", "text": "#...", "subText": "#...", "border": "#...", "success": "#...", "warning": "#...", "error": "#...", "info": "#..."}}]
            - Choose colors that look harmonious and match the requested style.
        
        20. SET_CUSTOM_BACKGROUND: Append this to create a unique AI-driven background.
            - Format: [ACTION:SET_CUSTOM_BACKGROUND:{"type": "particles|shapes|waves|circles|squares|cubes|wireframe", "count": number, "speed": number, "color": "HEX", "size": number}]
            - IMPORTANT: Use "wireframe" for a SINGLE LARGE 3D cube in the center (size: 80-120). Use "cubes" ONLY for many small floating cubes (size: 20-50). If the user says "single cube" or "large cube", ALWAYS use "wireframe".

        21. GENERATE_IMAGE: Use this to show a visual representation.
            - Format: [IMAGE:detailed_prompt_here]
            - Use this when the user asks for a picture, a visual, or when you want to inspire them with a cyberpunk/productivity themed artwork. Use Pollinations AI (Flux model).

        APP INFO & PRIVACY:
        - App Name: FocusTabs. Version: v1.0.0.
        - Purpose: Minimalist daily goal tracking with focus tools.
        - Privacy: ZERO data collection. Everything is stored LOCALLY on the device. No third-party analytics. No cloud sync unless explicitly exported.
        - Features: Daily goals, subtasks, Pomodoro timer, focus tracking, calendar view, customizable themes/effects, AI coaching.
        - Developer: neurodivergent-dev (Melih).
        
        - Refine user input into professional text for goals.
        - You can ONLY perform ONE action per response.`
      });

      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text().trim();
    } catch (e) {
      console.error("AI Chat Error:", e);
      return "";
    }
  }
}

export const aiService = new AIService();
