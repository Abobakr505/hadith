export type GradeLevel = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown';

export interface HadithItem {
  id: string;
  text: string;
  rawi: string;        // الراوي
  muhaddith: string;   // المحدّث
  source: string;      // المصدر
  page: string;        // الصفحة أو الرقم
  grade: string;       // خلاصة حكم المحدث
  level: GradeLevel;
}

export interface GroundingUrl {
  uri: string;
  title: string;
}

export interface VerifyResult {
  query: string;
  hadiths: HadithItem[];            // الأول هو الأقرب لسؤال المستخدم
  summary?: string;                 // تلخيص AI (اختياري)
  note?: string;                    // فائدة توضيحية
  alternative?: HadithItem | null;  // بديل صحيح
  mode: 'dorar+ai' | 'dorar' | 'ai';
  urls: GroundingUrl[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'loading' | 'success' | 'error';
  result?: VerifyResult;
  groundingUrls?: GroundingUrl[];
}