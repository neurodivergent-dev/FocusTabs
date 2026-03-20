import { useAIStore } from "../store/aiStore";

class GroqService {
  private readonly baseUrl = "https://api.groq.com/openai/v1";

  async chat(
    message: string, 
    history: { role: string, content: string }[], 
    systemInstruction: string,
    model: string = "llama-3.1-8b-instant"
  ): Promise<string> {
    const { groqApiKey } = useAIStore.getState();
    if (!groqApiKey) return "";

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemInstruction },
            ...history,
            { role: "user", content: message },
          ],
          temperature: 0.6,
          max_tokens: 4096,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Groq API Error:", data.error);
        return "";
      }

      return data.choices[0]?.message?.content || "";
    } catch (e) {
      console.error("Groq Service Error:", e);
      return "";
    }
  }

  // Refine, Decompose vb. yardımcı fonksiyonlar da buraya eklenebilir
}

export const groqService = new GroqService();
