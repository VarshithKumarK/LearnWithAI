import React, { useState, useEffect } from 'react';
import { Search, Book, ExternalLink, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api'; // Use existing configured api/axios instance

const Recommender = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/recommender/courses');
      if (response.data && response.data.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      enqueueSnackbar('Failed to load courses. Please make sure the AI service is running and models are generated.', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(course => 
        course.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10);
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [searchTerm, courses]);

  const handleSearch = async (courseName) => {
    setIsLoading(true);
    setSearchTerm(courseName);
    setSelectedCourse(courseName);
    setShowDropdown(false);
    
    try {
      const response = await api.post('/recommender/recommend', { course_name: courseName });
      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      enqueueSnackbar(error.response?.data?.detail || 'Failed to get recommendations', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-12 md:px-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white text-opacity-10">
            <Sparkles className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white mb-4 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-300" />
              Course Recommendations
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl">
              Discover your next learning adventure. Search for a course you liked, and our AI will recommend similar content to help you grow.
            </p>
          </div>
        </div>

        <div className="p-6 md:p-10 max-w-4xl mx-auto">
          <div className="relative mb-10 w-full animate-fade-in-up">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 border-2 border-indigo-100 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg shadow-sm"
                placeholder="Search for a course you have completed or liked..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
              />
            </div>

            {showDropdown && filteredCourses.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-auto">
                <ul className="py-2">
                  {filteredCourses.map((course, idx) => (
                    <li 
                      key={idx}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-700 flex items-center group transition-colors"
                      onClick={() => handleSearch(course)}
                    >
                      <Book className="w-4 h-4 mr-3 text-slate-400 group-hover:text-indigo-500" />
                      <span className="font-medium">{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {showDropdown && searchTerm && filteredCourses.length === 0 && courses.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-4 text-center text-slate-500">
                No matching courses found. Try another search.
              </div>
            )}
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Analyzing course similarities...</p>
              </div>
            ) : selectedCourse ? (
              <>
                <div className="flex items-center text-slate-600 font-medium mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <span className="text-sm uppercase tracking-wider font-semibold text-slate-500 mr-2">Results for:</span> 
                  <span className="text-indigo-700 text-lg flex items-center gap-2">
                    {selectedCourse}
                  </span>
                </div>
                
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((rec, index) => (
                      <div 
                        key={index} 
                        className="bg-white border text-left border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full"
                      >
                        <div className="p-6 flex-grow flex flex-col">
                          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Book className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight line-clamp-3">
                            {rec.name}
                          </h3>
                        </div>
                        <div className="bg-slate-50 p-4 border-t border-slate-100 mt-auto">
                          <a 
                            href={rec.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors w-full justify-between"
                          >
                            View on Coursera
                            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                    <p className="text-slate-500 font-medium">No recommendations found for this course.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 px-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center max-w-2xl mx-auto">
                <Search className="w-16 h-16 text-slate-300 mb-6" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Discover?</h3>
                <p className="text-slate-500 max-w-md">Search for a course you've enjoyed or want to learn, and we'll recommend the best similar courses.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommender;
