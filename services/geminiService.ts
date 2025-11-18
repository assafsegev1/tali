
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) throw new Error("VITE_API_KEY is missing!");

const ai = new GoogleGenAI({ apiKey });

console.log(ai.models);

export interface EvaluationResult {
  score: number;
  feedback: string;
}

export const evaluateAnswer = async (
  question: string,
  officialAnswer: string,
  studentAnswer: string
): Promise<EvaluationResult> => {
  if (!studentAnswer.trim()) {
    return { score: 0, feedback: "לא הוזנה תשובה." };
  }

  try {
    const prompt = `
    You are a biology teacher grading a high school matriculation exam (Bagrut) in Israel.
    
    Question:
    ${question}

    Official Rubric Answer:
    ${officialAnswer}

    Student Answer:
    ${studentAnswer}

    Task:
    1. Grade the student answer on a scale of 0 to 100 based on how well it matches the key concepts in the official answer.
    2. Provide constructive feedback in Hebrew. Explain what was correct and what was missing.
    3. Return ONLY a JSON object with the following format: {"score": number, "feedback": "string"}. Do not wrap in markdown.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Empty response from AI");

    const result = JSON.parse(responseText) as EvaluationResult;
    return result;

  } catch (error) {
    console.error("Error evaluating answer:", error);
    return {
      score: 0,
      feedback: "אירעה שגיאה בעת בדיקת התשובה. אנא נסה שנית מאוחר יותר."
    };
  }
};

export const getTopicSummary = async (topic: string): Promise<string> => {
     try {
    const prompt = `
    כתוב סיכום קצר (עד 3 פסקאות) בעברית על הנושא הביולוגי: "${topic}".
    הסיכום מיועד לתלמידי תיכון המתכוננים לבגרות. הדגש מושגי יסוד.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "לא ניתן היה לייצר סיכום כרגע.";

  } catch (error) {
    console.error("Error getting summary:", error);
    return "שגיאה בטעינת הסיכום.";
  }
}

export const generateStudyPlan = async (weakTopics: string[]): Promise<string> => {
  try {
    let prompt = "";
    if (weakTopics.length === 0) {
        prompt = `
        המשתמש סיים תרגול בביולוגיה לבגרות וצדק בכל השאלות.
        1. כתוב לו משוב קצר ומעודד בעברית.
        2. הוסף כותרת מודגשת: "טיפים נוספים ללמידה". תחת כותרת זו, כתוב 2-3 טיפים כלליים וחשובים להצלחה בבגרות בביולוגיה (למשל: שימת לב למילות מפתח בשאלה, ניתוח גרפים, שימוש בטרמינולוגיה מדויקת).
        `;
    } else {
        prompt = `
        המשתמש סיים תרגול בביולוגיה לבגרות והתקשה בנושאים הבאים: ${weakTopics.join(', ')}.
        
        המשימה שלך:
        1. כתוב סיכום קצר וממוקד בעברית עבור כל אחד מהנושאים הללו, המדגיש את מושגי המפתח והטעויות הנפוצות.
        2. הצע אסטרטגיית למידה לשיפור בנושאים אלו.
        3. הוסף כותרת נפרדת ומודגשת בסוף: "טיפים נוספים ללמידה". תחת כותרת זו, כתוב 2-3 טיפים כלליים וחשובים להצלחה בבגרות בביולוגיה, שאינם קשורים בהכרח לנושאים החלשים (למשל: ניהול זמן בבחינה, קריאת גרפים, הבחנה בין "תאר" ל"הסבר").
        4. עצב את התשובה בצורה קריאה עם כותרות.
        `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "לא ניתן היה לייצר תוכנית לימוד כרגע.";
  } catch (error) {
      console.error("Error generating study plan:", error);
      return "אירעה שגיאה בעת יצירת סיכום הלמידה.";
  }
}

export const generateConceptImage = async (topic: string, relatedConcepts: string[]): Promise<string | null> => {
  try {
    const prompt = `A high quality, educational biological illustration representing: ${topic}. 
    Focus on concepts: ${relatedConcepts.join(', ')}.
    Style: Scientific textbook diagram, clean white background, clear details, realistic colors, 4:3 aspect ratio. No text labels.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3',
        },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating concept image:", error);
    return null;
  }
};

export const askBiologyTeacher = async (question: string): Promise<string> => {
  try {
    const prompt = `
    אתה מורה לביולוגיה בתיכון המכין תלמידים לבגרות.
    תלמיד שואל אותך את השאלה הבאה: "${question}".
    
    ענה לו בעברית בצורה:
    1. ברורה, סבלנית ומעודדת.
    2. השתמש במושגים ביולוגיים מדויקים אך מוסברים היטב.
    3. אם השאלה רלוונטית לנושאים שבמיקוד לבגרות, ציין זאת וקשר אותה לחומר הלימוד.
    4. שמור על תשובה תמציתית (עד 200 מילים) אלא אם נדרש פירוט רב.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "מצטער, לא הצלחתי לייצר תשובה כרגע.";
  } catch (error) {
    console.error("Error asking teacher:", error);
    return "אירעה שגיאה בעת שליחת השאלה. אנא נסו שנית.";
  }
};
