import React, { useEffect, useState } from 'react';
import { Trophy, BookOpen, RotateCcw, Loader2 } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';

interface Props {
  weakTopics: string[];
  onRestart: () => void;
}

const Summary: React.FC<Props> = ({ weakTopics, onRestart }) => {
  const [aiPlan, setAiPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
        const plan = await generateStudyPlan(weakTopics);
        setAiPlan(plan);
        setLoading(false);
    };
    fetchPlan();
  }, [weakTopics]);

  // Simple function to render markdown-like text (bolding)
  const renderText = (text: string) => {
      return text.split('\n').map((line, i) => (
          <React.Fragment key={i}>
              {line.startsWith('**') || line.startsWith('#') ? 
                  <strong className="block mt-4 mb-2 text-emerald-800 text-lg">{line.replace(/[#*]/g, '')}</strong> : 
                  <span className="block mb-1">{line.replace(/\*\*/g, '')}</span>
              }
          </React.Fragment>
      ));
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 animate-fade-in-up">
      <div className="flex justify-center mb-6">
        <div className="bg-yellow-100 p-4 rounded-full">
            <Trophy size={48} className="text-yellow-600" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-2">כל הכבוד על סיום התרגול!</h2>
      <p className="text-gray-500 mb-8">
          {weakTopics.length > 0 
            ? `זיהינו ${weakTopics.length} נושאים שכדאי לחזק.` 
            : 'הפגנת ידע מצוין בכל השאלות!'}
      </p>

      <div className="bg-emerald-50 rounded-xl p-6 text-right mb-8 border border-emerald-100 shadow-inner">
        <div className="flex items-center gap-2 mb-4 border-b border-emerald-200 pb-2">
            <BookOpen className="text-emerald-600" size={24}/>
            <h3 className="font-bold text-emerald-800 text-lg">תוכנית לימוד מותאמת אישית (AI)</h3>
        </div>
        
        {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-emerald-600">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span className="text-sm">המורה הדיגיטלי מכין לך סיכום...</span>
            </div>
        ) : (
            <div className="text-emerald-900 text-sm leading-relaxed whitespace-pre-wrap text-right">
                {renderText(aiPlan)}
            </div>
        )}
      </div>

      <button
        onClick={onRestart}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-md flex items-center justify-center gap-2 mx-auto transition-all transform hover:scale-105"
      >
        <RotateCcw size={20} />
        תרגול נוסף
      </button>
    </div>
  );
};

export default Summary;