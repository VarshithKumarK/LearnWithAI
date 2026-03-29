import React, { useState, useEffect } from 'react';
import api from '../api';
import { useSnackbar } from 'notistack';
import { HelpCircle, Loader2, Award, ChevronRight, CheckCircle2, XCircle, Trash2, History, Save, Hash } from 'lucide-react';

const MCQ = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [activeTab, setActiveTab] = useState('take');
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedQuizzes();
    }
  }, [activeTab]);

  const fetchSavedQuizzes = async () => {
    try {
      const res = await api.get('/quiz/saved');
      setSavedQuizzes(res.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch saved quizzes', { variant: 'error' });
    }
  };

  const generateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setScore(null);
    setAnswers({});
    setCorrectAnswers({});
    setSubmitted(false);
    setQuizId(null);
    try {
      const res = await api.post(`/quiz/generate`, { topic, num_questions: numQuestions });
      setQuestions(res.data.questions || []);
      setQuizId(res.data.quiz_id);
      enqueueSnackbar(`Quiz generated with ${numQuestions} questions!`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to generate quiz', { variant: 'error' });
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
      const res = await api.post('/quiz/reveal-all', { quiz_id: quizId });
      const serverAnswers = res.data.answers;
      setCorrectAnswers(serverAnswers);
      
      let s = 0;
      questions.forEach((q) => {
        if (answers[q.id] === serverAnswers[String(q.id)]) {
          s += 1;
        }
      });
      setScore((s / questions.length) * 100);
      setSubmitted(true);
    } catch (error) {
      enqueueSnackbar('Failed to submit quiz', { variant: 'error' });
    }
    setSubmitting(false);
  };

  const saveQuizResult = async () => {
    setSavingQuiz(true);
    try {
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        options: q.options,
        userAnswer: answers[q.id] || '',
        correctAnswer: correctAnswers[String(q.id)] || ''
      }));

      await api.post('/quiz/save', {
        topic,
        score,
        totalQuestions: questions.length,
        questions: formattedQuestions
      });
      enqueueSnackbar('Quiz result saved!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to save quiz result', { variant: 'error' });
    }
    setSavingQuiz(false);
  };

  const deleteSavedQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz result?')) return;
    try {
      await api.delete(`/quiz/${id}`);
      enqueueSnackbar('Quiz deleted', { variant: 'info' });
      fetchSavedQuizzes();
    } catch (error) {
      enqueueSnackbar('Failed to delete quiz', { variant: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dynamic AI Quizzes</h1>
            <p className="text-slate-500 text-sm mt-1">Test your mastery with generative multi-choice questions</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('take')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'take' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            Take Quiz
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'saved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            Saved Results
          </button>
        </div>
      </div>
      
      {activeTab === 'take' && (
        <>
          <form onSubmit={generateQuiz} className="mb-10 p-6 bg-white rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 z-0 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Topic</label>
                  <input 
                    type="text" 
                    placeholder="What topic do you want to test? (e.g. Hooks in React)" 
                    className="w-full border border-slate-300 bg-slate-50 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-lg"
                    value={topic} onChange={(e) => setTopic(e.target.value)} required
                  />
                </div>
                <div className="sm:w-40">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                    <Hash className="h-4 w-4 mr-1 text-slate-400" /> Questions
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max="50" 
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className="w-full border border-slate-300 bg-slate-50 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-lg text-center"
                  />
                </div>
              </div>
              
              <button 
                disabled={loading || !topic} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-sm hover:shadow-md disabled:bg-emerald-400 disabled:shadow-none flex items-center justify-center min-w-[160px] w-full sm:w-auto sm:self-end"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Create ${numQuestions} Question Quiz`}
              </button>
            </div>
          </form>

          {questions.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-10">
              
              <div className="space-y-10">
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
                          ringClass = "";
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
                      <p className="text-slate-600 font-medium mb-6">
                        {score >= 70 ? 'Excellent work! You have a solid grasp of this topic.' : score >= 40 ? 'Good effort! Review the incorrect answers to improve.' : 'Keep studying! This is a great opportunity to learn more.'}
                      </p>
                      <button 
                        onClick={saveQuizResult}
                        disabled={savingQuiz}
                        className="bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center disabled:opacity-50"
                      >
                        {savingQuiz ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                        Save Result
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedQuizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 z-0"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner ${quiz.score >= 70 ? 'bg-emerald-100 text-emerald-700' : quiz.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {Math.round(quiz.score)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg capitalize line-clamp-1">{quiz.topic}</h3>
                    <p className="text-sm font-medium text-slate-500 whitespace-nowrap">{quiz.totalQuestions} Questions</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteSavedQuiz(quiz._id)}
                  className="h-8 w-8 flex items-center justify-center bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                  title="Delete Result"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="relative z-10 mt-auto bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
                  <span>Performance</span>
                  <span className={quiz.score >= 70 ? 'text-emerald-600' : quiz.score >= 40 ? 'text-amber-600' : 'text-red-600'}>
                    {quiz.score >= 70 ? 'Excellent' : quiz.score >= 40 ? 'Fair' : 'Needs Review'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${quiz.score >= 70 ? 'bg-emerald-500' : quiz.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                    style={{ width: `${quiz.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {savedQuizzes.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No saved quizzes</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">Take a quiz and save your result to track your mastery over time.</p>
              <button 
                onClick={() => setActiveTab('take')} 
                className="mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                Start a Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MCQ;
