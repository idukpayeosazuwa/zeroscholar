/**
 * CGPA Calculator Constants
 * Defines grading scales and grade point mappings
 */

export const GRADE_SCALES = {
  "5-point": {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0
  },
  "4-point": {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    E: 0.5,
    F: 0
  }
} as const;

export type ScaleType = keyof typeof GRADE_SCALES;
export type GradeType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const DEFAULT_SCALE: ScaleType = "5-point";
export const AVAILABLE_GRADES: GradeType[] = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Get grade point based on scale type and grade
 */
export const getGradePoint = (grade: GradeType, scaleType: ScaleType): number => {
  return GRADE_SCALES[scaleType][grade];
};

/**
 * Calculate CGPA
 * CGPA = Σ(Grade Point × Credit Units) / Σ(Credit Units)
 */
export interface CourseData {
  gradePoint: number;
  creditUnits: number;
}

export const calculateCGPA = (courses: CourseData[]): number => {
  if (courses.length === 0) return 0;

  const totalGradePoints = courses.reduce(
    (sum, course) => sum + course.gradePoint * course.creditUnits,
    0
  );

  const totalCreditUnits = courses.reduce(
    (sum, course) => sum + course.creditUnits,
    0
  );

  if (totalCreditUnits === 0) return 0;

  return parseFloat((totalGradePoints / totalCreditUnits).toFixed(2));
};
