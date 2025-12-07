# 📋 ZeroScholar Scholarship Audit Log

> Track extraction accuracy across batches. Note errors, patterns, and fixes.

---

## 📊 Summary Dashboard

| Batch | Page | Total | ✅ Correct | ⚠️ Minor | ❌ Major | Accuracy |
|-------|------|-------|-----------|----------|---------|----------|
| 1     | 1    | 10    | -         | -        | -       | -        |
| 2     | 2    | 10    | -         | -        | -       | -        |
| 3     | 3    | 10    | -         | -        | -       | -        |
| ...   | ...  | ...   | -         | -        | -       | -        |

---

## 🔴 Error Pattern Tracker

| Error Type | Count | Example | Fix Location |
|------------|-------|---------|--------------|
| CGPA > 0 but includes 100L | 0 | - | Validation layer |
| "Admitted" not inferring 100L | 0 | - | LLM prompt |
| Course category wrong | 0 | - | LLM prompt |
| State/LGA missing | 0 | - | LLM prompt |
| Deadline parsing error | 0 | - | Code |
| Wrong track split | 0 | - | LLM prompt |

---

## 📦 Batch 1 (Page 1) - Scholarships 1-10

**Date:** _______________  
**Scraped from:** `https://scholarsworld.ng/nigerian-scholarships/`

### Scholarship 1: _____________________
- **Scholarship ID:** `_______________`
- **Provider:** _______________
- **Tracks:** ___ track(s)

| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| allowed_levels | | | ✅/⚠️/❌ |
| min_cgpa | | | ✅/⚠️/❌ |
| min_jamb_score | | | ✅/⚠️/❌ |
| required_state_of_origin | | | ✅/⚠️/❌ |
| required_lga_list | | | ✅/⚠️/❌ |
| required_universities | | | ✅/⚠️/❌ |
| course_category | | | ✅/⚠️/❌ |
| required_gender | | | ✅/⚠️/❌ |
| is_financial_need_required | | | ✅/⚠️/❌ |
| required_religion | | | ✅/⚠️/❌ |
| is_disability_specific | | | ✅/⚠️/❌ |
| is_aptitude_test_required | | | ✅/⚠️/❌ |

**Notes:** 
- 

**Action:** ✅ Keep / ⚠️ Fix manually / ❌ Delete & re-extract

---

### Scholarship 2: _____________________
- **Scholarship ID:** `_______________`
- **Provider:** _______________
- **Tracks:** ___ track(s)

| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| allowed_levels | | | ✅/⚠️/❌ |
| min_cgpa | | | ✅/⚠️/❌ |
| min_jamb_score | | | ✅/⚠️/❌ |
| required_state_of_origin | | | ✅/⚠️/❌ |
| required_lga_list | | | ✅/⚠️/❌ |
| required_universities | | | ✅/⚠️/❌ |
| course_category | | | ✅/⚠️/❌ |
| required_gender | | | ✅/⚠️/❌ |
| is_financial_need_required | | | ✅/⚠️/❌ |
| required_religion | | | ✅/⚠️/❌ |
| is_disability_specific | | | ✅/⚠️/❌ |
| is_aptitude_test_required | | | ✅/⚠️/❌ |

**Notes:** 
- 

**Action:** ✅ Keep / ⚠️ Fix manually / ❌ Delete & re-extract

---

### Scholarship 3-10: (Copy template above as needed)

---

## 📦 Batch 2 (Page 2) - Scholarships 11-20

**Date:** _______________  
**Scraped from:** `https://scholarsworld.ng/nigerian-scholarships/page/2/`

(Copy scholarship template from Batch 1)

---

## 📝 Notes & Observations

### Batch 1 Findings
- 

### Prompt Improvements Needed
- 

### Validation Rules to Add
- 

---

## ✅ Fixes Applied

| Date | Fix Description | Affected Scholarships | Result |
|------|-----------------|----------------------|--------|
| | | | |

---

## 📌 Quick Reference: Expected Values

### allowed_levels
- `[100]` = Freshers only (needs JAMB, no CGPA)
- `[200, 300, 400, 500]` = Returning students (needs CGPA/transcripts)
- `[100, 200, 300, 400, 500]` = All levels
- `[400, 500]` = Final year only

### course_category
- `ALL` = Open to all courses
- `STEM` = Engineering, Comp Sci, Physics, Math, Geology
- `MED` = Medicine, Nursing, Pharmacy
- `LAW` = Law
- `ARTS` = Humanities, Languages, Mass Comm
- `MGT` = Business, Accounting, Economics
- `EDU` = Education
- `AGRI` = Agriculture
- `ENV` = Architecture, Estate Management
- `SOC` = Social Sciences

### required_gender
- `ANY` = Open to all
- `M` = Male only
- `F` = Female only

### Key Signals for Levels
- "CGPA required" / "Transcripts required" → Returning students (200+)
- "Admission letter" / "JAMB" / "Freshly admitted" → 100L only
- "Final year" → 400/500 only
