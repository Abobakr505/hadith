import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_INSTRUCTION = `
أنت مساعد إسلامي متخصص في التحقق من صحة الأحاديث النبوية. مهمتك الأساسية هي التأكد من صحة الأحاديث اعتمادًا على مصادر أهل السنة والجماعة الموثوقة فقط.

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

مهم جداً: لا تكتب أي مقدمة أو تعليق خارج هذه العلامات، ابدأ مباشرة بـ [HADITH_START].
`;

interface UrlResult {
  uri: string;
  title: string;
}

interface HadithResult {
  text: string;
  urls: UrlResult[];
}

export class HadithService {
  private client: Anthropic;

  constructor() {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error(
        'مفتاح Anthropic API غير موجود. تأكد من إضافة VITE_ANTHROPIC_API_KEY في ملف .env'
      );
    }

    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // ⚠️ المفتاح مرئي في المتصفح - راجع الملاحظة الأمنية أدناه
    });
  }

  async verifyHadith(prompt: string, retries: number = 3): Promise<HadithResult> {
    let attempt = 0;

    while (attempt < retries) {
      try {
        const response = await this.client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: SYSTEM_INSTRUCTION,
          messages: [
            { role: 'user', content: prompt }
          ],
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search',
            } as any,
          ],
        });

        const text = response.content
          .filter((block: any) => block.type === 'text')
          .map((block: any) => block.text)
          .join('\n')
          .trim() || 'عذراً، لم أتمكن من العثور على نتيجة دقيقة.';

        const urls: UrlResult[] = [];
        for (const block of response.content as any[]) {
          if (block.type === 'text' && block.citations) {
            for (const citation of block.citations) {
              if (citation.type === 'web_search_result_location' && citation.url) {
                urls.push({
                  uri: citation.url,
                  title: citation.title || 'مصدر خارجي',
                });
              }
            }
          }
        }

        const uniqueUrls = Array.from(
          new Map(urls.map(u => [u.uri, u])).values()
        );

        return { text, urls: uniqueUrls };

      } catch (error: any) {
        const status = error?.status ?? error?.code;

        if (status === 429) {
          console.warn(`Rate limit exceeded (attempt ${attempt + 1}/${retries}), retrying...`);
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        } else if (status === 404) {
          console.warn(`Model not found (attempt ${attempt + 1}/${retries}), retrying...`);
          attempt++;
        } else {
          console.error('Anthropic API Error:', error);
          throw error;
        }
      }
    }

    throw new Error('Exceeded retry limit. Please check your API quota, billing setup, or model name.');
  }
}

export const hadithService = new HadithService();