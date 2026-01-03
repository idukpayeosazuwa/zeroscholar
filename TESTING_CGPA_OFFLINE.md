# Quick Start: Testing CGPA Prefill & Offline Mode

## 🚀 How to Test

### 1. Test CGPA Prefill
```
1. Open the app and navigate to Tools → CGPA Calculator
2. Switch to "Add Course" tab (if not already there)
3. Look for the blue banner: "Prefill 100L Courses"
4. Click "📚 Prefill Semester 1" button
   ✓ Should add 6 courses: MTH101, PHY101, CHM101, PHY107, GST111, GST112
   ✓ All with grade A and appropriate credit units
   ✓ Should auto-switch to "My Courses" tab
   ✓ Should auto-scroll to show courses
5. Verify courses appear in "My Courses" tab
6. Click "📚 Prefill Semester 2" button to add 5 more courses
```

### 2. Test Inline Credit Unit Editing
```
1. In "My Courses" tab, view any course card
2. Click the ✏️ (Edit) icon on any course
3. Look for credit units dropdown to appear
4. Select a different value (1, 2, or 3)
5. Click "✓ Save" button
   ✓ Course should update instantly
   ✓ GPA should recalculate
   ✓ Inline editor should close
6. Try clicking "✕ Cancel" to verify it reverts changes
```

### 3. Test Offline Mode
```
1. Open DevTools (F12) → Network tab
2. Check "Offline" checkbox (in Network tab)
3. App should show yellow banner at top: "📡 You're offline"
4. Navigate to Edit Profile
   ✓ Should show orange warning: "You're Offline"
   ✓ Save button should show: "Come Online to Save"
   ✓ Save button should be disabled
5. Go to Scholarship Finder
   ✓ Click "Matched Scholarships" tab
   ✓ Should show blue message: "Come Online to see latest matched scholarships"
6. Go to CGPA Calculator
   ✓ Should work normally (fully functional offline)
   ✓ Can add/edit courses offline
7. Uncheck "Offline" in Network tab
   ✓ Yellow banner disappears
   ✓ Edit Profile button re-enables
   ✓ Offline messages disappear
```

## 📋 Files Changed

| File | Changes |
|------|---------|
| CGPACalculator.tsx | ✅ Prefill button, inline editing |
| App.tsx | ✅ Offline banner, pass isOnline prop |
| ScholarshipFinder.tsx | ✅ Offline message, isOnline prop |
| EditProfile.tsx | ✅ Offline warning, disable save |
| OfflineBanner.tsx | ✅ NEW - Offline indicator |
| cgpaPrefill.ts | ✅ Already exists - prefill data |

## ✨ Key Features

### Prefill Functionality
- ✅ Two buttons: Prefill Semester 1, Prefill Semester 2
- ✅ Auto-fill with correct courses and credit units
- ✅ Auto-switch to My Courses tab
- ✅ Auto-scroll to My Courses section
- ✅ Uses grade 'A' for all prefilled courses

### Inline Editing
- ✅ Edit icon on every course card
- ✅ Dropdown selector for credit units (1, 2, 3 only)
- ✅ Save/Cancel buttons appear inline
- ✅ Works in all view modes (Semester, Level, Cumulative)
- ✅ GPA recalculates instantly on save

### Offline Mode
- ✅ Yellow banner shows "You're offline"
- ✅ Profile edits blocked with explanation
- ✅ Scholarship matching shows "Come Online" message
- ✅ CGPA Calculator works offline
- ✅ Automatic re-enable when back online

## 🐛 Troubleshooting

**Issue:** Prefill button not showing
- Check that you're on "Add Course" tab in CGPA Calculator
- Clear browser cache and reload

**Issue:** Inline editor not appearing
- Click the ✏️ icon, not the entire course card
- Make sure you're in "My Courses" tab

**Issue:** Offline banner not showing
- Use DevTools Network → check "Offline"
- Or disconnect internet physically

**Issue:** Changes not saving offline
- This is expected - profile changes require internet
- Edit Profile is intentionally disabled offline
- CGPA changes are stored locally and sync on reconnect

## 📱 Mobile Testing

Same tests work on mobile:
1. Use browser DevTools Offline mode
2. Or use device Developer Options to disable data
3. All inline editors work on touch devices
4. Prefill buttons work on small screens (responsive)

## 🎯 Success Criteria

- [ ] Prefill adds correct courses
- [ ] Inline editing works for credit units
- [ ] GPA updates after inline saves
- [ ] Offline banner appears when disconnected
- [ ] Edit Profile blocked when offline
- [ ] Scholarships show offline message
- [ ] CGPA works fully offline
- [ ] Everything re-enables when reconnected

---

Need to test something specific? Check the full implementation guide:
[CGPA_OFFLINE_IMPLEMENTATION.md](./CGPA_OFFLINE_IMPLEMENTATION.md)
