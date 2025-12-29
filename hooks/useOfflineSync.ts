import { useState, useEffect, useCallback } from 'react';

// LocalStorage Keys
const STORAGE_KEYS = {
  COURSES: 'cgpa_courses',
};

export interface Course {
  $id?: string;
  localId?: string;
  courseCode: string;
  creditUnits: number;
  grade: string;
  gradePoint: number;
  scaleType: string;
  semester: string;
  courseLevel: string;
}

/**
 * Pure offline-first hook
 * All courses stored in localStorage only
 * No database calls for courses
 * Only CGPA profile update goes to DB via parent component
 */
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get courses from localStorage
  const getLocalCourses = useCallback((): Course[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to load courses from localStorage:', err);
      return [];
    }
  }, []);

  // Save courses to localStorage
  const saveLocalCourses = useCallback((courses: Course[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
      console.log(`💾 Saved ${courses.length} courses to localStorage`);
    } catch (err) {
      console.error('Failed to save courses to localStorage:', err);
    }
  }, []);

  // Add course to localStorage
  const addCourse = useCallback(async (
    course: Omit<Course, '$id' | 'localId'>,
    userId: string
  ): Promise<Course> => {
    const courses = getLocalCourses();
    const newCourse: Course = {
      ...course,
      localId: `${course.courseCode}_${Date.now()}`,
    };
    courses.push(newCourse);
    saveLocalCourses(courses);
    console.log(`➕ Added ${course.courseCode} to localStorage`);
    return newCourse;
  }, [getLocalCourses, saveLocalCourses]);

  // Update course in localStorage
  const updateCourse = useCallback(async (
    courseId: string,
    updates: Partial<Course>,
    userId: string
  ): Promise<Course | null> => {
    const courses = getLocalCourses();
    const index = courses.findIndex(c => c.$id === courseId || c.localId === courseId);
    
    if (index === -1) {
      console.warn(`⚠️ Course ${courseId} not found`);
      return null;
    }
    
    courses[index] = { ...courses[index], ...updates };
    saveLocalCourses(courses);
    console.log(`✏️ Updated ${courses[index].courseCode} in localStorage`);
    return courses[index];
  }, [getLocalCourses, saveLocalCourses]);

  // Delete course from localStorage
  const deleteCourse = useCallback(async (courseId: string): Promise<boolean> => {
    const courses = getLocalCourses();
    const index = courses.findIndex(c => c.$id === courseId || c.localId === courseId);
    
    if (index === -1) {
      console.warn(`⚠️ Course ${courseId} not found`);
      return false;
    }
    
    const courseCode = courses[index].courseCode;
    courses.splice(index, 1);
    saveLocalCourses(courses);
    console.log(`🗑️ Deleted ${courseCode} from localStorage`);
    return true;
  }, [getLocalCourses, saveLocalCourses]);

  // Refresh from server (not used - always local)
  const refreshFromServer = useCallback(async (userId: string): Promise<Course[]> => {
    return getLocalCourses();
  }, [getLocalCourses]);

  // No-op sync function for compatibility
  const syncPendingChanges = useCallback(async () => {
    // Pure offline mode - no syncing needed
  }, []);

  return {
    isOnline,
    isSyncing: false,
    pendingChanges: 0,
    lastSyncTime: null,
    getLocalCourses,
    saveLocalCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    syncPendingChanges,
    refreshFromServer,
  };
};

export default useOfflineSync;

// Export cached profile functions for other parts of app
export const cacheUserProfile = (profile: any) => {
  localStorage.setItem('user_profile', JSON.stringify(profile));
};

export const getCachedUserProfile = () => {
  try {
    const cached = localStorage.getItem('user_profile');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const cacheUserSession = (session: any) => {
  localStorage.setItem('user_session_cache', JSON.stringify(session));
};

export const getCachedUserSession = () => {
  try {
    const cached = localStorage.getItem('user_session_cache');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const cacheScholarships = (scholarships: any) => {
  localStorage.setItem('scholarships_cache', JSON.stringify(scholarships));
};

export const getCachedScholarships = () => {
  try {
    const cached = localStorage.getItem('scholarships_cache');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const cacheMatchedScholarships = (matched: any) => {
  localStorage.setItem('matched_scholarships_cache', JSON.stringify(matched));
};

export const getCachedMatchedScholarships = () => {
  try {
    const cached = localStorage.getItem('matched_scholarships_cache');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};
