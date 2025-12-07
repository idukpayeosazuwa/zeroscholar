import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

let errors = [];
let warnings = [];
const seenNames = new Set();

data.forEach((scholarship, idx) => {
  const name = scholarship.scholarship_name;
  
  // Check for duplicates
  if (seenNames.has(name)) {
    errors.push(`❌ Duplicate scholarship: "${name}"`);
  }
  seenNames.add(name);
  
  // Check required fields
  if (!scholarship.provider) errors.push(`❌ [${name}] Missing provider`);
  if (!scholarship.deadline) errors.push(`❌ [${name}] Missing deadline`);
  if (!scholarship.tracks || scholarship.tracks.length === 0) {
    errors.push(`❌ [${name}] Missing or empty tracks`);
    return;
  }
  
  scholarship.tracks.forEach((track, tIdx) => {
    const tName = track.track_name || `Track ${tIdx}`;
    
    // Required track fields
    const requiredFields = [
      'track_name', 'required_universities', 'course_category',
      'required_state_of_origin', 'allowed_levels', 'required_gender',
      'required_religion', 'is_disability_specific'
    ];
    
    requiredFields.forEach(field => {
      if (track[field] === undefined) {
        errors.push(`❌ [${name} > ${tName}] Missing field: ${field}`);
      }
    });
    
    // Validate allowed_levels is array of numbers
    if (track.allowed_levels && !Array.isArray(track.allowed_levels)) {
      errors.push(`❌ [${name} > ${tName}] allowed_levels must be array`);
    }
    
    // Validate gender values
    if (track.required_gender && !['M', 'F', 'ANY'].includes(track.required_gender)) {
      errors.push(`❌ [${name} > ${tName}] Invalid gender: ${track.required_gender}`);
    }
    
    // Check specific_requirements exists
    if (!track.specific_requirements) {
      warnings.push(`⚠️ [${name} > ${tName}] Missing specific_requirements (should be [] if empty)`);
    }
  });
});

console.log('\n📋 DATA VALIDATION REPORT\n');
console.log(`Total Scholarships: ${data.length}`);
console.log(`Total Tracks: ${data.reduce((sum, s) => sum + (s.tracks?.length || 0), 0)}`);

if (errors.length === 0) {
  console.log('\n✅ No errors found!\n');
} else {
  console.log(`\n🚨 ${errors.length} ERRORS:\n`);
  errors.forEach(e => console.log(e));
}

if (warnings.length > 0) {
  console.log(`\n⚠️ ${warnings.length} WARNINGS:\n`);
  warnings.forEach(w => console.log(w));
}

console.log('\n✨ Validation complete');
