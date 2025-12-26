import { useState, useEffect, useCallback } from 'react';
import { databases, account, DATABASE_ID, USERCOURSES_COLLECTION_ID } from '../appwriteConfig';
import { Query } from 'appwrite';

// LocalStorage Keys
const STORAGE_KEYS = {
  COURSES: 'cgpa_courses',
  USER_ID: 'cgpa_userId',
  PENDING_SYNC: 'cgpa_pendingSync',
  LAST_SYNC: 'cgpa_lastSync',
  USER_PROFILE: 'user_profile',
  USER_SESSION: 'user_session_cache',
  SCHOLARSHIPS: 'scholarships_cache',
  MATCHED_SCHOLARSHIPS: 'matched_scholarships_cache',
};

export interface Course {
  $id?: string;
  localId?: string; // For offline-created courses
  courseCode: string;
  creditUnits: number;
  grade: string;
  gradePoint: number;
  scaleType: string;
  semester: string;
  courseLevel: string;
  pendingAction?: 'create' | 'update' | 'delete';
}

interface PendingSync {
  courses: Course[];
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState<number>(0);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncPendingChanges();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending changes on mount
    const pending = getPendingSync();
    setPendingChanges(pending.courses.filter(c => c.pendingAction).length);

    // Load last sync time
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }

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
    } catch {
      return [];
    }
  }, []);

  // Save courses to localStorage
  const saveLocalCourses = useCallback((courses: Course[]) => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    // Update pending changes count
    setPendingChanges(courses.filter(c => c.pendingAction).length);
  }, []);

  // Get pending sync data
  const getPendingSync = useCallback((): PendingSync => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return stored ? JSON.parse(stored) : { courses: [], timestamp: Date.now() };
    } catch {
      return { courses: [], timestamp: Date.now() };
    }
  }, []);

  // Save pending sync data
  const savePendingSync = useCallback((courses: Course[]) => {
    const pendingCourses = courses.filter(c => c.pendingAction);
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify({
      courses: pendingCourses,
      timestamp: Date.now()
    }));
    setPendingChanges(pendingCourses.length);
  }, []);

  // Add course (works offline)
  const addCourse = useCallback(async (course: Omit<Course, '$id' | 'localId' | 'pendingAction'>, userId: string): Promise<Course> => {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCourse: Course = {
      ...course,
      localId,
      pendingAction: isOnline ? undefined : 'create'
    };

    if (isOnline) {
      try {
        const newDoc = await databases.createDocument(
          DATABASE_ID,
          USERCOURSES_COLLECTION_ID,
          'unique()',
          { userId, ...course }
        );
        newCourse.$id = newDoc.$id;
        delete newCourse.pendingAction;
        delete newCourse.localId;
      } catch (error) {
        // If online save fails, mark for sync
        newCourse.pendingAction = 'create';
        console.error('Failed to save online, storing locally:', error);
      }
    }

    const courses = getLocalCourses();
    courses.push(newCourse);
    saveLocalCourses(courses);
    savePendingSync(courses);

    return newCourse;
  }, [isOnline, getLocalCourses, saveLocalCourses, savePendingSync]);

  // Update course (works offline)
  const updateCourse = useCallback(async (courseId: string, updates: Partial<Course>, userId: string): Promise<Course | null> => {
    const courses = getLocalCourses();
    const index = courses.findIndex(c => c.$id === courseId || c.localId === courseId);
    
    if (index === -1) return null;

    const updatedCourse: Course = {
      ...courses[index],
      ...updates,
      pendingAction: isOnline ? courses[index].pendingAction : (courses[index].pendingAction === 'create' ? 'create' : 'update')
    };

    if (isOnline && courses[index].$id) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          USERCOURSES_COLLECTION_ID,
          courses[index].$id!,
          updates
        );
        delete updatedCourse.pendingAction;
      } catch (error) {
        updatedCourse.pendingAction = courses[index].pendingAction === 'create' ? 'create' : 'update';
        console.error('Failed to update online, storing locally:', error);
      }
    }

    courses[index] = updatedCourse;
    saveLocalCourses(courses);
    savePendingSync(courses);

    return updatedCourse;
  }, [isOnline, getLocalCourses, saveLocalCourses, savePendingSync]);

  // Delete course (works offline)
  const deleteCourse = useCallback(async (courseId: string): Promise<boolean> => {
    const courses = getLocalCourses();
    const index = courses.findIndex(c => c.$id === courseId || c.localId === courseId);
    
    if (index === -1) return false;

    const course = courses[index];

    // If it's a local-only course, just remove it
    if (course.localId && !course.$id) {
      courses.splice(index, 1);
      saveLocalCourses(courses);
      savePendingSync(courses);
      return true;
    }

    if (isOnline && course.$id) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          USERCOURSES_COLLECTION_ID,
          course.$id
        );
        courses.splice(index, 1);
      } catch (error) {
        // Mark for deletion on sync
        courses[index].pendingAction = 'delete';
        console.error('Failed to delete online, marking for sync:', error);
      }
    } else {
      // Mark for deletion when back online
      courses[index].pendingAction = 'delete';
    }

    saveLocalCourses(courses);
    savePendingSync(courses);
    return true;
  }, [isOnline, getLocalCourses, saveLocalCourses, savePendingSync]);

  // Sync pending changes when back online
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    const courses = getLocalCourses();
    const pendingCourses = courses.filter(c => c.pendingAction);

    if (pendingCourses.length === 0) {
      setIsSyncing(false);
      return;
    }

    try {
      const user = await account.get();
      
      for (const course of pendingCourses) {
        const index = courses.findIndex(c => 
          (c.$id && c.$id === course.$id) || (c.localId && c.localId === course.localId)
        );
        
        if (index === -1) continue;

        try {
          if (course.pendingAction === 'create') {
            const { $id, localId, pendingAction, ...courseData } = course;
            const newDoc = await databases.createDocument(
              DATABASE_ID,
              USERCOURSES_COLLECTION_ID,
              'unique()',
              { userId: user.$id, ...courseData }
            );
            courses[index].$id = newDoc.$id;
            delete courses[index].localId;
            delete courses[index].pendingAction;
          } else if (course.pendingAction === 'update' && course.$id) {
            const { $id, localId, pendingAction, ...courseData } = course;
            await databases.updateDocument(
              DATABASE_ID,
              USERCOURSES_COLLECTION_ID,
              course.$id,
              courseData
            );
            delete courses[index].pendingAction;
          } else if (course.pendingAction === 'delete' && course.$id) {
            await databases.deleteDocument(
              DATABASE_ID,
              USERCOURSES_COLLECTION_ID,
              course.$id
            );
            courses.splice(index, 1);
          }
        } catch (error) {
          console.error(`Failed to sync course ${course.courseCode}:`, error);
        }
      }

      saveLocalCourses(courses);
      savePendingSync(courses);
      
      const now = new Date();
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
      setLastSyncTime(now);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, getLocalCourses, saveLocalCourses, savePendingSync]);

  // Force refresh from server
  const refreshFromServer = useCallback(async (userId: string): Promise<Course[]> => {
    if (!isOnline) {
      return getLocalCourses();
    }

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERCOURSES_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      const serverCourses: Course[] = response.documents.map(doc => ({
        $id: doc.$id,
        courseCode: doc.courseCode as string,
        creditUnits: doc.creditUnits as number,
        grade: doc.grade as string,
        gradePoint: doc.gradePoint as number,
        scaleType: doc.scaleType as string,
        semester: doc.semester as string,
        courseLevel: doc.courseLevel as string,
      }));

      // Merge with pending local changes
      const localCourses = getLocalCourses();
      const pendingCreates = localCourses.filter(c => c.pendingAction === 'create' && !c.$id);
      
      const mergedCourses = [...serverCourses, ...pendingCreates];
      saveLocalCourses(mergedCourses);
      
      const now = new Date();
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
      setLastSyncTime(now);

      return mergedCourses;
    } catch (error) {
      console.error('Failed to refresh from server:', error);
      return getLocalCourses();
    }
  }, [isOnline, getLocalCourses, saveLocalCourses]);

  // Clear all local data
  const clearLocalData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    setPendingChanges(0);
    setLastSyncTime(null);
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingChanges,
    getLocalCourses,
    saveLocalCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    syncPendingChanges,
    refreshFromServer,
    clearLocalData,
  };
};

