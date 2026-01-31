import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GRADE_SCALES, DEFAULT_SCALE, AVAILABLE_GRADES, getGradePoint, calculateCGPA, type ScaleType, type GradeType } from '../utils/cgpaConstants';
import { PREFILL_COURSES_100L, createCourseFromTemplate } from '../constants/cgpaPrefill';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { LogoIcon } from './icons/LogoIcon';

interface Course {
  localId: string;
  courseCode: string;
  creditUnits: number;
  grade: GradeType;
  gradePoint: number;
  scaleType: ScaleType;
  semester: string;
  courseLevel: string;
}

interface FormState {
  courseCode: string;
  creditUnits: number;
  grade: GradeType;
  scaleType: ScaleType;
  semester: string;
  courseLevel: string;
  gradePoint?: number;
}

type ViewMode = 'semester' | 'level' | 'cumulative';

const STORAGE_KEY = 'standalone_cgpa_courses';

const StandaloneCGPACalculator: React.FC = () => {
  // Load courses from localStorage on mount
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedLevel, setSelectedLevel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const cached = saved ? JSON.parse(saved) : [];
      if (cached && cached.length > 0) {
        const levels = [...new Set(cached.map((c: Course) => c.courseLevel))].sort();
        return levels.length > 0 ? String(levels[0]) : '100';
      }
    } catch {}
    return '100';
  });

  const [activeTab, setActiveTab] = useState<'add' | 'history'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const cached = saved ? JSON.parse(saved) : [];
      return cached && cached.length > 0 ? 'history' : 'add';
    } catch {
      return 'add';
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('semester');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Inline editing states
  const [editingCreditUnits, setEditingCreditUnits] = useState<string | null>(null);
  const [tempCreditUnits, setTempCreditUnits] = useState<number>(0);
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<GradeType>('A');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');

  const [form, setForm] = useState<FormState>({
    courseCode: '',
    creditUnits: 3,
    grade: 'A',
    scaleType: DEFAULT_SCALE,
    semester: '1',
    courseLevel: '100',
    gradePoint: 5
  });

  // Save to localStorage whenever courses change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  // Show signup prompt after user adds 3+ courses
  useEffect(() => {
    if (courses.length >= 3 && !showSignupPrompt) {
      const hasSeenPrompt = sessionStorage.getItem('cgpa_signup_prompt_shown');
      if (!hasSeenPrompt) {
        setShowSignupPrompt(true);
        sessionStorage.setItem('cgpa_signup_prompt_shown', 'true');
      }
    }
  }, [courses.length, showSignupPrompt]);

  // Update grade point when grade/scale changes
  useEffect(() => {
    const newGradePoint = getGradePoint(form.grade, form.scaleType);
    setForm(prev => ({ ...prev, gradePoint: newGradePoint }));
  }, [form.grade, form.scaleType]);

  // Computed values
  const uniqueLevels = useMemo(() => 
    [...new Set(courses.map(c => c.courseLevel))].sort(),
    [courses]
  );

  const displayedSemesters = useMemo(() => 
    [...new Set(courses.map(c => c.semester))].sort(),
    [courses]
  );

  const displayedGPA = useMemo(() => {
    let filtered = courses;
    if (viewMode === 'semester') {
      filtered = courses.filter(c => displayedSemesters.includes(c.semester));
    } else if (viewMode === 'level') {
      filtered = courses.filter(c => c.courseLevel === selectedLevel);
    }
    return calculateCGPA(filtered.map(c => ({ gradePoint: c.gradePoint, creditUnits: c.creditUnits })));
  }, [courses, viewMode, selectedLevel, displayedSemesters]);

  const getGPALabel = useMemo(() => {
    if (viewMode === 'semester') return 'Current GPA';
    if (viewMode === 'level') return `${selectedLevel}L GPA`;
    return 'Cumulative GPA';
  }, [viewMode, selectedLevel]);

  const handleFormChange = useCallback((field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Prefill logic
  const handlePrefill100L = useCallback((semester: 'semester1' | 'semester2') => {
    try {
      const prefillCourses = PREFILL_COURSES_100L[semester];
      const semesterNum = semester === 'semester1' ? '1' : '2';
      const newCourses = prefillCourses.map(template =>
        createCourseFromTemplate(template, semesterNum, 'A', '5-point')
      );
      
      setCourses(prev => [...prev, ...newCourses] as Course[]);
      setActiveTab('history');
      
      setTimeout(() => {
        const coursesSection = document.getElementById('my-courses-section');
        coursesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Prefill error:', err);
    }
  }, []);

  // Inline Editing Handlers
  const handleEditCreditUnits = useCallback((courseId: string, currentCredits: number) => {
    setEditingCreditUnits(courseId);
    setTempCreditUnits(currentCredits);
  }, []);

  const handleSaveCreditUnits = useCallback((courseId: string) => {
    setCourses(prev => prev.map(c => 
      c.localId === courseId ? { ...c, creditUnits: tempCreditUnits } : c
    ));
    setEditingCreditUnits(null);
  }, [tempCreditUnits]);

  const handleEditGrade = useCallback((courseId: string, currentGrade: GradeType) => {
    setEditingGrade(courseId);
    setTempGrade(currentGrade);
  }, []);

  const handleSaveGrade = useCallback((courseId: string, scaleType: ScaleType) => {
    const newGradePoint = getGradePoint(tempGrade, scaleType);
    setCourses(prev => prev.map(c => 
      c.localId === courseId ? { ...c, grade: tempGrade, gradePoint: newGradePoint } : c
    ));
    setEditingGrade(null);
  }, [tempGrade]);

  const handleEditTitle = useCallback((courseId: string, currentTitle: string) => {
    setEditingTitle(courseId);
    setTempTitle(currentTitle);
  }, []);

  const handleSaveTitle = useCallback((courseId: string) => {
    setCourses(prev => prev.map(c => 
      c.localId === courseId ? { ...c, courseCode: tempTitle } : c
    ));
    setEditingTitle(null);
  }, [tempTitle]);

  // CRUD Handlers
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const courseData: Course = {
        localId: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseCode: form.courseCode,
        creditUnits: form.creditUnits,
        grade: form.grade,
        gradePoint: form.gradePoint || getGradePoint(form.grade, form.scaleType),
        scaleType: form.scaleType,
        semester: form.semester,
        courseLevel: form.courseLevel,
      };

      if (editingId) {
        setCourses(prev => prev.map(c => 
          c.localId === editingId ? { ...courseData, localId: editingId } : c
        ));
        setEditingId(null);
      } else {
        setCourses(prev => [...prev, courseData]);
      }

      setForm({
        courseCode: '',
        creditUnits: 3,
        grade: 'A',
        scaleType: DEFAULT_SCALE,
        semester: '1',
        courseLevel: '100',
        gradePoint: 5
      });
    } catch (err) {
      setError('Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingId(course.localId);
    setForm({
      courseCode: course.courseCode,
      creditUnits: course.creditUnits,
      grade: course.grade,
      scaleType: course.scaleType,
      semester: course.semester,
      courseLevel: course.courseLevel,
      gradePoint: course.gradePoint,
    });
    setActiveTab('add');
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.localId !== courseId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with branding and CTA */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-gray-800">ScholarAI</span>
          </Link>
          <Link 
            to="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      <div className="pt-4 px-4 pb-24 max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Free CGPA Calculator</h1>
          <p className="text-gray-600 text-sm">Calculate your GPA instantly - no sign up required!</p>
        </div>

        {/* GPA Display Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 mb-6 shadow-lg">
          <p className="text-sm opacity-90 mb-1">{getGPALabel}</p>
          <h2 className="text-4xl font-bold">{displayedGPA.toFixed(2)}</h2>
          <p className="text-xs opacity-75 mt-2">Based on {courses.filter(c => {
            if (viewMode === 'semester') return displayedSemesters.includes(c.semester);
            if (viewMode === 'level') return c.courseLevel === selectedLevel;
            return true;
          }).length} courses</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
              activeTab === 'add' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            {editingId ? 'Edit Course' : 'Add Course'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
              activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            My Courses ({courses.length})
          </button>
        </div>

        {/* Add Course Tab */}
        {activeTab === 'add' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-3 font-semibold">Quick Start - Prefill 100L Courses:</p>
              <div className="flex gap-2 flex-wrap">
                <button 
                  type="button" 
                  onClick={() => handlePrefill100L('semester1')} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                >
                  Semester 1
                </button>
                <button 
                  type="button" 
                  onClick={() => handlePrefill100L('semester2')} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                >
                  Semester 2
                </button>
              </div>
            </div>

            <form onSubmit={handleAddCourse} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                <input 
                  type="text" 
                  placeholder="e.g., CSC101" 
                  value={form.courseCode} 
                  onChange={e => handleFormChange('courseCode', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Units *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="6" 
                    value={form.creditUnits} 
                    onChange={e => handleFormChange('creditUnits', parseInt(e.target.value))} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <select 
                    value={form.grade} 
                    onChange={e => handleFormChange('grade', e.target.value as GradeType)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    required
                  >
                    {AVAILABLE_GRADES.map(g => (<option key={g} value={g}>{g}</option>))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 1 or 2" 
                    value={form.semester} 
                    onChange={e => handleFormChange('semester', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Level *</label>
                  <select 
                    value={form.courseLevel} 
                    onChange={e => handleFormChange('courseLevel', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSaving} 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update Course' : 'Add Course'}
              </button>

              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { 
                    setEditingId(null); 
                    setForm({ courseCode: '', creditUnits: 3, grade: 'A', scaleType: DEFAULT_SCALE, semester: '1', courseLevel: '100', gradePoint: 5 }); 
                  }} 
                  className="w-full bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </>
        )}

        {/* My Courses Tab */}
        {activeTab === 'history' && (
          <div id="my-courses-section" className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setViewMode('semester')} 
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${viewMode === 'semester' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  By Semester
                </button>
                <button 
                  onClick={() => setViewMode('level')} 
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${viewMode === 'level' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  By Level
                </button>
                <button 
                  onClick={() => setViewMode('cumulative')} 
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${viewMode === 'cumulative' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cumulative
                </button>
              </div>
              {viewMode === 'level' && uniqueLevels.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {uniqueLevels.map(level => (
                    <button 
                      key={level} 
                      onClick={() => setSelectedLevel(level)} 
                      className={`py-2 px-4 rounded text-sm font-medium transition-colors ${selectedLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {level}L
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Empty State */}
            {courses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p className="mb-4">No courses added yet. Add your first course to calculate your GPA!</p>
                <button 
                  onClick={() => setActiveTab('add')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Add your first course →
                </button>
              </div>
            ) : viewMode === 'semester' ? (
              // Semester View
              <div className="space-y-6">
                {displayedSemesters.map((sem, semIdx) => {
                  const semesterCourses = courses.filter(c => c.semester === sem);
                  const semGPA = calculateCGPA(semesterCourses.map(c => ({ gradePoint: c.gradePoint, creditUnits: c.creditUnits })));
                  return (
                    <div key={sem}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Semester {sem}</h3>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">GPA: {semGPA.toFixed(2)}</span>
                      </div>
                      <div className="space-y-3 mb-6">
                        {semesterCourses.map(course => (
                          <div key={course.localId} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                {editingTitle === course.localId ? (
                                  <div className="flex items-center gap-1 mb-2">
                                    <input 
                                      type="text" 
                                      value={tempTitle} 
                                      onChange={(e) => setTempTitle(e.target.value)} 
                                      className="text-sm border border-blue-300 rounded px-2 py-1 flex-1" 
                                    />
                                    <button onClick={() => handleSaveTitle(course.localId)} className="px-2 py-1 text-xs bg-green-500 text-white rounded">✓</button>
                                    <button onClick={() => setEditingTitle(null)} className="px-2 py-1 text-xs bg-gray-400 text-white rounded">✕</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                                    <button onClick={() => handleEditTitle(course.localId, course.courseCode)} className="text-blue-600 p-1">
                                      <EditIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-gray-500">{course.courseLevel}L •</p>
                                  {editingCreditUnits === course.localId ? (
                                    <div className="flex items-center gap-1">
                                      <select 
                                        value={tempCreditUnits} 
                                        onChange={(e) => setTempCreditUnits(parseInt(e.target.value))} 
                                        className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                      >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                      </select>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500">{course.creditUnits} units</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {editingGrade === course.localId ? (
                                  <div className="flex items-center gap-1 mb-2">
                                    <select 
                                      value={tempGrade} 
                                      onChange={(e) => setTempGrade(e.target.value as GradeType)} 
                                      className="text-sm border border-blue-300 rounded px-2 py-1"
                                    >
                                      {AVAILABLE_GRADES.map(g => (<option key={g} value={g}>{g}</option>))}
                                    </select>
                                    <button onClick={() => handleSaveGrade(course.localId, course.scaleType)} className="px-2 py-1 text-xs bg-green-500 text-white rounded">✓</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-lg font-bold text-blue-600">{course.grade}</p>
                                    <button onClick={() => handleEditGrade(course.localId, course.grade)} className="text-blue-600 p-1">
                                      <EditIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500">{course.gradePoint} pts</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              {editingCreditUnits === course.localId ? (
                                <>
                                  <button onClick={() => handleSaveCreditUnits(course.localId)} className="px-3 py-1 text-xs bg-green-500 text-white rounded">✓ Save</button>
                                  <button onClick={() => setEditingCreditUnits(null)} className="px-3 py-1 text-xs bg-gray-400 text-white rounded">✕ Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEditCreditUnits(course.localId, course.creditUnits)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded">Edit Units</button>
                                  <button onClick={() => handleDeleteCourse(course.localId)} className="p-2 text-red-600 hover:bg-red-100 rounded">
                                    <DeleteIcon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {semIdx < displayedSemesters.length - 1 && <div className="flex items-center gap-3 my-8"><div className="flex-1 h-0.5 bg-gray-300"></div></div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Level/Cumulative View
              <div className="space-y-3">
                {(viewMode === 'level' ? courses.filter(c => c.courseLevel === selectedLevel) : courses).map(course => (
                  <div key={course.localId} className={`bg-white rounded-lg shadow p-4 border-l-4 ${viewMode === 'level' ? 'border-green-500' : 'border-purple-500'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                        <p className="text-xs text-gray-500">Sem {course.semester} • {course.creditUnits} units • {course.courseLevel}L</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{course.grade}</p>
                        <p className="text-xs text-gray-500">{course.gradePoint} pts</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEditCourse(course)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded">Edit</button>
                      <button onClick={() => handleDeleteCourse(course.localId)} className="p-2 text-red-600 hover:bg-red-100 rounded">
                        <DeleteIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky CTA Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Want more features?</p>
            <p className="text-xs opacity-90">Sync across devices, track scholarships & more!</p>
          </div>
          <Link 
            to="/login" 
            className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Sign Up Free
          </Link>
        </div>
      </div>

      {/* Signup Prompt Modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">

              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">You're doing great!</h3>
              <p className="text-gray-600 text-sm">
                Create a free account to sync your courses across devices, discover scholarships that match your profile, and access more tools!
              </p>
            </div>
            <div className="space-y-3">
              <Link 
                to="/login" 
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
              >
                Create Free Account
              </Link>
              <button 
                onClick={() => setShowSignupPrompt(false)}
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              Your data will be saved locally. Sign up anytime to sync.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandaloneCGPACalculator;
