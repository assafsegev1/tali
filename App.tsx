
import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import QuestionCard from './components/QuestionCard';
import Summary from './components/Summary';
import ConceptExplorer from './components/ConceptExplorer';
import AskTeacher from './components/AskTeacher';
import { questions } from './data/questions';
import { Brain, ArrowRight, Filter, Check, BookOpen, MessageCircleQuestion } from 'lucide-react';
import { Question } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'quiz' | 'concepts' | 'ask'>('home');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [results, setResults] = useState<{topic: string, isCorrect: boolean}[]>([]);
  
  // Extract unique categories (e.g., "גוף האדם", "התא") from topics
  const categories = useMemo(() => {
    const cats = new Set(questions.map(q => q.topic.split(' - ')[0]));
    return Array.from(cats);
  }, []);

  // Extract all unique related concepts for the glossary
  const allConcepts = useMemo(() => {
    const concepts = new Set<string>();
    questions.forEach(q => {
      q.relatedConcepts.forEach(c => concepts.add(c.replace(/\*/g, ''))); // Clean asterisks if any
    });
    return Array.from(concepts).sort();
  }, []);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStart = () => {
    const filtered = questions.filter(q => {
      const cat = q.topic.split(' - ')[0];
      return selectedCategories.includes(cat);
    });

    if (filtered.length === 0) {
      alert("יש לבחור לפחות נושא אחד לתרגול");
      return;
    }

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setActiveQuestions(shuffled);
    setView('quiz');
  };

  const handleNext = (isCorrect: boolean) => {
    const currentTopic = activeQuestions[currentQuestionIdx].topic;
    const newResults = [...results, { topic: currentTopic, isCorrect }];
    setResults(newResults);

    if (currentQuestionIdx < activeQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Finished quiz
      // We just keep view as 'quiz' but render summary based on index check or separate state? 
      // Let's use a 'finished' flag in the render logic or separate view state
    }
  };

  const isQuizFinished = view === 'quiz' && results.length === activeQuestions.length && activeQuestions.length > 0;

  const handleRestart = () => {
    setView('home');
    setCurrentQuestionIdx(0);
    setResults([]);
    setSelectedCategories(categories);
  };

  const weakTopics = Array.from(new Set(
      results.filter(r => !r.isCorrect).map(r => r.topic)
  ));

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <Navbar />

      <main className="container mx-auto px-4 pt-8 md:pt-12">
        {view === 'home' && (
          <div className="max-w-4xl mx-auto text-center space-y-8 mt-6 animate-fade-in">
            <div className="relative inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full blur opacity-30"></div>
                <div className="relative bg-white p-6 rounded-full shadow-sm">
                     <Brain size={64} className="text-emerald-600" />
                </div>
            </div>
            
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                מוכנים לבגרות בביולוגיה?
                </h1>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                תרגול שאלות משאלוני בגרות רשמיים (2020-2025) עם משוב חכם מבוסס AI.
                </p>
            </div>

            {/* Main Actions - 3 Columns now */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-10">
                <button
                  onClick={handleStart}
                  disabled={selectedCategories.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-lg font-bold py-6 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-40"
                >
                  <div className="bg-white/20 p-3 rounded-full">
                    <ArrowRight size={28} />
                  </div>
                  <span>התחלת תרגול</span>
                </button>

                <button
                  onClick={() => setView('concepts')}
                  className="bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-100 text-lg font-bold py-6 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-40"
                >
                   <div className="bg-emerald-100 p-3 rounded-full">
                    <BookOpen size={28} className="text-emerald-600"/>
                  </div>
                  <span>מילון מושגים</span>
                </button>

                <button
                  onClick={() => setView('ask')}
                  className="bg-white hover:bg-indigo-50 text-indigo-800 border-2 border-indigo-100 text-lg font-bold py-6 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-40"
                >
                   <div className="bg-indigo-100 p-3 rounded-full">
                    <MessageCircleQuestion size={28} className="text-indigo-600"/>
                  </div>
                  <span>שאל את המורה</span>
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-xl mx-auto text-right mt-12">
              <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold border-b border-gray-100 pb-2">
                <Filter size={20} />
                <h3>סינון נושאי תרגול:</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                        ${isSelected 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {isSelected && <Check size={12} />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-8">
                מבוסס על שאלוני משרד החינוך • פיתוח למטרות לימוד
            </p>
          </div>
        )}

        {view === 'concepts' && (
          <ConceptExplorer concepts={allConcepts} onBack={() => setView('home')} />
        )}

        {view === 'ask' && (
          <AskTeacher onBack={() => setView('home')} />
        )}

        {view === 'quiz' && !isQuizFinished && (
          <div className="animate-fade-in-up">
            <div className="max-w-3xl mx-auto mb-4 flex justify-start">
               <button 
                 onClick={handleRestart}
                 className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-medium text-sm"
               >
                 <ArrowRight size={18} />
                 יציאה לדף הבית
               </button>
            </div>

            <div className="mb-6 max-w-3xl mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${((currentQuestionIdx + 1) / activeQuestions.length) * 100}%` }}
                    ></div>
                </div>
                <div className="text-left text-xs text-gray-500 mt-1 pl-1">
                    {currentQuestionIdx + 1} מתוך {activeQuestions.length}
                </div>
            </div>

            <QuestionCard
              key={currentQuestionIdx}
              question={activeQuestions[currentQuestionIdx]}
              questionNumber={currentQuestionIdx + 1}
              onNext={handleNext}
              isLast={currentQuestionIdx === activeQuestions.length - 1}
            />
          </div>
        )}

        {isQuizFinished && (
          <Summary weakTopics={weakTopics} onRestart={handleRestart} />
        )}
      </main>
    </div>
  );
};

export default App;