// Cache helpers for other data
export const cacheUserProfile = (profile: any) => {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getCachedUserProfile = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const cacheUserSession = (user: any) => {
  localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
};

export const getCachedUserSession = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const cacheScholarships = (scholarships: any[]) => {
  localStorage.setItem(STORAGE_KEYS.SCHOLARSHIPS, JSON.stringify({
    data: scholarships,
    timestamp: Date.now()
  }));
};

export const getCachedScholarships = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCHOLARSHIPS);
    if (!stored) return null;
    const { data, timestamp } = JSON.parse(stored);
    // Cache valid for 1 hour
    if (Date.now() - timestamp > 3600000) return null;
    return data;
  } catch {
    return null;
  }
};

export const cacheMatchedScholarships = (scholarships: any[]) => {
  localStorage.setItem(STORAGE_KEYS.MATCHED_SCHOLARSHIPS, JSON.stringify({
    data: scholarships,
    timestamp: Date.now()
  }));
};

export const getCachedMatchedScholarships = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MATCHED_SCHOLARSHIPS);
    if (!stored) return null;
    const { data, timestamp } = JSON.parse(stored);
    // Cache valid for 1 hour
    if (Date.now() - timestamp > 3600000) return null;
    return data;
  } catch {
    return null;
  }
};

export default useOfflineSync;
