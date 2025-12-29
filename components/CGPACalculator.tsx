import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { account, databases, DATABASE_ID, USERCOURSES_COLLECTION_ID, USERS_COLLECTION_ID } from '../appwriteConfig';
import { Query } from 'appwrite';
import { GRADE_SCALES, DEFAULT_SCALE, AVAILABLE_GRADES, getGradePoint, calculateCGPA, type ScaleType, type GradeType } from '../utils/cgpaConstants';
import { PREFILL_COURSES_100L, createCourseFromTemplate } from '../constants/cgpaPrefill';
import { LogoIcon } from './icons/LogoIcon';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import useOfflineSync from '../hooks/useOfflineSync';

interface Course {
  $id?: string;
  localId?: string; // For offline-created courses
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('semester');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLevelForUpdate, setSelectedLevelForUpdate] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [editingCreditUnits, setEditingCreditUnits] = useState<string | null>(null);
  const [tempCreditUnits, setTempCreditUnits] = useState<number>(0);
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<GradeType>('A');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');
  const [showPrefillModal, setShowPrefillModal] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [profileCGPA, setProfileCGPA] = useState<number | null>(null);
  const mountedRef = useRef(true);

  // Offline sync hook
  const {
    isOnline,
    isSyncing,
    pendingChanges,
    lastSyncTime,
    getLocalCourses,
    saveLocalCourses,
    addCourse: addCourseOffline,
    updateCourse: updateCourseOffline,
    deleteCourse: deleteCourseOffline,
    syncPendingChanges,
    refreshFromServer,
  } = useOfflineSync();

  const [form, setForm] = useState<FormState>({
    courseCode: '',
    creditUnits: 3,
    grade: 'A',
    scaleType: DEFAULT_SCALE,
    semester: '1',
    courseLevel: '100',
    gradePoint: 5
  });

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load courses - prioritize local cache for instant display
  useEffect(() => {
    const loadCourses = async () => {
      // Immediately show cached courses for instant UI
      const cachedCourses = getLocalCourses();
      if (cachedCourses.length > 0 && !initialLoadDone) {
        setCourses(cachedCourses as Course[]);
        setIsLoading(false);
        
        // Set default selected level from cache
        const uniqueLevels = [...new Set(cachedCourses.map(c => c.courseLevel))].sort();
        if (uniqueLevels.length > 0 && !selectedLevel) {
          setSelectedLevel(uniqueLevels[0]);
        }
      }

      try {
        const user = await account.get();
        if (!mountedRef.current) return;
        setUserId(user.$id);

        // If online, fetch fresh data in background
        if (isOnline) {
          const freshCourses = await refreshFromServer(user.$id);
          if (!mountedRef.current) return;
          
          const typedCourses = freshCourses.map(c => ({
            ...c,
            grade: c.grade as GradeType,
            scaleType: c.scaleType as ScaleType,
          })) as Course[];
          
          setCourses(typedCourses);
          
          // Update selected level if needed
          if (typedCourses.length > 0) {
            const uniqueLevels = [...new Set(typedCourses.map(c => c.courseLevel))].sort();
            if (uniqueLevels.length > 0 && !selectedLevel) {
              setSelectedLevel(uniqueLevels[0]);
            }
          }
        } else if (cachedCourses.length === 0) {
          // Offline with no cache - show offline message
          setError('You are offline. Courses will load when you reconnect.');
        }
        
        setInitialLoadDone(true);
        setError(null);
      } catch (err: any) {
        if (!mountedRef.current) return;
        console.error('Error fetching data:', err);
        
        // If we have cached data, don't show error
        if (cachedCourses.length === 0) {
          setError('Failed to load courses. Please try again.');
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadCourses();
  }, [isOnline]);

  // Sync pending changes when coming back online
  useEffect(() => {
    if (isOnline && pendingChanges > 0) {
      syncPendingChanges();
    }
  }, [isOnline, pendingChanges, syncPendingChanges]);

  // Update grade point when grade or scale changes
  useEffect(() => {
    const newGradePoint = getGradePoint(form.grade, form.scaleType);
    setForm(prev => ({ ...prev, gradePoint: newGradePoint }));
  }, [form.grade, form.scaleType]);

  // Handle form input changes
  const handleFormChange = useCallback((field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Prefill 100L courses - localStorage only, instant UI
  const handlePrefill100L = useCallback((semester: 'semester1' | 'semester2') => {
    if (!userId) return;
    setIsPrefilling(true);
    
    try {
      const prefillCourses = PREFILL_COURSES_100L[semester];
      const semesterNum = semester === 'semester1' ? '1' : '2';
      // Use 5-point CGPA (A = 5 points)
      const newCourses = prefillCourses.map(template =>
        createCourseFromTemplate(template, semesterNum, 'A', '5-point')
      );
      
      // Add all to state and localStorage
      const updatedCourses = [...courses, ...newCourses] as Course[];
      setCourses(updatedCourses);
      saveLocalCourses(updatedCourses);
      
      setShowPrefillModal(false);
      setActiveTab('history');
      
      // Scroll to My Courses section
      setTimeout(() => {
        const coursesSection = document.getElementById('my-courses-section');
        coursesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('[CGPA] Prefill error:', err);
    } finally {
      setIsPrefilling(false);
    }
  }, [userId, courses, saveLocalCourses]);

  // Handle inline credit unit editing
  const handleEditCreditUnits = useCallback((courseId: string, currentCredits: number) => {
    setEditingCreditUnits(courseId);
    setTempCreditUnits(currentCredits);
  }, []);

  const handleSaveCreditUnits = useCallback((courseId: string) => {
    // Update state
    const updatedCourses = courses.map(c => 
      c.$id === courseId || c.localId === courseId
        ? { ...c, creditUnits: tempCreditUnits }
        : c
    ) as Course[];
    
    setCourses(updatedCourses);
    saveLocalCourses(updatedCourses);
    setEditingCreditUnits(null);
  }, [tempCreditUnits, courses, saveLocalCourses]);

  // Handle inline grade editing
  const handleEditGrade = useCallback((courseId: string, currentGrade: GradeType) => {
    setEditingGrade(courseId);
    setTempGrade(currentGrade);
  }, []);

  const handleSaveGrade = useCallback((courseId: string, scaleType: ScaleType) => {
    const newGradePoint = getGradePoint(tempGrade, scaleType);
    
    // Update state
    const updatedCourses = courses.map(c => 
      c.$id === courseId || c.localId === courseId
        ? { ...c, grade: tempGrade, gradePoint: newGradePoint }
        : c
    ) as Course[];
    
    setCourses(updatedCourses);
    saveLocalCourses(updatedCourses);
    setEditingGrade(null);
  }, [tempGrade, courses, saveLocalCourses]);

  // Handle inline title/course code editing
  const handleEditTitle = useCallback((courseId: string, currentTitle: string) => {
    setEditingTitle(courseId);
    setTempTitle(currentTitle);
  }, []);

  const handleSaveTitle = useCallback((courseId: string) => {
    // Update state
    const updatedCourses = courses.map(c => 
      c.$id === courseId || c.localId === courseId
        ? { ...c, courseCode: tempTitle }
        : c
    ) as Course[];
    
    setCourses(updatedCourses);
    saveLocalCourses(updatedCourses);
    setEditingTitle(null);
  }, [tempTitle, courses, saveLocalCourses]);

  // Add or update course - with offline support
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

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
        // Update existing course - works offline
        const updatedCourse = await updateCourseOffline(editingId, courseData, userId);
        if (updatedCourse) {
          setCourses(prev =>
            prev.map(c => ((c.$id === editingId || c.localId === editingId) ? { ...c, ...courseData } as Course : c))
          );
        }
        setEditingId(null);
      } else {
        // Create new course - works offline
        const newCourse = await addCourseOffline(courseData, userId);
        setCourses(prev => [...prev, { ...newCourse, grade: newCourse.grade as GradeType, scaleType: newCourse.scaleType as ScaleType } as Course]);
      }

      // Reset form
      setForm({
        courseCode: '',
        creditUnits: 3,
        grade: 'A',
        scaleType: DEFAULT_SCALE,
        semester: '1',
        courseLevel: '100',
        gradePoint: 5
      });

      // Show success feedback
      if (!isOnline) {
        setError('Course saved locally. Will sync when online.');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      setError(err.message || 'Failed to save course. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete course - works offline
  const handleDeleteCourse = async (courseId: string) => {
    // No confirmation on mobile - just delete
    setIsSaving(true);
    setError(null);

    try {
      const success = await deleteCourseOffline(courseId);
      if (success) {
        setCourses(prev => prev.filter(c => c.$id !== courseId && c.localId !== courseId));
      }
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit course
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

  // Memoized calculations for better performance
  const uniqueSemesters = useMemo(() => 
    [...new Set(courses.map(c => c.semester))].sort((a, b) => parseInt(a) - parseInt(b)),
    [courses]
  );
  
  const uniqueLevels = useMemo(() => 
    [...new Set(courses.map(c => c.courseLevel))].sort((a, b) => parseInt(a) - parseInt(b)),
    [courses]
  );

  // Get displayed semesters (max 2)
  const displayedSemesters = useMemo(() => uniqueSemesters.slice(0, 2), [uniqueSemesters]);

  // Calculate GPA based on view mode - memoized
  const calculateDisplayedGPA = useCallback((): number => {
    let filteredCourses: Course[] = [];

    if (viewMode === 'semester') {
      filteredCourses = courses.filter(c => displayedSemesters.includes(c.semester));
    } else if (viewMode === 'level') {
      filteredCourses = courses.filter(c => c.courseLevel === selectedLevel);
    } else {
      // cumulative
      filteredCourses = courses;
    }

    if (filteredCourses.length === 0) return 0;
    return calculateCGPA(filteredCourses.map(c => ({
      gradePoint: c.gradePoint,
      creditUnits: c.creditUnits
    })));
  }, [viewMode, courses, displayedSemesters, selectedLevel]);

  // Memoized GPA value
  const displayedGPA = useMemo(() => calculateDisplayedGPA(), [calculateDisplayedGPA]);

  // Get GPA label based on view mode - memoized
  const getGPALabel = useMemo((): string => {
    if (viewMode === 'semester') {
      if (displayedSemesters.length === 1) {
        return `Semester ${displayedSemesters[0]} GPA`;
      }
      return `Semester ${displayedSemesters.join(' & ')} GPA`;
    } else if (viewMode === 'level') {
      return `${selectedLevel}L GPA`;
    }
    return 'Cumulative GPA';
  }, [viewMode, displayedSemesters, selectedLevel]);

  // Calculate CGPA for a specific level
  const calculateLevelCGPA = useCallback((level: string): number => {
    const levelCourses = courses.filter(c => c.courseLevel === level);
    if (levelCourses.length === 0) return 0;
    return calculateCGPA(levelCourses.map(c => ({
      gradePoint: c.gradePoint,
      creditUnits: c.creditUnits
    })));
  }, [courses]);

  // Update profile with cumulative CGPA
  const handleUpdateProfileCGPA = async () => {
    const cumulativeCGPA = displayedGPA;
    
    try {
      setIsUpdatingProfile(true);
      
      // Update the user profile with the cumulative CGPA
      const updatedCGPA = parseFloat(cumulativeCGPA.toFixed(2));
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        { cgpa: updatedCGPA }
      );

      // Update local profile CGPA state
      setProfileCGPA(updatedCGPA);

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setShowUpdateModal(false);
      }, 2000);
    } catch (err) {
      alert('Failed to update profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Show skeleton instead of spinner for faster perceived loading
  if (isLoading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="pt-4 px-4 max-w-md mx-auto">
          {/* Skeleton GPA Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-6 shadow-lg animate-pulse">
            <div className="h-4 bg-blue-400 rounded w-24 mb-2"></div>
            <div className="h-10 bg-blue-400 rounded w-20"></div>
            <div className="h-3 bg-blue-400 rounded w-32 mt-2"></div>
          </div>
          {/* Skeleton Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-200 p-1 rounded-lg">
            <div className="flex-1 h-10 bg-gray-300 rounded animate-pulse"></div>
            <div className="flex-1 h-10 bg-gray-300 rounded animate-pulse"></div>
          </div>
          {/* Skeleton Form */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-2m6 2l6-2" />
            </svg>
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
              activeTab === 'add'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            {editingId ? 'Edit Course' : 'Add Course'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            My Courses ({courses.length})
          </button>
        </div>

        {/* Add Course Tab */}
        {activeTab === 'add' && (
          <>
            {/* Prefill Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-3">
                <span className="font-semibold">Prefill 100L Courses:</span> Quick add common 100L courses (for 100L & 200L students)
              </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code *
              </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Units *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <select
                  value={form.grade}
                  onChange={e => handleFormChange('grade', e.target.value as GradeType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {AVAILABLE_GRADES.map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Level *
                </label>
                <select
                  value={form.courseLevel}
                  onChange={e => handleFormChange('courseLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : editingId ? 'Update Course' : 'Add Course'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    courseCode: '',
                    creditUnits: 3,
                    grade: 'A',
                    scaleType: DEFAULT_SCALE,
                    semester: '1',
                    courseLevel: '100',
                    gradePoint: 5
                  });
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
            {/* View Mode Selector */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setViewMode('semester')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    viewMode === 'semester'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  By Semester
                </button>
                <button
                  onClick={() => setViewMode('level')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    viewMode === 'level'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  By Level
                </button>
                <button
                  onClick={() => setViewMode('cumulative')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    viewMode === 'cumulative'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cumulative
                </button>
              </div>

              {/* Level Filter Buttons - Only show in level view */}
              {viewMode === 'level' && uniqueLevels.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {uniqueLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                        selectedLevel === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {level}L
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Courses Display */}
            {courses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p>No courses added yet. Add your first course to calculate your GPA!</p>
              </div>
            ) : viewMode === 'semester' ? (
              // Semester View - Group by semester
              <div className="space-y-6">
                {displayedSemesters.map((sem, semIdx) => {
                  const semesterCourses = courses.filter(c => c.semester === sem);
                  const semGPA = calculateCGPA(semesterCourses.map(c => ({
                    gradePoint: c.gradePoint,
                    creditUnits: c.creditUnits
                  })));

                  return (
                    <div key={sem}>
                      {/* Semester Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Semester {sem}</h3>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                          GPA: {semGPA.toFixed(2)}
                        </span>
                      </div>

                      {/* Semester Courses */}
                      <div className="space-y-3 mb-6">
                        {semesterCourses.map(course => (
                          <div
                            key={course.$id || course.localId}
                            className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                {editingTitle === (course.$id || course.localId) ? (
                                  <div className="flex items-center gap-1 mb-2">
                                    <input
                                      type="text"
                                      value={tempTitle}
                                      onChange={(e) => setTempTitle(e.target.value)}
                                      className="text-sm border border-blue-300 rounded px-2 py-1 flex-1"
                                      placeholder="Course code"
                                    />
                                    <button
                                      onClick={() => handleSaveTitle(course.$id || course.localId || '')}
                                      className="px-2 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded font-medium"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => setEditingTitle(null)}
                                      className="px-2 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded font-medium"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                                    <button
                                      onClick={() => handleEditTitle(course.$id || course.localId || '', course.courseCode)}
                                      className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
                                      title="Edit course code"
                                    >
                                      <EditIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-gray-500">{course.courseLevel}L •</p>
                                  {editingCreditUnits === (course.$id || course.localId) ? (
                                    <div className="flex items-center gap-1">
                                      <select
                                        value={tempCreditUnits}
                                        onChange={(e) => setTempCreditUnits(parseInt(e.target.value))}
                                        className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                      >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                      </select>
                                      <span className="text-xs text-gray-500">units</span>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500">{course.creditUnits} units</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {editingGrade === (course.$id || course.localId) ? (
                                  <div className="flex items-center gap-1 mb-2">
                                    <select
                                      value={tempGrade}
                                      onChange={(e) => setTempGrade(e.target.value as GradeType)}
                                      className="text-sm border border-blue-300 rounded px-2 py-1"
                                    >
                                      {AVAILABLE_GRADES.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleSaveGrade(course.$id || course.localId || '', course.scaleType)}
                                      className="px-2 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded font-medium"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => setEditingGrade(null)}
                                      className="px-2 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded font-medium"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-lg font-bold text-blue-600">{course.grade}</p>
                                    <button
                                      onClick={() => handleEditGrade(course.$id || course.localId || '', course.grade)}
                                      className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
                                      title="Edit grade"
                                    >
                                      <EditIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500">{course.gradePoint}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                              {editingCreditUnits === (course.$id || course.localId) ? (
                                <>
                                  <button
                                    onClick={() => handleSaveCreditUnits(course.$id || course.localId || '')}
                                    className="flex items-center justify-center px-3 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded transition-colors font-medium"
                                    title="Save credits"
                                  >
                                    ✓ Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCreditUnits(null)}
                                    className="flex items-center justify-center px-3 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded transition-colors font-medium"
                                    title="Cancel"
                                  >
                                    ✕ Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditCreditUnits(course.$id || course.localId || '', course.creditUnits)}
                                    className="flex items-center justify-center px-3 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors font-medium"
                                    title="Edit credit units"
                                  >
                                    📝 Units
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourse(course.$id || course.localId || '')}
                                    className="flex items-center justify-center p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                    title="Delete course"
                                  >
                                    <DeleteIcon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dividing Line - Stylish separator */}
                      {semIdx < displayedSemesters.length - 1 && (
                        <div className="flex items-center gap-3 my-8">
                          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
                          <span className="text-xs font-semibold text-gray-400 px-2">•</span>
                          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : viewMode === 'level' ? (
              // Level View - Show selected level courses
              <div className="space-y-3">
                {courses
                  .filter(c => c.courseLevel === selectedLevel)
                  .map(course => (
                    <div
                      key={course.$id || course.localId}
                      className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          {editingTitle === (course.$id || course.localId) ? (
                            <div className="flex items-center gap-1 mb-2">
                              <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                className="text-sm border border-green-300 rounded px-2 py-1 flex-1"
                                placeholder="Course code"
                              />
                              <button
                                onClick={() => handleSaveTitle(course.$id || course.localId || '')}
                                className="px-2 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded font-medium"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingTitle(null)}
                                className="px-2 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded font-medium"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                              <button
                                onClick={() => handleEditTitle(course.$id || course.localId || '', course.courseCode)}
                                className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
                                title="Edit course code"
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">Semester {course.semester} •</p>
                            {editingCreditUnits === (course.$id || course.localId) ? (
                              <div className="flex items-center gap-1">
                                <select
                                  value={tempCreditUnits}
                                  onChange={(e) => setTempCreditUnits(parseInt(e.target.value))}
                                  className="text-xs border border-green-300 rounded px-1 py-0.5"
                                >
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                </select>
                                <span className="text-xs text-gray-500">units</span>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">{course.creditUnits} units</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {editingGrade === (course.$id || course.localId) ? (
                            <div className="flex items-center gap-1 mb-2">
                              <select
                                value={tempGrade}
                                onChange={(e) => setTempGrade(e.target.value as GradeType)}
                                className="text-sm border border-green-300 rounded px-2 py-1"
                              >
                                {AVAILABLE_GRADES.map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleSaveGrade(course.$id || course.localId || '', course.scaleType)}
                                className="px-2 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded font-medium"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingGrade(null)}
                                className="px-2 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded font-medium"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-lg font-bold text-blue-600">{course.grade}</p>
                              <button
                                onClick={() => handleEditGrade(course.$id || course.localId || '', course.grade)}
                                className="text-xs text-blue-600 hover:bg-blue-100 p-1 rounded"
                                title="Edit grade"
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">{course.gradePoint}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {editingCreditUnits === (course.$id || course.localId) ? (
                          <>
                            <button
                              onClick={() => handleSaveCreditUnits(course.$id || course.localId || '')}
                              className="flex items-center justify-center px-3 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded transition-colors font-medium"
                              title="Save credits"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={() => setEditingCreditUnits(null)}
                              className="flex items-center justify-center px-3 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded transition-colors font-medium"
                              title="Cancel"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditCreditUnits(course.$id || course.localId || '', course.creditUnits)}
                              className="flex items-center justify-center px-3 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors font-medium"
                              title="Edit credit units"
                            >
                              📝 Units
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.$id || course.localId || '')}
                              className="flex items-center justify-center p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete course"
                            >
                              <DeleteIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              // Cumulative View - All courses
              <div className="space-y-3">
                {courses.map(course => (
                  <div
                    key={course.$id || course.localId}
                    className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        {editingTitle === (course.$id || course.localId) ? (
                          <div className="flex items-center gap-1 mb-2">
                            <input
                              type="text"
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              className="text-sm border border-purple-300 rounded px-2 py-1 flex-1"
                              placeholder="Course code"
                            />
                            <button
                              onClick={() => handleSaveTitle(course.$id || course.localId || '')}
                              className="px-2 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded font-medium"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingTitle(null)}
                              className="px-2 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded font-medium"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800">{course.courseCode}</h3>
                            <button
                              onClick={() => handleEditTitle(course.$id || course.localId || '', course.courseCode)}
                              className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
                              title="Edit course code"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">Semester {course.semester} • {course.courseLevel}L •</p>
                          {editingCreditUnits === (course.$id || course.localId) ? (
                            <div className="flex items-center gap-1">
                              <select
                                value={tempCreditUnits}
                                onChange={(e) => setTempCreditUnits(parseInt(e.target.value))}
                                className="text-xs border border-purple-300 rounded px-1 py-0.5"
                              >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                              </select>
                              <span className="text-xs text-gray-500">units</span>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">{course.creditUnits} units</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {editingGrade === (course.$id || course.localId) ? (
                          <div className="flex items-center gap-1 mb-2">
                            <select
                              value={tempGrade}
                              onChange={(e) => setTempGrade(e.target.value as GradeType)}
                              className="text-sm border border-purple-300 rounded px-2 py-1"
                            >
                              {AVAILABLE_GRADES.map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleSaveGrade(course.$id || course.localId || '', course.scaleType)}
                              className="px-2 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded font-medium"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingGrade(null)}
                              className="px-2 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded font-medium"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-bold text-blue-600">{course.grade}</p>
                            <button
                              onClick={() => handleEditGrade(course.$id || course.localId || '', course.grade)}
                              className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
                              title="Edit grade"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">{course.gradePoint}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {editingCreditUnits === (course.$id || course.localId) ? (
                        <>
                          <button
                            onClick={() => handleSaveCreditUnits(course.$id || course.localId || '')}
                            className="flex items-center justify-center px-3 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded transition-colors font-medium"
                            title="Save credits"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={() => setEditingCreditUnits(null)}
                            className="flex items-center justify-center px-3 py-1 text-xs bg-gray-400 text-white hover:bg-gray-500 rounded transition-colors font-medium"
                            title="Cancel"
                          >
                            ✕ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditCreditUnits(course.$id || course.localId || '', course.creditUnits)}
                            className="flex items-center justify-center px-3 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors font-medium"
                            title="Edit credit units"
                          >
                            📝 Units
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.$id || course.localId || '')}
                            className="flex items-center justify-center p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete course"
                          >
                            <DeleteIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
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
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Update Profile CGPA</h3>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Success Message */}
              {updateSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  ✓ Profile updated successfully!
                </div>
              )}

              {/* Level Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Cumulative GPA
                </label>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6 text-center">
                  <div className="text-5xl font-bold text-blue-600">
                    {displayedGPA.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Based on {courses.length} course{courses.length !== 1 ? 's' : ''}
                  </div>
                  
                  {/* Show if not updated */}
                  {profileCGPA !== null && Math.abs(displayedGPA - profileCGPA) > 0.01 && (
                    <div className="mt-3 px-3 py-2 bg-amber-100 border border-amber-300 rounded text-sm text-amber-800">
                      ⚠️ You haven't updated your profile
                    </div>
                  )}
                </div>
              </div>

              {/* Info Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Info:</span> Your profile CGPA will be updated to <span className="font-bold">{displayedGPA.toFixed(2)}</span>. This CGPA will be used to match you to scholarships.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfileCGPA}
                  disabled={isUpdatingProfile}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CGPACalculator;
