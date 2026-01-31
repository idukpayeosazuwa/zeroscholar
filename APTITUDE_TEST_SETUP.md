# Aptitude Test Feature - Setup Complete ✅

## What's Been Built

### 1. Infrastructure
- ✅ **Recharts** installed for chart visualization
- ✅ **Type definitions** added to `types.ts`
- ✅ **Data structure** created in `data/aptitude/`
- ✅ **Validation script** to check data integrity

### 2. Components Created

**ChartRenderer.tsx**
- Renders tables, bar charts, pie charts, line charts
- Responsive design with Recharts
- Supports annotations and labels
- Mobile-friendly with overflow handling

**NumericalQuestionCard.tsx**
- Interactive question display
- Multiple choice answer selection
- Immediate feedback (correct/incorrect)
- Expandable explanation section
- Visual indicators (✓/✗)

**AptitudeTestPreview.tsx**
- Full test interface with progress tracking
- Score calculation and percentage display
- Completion summary with performance feedback

### 3. Current Status
- ✅ 10 numerical questions converted and validated
- ✅ Preview page available at: `http://localhost:3000/test/preview`
- ✅ Build successful (bundle size: 822KB, gzipped: 236KB)

## Testing the Questions

**Visit**: `http://localhost:3000/test/preview`

You'll see:
- All 10 numerical questions
- Tables and bar charts rendering correctly
- Interactive answer selection
- Instant feedback and explanations
- Progress tracking at the top

## Next Steps for Conversion

### For Next 90 Numerical Questions:

1. **Batch Processing** (10 questions at a time):
   ```
   Upload 10 PDF pages to GPT-5.2 Vision
   Use this prompt:
   
   "Extract these numerical reasoning questions to JSON following this exact format:
   {
     "id": "num_XXX",
     "question": "[exact question text]",
     "chartConfig": {
       "type": "table|bar|pie|line|clustered-bar",
       ...data structure...
     },
     "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
     "correctAnswer": "X",
     "explanation": "[step by step solution]"
   }"
   ```

2. **Copy-paste** the JSON output into `data/aptitude/numerical.json` (append to array)

3. **Validate**:
   ```bash
   npm run validate-aptitude  # (we can add this script)
   ```

4. **Test**: Visit preview page and check rendering

### For Abstract Questions (100):

**Option A: Image-based (Quickest)**
1. Extract images from PDF
2. Save as WebP format (optimized)
3. Store in `public/aptitude/abstract/`
4. Reference in JSON:
   ```json
   {
     "id": "abs_001",
     "question": "Which shape comes next?",
     "imageUrl": "/aptitude/abstract/q001.webp",
     "options": ["A", "B", "C", "D", "E"],
     "correctAnswer": "C"
   }
   ```

**Option B: Programmatic SVG** (if shapes are simple):
- Create reusable shape components
- Define patterns in JSON
- Render dynamically

### For Verbal Questions (100):

1. Text extraction is easiest - use GPT-5.2:
   ```json
   {
     "id": "ver_001",
     "passage": "[reading passage if any]",
     "question": "[question text]",
     "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
     "correctAnswer": "B",
     "explanation": "[optional]"
   }
   ```

2. Pure text - no visualization needed
3. Can batch 20-30 at once

## Estimated Timeline

| Task | Time | Notes |
|------|------|-------|
| Remaining 90 numerical | 6-8 hours | 10-15 per hour with GPT |
| 100 abstract | 4-6 hours | Image extraction + JSON |
| 100 verbal | 3-4 hours | Pure text, fastest |
| Testing & fixes | 2-3 hours | Spot-check rendering |
| **Total** | **15-21 hours** | ~2-3 focused days |

## Files Structure

```
data/aptitude/
  ├── numerical.json         # 100 questions (currently 10 ✅)
  ├── abstract.json          # 100 questions (todo)
  └── verbal.json            # 100 questions (todo)

public/aptitude/abstract/
  └── *.webp                 # Abstract reasoning images

components/
  ├── ChartRenderer.tsx      # ✅ Complete
  ├── NumericalQuestionCard.tsx  # ✅ Complete
  ├── AbstractQuestionCard.tsx   # todo
  └── VerbalQuestionCard.tsx     # todo

pages/
  └── AptitudeTestPreview.tsx    # ✅ Preview page
```

## Bundle Impact

- Recharts: ~40KB (added)
- Question JSON: ~100KB total (all 300 questions)
- Abstract images: ~500KB-1MB (if using images)
- **Total addition**: ~600KB-1.1MB

With lazy loading, can reduce initial bundle.

## Quality Tips

1. **Consistency**: Keep option format identical (A), B), C), etc.)
2. **Validation**: Run validation script after each batch
3. **Cross-check**: Use Gemini to verify GPT extractions on complex charts
4. **Test early**: Preview after first 20 of each category
5. **Backup**: Keep original PDFs as source of truth

## What Works Right Now

Visit `http://localhost:3000/test/preview` and you'll see:
- ✅ Tables rendering perfectly
- ✅ Bar charts with proper axes and labels
- ✅ Annotations displaying below charts
- ✅ Answer selection working
- ✅ Immediate feedback with explanations
- ✅ Mobile-responsive design
- ✅ Score tracking

**Ready to convert the remaining 290 questions!** 🚀

Would you like me to create placeholder files for abstract and verbal, or start converting more numerical questions together?
