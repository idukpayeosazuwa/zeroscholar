// Pre-filled courses for 100L (Science disciplines)
import { getGradePoint } from '../utils/cgpaConstants';
import type { GradeType, ScaleType } from '../utils/cgpaConstants';

export const PREFILL_COURSES_100L = {
  semester1: [
    { courseCode: 'MTH101', creditUnits: 2 },
    { courseCode: 'PHY101', creditUnits: 2 },
    { courseCode: 'CHM101', creditUnits: 2 },
    { courseCode: 'PHY107', creditUnits: 1 },
    { courseCode: 'GST111', creditUnits: 2 },
    { courseCode: 'GST112', creditUnits: 2 },
  ],
  semester2: [
    { courseCode: 'MTH102', creditUnits: 2 },
    { courseCode: 'PHY102', creditUnits: 2 },
    { courseCode: 'CHM102', creditUnits: 2 },
    { courseCode: 'PHY108', creditUnits: 1 },
    { courseCode: 'CHEM108', creditUnits: 2 },
  ],
};

// Helper to create course object from template
export const createCourseFromTemplate = (
  template: { courseCode: string; creditUnits: number },
  semester: string,
  defaultGrade: GradeType = 'A',
  defaultScale: ScaleType = '5-point'
) => {
  const gradePoint = getGradePoint(defaultGrade, defaultScale);
  return {
    courseCode: template.courseCode,
    creditUnits: template.creditUnits,
    grade: defaultGrade,
    gradePoint: gradePoint,
    scaleType: defaultScale,
    semester: semester,
    courseLevel: '100',
    localId: `${template.courseCode}-${Date.now()}`,
  };
};
