import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { account, databases, DATABASE_ID, USERCOURSES_COLLECTION_ID, USERS_COLLECTION_ID } from '../appwriteConfig';
import { GRADE_SCALES, DEFAULT_SCALE, AVAILABLE_GRADES, getGradePoint, calculateCGPA, type ScaleType, type GradeType } from '../utils/cgpaConstants';
import { PREFILL_COURSES_100L, createCourseFromTemplate } from '../constants/cgpaPrefill';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import useOfflineSync from '../hooks/useOfflineSync';

interface Course {
  $id?: string;
  localId?: string;
  courseCode: string;
  creditUnits: number;
  grade: GradeType;
  gradePoint: number;
  scaleType: ScaleType;
  semester: string;
  courseLevel: string;
  pendingAction?: 'create' | 'update' | 'delete';
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

const CGPACalculator: React.FC = () => {
  const mountedRef = useRef(true);
  
  // 1. Hook setup
  const {
    isOnline,
    pendingChanges,
    getLocalCourses,
    saveLocalCourses,
    addCourse: addCourseOffline,
    updateCourse: updateCourseOffline,
    deleteCourse: deleteCourseOffline,
    syncPendingChanges,
    refreshFromServer,
  } = useOfflineSync();

  // 2. INSTANT STATE: Load directly from storage during initialization
  // This ensures data is available on the very first render cycle.
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const cached = getLocalCourses();
      return (cached as Course[]) || [];
    } catch (e) {
      return [];
    }
  });

  const [selectedLevel, setSelectedLevel] = useState<string>(() => {
    // Calculate initial level instantly based on the courses we just loaded
    try {
        const cached = getLocalCourses();
        if (cached && cached.length > 0) {
            const levels = [...new Set(cached.map((c: any) => c.courseLevel))].sort();
            return levels.length > 0 ? levels[0] : '';
        }
    } catch (e) {}
    return '';
  });

  // Decide initial tab instantly: if we have courses, show list. If not, show add form.
  const [activeTab, setActiveTab] = useState<'add' | 'history'>(() => {
     try {
         const cached = getLocalCourses();
         return cached && cached.length > 0 ? 'history' : 'add';
     } catch (e) { return 'add'; }
  });

  const [userId, setUserId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('semester');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Inline editing states
  const [editingCreditUnits, setEditingCreditUnits] = useState<string | null>(null);
  const [tempCreditUnits, setTempCreditUnits] = useState<number>(0);
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<GradeType>('A');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');
  const [showPrefillModal, setShowPrefillModal] = useState(false); // Kept for logic, though unused in snippet
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [profileCGPA, setProfileCGPA] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>({
    courseCode: '',
    creditUnits: 3,
    grade: 'A',
    scaleType: DEFAULT_SCALE,
    semester: '1',
    courseLevel: '100',
    gradePoint: 5
  });

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // 3. BACKGROUND SYNC ONLY: This does NOT block the UI.
  // The UI is already painted using local data.
  useEffect(() => {
    const loadBackgroundData = async () => {
      try {
        const user = await account.get();
        if (!mountedRef.current) return;
        setUserId(user.$id);

        if (isOnline) {
          // Fetch fresh data silently
          const freshCourses = await refreshFromServer(user.$id);
          if (!mountedRef.current) return;
          
          const typedCourses = freshCourses.map(c => ({
            ...c,
            grade: c.grade as GradeType,
            scaleType: c.scaleType as ScaleType,
          })) as Course[];
          
          // Only update state if different to prevent UI jitter
          if (JSON.stringify(typedCourses) !== JSON.stringify(courses)) {
             setCourses(typedCourses);
             
             // Update selected level if needed
             if (typedCourses.length > 0 && !selectedLevel) {
                const uniqueLevels = [...new Set(typedCourses.map(c => c.courseLevel))].sort();
                if (uniqueLevels.length > 0) setSelectedLevel(uniqueLevels[0]);
             }
          }
        }
      } catch (err) {
        // Silent fail on background refresh is fine, user has local data
        console.error('Background sync error:', err);
      }
    };

    loadBackgroundData();
  }, [isOnline]); // Intentionally minimal dependencies

  // Sync pending changes when coming back online
  useEffect(() => {
    if (isOnline && pendingChanges > 0) {
      syncPendingChanges();
    }
  }, [isOnline, pendingChanges, syncPendingChanges]);

  // Update grade point when grade/scale changes
  useEffect(() => {
    const newGradePoint = getGradePoint(form.grade, form.scaleType);
    setForm(prev => ({ ...prev, gradePoint: newGradePoint }));
  }, [form.grade, form.scaleType]);

  const handleFormChange = useCallback((field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Prefill logic
  const handlePrefill100L = useCallback((semester: 'semester1' | 'semester2') => {
    if (!userId) {
        // Fallback for offline/no-user yet - allows interaction before auth check completes
        // In a real app we might want to prompt login, but for "instant" feel we can proceed
    } 
    setIsPrefilling(true);
    
    try {
      const prefillCourses = PREFILL_COURSES_100L[semester];
      const semesterNum = semester === 'semester1' ? '1' : '2';
      const newCourses = prefillCourses.map(template =>
        createCourseFromTemplate(template, semesterNum, 'A', '5-point')
      );
      
      const updatedCourses = [...courses, ...newCourses] as Course[];
      setCourses(updatedCourses);
      saveLocalCourses(updatedCourses);
      
      setShowPrefillModal(false);
      setActiveTab('history');
      
      setTimeout(() => {
        const coursesSection = document.getElementById('my-courses-section');
        coursesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Prefill error:', err);
    } finally {
      setIsPrefilling(false);
    }
  }, [userId, courses, saveLocalCourses]);

  // --- Inline Editing Handlers ---
  const handleEditCreditUnits = useCallback((courseId: string, currentCredits: number) => {
    setEditingCreditUnits(courseId);
    setTempCreditUnits(currentCredits);
  }, []);

  const handleSaveCreditUnits = useCallback((courseId: string) => {
    const updatedCourses = courses.map(c => 
      c.$id === courseId || c.localId === courseId
        ? { ...c, creditUnits: tempCreditUnits }
        : c
    ) as Course[];
    setCourses(updatedCourses);
    saveLocalCourses(updatedCourses);
    setEditingCreditUnits(null);
  }, [tempCreditUnits, courses, saveLocalCourses]);

  const handleEditGrade = useCallback((courseId: string, currentGrade: GradeType) => {
    setEditingGrade(courseId);
    setTempGrade(currentGrade);
  }, []);

  const handleSaveGrade = useCallback((courseId: string, scaleType: ScaleType) => {
    const newGradePoint = getGradePoint(tempGrade, scaleType);
    const updatedCourses = courses.map(c => 
      c.$id === courseId || c.localId === courseId
        ? { ...c, grade: tempGrade, gradePoint: newGradePoint }
        : c
    ) as Course[];
    setCourses(updatedCourses);
    saveLocalCourses(updatedCourses);
    setEditingGrade(null);
  }, [tempGrade, courses, saveLocalCourses]);

  const handleEditTitle = useCallback((courseId: string, currentTitle: string) => {
    setEditingTitle(courseId);
    setTempTitle(currentTitle);
  }, []);

  const handleSaveTitle = useCallback((courseId: string) => {
    const updatedCourses = courses.map(c => 
      c.$id === courseId || c.localId === courseId
        ? { ...c, courseCode: tempTitle }
        : c
    ) as Course[];
    setCourses(updatedCourses);
    saveLocalCourses(updatedCourses);
    setEditingTitle(null);
  }, [tempTitle, courses, saveLocalCourses]);

  // --- CRUD Handlers ---
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow adding even if userId isn't fetched yet (offline mode handles queueing)
    
    setIsSaving(true);
    setError(null);

    try {
      const courseData = {
        courseCode: form.courseCode,
        creditUnits: form.creditUnits,
        grade: form.grade,
        gradePoint: form.gradePoint || getGradePoint(form.grade, form.scaleType),
        scaleType: form.scaleType,
        semester: form.semester,
        courseLevel: form.courseLevel,
      };

      if (editingId) {
        const updatedCourse = await updateCourseOffline(editingId, courseData, userId);
        if (updatedCourse) {
          setCourses(prev =>
            prev.map(c => ((c.$id === editingId || c.localId === editingId) ? { ...c, ...courseData } as Course : c))
          );
        }
        setEditingId(null);
      } else {
        const newCourse = await addCourseOffline(courseData, userId);
        setCourses(prev => [...prev, { ...newCourse, grade: newCourse.grade as GradeType, scaleType: newCourse.scaleType as ScaleType } as Course]);
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
      
      if (!isOnline) {
        setError('Saved locally.');
        setTimeout(() => setError(null), 2000);
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      setError(err.message || 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const success = await deleteCourseOffline(courseId);
      if (success) {
        setCourses(prev => prev.filter(c => c.$id !== courseId && c.localId !== courseId));
      }
    } catch (err: any) {
      console.error('Error deleting:', err);
      setError('Failed to delete.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCourse = useCallback((course: Course) => {
    setForm({
      courseCode: course.courseCode,
      creditUnits: course.creditUnits,
      grade: course.grade,
      scaleType: course.scaleType,
      semester: course.semester,
      courseLevel: course.courseLevel,
      gradePoint: course.gradePoint
    });
    setEditingId(course.$id || course.localId || null);
    setActiveTab('add');
  }, []);

  // --- Calculations ---
  const uniqueSemesters = useMemo(() => 
    [...new Set(courses.map(c => c.semester))].sort((a, b) => parseInt(a) - parseInt(b)),
    [courses]
  );
  
  const uniqueLevels = useMemo(() => 
    [...new Set(courses.map(c => c.courseLevel))].sort((a, b) => parseInt(a) - parseInt(b)),
    [courses]
  );

  const displayedSemesters = useMemo(() => uniqueSemesters.slice(0, 2), [uniqueSemesters]);

  const calculateDisplayedGPA = useCallback((): number => {
    let filteredCourses: Course[] = [];
    if (viewMode === 'semester') {
      filteredCourses = courses.filter(c => displayedSemesters.includes(c.semester));
    } else if (viewMode === 'level') {
      filteredCourses = courses.filter(c => c.courseLevel === selectedLevel);
    } else {
      filteredCourses = courses;
    }
    if (filteredCourses.length === 0) return 0;
    return calculateCGPA(filteredCourses.map(c => ({
      gradePoint: c.gradePoint,
      creditUnits: c.creditUnits
    })));
  }, [viewMode, courses, displayedSemesters, selectedLevel]);

  const displayedGPA = useMemo(() => calculateDisplayedGPA(), [calculateDisplayedGPA]);

  const getGPALabel = useMemo((): string => {
    if (viewMode === 'semester') {
      if (displayedSemesters.length === 1) return `Semester ${displayedSemesters[0]} GPA`;
      return `Semester ${displayedSemesters.join(' & ')} GPA`;
    } else if (viewMode === 'level') {
      return `${selectedLevel}L GPA`;
    }
    return 'Cumulative GPA';
  }, [viewMode, displayedSemesters, selectedLevel]);

  const handleUpdateProfileCGPA = async () => {
    const cumulativeCGPA = displayedGPA;
    try {
      setIsUpdatingProfile(true);
      const updatedCGPA = parseFloat(cumulativeCGPA.toFixed(2));
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, { cgpa: updatedCGPA });
      setProfileCGPA(updatedCGPA);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setShowUpdateModal(false);
      }, 2000);
    } catch (err) {
      alert('Failed update');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 4. INSTANT RENDER: No Conditionals. We render the UI immediately.
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="pt-4 px-4 max-w-md mx-auto">
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

        {/* Update Profile Button */}
        {uniqueLevels.length > 0 && (
          <button
            onClick={() => setShowUpdateModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg mb-6 transition-colors flex items-center justify-center gap-2"
          >
            Update Profile CGPA
          </button>
        )}
        
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
              <p className="text-sm text-gray-700 mb-3 font-semibold">Prefill 100L Courses:</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => handlePrefill100L('semester1')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium">Semester 1</button>
                <button type="button" onClick={() => handlePrefill100L('semester2')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium">Semester 2</button>
              </div>
            </div>

            <form onSubmit={handleAddCourse} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
              <input type="text" placeholder="e.g., CSC101" value={form.courseCode} onChange={e => handleFormChange('courseCode', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Units *</label>
                <input type="number" min="1" max="6" value={form.creditUnits} onChange={e => handleFormChange('creditUnits', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                <select value={form.grade} onChange={e => handleFormChange('grade', e.target.value as GradeType)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required>
                  {AVAILABLE_GRADES.map(g => (<option key={g} value={g}>{g}</option>))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                <input type="text" placeholder="e.g., 1 or 2" value={form.semester} onChange={e => handleFormChange('semester', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Level *</label>
                <select value={form.courseLevel} onChange={e => handleFormChange('courseLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
              {isSaving ? 'Saving...' : editingId ? 'Update Course' : 'Add Course'}
            </button>

            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ courseCode: '', creditUnits: 3, grade: 'A', scaleType: DEFAULT_SCALE, semester: '1', courseLevel: '100', gradePoint: 5 }); }} className="w-full bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 font-medium">
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
                <button onClick={() => setViewMode('semester')} className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${viewMode === 'semester' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>By Semester</button>
                <button onClick={() => setViewMode('level')} className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${viewMode === 'level' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>By Level</button>
                <button onClick={() => setViewMode('cumulative')} className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${viewMode === 'cumulative' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Cumulative</button>
              </div>
              {viewMode === 'level' && uniqueLevels.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {uniqueLevels.map(level => (
                    <button key={level} onClick={() => setSelectedLevel(level)} className={`py-2 px-4 rounded text-sm font-medium transition-colors ${selectedLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{level}L</button>
                  ))}
                </div>
              )}
            </div>

            {/* Empty State */}
            {courses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p>No courses added yet. Add your first course to calculate your GPA!</p>
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
                          <div key={course.$id || course.localId} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                             {/* Optimized Course Card */}
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  {editingTitle === (course.$id || course.localId) ? (
                                    <div className="flex items-center gap-1 mb-2">
                                      <input type="text" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} className="text-sm border border-blue-300 rounded px-2 py-1 flex-1" />
                                      <button onClick={() => handleSaveTitle(course.$id || course.localId || '')} className="px-2 py-1 text-xs bg-green-500 text-white rounded">✓</button>
                                      <button onClick={() => setEditingTitle(null)} className="px-2 py-1 text-xs bg-gray-400 text-white rounded">✕</button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                                      <button onClick={() => handleEditTitle(course.$id || course.localId || '', course.courseCode)} className="text-blue-600 p-1"><EditIcon className="h-4 w-4" /></button>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">{course.courseLevel}L •</p>
                                    {editingCreditUnits === (course.$id || course.localId) ? (
                                      <div className="flex items-center gap-1">
                                        <select value={tempCreditUnits} onChange={(e) => setTempCreditUnits(parseInt(e.target.value))} className="text-xs border border-blue-300 rounded px-1 py-0.5"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-500">{course.creditUnits} units</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {editingGrade === (course.$id || course.localId) ? (
                                    <div className="flex items-center gap-1 mb-2">
                                      <select value={tempGrade} onChange={(e) => setTempGrade(e.target.value as GradeType)} className="text-sm border border-blue-300 rounded px-2 py-1">{AVAILABLE_GRADES.map(g => (<option key={g} value={g}>{g}</option>))}</select>
                                      <button onClick={() => handleSaveGrade(course.$id || course.localId || '', course.scaleType)} className="px-2 py-1 text-xs bg-green-500 text-white rounded">✓</button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-lg font-bold text-blue-600">{course.grade}</p>
                                      <button onClick={() => handleEditGrade(course.$id || course.localId || '', course.grade)} className="text-blue-600 p-1"><EditIcon className="h-4 w-4" /></button>
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-500">{course.gradePoint}</p>
                                </div>
                             </div>
                             <div className="flex gap-2 mt-3">
                                {editingCreditUnits === (course.$id || course.localId) ? (
                                  <><button onClick={() => handleSaveCreditUnits(course.$id || course.localId || '')} className="px-3 py-1 text-xs bg-green-500 text-white rounded">✓ Save</button><button onClick={() => setEditingCreditUnits(null)} className="px-3 py-1 text-xs bg-gray-400 text-white rounded">✕ Cancel</button></>
                                ) : (
                                  <><button onClick={() => handleEditCreditUnits(course.$id || course.localId || '', course.creditUnits)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded">📝 Units</button><button onClick={() => handleDeleteCourse(course.$id || course.localId || '')} className="p-2 text-red-600 hover:bg-red-100 rounded"><DeleteIcon className="h-5 w-5" /></button></>
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
              // Level/Cumulative View (Simplified list similar to above but flattened/filtered)
              <div className="space-y-3">
                {(viewMode === 'level' ? courses.filter(c => c.courseLevel === selectedLevel) : courses).map(course => (
                  <div key={course.$id || course.localId} className={`bg-white rounded-lg shadow p-4 border-l-4 ${viewMode === 'level' ? 'border-green-500' : 'border-purple-500'}`}>
                    {/* Simplified Card Reuse for brevitiy - identical structure to above */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                            <p className="text-xs text-gray-500">{course.semester} • {course.creditUnits} units</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{course.grade}</p>
                        </div>
                    </div>
                    {/* Simple Delete only for cumulative view to save space, or full controls if desired */}
                     <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEditCourse(course)} className="px-3 py-1 text-xs bg-blue-500 text-white rounded">Edit</button>
                        <button onClick={() => handleDeleteCourse(course.$id || course.localId || '')} className="p-2 text-red-600"><DeleteIcon className="h-5 w-5" /></button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Update Profile Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Update Profile CGPA</h3>
                <button onClick={() => setShowUpdateModal(false)} className="text-gray-500 text-2xl">×</button>
              </div>
              {updateSuccess && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4">✓ Profile updated!</div>}
              <div className="mb-6 bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-5xl font-bold text-blue-600">{displayedGPA.toFixed(2)}</div>
                  <div className="text-sm text-gray-600 mt-2">Based on {courses.length} courses</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowUpdateModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg">Cancel</button>
                <button onClick={handleUpdateProfileCGPA} disabled={isUpdatingProfile} className="flex-1 bg-green-600 text-white py-3 rounded-lg">{isUpdatingProfile ? 'Updating...' : 'Update Profile'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CGPACalculator;