# CGPA Calculator - Database Planning

## Overview
The CGPA calculator requires storing course grades for each user and supporting different grading scales. This document outlines the database structure and workflow.

---

## Option 1: Separate Collections (Recommended)

### Collection 1: `GradingScales` (System-wide or User-specific)
**Purpose**: Store grading system configurations for flexibility

```
{
  "$id": "unique-scale-id",
  "name": "Standard Nigerian (5-Point)",
  "description": "Default grading scale used by most Nigerian universities",
  "createdBy": "system", // or "user-id" for custom scales
  "isDefault": true,
  "gradePoints": {
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2,
    "E": 1,
    "F": 0
  },
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

**Attributes to create:**
- `name` (String) - Name of the grading scale
- `description` (String) - Description
- `createdBy` (String) - User ID or "system"
- `isDefault` (Boolean) - Is this the default scale?
- `gradePoints` (JSON/Map) - Grade → Point mapping
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

### Collection 2: `UserCourses` (One document per course per user)
**Purpose**: Store individual course grades for CGPA calculation

```
{
  "$id": "unique-course-entry-id",
  "userId": "user-id-from-users-collection",
  "courseCode": "CSC101", // e.g., "ENG201", "MED103"
  "courseName": "Introduction to Programming",
  "creditUnits": 3,
  "grade": "A",
  "gradePoint": 5, // automatically calculated from grade
  "gradingScaleId": "reference-to-grading-scale",
  "semester": "1", // Semester 1, 2, etc.
  "academicYear": "2023/2024",
  "courseLevel": "100", // or "200", "300", "400" for 100-level, 200-level, etc.
  "status": "completed", // "in-progress", "completed", "dropped"
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

**Attributes to create:**
- `userId` (String) - Link to Users collection
- `courseCode` (String) - Course code (e.g., CSC101)
- `courseName` (String) - Course name
- `creditUnits` (Integer) - Credit units for the course
- `grade` (String) - Letter grade (A, B, C, D, E, F)
- `gradePoint` (Float) - Numeric grade point (auto-calculated)
- `gradingScaleId` (String) - Reference to GradingScales collection
- `semester` (String) - Which semester
- `academicYear` (String) - Academic year
- `courseLevel` (String) - Course level (100, 200, 300, 400)
- `status` (String) - Course status
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Indexes** (for performance):
- `userId` (for fetching all courses for a user)
- `userId + academicYear` (for calculating CGPA by year)

---

## Option 2: Single Collection (Simpler Alternative)

If you want to keep it simpler with just one collection:

### Collection: `UserCourses`
```
{
  "$id": "unique-course-entry-id",
  "userId": "user-id",
  "courseCode": "CSC101",
  "courseName": "Introduction to Programming",
  "creditUnits": 3,
  "grade": "A",
  "gradingScale": { // Embed the scale
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2,
    "E": 1,
    "F": 0
  },
  "gradePoint": 5,
  "semester": "1",
  "academicYear": "2023/2024",
  "courseLevel": "100",
  "status": "completed",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

**Pros**: Simpler, all data in one place
**Cons**: Redundant grading scale data, harder to change scales globally

---

## CGPA Calculation Logic

### Formula
```
CGPA = Σ(Grade Point × Credit Units) / Σ(Credit Units)
```

### Example
```
Course 1: A (5 points) × 3 units = 15
Course 2: B (4 points) × 4 units = 16
Course 3: C (3 points) × 2 units = 6

CGPA = (15 + 16 + 6) / (3 + 4 + 2) = 37 / 9 = 4.11
```

### Calculation Scope Options
1. **Cumulative CGPA**: All courses across all semesters/years
2. **Semester CGPA**: Only courses in a specific semester
3. **Year CGPA**: Only courses in a specific academic year
4. **Level CGPA**: Only courses at a specific level (100, 200, etc.)

---

## Implementation Workflow

### Step 1: Add Courses
User enters:
- Course Code
- Course Name
- Credit Units
- Grade (dropdown: A, B, C, D, E, F)
- Semester
- Academic Year
- Course Level (100, 200, 300, 400)

### Step 2: Calculate Grade Point
When user selects grade → fetch grading scale → get corresponding points

### Step 3: Store in Database
Save to `UserCourses` collection

### Step 4: Calculate CGPA
- Fetch all courses for user (or filtered by semester/year)
- Calculate using formula
- Display to user
- Store in `Users` collection (optional, for quick access)

### Step 5: Update Auth Form
Use calculated CGPA in scholarship matching instead of manual input

---

## Updates to Users Collection

Add to existing `Users` collection:
```
{
  ...existing fields...,
  "cgpaHistory": [
    {
      "calculatedAt": timestamp,
      "cgpa": 4.11,
      "basedOnCourses": 15, // number of courses
      "academicYear": "2023/2024"
    }
  ],
  "lastCalculatedCGPA": 4.11,
  "lastCGPAUpdateTime": timestamp
}
```

**New attributes:**
- `cgpaHistory` (Array of Objects) - Track CGPA calculations over time
- `lastCalculatedCGPA` (Float) - Most recent CGPA
- `lastCGPAUpdateTime` (DateTime) - When it was last calculated

---

## Grading Scale Presets

Pre-populate `GradingScales` with common systems:

### Standard (Default)
```json
{
  "A": 5,
  "B": 4,
  "C": 3,
  "D": 2,
  "E": 1,
  "F": 0
}
```

### 4-Point Scale
```json
{
  "A": 4.0,
  "B": 3.0,
  "C": 2.0,
  "D": 1.0,
  "F": 0
}
```

### Custom (User-defined)
Allow users to create their own grading scales

---

## UI/UX Flow

### Page: CGPA Calculator

#### Tab 1: Add Courses
- Form to add courses
- Table showing added courses
- Real-time CGPA calculation

#### Tab 2: Course History
- List all saved courses
- Edit/Delete options
- Filter by semester/year

#### Tab 3: CGPA Trends (Optional)
- Chart showing CGPA over semesters/years
- Export data

---

## Summary

**Recommended: Option 1 (Two Collections)**
- Provides flexibility for different grading scales
- Scalable for future enhancements
- Reduces data redundancy
- Better performance with indexing

**Next Steps:**
1. Create `GradingScales` collection in Appwrite
2. Create `UserCourses` collection in Appwrite
3. Build `CGPACalculator.tsx` component
4. Add utility function for CGPA calculation
5. Integrate with Auth form for scholarship matching
