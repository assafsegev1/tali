
import React, { useState } from 'react';
import { Search, BookOpen, ArrowRight, Sparkles, Loader2, GraduationCap } from 'lucide-react';
import { getTopicSummary } from '../services/geminiService';

interface Props {
  concepts: string[];
  onBack: () => void;
}

const ConceptExplorer: React.FC<Props> = ({ concepts, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredConcepts = concepts.filter(c => 
    c.includes(searchQuery) || c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConceptClick = async (concept: string) => {
    setSelectedConcept(concept);
    setLoading(true);
    setDefinition('');
    
    try {
      const summary = await getTopicSummary(concept);
      setDefinition(summary);
    } catch (error) {
      setDefinition("אירעה שגיאה בטעינת ההסבר. אנא נסו שוב.");
    } finally {
      setLoading(false);
    }
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line.startsWith('**') || line.startsWith('#') ? 
                <strong className="block mt-3 mb-1 text-emerald-800">{line.replace(/[#*]/g, '')}</strong> : 
                <span className="block mb-1 text-slate-700">{line.replace(/\*\*/g, '')}</span>
            }
        </React.Fragment>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-10">
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
          <BookOpen className="text-emerald-600" />
          מילון מושגים חכם
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 h-[600px]">
        {/* List Column */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="חיפוש מושג..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 no-scrollbar space-y-1">
            {filteredConcepts.length > 0 ? (
              filteredConcepts.map((concept, idx) => (
                <button
                  key={idx}
                  onClick={() => handleConceptClick(concept)}
                  className={`w-full text-right px-4 py-3 rounded-lg transition-all flex items-center justify-between group
                    ${selectedConcept === concept 
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-sm border border-emerald-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span>{concept}</span>
                  {selectedConcept === concept && <Sparkles size={16} className="text-emerald-500" />}
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                לא נמצאו מושגים התואמים את החיפוש
              </div>
            )}
          </div>
        </div>

        {/* Definition Column */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 flex flex-col overflow-hidden relative">
           {!selectedConcept ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
               <div className="bg-emerald-50 p-6 rounded-full mb-4">
                 <GraduationCap size={48} className="text-emerald-200" />
               </div>
               <p className="text-lg font-medium text-gray-500">בחרו מושג מהרשימה</p>
               <p className="text-sm mt-2 max-w-xs">המורה הדיגיטלי יסביר לכם את המושג, ייתן דוגמאות ויקשר אותו לחומר הלימוד.</p>
             </div>
           ) : (
             <div className="flex flex-col h-full">
               <div className="bg-emerald-600 p-6 text-white">
                 <h3 className="text-2xl font-bold">{selectedConcept}</h3>
               </div>
               
               <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative">
                 {loading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                     <Loader2 className="animate-spin text-emerald-600 mb-3" size={40} />
                     <span className="text-emerald-800 font-medium animate-pulse">מייצר הסבר...</span>
                   </div>
                 ) : (
                   <div className="text-lg leading-relaxed space-y-4">
                     {renderText(definition)}
                   </div>
                 )}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ConceptExplorer;
