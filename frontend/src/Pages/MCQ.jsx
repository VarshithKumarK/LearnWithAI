import React, { useState } from 'react';
import api from '../api';
import { HelpCircle, Loader2, Award, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const MCQ = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({}); // user answers { "1": "A" }
  const [correctAnswers, setCorrectAnswers] = useState({}); // secure answers { "1": "A" }
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const generateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setScore(null);
    setAnswers({});
    setCorrectAnswers({});
    setSubmitted(false);
    setQuizId(null);
    try {
      const res = await api.post(`/quiz/generate`, { topic });
      setQuestions(res.data.questions || []);
      setQuizId(res.data.quiz_id);
    } catch (error) {
      console.error('Failed to generate MCQ');
    }
    setLoading(false);
  };

  const handleSelect = (qId, opt) => {
    if(!submitted) {
      setAnswers({ ...answers, [qId]: opt });
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      // Securely fetch correct answers from the backend after submitting
      const res = await api.post('/quiz/reveal-all', { quiz_id: quizId });
      const serverAnswers = res.data.answers;
      setCorrectAnswers(serverAnswers);
      
      let s = 0;
      questions.forEach((q) => {
        // q.id is 1-indexed (e.g., 1, 2, 3...)
        // serverAnswers tracks answers by stringified IDs
        if (answers[q.id] === serverAnswers[String(q.id)]) {
          s += 1;
        }
      });
      setScore((s / questions.length) * 100);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit and grade quiz", error);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-200">
        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dynamic AI Quizzes</h1>
          <p className="text-slate-500 text-sm mt-1">Test your mastery with generative multi-choice questions</p>
        </div>
      </div>
      
      <form onSubmit={generateQuiz} className="mb-10 p-6 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <input 
            type="text" 
            placeholder="What topic do you want to test? (e.g. Hooks in React)" 
            className="w-full border border-slate-300 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            value={topic} onChange={(e) => setTopic(e.target.value)} required
          />
        </div>
        <button 
          disabled={loading || !topic} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm hover:shadow-md disabled:bg-emerald-400 disabled:shadow-none flex items-center justify-center min-w-[160px]"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Quiz'}
        </button>
      </form>

      {questions.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-10 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 z-0 opacity-50"></div>
          
          <div className="relative z-10 space-y-10">
            {questions.map((q, idx) => (
              <div key={idx} className="pb-8 border-b border-slate-100 last:border-b-0 last:pb-0">
                <h3 className="font-bold text-xl text-slate-800 mb-5 flex items-start">
                  <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 shrink-0 mt-0.5">{idx + 1}</span>
                  {q.question}
                </h3>
                
                <div className="space-y-3 pl-11">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === opt;
                    const isCorrect = submitted && opt === correctAnswers[String(q.id)];
                    const isWrongSelection = submitted && isSelected && opt !== correctAnswers[String(q.id)];
                    
                    let bgClass = "bg-white border-slate-200 hover:bg-slate-50";
                    let ringClass = isSelected ? "border-emerald-500 ring-1 ring-emerald-500" : "";
                    
                    if (submitted) {
                      if (isCorrect) bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
                      else if (isWrongSelection) bgClass = "bg-red-50 border-red-200 text-red-800";
                      else bgClass = "bg-white border-slate-200 opacity-50";
                      ringClass = ""; // Remove ring after submit
                    }

                    return (
                      <label 
                        key={oIdx} 
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${bgClass} ${ringClass} ${submitted ? 'cursor-default' : 'hover:border-emerald-300'}`}
                      >
                        <div className="relative flex items-center justify-center w-5 h-5 mr-4 shrink-0">
                          <input 
                            type="radio" 
                            name={`q-${q.id}`} 
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleSelect(q.id, opt)}
                            disabled={submitted}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 absolute opacity-0 cursor-pointer"
                          />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-500' : 'border-slate-300'}`}>
                            {isSelected && !submitted && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                            {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute -inset-px" />}
                            {submitted && isWrongSelection && <XCircle className="w-5 h-5 text-red-500 absolute -inset-px" />}
                          </div>
                        </div>
                        <span className="text-slate-700 font-medium">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {!submitted ? (
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={submitQuiz} 
                  disabled={Object.keys(answers).length < questions.length || submitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:shadow-none flex items-center"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto mr-2" /> : null}
                  Submit Quiz <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="mt-8">
                <div className={`p-8 rounded-3xl flex flex-col items-center justify-center text-center ${score >= 70 ? 'bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200' : score >= 40 ? 'bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200' : 'bg-gradient-to-br from-red-50 to-rose-100 border border-red-200'}`}>
                  <Award className={`h-16 w-16 mb-4 ${score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-red-500'}`} />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Quiz Completed!</h3>
                  <div className={`text-5xl font-black mb-4 ${score >= 70 ? 'text-emerald-700' : score >= 40 ? 'text-amber-700' : 'text-red-700'}`}>
                    {score.toFixed(0)}%
                  </div>
                  <p className="text-slate-600 font-medium">
                    {score >= 70 ? 'Excellent work! You have a solid grasp of this topic.' : score >= 40 ? 'Good effort! Review the incorrect answers to improve.' : 'Keep studying! This is a great opportunity to learn more.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQ;
