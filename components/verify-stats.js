import { Client, Databases, Query } from 'node-appwrite';

const CLIENT_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '690f7de40013993815c1';
const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';

const DB_ID = 'scholarship_db';
const TRACKS_COL_ID = 'eligibility_tracks';
const SCHOLARSHIP_COL_ID = 'scholarships';

const client = new Client()
  .setEndpoint(CLIENT_ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function fetchAllDocuments(collectionId) {
  let allDocs = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(DB_ID, collectionId, [
      Query.limit(limit),
      Query.offset(offset)
    ]);
    allDocs = allDocs.concat(response.documents);
    if (response.documents.length < limit) break;
    offset += limit;
  }
  return allDocs;
}

async function generateStats() {
  console.log('🚀 Generating Verification Stats...\n');

  // 1. Fetch Data
  const scholarships = await fetchAllDocuments(SCHOLARSHIP_COL_ID);
  const tracks = await fetchAllDocuments(TRACKS_COL_ID);

  // Map scholarship ID to Name for easy lookup
  const scholarshipMap = new Map();
  scholarships.forEach(s => scholarshipMap.set(s.$id, s.scholarship_name));

  // 2. Initialize Counters & Lists
  const stats = {
    totalTracks: tracks.length,
    financialNeedFalse: 0,
    disabilityFalse: 0,
    allCourses: 0,
    allUniversities: 0,
    allLocations: 0, // State + LGA
    allGender: 0,
    fullyOpen: 0, // New stat for completely unrestricted tracks
    fullyOpenList: [], // List to store names of fully open tracks
    
    // Money Stats
    totalMoney: 0,
    countMoney: 0,
    countSupport: 0,

    // Drill-down lists (Name + Track Name)
    restrictedFinancial: [],
    restrictedDisability: [],
    restrictedCourses: [],
    restrictedUniversities: [],
    restrictedLocations: [],
    restrictedGender: []
  };

  // Helper to parse currency
  const parseCurrency = (str) => {
    if (!str) return 0;
    // Remove commas
    const clean = str.replace(/,/g, '').trim();
    // Regex for Currency+Number (e.g. N300000, $500, ₦150000)
    // Matches optional non-digit prefix, then digits
    const match = clean.match(/^([^\d\s]+)?\s*(\d+(\.\d+)?)$/);
    if (match) {
        return parseFloat(match[2]);
    }
    return 0;
  };

  // Analyze Scholarships for Money (Parent Level)
  for (const s of scholarships) {
      const val = parseCurrency(s.award_amount);
      if (val > 0) {
          stats.totalMoney += val;
          stats.countMoney++;
      } else {
          stats.countSupport++;
      }
  }

  // 3. Analyze Tracks
  for (const track of tracks) {
    const scholarshipName = scholarshipMap.get(track.scholarship_id) || 'Unknown Scholarship';
    const label = `[${scholarshipName}] - ${track.track_name}`;

    let isFinancialOpen = false;
    let isDisabilityOpen = false;
    let isUniOpen = false;
    let isLocationOpen = false;
    let isGenderOpen = false;

    // Financial Need
    if (track.is_financial_need_required !== true) {
      stats.financialNeedFalse++;
      isFinancialOpen = true;
    } else {
      stats.restrictedFinancial.push(label);
    }

    // Disability
    if (track.is_disability_specific !== true) {
      stats.disabilityFalse++;
      isDisabilityOpen = true;
    } else {
      stats.restrictedDisability.push(label);
    }

    // Courses (Empty or ALL)
    const courses = track.course_category || [];
    if (courses.length === 0 || courses.includes('ALL')) {
      stats.allCourses++;
    } else {
      stats.restrictedCourses.push(`${label} (${courses.join(', ')})`);
    }

    // Universities (Empty or ALL)
    const unis = track.required_universities || [];
    if (unis.length === 0 || unis.includes('ALL')) {
      stats.allUniversities++;
      isUniOpen = true;
    } else {
      stats.restrictedUniversities.push(`${label} (${unis.join(', ')})`);
    }

    // Locations (State & LGA)
    const states = track.required_state_of_origin || [];
    const lgas = track.required_lga_list || [];
    const isStateOpenCheck = states.length === 0 || states.includes('ALL');
    const isLgaOpenCheck = lgas.length === 0;

    if (isStateOpenCheck && isLgaOpenCheck) {
      stats.allLocations++;
      isLocationOpen = true;
    } else {
      const restrictions = [];
      if (!isStateOpenCheck) restrictions.push(`States: ${states.join(', ')}`);
      if (!isLgaOpenCheck) restrictions.push(`LGAs: ${lgas.join(', ')}`);
      stats.restrictedLocations.push(`${label} (${restrictions.join(' | ')})`);
    }

    // Gender
    if (track.required_gender === 'ANY' || !track.required_gender) {
      stats.allGender++;
      isGenderOpen = true;
    } else {
      stats.restrictedGender.push(`${label} (${track.required_gender})`);
    }

    // Check for "Fully Open" (excluding course restrictions, based on your prompt)
    // Prompt asked for: all unis, all gender, financial need false, disability false, all locations
    if (isFinancialOpen && isDisabilityOpen && isUniOpen && isLocationOpen && isGenderOpen) {
        stats.fullyOpen++;
        stats.fullyOpenList.push(label);
    }
  }

  // 4. Output Results
  console.log(`📊 STATS SUMMARY (Total Tracks: ${stats.totalTracks})`);
  console.log('='.repeat(60));

  console.log(`\n💸 FINANCIAL VALUE (Across ${scholarships.length} Scholarships)`);
  console.log(`   • Total Calculable: ₦${stats.totalMoney.toLocaleString()}`);
  console.log(`   • Cash Awards:      ${stats.countMoney}`);
  console.log(`   • Other Support:    ${stats.countSupport}`);
  
  console.log(`\n🌟 FULLY OPEN (No Financial/Disability/Uni/Location/Gender restrictions): ${stats.fullyOpen} (${((stats.fullyOpen/stats.totalTracks)*100).toFixed(1)}%)`);
  
  console.log(`\n💰 Financial Need NOT Required: ${stats.financialNeedFalse} (${((stats.financialNeedFalse/stats.totalTracks)*100).toFixed(1)}%)`);
  console.log(`♿ Disability NOT Required:     ${stats.disabilityFalse} (${((stats.disabilityFalse/stats.totalTracks)*100).toFixed(1)}%)`);
  console.log(`📚 Open to ALL Courses:         ${stats.allCourses} (${((stats.allCourses/stats.totalTracks)*100).toFixed(1)}%)`);
  console.log(`🏫 Open to ALL Universities:    ${stats.allUniversities} (${((stats.allUniversities/stats.totalTracks)*100).toFixed(1)}%)`);
  console.log(`🌍 Open to ALL Locations:       ${stats.allLocations} (${((stats.allLocations/stats.totalTracks)*100).toFixed(1)}%)`);
  console.log(`⚧️  Open to ANY Gender:          ${stats.allGender} (${((stats.allGender/stats.totalTracks)*100).toFixed(1)}%)`);

  console.log(`\n\n🔍 DRILL-DOWN: FULLY OPEN SCHOLARSHIPS (No Restrictions)`);
  console.log('='.repeat(60));
  stats.fullyOpenList.forEach(s => console.log(`   - ${s}`));

  /* 
  // Commenting out restricted drill-downs as requested
  console.log(`\n\n🔍 DRILL-DOWN: RESTRICTED SCHOLARSHIPS (Verify these!)`);
  console.log('='.repeat(60));

  console.log(`\n💰 REQUIRES FINANCIAL NEED (${stats.restrictedFinancial.length}):`);
  stats.restrictedFinancial.forEach(s => console.log(`   - ${s}`));

  console.log(`\n♿ DISABILITY SPECIFIC (${stats.restrictedDisability.length}):`);
  stats.restrictedDisability.forEach(s => console.log(`   - ${s}`));

  console.log(`\n⚧️  GENDER RESTRICTED (${stats.restrictedGender.length}):`);
  stats.restrictedGender.forEach(s => console.log(`   - ${s}`));

  console.log(`\n📚 COURSE RESTRICTED (${stats.restrictedCourses.length}):`);
  stats.restrictedCourses.slice(0, 20).forEach(s => console.log(`   - ${s}`));
  if (stats.restrictedCourses.length > 20) console.log(`   ... and ${stats.restrictedCourses.length - 20} more`);

  console.log(`\n🏫 UNIVERSITY RESTRICTED (${stats.restrictedUniversities.length}):`);
  stats.restrictedUniversities.forEach(s => console.log(`   - ${s}`));

  console.log(`\n🌍 LOCATION RESTRICTED (${stats.restrictedLocations.length}):`);
  stats.restrictedLocations.slice(0, 20).forEach(s => console.log(`   - ${s}`));
  if (stats.restrictedLocations.length > 20) console.log(`   ... and ${stats.restrictedLocations.length - 20} more`);
  */
}

generateStats().catch(console.error);
