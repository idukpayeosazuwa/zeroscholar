import numericalQuestions from '../data/aptitude/numerical.json';
import { NumericalQuestion } from '../types';

console.log('🔍 Validating Aptitude Test Data...\n');

let errorCount = 0;

(numericalQuestions as NumericalQuestion[]).forEach((q, idx) => {
  const questionNum = idx + 1;
  
  // Check required fields
  if (!q.id) {
    console.error(`❌ Question ${questionNum}: Missing ID`);
    errorCount++;
  }
  
  if (!q.question || q.question.trim().length === 0) {
    console.error(`❌ Question ${questionNum} (${q.id}): Missing or empty question text`);
    errorCount++;
  }
  
  if (!q.options || q.options.length !== 5) {
    console.error(`❌ Question ${questionNum} (${q.id}): Should have exactly 5 options, has ${q.options?.length || 0}`);
    errorCount++;
  }
  
  if (!q.correctAnswer) {
    console.error(`❌ Question ${questionNum} (${q.id}): Missing correct answer`);
    errorCount++;
  }
  
  // Validate chartConfig
  if (!q.chartConfig || !q.chartConfig.type) {
    console.error(`❌ Question ${questionNum} (${q.id}): Missing or invalid chartConfig`);
    errorCount++;
  } else {
    const config = q.chartConfig;
    
    if (config.type === 'table') {
      if (!config.headers || config.headers.length === 0) {
        console.error(`❌ Question ${questionNum} (${q.id}): Table missing headers`);
        errorCount++;
      }
      if (!config.rows || config.rows.length === 0) {
        console.error(`❌ Question ${questionNum} (${q.id}): Table missing rows`);
        errorCount++;
      }
      // Check row consistency
      if (config.rows && config.headers) {
        config.rows.forEach((row, rowIdx) => {
          if (row.length !== config.headers.length) {
            console.error(`❌ Question ${questionNum} (${q.id}): Row ${rowIdx + 1} has ${row.length} cells but ${config.headers.length} headers`);
            errorCount++;
          }
        });
      }
    } else {
      // Bar, pie, line charts
      if (!config.data || !config.data.labels || !config.data.datasets) {
        console.error(`❌ Question ${questionNum} (${q.id}): Chart missing data structure`);
        errorCount++;
      } else {
        const { labels, datasets } = config.data;
        
        datasets.forEach((dataset, dsIdx) => {
          if (dataset.values.length !== labels.length) {
            console.error(`❌ Question ${questionNum} (${q.id}): Dataset ${dsIdx} has ${dataset.values.length} values but ${labels.length} labels`);
            errorCount++;
          }
        });
      }
    }
  }
  
  // Check answer is valid option letter
  if (q.correctAnswer && q.options) {
    const answerExists = q.options.some(opt => opt.startsWith(q.correctAnswer));
    if (!answerExists) {
      console.error(`❌ Question ${questionNum} (${q.id}): Correct answer "${q.correctAnswer}" not found in options`);
      errorCount++;
    }
  }
});

console.log('\n' + '='.repeat(50));
if (errorCount === 0) {
  console.log('✅ All questions validated successfully!');
  console.log(`📊 Total questions: ${numericalQuestions.length}`);
} else {
  console.log(`❌ Validation failed with ${errorCount} error(s)`);
  process.exit(1);
}
