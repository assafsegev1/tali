
import React, { useState } from 'react';
import { Send, User, Bot, ArrowRight, Loader2, HelpCircle } from 'lucide-react';
import { askBiologyTeacher } from '../services/geminiService';

interface Props {
  onBack: () => void;
}

const AskTeacher: React.FC<Props> = ({ onBack }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(null);
    
    const response = await askBiologyTeacher(question);
    setAnswer(response);
    setLoading(false);
  };

  // Render formatted text with bolding
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line.startsWith('**') || line.startsWith('#') ? 
                <strong className="block mt-3 mb-1 text-emerald-900">{line.replace(/[#*]/g, '')}</strong> : 
                <span className="block mb-1 text-slate-700 leading-relaxed">{line.replace(/\*\*/g, '')}</span>
            }
        </React.Fragment>
    ));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-medium"
        >
          <ArrowRight size={20} />
          חזרה לראשי
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HelpCircle className="text-emerald-600" />
          שאל את המורה
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white">
          <h3 className="text-xl font-bold mb-2">יש לך שאלה בביולוגיה?</h3>
          <p className="opacity-90 text-sm">
            המורה הדיגיטלי כאן כדי לעזור! אפשר לשאול על מושגים לא ברורים, שאלות חזרה, או בקשה להסברים מעמיקים.
          </p>
        </div>

        <div className="p-6 md:p-8">
          {!answer ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  השאלה שלך:
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="למשל: מה ההבדל בין מיטוזה למיוזה? או, למה מיטוכונדריה נקראת תחנת הכוח של התא?"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none min-h-[200px] resize-y bg-gray-50 focus:bg-white transition-all text-lg text-gray-800 placeholder-gray-400"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    המורה חושב...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    שלח שאלה
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="animate-fade-in">
               {/* User Question Bubble */}
               <div className="flex gap-4 mb-8">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={20} className="text-gray-500" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tr-none p-5 text-gray-800 flex-1">
                    <p className="font-bold text-sm text-gray-500 mb-1">השאלה שלך:</p>
                    <p className="text-lg">{question}</p>
                  </div>
               </div>

               {/* Teacher Response Bubble */}
               <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                    <Bot size={20} className="text-emerald-600" />
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-none p-6 text-gray-800 flex-1 shadow-sm">
                    <p className="font-bold text-sm text-emerald-600 mb-2">תשובת המורה:</p>
                    <div className="prose prose-emerald max-w-none">
                      {renderText(answer)}
                    </div>
                  </div>
               </div>

               <div className="mt-8 flex justify-center">
                 <button
                   onClick={() => {
                     setAnswer(null);
                     setQuestion('');
                   }}
                   className="text-emerald-600 font-bold hover:bg-emerald-50 px-6 py-2 rounded-full transition-colors border border-emerald-200"
                 >
                   לשאול שאלה נוספת
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskTeacher;
