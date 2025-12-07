import { Client, Databases, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';

const CLIENT_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '690f7de40013993815c1';
const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';

const DB_ID = 'scholarship_db';
const TRACKS_COL_ID = 'eligibility_tracks';
const SCHOLARSHIP_COL_ID = 'scholarships';

const GMAIL_USER = 'idukpayealex@gmail.com';
const GMAIL_PASS = 'yeop ydwl tqbx csat';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

const client = new Client()
  .setEndpoint(CLIENT_ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Test users
const testUsers = [
  {
    name: "Alex Idukpaye",
    gender: "M",
    current_level: 200,
    current_cgpa: 4.0,
    email:'idukpayealex@gmail.com',
    jamb_score: 265,
    university_alias: "UNILAG",
    course_category: "ENG", // Updated to new code (Engineering)
    state_of_origin: "Lagos",
    lga_of_origin: "Ajegunle",
    is_orphan_single_parent: false,
    religious_affiliation: "Christian",
    is_financially_indigent: false,
    is_physically_challenged: false
  },
  {
    name: "Kwara Student",
    gender: "F",
    current_level: 300,
    current_cgpa: 5.0,
    jamb_score: 285,
    university_alias: "KASU",
    course_category: "SCI", // Updated to new code (Sciences)
    email:'agvictor91@gmail.com',
    state_of_origin: "Kwara", 
    lga_of_origin: "Ilorin",
    religious_affiliation: "Muslim",
    is_financially_indigent: true,
    is_orphan_single_parent: false,
    is_physically_challenged: false
  },
  {
    name: "Female STEM Scholar",
    gender: "F",
    current_level: 300,
    current_cgpa: 4.8,
    email:'zuwaidukpaye@gmail.com',
    jamb_score: 275,
    university_alias: "OAU",
    course_category: "ENG", // Updated to new code (Engineering)
    state_of_origin: "Edo",
    lga_of_origin: "Benin City",
    religious_affiliation: "Muslim",
    is_financially_indigent: false,
    is_orphan_single_parent: true,
    is_physically_challenged: true
  }
];

function isTrackMatch(track, user) {
  // Gender check
  if (track.required_gender !== 'ANY' && track.required_gender !== user.gender) return false;
  
  // Level check
  if (!track.allowed_levels?.includes(user.current_level)) return false;
  
  // State check
  const stateList = track.required_state_of_origin || [];
  // FIX: If list is empty [], treat as ALL. Only filter if list has items AND doesn't contain ALL.
  if (stateList.length > 0 && !stateList.includes('ALL') && !stateList.map(s => s.toLowerCase()).includes(user.state_of_origin.toLowerCase())) return false;

  // University check
  const uniList = track.required_universities || [];
  // FIX: If list is empty [], treat as ALL.
  if (uniList.length > 0 && !uniList.includes('ALL') && !uniList.map(u => u.toLowerCase()).includes(user.university_alias.toLowerCase())) return false;

  // Course category check (Robust Array Matching)
  const courseList = track.course_category || [];
  // FIX: If list is empty [], treat as ALL.
  if (courseList.length > 0 && !courseList.includes('ALL') && !courseList.map(c => c.toLowerCase()).includes(user.course_category.toLowerCase())) return false;

  // LGA check (empty = no restriction)
  const lgaList = track.required_lga_list || [];
  if (lgaList.length > 0 && !lgaList.map(l => l.toLowerCase()).includes(user.lga_of_origin.toLowerCase())) return false;

  // Orphan/Single parent check
  if (track.is_orphan_or_single_parent_required === true && user.is_orphan_single_parent !== true) return false;
  
  // Financial need check
  if (track.is_financial_need_required === true && user.is_financially_indigent !== true) return false;
  
  // Religion check (NONE means open to all)
  const requiredReligion = track.required_religion || 'NONE';
  if (requiredReligion !== 'NONE' && requiredReligion.toLowerCase() !== user.religious_affiliation?.toLowerCase()) return false;
  
  // Disability check
  if (track.is_disability_specific === true && user.is_physically_challenged !== true) return false;

  // Academic checks
  if ((track.min_cgpa || 0) > user.current_cgpa) return false;
  if ((track.min_jamb_score || 0) > user.jamb_score) return false;

  return true;
}

async function sendMatchEmail(user, matches) {
  if (matches.length === 0) return;

  const emailSubject = `🎉 You have ${matches.length} New Scholarship Matches!`;
  
  let emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Hello ${user.name},</h2>
      <p>We found <strong>${matches.length} scholarships</strong> that match your profile!</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
  `;

  for (const match of matches) {
    emailBody += `
      <div style="margin-bottom: 25px; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #2980b9;">${match.scholarship.scholarship_name}</h3>
        <p style="margin: 5px 0;"><strong>📅 Deadline:</strong> ${match.scholarship.deadline || 'Not Specified'}</p>
        <p style="margin: 5px 0;"><strong>🔗 Link:</strong> <a href="${match.scholarship.official_link}" target="_blank">Apply Here</a></p>
        <div style="margin-top: 10px;">
          <strong>✅ Matched Tracks:</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${match.tracks.map(t => `<li>${t.track_name}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  emailBody += `
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #7f8c8d; font-size: 12px;">ZeroScholar - Your Scholarship Matching Engine</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"ZeroScholar" <${GMAIL_USER}>`,
      to: user.email,
      subject: emailSubject,
      html: emailBody
    });
    console.log(`   📧 Email sent to ${user.email}`);
  } catch (error) {
    console.error(`   ❌ Failed to send email to ${user.email}:`, error.message);
  }
}

async function findMatchesForUser(user) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔎 Matching: ${user.name}`);
  console.log(`   Level: ${user.current_level} | State: ${user.state_of_origin} | CGPA: ${user.current_cgpa}`);
  console.log(`   Uni: ${user.university_alias} | Course: ${user.course_category} | Gender: ${user.gender}`);

  const queries = [
    Query.lessThanEqual('min_cgpa', user.current_cgpa),
    Query.lessThanEqual('min_jamb_score', user.jamb_score),
    Query.limit(500)
  ];

  const { documents: tracks } = await databases.listDocuments(DB_ID, TRACKS_COL_ID, queries);
  const matchedTracks = tracks.filter(t => isTrackMatch(t, user));

  const scholarshipIds = [...new Set(matchedTracks.map(t => t.scholarship_id))];
  
  if (scholarshipIds.length === 0) {
    console.log(`   ❌ No matches found.`);
    return;
  }

  console.log(`   ✅ Found ${matchedTracks.length} tracks across ${scholarshipIds.length} scholarships:\n`);

  const aggregatedMatches = [];

  for (const id of scholarshipIds) {
    const scholarship = await databases.getDocument(DB_ID, SCHOLARSHIP_COL_ID, id);
    const userTracks = matchedTracks.filter(t => t.scholarship_id === id);
    
    console.log(`   🌟 ${scholarship.scholarship_name}`);
    userTracks.forEach(t => console.log(`      └─ ${t.track_name}`));

    aggregatedMatches.push({
      scholarship: scholarship,
      tracks: userTracks
    });
  }

  await sendMatchEmail(user, aggregatedMatches);
}

async function runTests() {
  console.log('🚀 Starting Scholarship Matching Test\n');
  for (const user of testUsers) {
    await findMatchesForUser(user);
  }
  console.log(`\n${'='.repeat(60)}`);
  console.log('✨ Testing Complete');
}

runTests().catch(console.error);
