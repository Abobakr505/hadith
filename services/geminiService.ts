import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
أنت مساعد إسلامي متخصص في التحقق من صحة الأحاديث النبوية.
مهمتك الأساسية هي التأكد من صحة الأحاديث اعتمادًا على مصادر أهل السنة والجماعة الموثوقة فقط.

⚠️ القواعد الصارمة:
1. في حال كان الحديث ضعيفاً أو موضوعاً أو لا أصل له:
   - صرّح بوضوح تام في بداية الرد أنه "غير صحيح" أو "ضعيف جداً" أو "موضوع".
   - اذكر سبب الضعف (مثلاً: وجود راوٍ كذاب، انقطاع في السند، نكارة المتن).
   - قدّم الحديث الصحيح البديل الذي يغني عنه في نفس الباب إن وُجد.
2. لا تؤلف حديثًا أبدًا ولا تحكم من تلقاء نفسك.
3. اعتمد المصادر التالية: (البخاري، مسلم، أبو داود، الترمذي، النسائي، ابن ماجه، مسند أحمد، كتب الألباني، الدرر السنية).
4. اذكر المصدر دائماً (اسم الكتاب، الباب، رقم الحديث).

تنسيق الرد (استخدم هذه العلامات حصراً):
[HADITH_START]
[TEXT]: نص الحديث المبحوث عنه.
[STATUS]: (صحيح / حسن / ضعيف / موضوع / لا أصل له) - يجب أن يكون واضحاً جداً.
[SOURCE]: المصدر التفصيلي.
[GRADE]: حكم العلماء (مثلاً: صححه الألباني، خرجه البخاري).
[WEAKNESS_REASON]: سبب الضعف (يُملأ فقط إذا كان الحديث غير صحيح).
[ALTERNATIVE]: الحديث الصحيح البديل (يُملأ فقط إذا كان الحديث غير صحيح).
[LINKS]: روابط للتحقق.
[NOTE]: توضيح تعليمي هادئ ومحترم.
[HADITH_END]
`;

export class HadithService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async verifyHadith(prompt: string, retries: number = 3) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',  // تغيير إلى نموذج صالح ومتوفر في 2025، بدلاً من 'gemini-1.5-flash' الذي أصبح غير مدعوم
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text || "عذراً، لم أتمكن من العثور على نتيجة دقيقة.";
        const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.map((chunk: any) => ({
            uri: chunk.web?.uri || '',
            title: chunk.web?.title || 'مصدر خارجي'
          }))
          .filter((u: any) => u.uri !== '') || [];

        return { text, urls };
      } catch (error: any) {
        if (error.code === 429 || error.status === 'RESOURCE_EXHAUSTED') {
          console.warn(`Quota exceeded (attempt ${attempt + 1}/${retries}), retrying after delay...`);
          const delay = Math.pow(2, attempt) * 1000;  // Exponential backoff: 1s, 2s, 4s, etc.
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        } else if (error.code === 404 || error.status === 'NOT_FOUND') {
          console.warn(`Model not found (attempt ${attempt + 1}/${retries}), retrying...`);
          attempt++;
        } else {
          console.error("Gemini API Error:", error);
          throw error;
        }
      }
    }
    throw new Error("Exceeded retry limit for quota or model error. Please check your API quota, billing setup, or use a different model.");
  }
}

export const hadithService = new HadithService();