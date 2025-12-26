import { UserProfile } from '../types';

interface EligibilityRules {
  minCGPA?: number;
  levels?: string[];
  courseCategories?: string[];
  gender?: "Male" | "Female" | "All";
  states?: string[];
  universities?: string[];
  ageLimit?: number;
  otherRequirements?: string[];
}

export function matchScholarshipToUser(
  scholarship: any,
  userProfile: UserProfile
): { matches: boolean; matchScore: number; reasons: string[] } {
  
  let matchScore = 100;
  const reasons: string[] = [];
  
  try {
    // Filter out closed scholarships completely
    if (scholarship.status === 'Closed') {
      return { matches: false, matchScore: 0, reasons: ['❌ Applications closed'] };
    }
    
    // Parse eligibility rules from JSON
    const rules: EligibilityRules = scholarship.eligibilityRules 
      ? JSON.parse(scholarship.eligibilityRules)
      : {};
    
    // Helper function to check if value is "All X"
    const isAllInclusive = (arr: string[] | undefined) => {
      return arr && (
        arr.includes('All') || 
        arr.includes('All Levels') || 
        arr.includes('All Courses') || 
        arr.includes('All States') ||
        arr.includes('All Universities')
      );
    };
    
    // 1. Check CGPA (STRICT)
    if (rules.minCGPA) {
      const userCGPA = userProfile.cgpa || 3.5;
      if (userCGPA < rules.minCGPA) {
        matchScore -= 50;
        reasons.push(`❌ Requires CGPA ${rules.minCGPA} (you have ${userCGPA})`);
      } else {
        reasons.push(`✅ CGPA requirement met (${rules.minCGPA})`);
      }
    }
    
    // 2. Check Level (STRICT - must be exact match or "All Levels")
    if (rules.levels && !isAllInclusive(rules.levels)) {
      const userLevel = userProfile.level;
      if (!rules.levels.includes(userLevel)) {
        matchScore -= 50;
        reasons.push(`❌ For ${rules.levels.join(', ')} only (you're ${userLevel})`);
      } else {
        reasons.push(`✅ Level requirement met (${userLevel})`);
      }
    }
    
    // 3. Check Course Category (STRICT - must be exact match or "All Courses")
    if (rules.courseCategories && !isAllInclusive(rules.courseCategories)) {
      const userCourse = userProfile.course;
      if (userCourse && !rules.courseCategories.includes(userCourse)) {
        matchScore -= 50;
        reasons.push(`❌ For ${rules.courseCategories.join(', ')} only (you're ${userCourse})`);
      } else if (userCourse) {
        reasons.push(`✅ Course requirement met (${userCourse})`);
      }
    }
    
    // 4. Check Gender (STRICT - must match or "All")
    if (rules.gender && rules.gender !== 'All') {
      const userGender = userProfile.gender;
      if (userGender && userGender !== rules.gender) {
        matchScore -= 50;
        reasons.push(`❌ For ${rules.gender} applicants only (you're ${userGender})`);
      } else if (userGender) {
        reasons.push(`✅ Gender requirement met`);
      }
    }
    
    // 5. Check State (STRICT - must match or "All States")
    if (rules.states && !isAllInclusive(rules.states)) {
      const userState = userProfile.state;
      if (userState && !rules.states.includes(userState)) {
        matchScore -= 50;
        reasons.push(`❌ For ${rules.states.join(', ')} residents only (you're from ${userState})`);
      } else if (userState) {
        reasons.push(`✅ State requirement met (${userState})`);
      }
    }
    
    // 6. Check University (STRICT - must match or "All Universities")
    if (rules.universities && !isAllInclusive(rules.universities)) {
      const userUniversity = userProfile.university;
      if (userUniversity && !rules.universities.includes(userUniversity)) {
        matchScore -= 50;
        reasons.push(`❌ For specific universities only (not ${userUniversity})`);
      } else if (userUniversity) {
        reasons.push(`✅ University requirement met`);
      }
    }
    
    // 7. Status bonuses
    if (scholarship.status === 'Open') {
      matchScore += 20;
      reasons.push('✅ Currently accepting applications');
    } else if (scholarship.status === 'Upcoming') {
      matchScore += 10;
      reasons.push('📅 Opening soon');
    }
    
    // STRICT THRESHOLD: Must score at least 50 to be shown
    const matches = matchScore >= 50;
    
    return { matches, matchScore, reasons };
    
  } catch (error) {
    console.error('Error matching scholarship:', error);
    // If parsing fails, don't show the scholarship (strict mode)
    return { matches: false, matchScore: 0, reasons: ['⚠️ Unable to verify eligibility'] };
  }
}

export function sortScholarshipsByRelevance(
  scholarships: any[],
  userProfile: UserProfile
): any[] {
  return scholarships
    .map(scholarship => ({
      ...scholarship,
      matchData: matchScholarshipToUser(scholarship, userProfile)
    }))
    .filter(s => s.matchData.matches) // Only show scholarships with score >= 50
    .sort((a, b) => b.matchData.matchScore - a.matchData.matchScore); // Sort by score descending
}
