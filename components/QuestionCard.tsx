
import React, { useState, useEffect } from 'react';
import { Question, QuestionType, MultipleChoiceQuestion, OpenEndedQuestion } from '../types';
import { evaluateAnswer, generateConceptImage, getTopicSummary } from '../services/geminiService';
import { CheckCircle, XCircle, Loader2, Send, BookOpen, Lightbulb, Activity, Leaf, Zap, HeartPulse, FlaskConical, Image as ImageIcon, GraduationCap } from 'lucide-react';

interface Props {
  question: Question;
  questionNumber: number;
  onNext: (isCorrect: boolean) => void;
  isLast: boolean;
}

const QuestionCard: React.FC<Props> = ({ question, questionNumber, onNext, isLast }) => {
  // State for MCQ
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  // State for Open Ended
  const [userAnswer, setUserAnswer] = useState('');
  const [aiFeedback, setAiFeedback] = useState<{ score: number; feedback: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleMcqSelect = (index: number) => {
    if (mcqSubmitted) return;
    setSelectedOption(index);
  };

  const handleMcqSubmit = () => {
    if (selectedOption === null) return;
    setMcqSubmitted(true);
  };

  const handleOpenSubmit = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    const q = question as OpenEndedQuestion;
    const result = await evaluateAnswer(q.questionText, q.officialAnswer, userAnswer);
    setAiFeedback(result);
    setIsEvaluating(false);
  };

  const handleNextClick = () => {
    let isCorrect = false;
    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      isCorrect = selectedOption === (question as MultipleChoiceQuestion).correctOptionIndex;
    } else {
      // For open-ended, we consider a score of 65 or higher as "passing"/correct for topic tracking
      isCorrect = (aiFeedback?.score || 0) >= 65;
    }
    onNext(isCorrect);
  };

  // Helper to render text with highlighted terms (wrapped in *)
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    // Split by *term* markers
    const parts = text.split(/(\*[^*]+\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // Extract the text without asterisks
        const content = part.slice(1, -1);
        return (
          <span 
            key={index} 
            className="inline-block font-bold text-emerald-900 bg-emerald-200 px-1.5 py-0.5 rounded mx-0.5 shadow-sm border border-emerald-300 transform hover:scale-105 transition-transform cursor-default"
          >
            {content}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Helper to select an icon based on topic (Fallback)
  const getTopicIcon = (topic: string) => {
    if (topic.includes('אקולוגיה')) return <Leaf className="text-green-500" size={48} />;
    if (topic.includes('נשימה') || topic.includes('הובלה') || topic.includes('לב')) return <HeartPulse className="text-red-500" size={48} />;
    if (topic.includes('אנזימים') || topic.includes('תא')) return <FlaskConical className="text-purple-500" size={48} />;
    if (topic.includes('אנרגיה')) return <Zap className="text-yellow-500" size={48} />;
    return <Activity className="text-blue-500" size={48} />;
  };

  // Component for the feedback/summary section
  const ConceptReviewSection = () => {
    const explanation = question.type === QuestionType.MULTIPLE_CHOICE 
      ? (question as MultipleChoiceQuestion).explanation 
      : (question as OpenEndedQuestion).officialAnswer;

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(true);

    // State for concept interaction
    const [activeConcept, setActiveConcept] = useState<string | null>(null);
    const [conceptSummary, setConceptSummary] = useState<string>('');
    const [loadingConcept, setLoadingConcept] = useState(false);

    useEffect(() => {
      let isMounted = true;
      const fetchImage = async () => {
        setLoadingImage(true);
        const url = await generateConceptImage(question.topic, question.relatedConcepts);
        if (isMounted) {
          setImageUrl(url);
          setLoadingImage(false);
        }
      };
      fetchImage();
      return () => { isMounted = false; };
    }, []);

    const handleConceptClick = async (concept: string) => {
      if (activeConcept === concept) {
        setActiveConcept(null); // Toggle off
        return;
      }

      setActiveConcept(concept);
      setLoadingConcept(true);
      setConceptSummary('');

      try {
        const summary = await getTopicSummary(concept);
        setConceptSummary(summary);
      } catch (error) {
        setConceptSummary("לא ניתן היה לטעון את הסיכום כרגע.");
      } finally {
        setLoadingConcept(false);
      }
    };

    return (
      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden animate-fade-in">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center gap-2">
          <Lightbulb className="text-yellow-600" size={20} />
          <h3 className="font-bold text-slate-800">הסבר והרחבה</h3>
        </div>
        
        <div className="p-6 grid md:grid-cols-3 gap-6">
           {/* Text Explanation */}
           <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-500 mb-2">התשובה המלאה והסבר:</h4>
                <div className="text-slate-800 leading-loose text-lg">
                  {renderFormattedText(explanation)}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-1">
                  <BookOpen size={14}/>
                  לחצו על מושג להרחבה:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {question.relatedConcepts.map((concept, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleConceptClick(concept)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all duration-200 flex items-center gap-1
                        ${activeConcept === concept 
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 ring-offset-1' 
                          : 'bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                    >
                      {concept}
                      {activeConcept === concept && <GraduationCap size={12} />}
                    </button>
                  ))}
                </div>

                {/* Active Concept Summary Panel */}
                {activeConcept && (
                  <div className="mt-4 bg-white border border-emerald-200 rounded-xl p-4 shadow-sm animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
                    <h5 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                      <GraduationCap size={16} />
                      מהו {activeConcept}?
                    </h5>
                    {loadingConcept ? (
                      <div className="flex items-center gap-2 text-emerald-600 py-2">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-sm">המורה הדיגיטלי מסכם את הנושא...</span>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {conceptSummary}
                      </p>
                    )}
                  </div>
                )}
              </div>
           </div>

           {/* Visual Illustration */}
           <div className="flex flex-col items-center justify-center bg-white rounded-xl p-2 border border-slate-100 shadow-sm h-full min-h-[200px] relative overflow-hidden group">
              {loadingImage ? (
                 <div className="flex flex-col items-center gap-3 text-gray-400 animate-pulse">
                    <ImageIcon size={40} />
                    <span className="text-xs">מייצר איור להמחשה...</span>
                 </div>
              ) : imageUrl ? (
                <div className="w-full h-full flex flex-col items-center">
                  <img 
                    src={imageUrl} 
                    alt={question.topic} 
                    className="w-full h-48 object-cover rounded-lg shadow-sm transition-transform duration-500 group-hover:scale-105" 
                  />
                  <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                     <Zap size={10} /> איור נוצר ע"י AI
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-3 p-5 bg-slate-50 rounded-full border border-slate-100">
                    {getTopicIcon(question.topic)}
                  </div>
                  <span className="text-sm text-slate-500 font-medium text-center px-2">
                    {question.topic}
                  </span>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-3xl mx-auto border border-gray-100 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
          שאלה {questionNumber}
        </span>
        <span className="text-xs text-gray-400 font-medium">{question.topic} | {question.year}</span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
        {question.questionText}
      </h2>

      {/* Multiple Choice Logic */}
      {question.type === QuestionType.MULTIPLE_CHOICE && (
        <div className="space-y-3">
          {(question as MultipleChoiceQuestion).options.map((option, idx) => {
            let optionClass = "w-full p-4 text-right rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-lg ";
            
            if (mcqSubmitted) {
              if (idx === (question as MultipleChoiceQuestion).correctOptionIndex) {
                optionClass += "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-inner";
              } else if (idx === selectedOption) {
                optionClass += "border-red-500 bg-red-50 text-red-900";
              } else {
                optionClass += "border-gray-100 text-gray-400 opacity-60";
              }
            } else {
              if (selectedOption === idx) {
                optionClass += "border-emerald-500 bg-emerald-50 shadow-sm text-emerald-900";
              } else {
                optionClass += "border-gray-100 hover:border-emerald-200 hover:bg-gray-50 text-gray-700";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleMcqSelect(idx)}
                className={optionClass}
                disabled={mcqSubmitted}
              >
                <span className="font-medium">{option}</span>
                {mcqSubmitted && idx === (question as MultipleChoiceQuestion).correctOptionIndex && (
                  <CheckCircle className="text-emerald-500 flex-shrink-0 mr-2" size={24} />
                )}
                {mcqSubmitted && idx === selectedOption && idx !== (question as MultipleChoiceQuestion).correctOptionIndex && (
                  <XCircle className="text-red-500 flex-shrink-0 mr-2" size={24} />
                )}
              </button>
            );
          })}

          {!mcqSubmitted && (
            <button
              onClick={handleMcqSubmit}
              disabled={selectedOption === null}
              className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md text-lg"
            >
              בדיקה
            </button>
          )}
        </div>
      )}

      {/* Open Ended Logic */}
      {question.type === QuestionType.OPEN_ENDED && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="כתבו את תשובתכם כאן..."
              className="w-full p-5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none min-h-[180px] resize-y bg-gray-50 focus:bg-white transition-all text-lg text-gray-800"
              disabled={!!aiFeedback}
            />
          </div>

          {!aiFeedback ? (
            <button
              onClick={handleOpenSubmit}
              disabled={isEvaluating || !userAnswer.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-lg"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="animate-spin" />
                  בודק עם המורה הדיגיטלי...
                </>
              ) : (
                <>
                  <Send size={20} />
                  בדיקת תשובה עם AI
                </>
              )}
            </button>
          ) : (
            <div className="mt-6 bg-indigo-50 border border-indigo-100 p-6 rounded-xl animate-fade-in shadow-sm">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                   <Activity size={18}/>
                   משוב אישי מה-AI
                 </h3>
                 <div className={`px-4 py-1 rounded-full text-sm font-bold shadow-sm ${
                    aiFeedback.score > 80 ? 'bg-green-100 text-green-700 border border-green-200' : 
                    aiFeedback.score > 50 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'
                 }`}>
                    ציון: {aiFeedback.score}
                 </div>
              </div>
              <p className="text-indigo-900 text-base leading-relaxed">{aiFeedback.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Expanded Concept Review Section (Shown after any submission) */}
      {(mcqSubmitted || aiFeedback) && (
        <>
          <ConceptReviewSection />
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNextClick}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              {isLast ? 'סיום תרגול' : 'לשאלה הבאה'}
              <span className="text-xl">←</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionCard;
