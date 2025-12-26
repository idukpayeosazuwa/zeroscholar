import { Client, Databases, Query } from 'node-appwrite';

const DB_ID = 'scholarship_db';
const TRACKS_COL_ID = 'eligibility_tracks';
const SCHOLARSHIP_COL_ID = 'scholarships';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  // Parse user profile from request body
  let user;
  try {
    user = JSON.parse(req.body);
  } catch (e) {
    return res.json({ error: 'Invalid JSON body' }, 400);
  }

  // Validate required fields
  const requiredFields = [
    'gender', 'university_alias', 'course_category', 'state_of_origin',
    'lga_of_origin', 'current_level', 'current_cgpa', 'jamb_score',
    'is_orphan_single_parent'
  ];
  
  for (const field of requiredFields) {
    if (user[field] === undefined) {
      return res.json({ error: `Missing required field: ${field}` }, 400);
    }
  }

  try {
    // Fetch all active tracks with basic numeric filters
    // These are the only filters Appwrite can handle efficiently
    
    // Check if user is 100 Level (they don't have CGPA yet)
    const isUser100Level = user.current_level === 100 || String(user.current_level).includes('100');
    
    // Build queries - skip CGPA filter for 100L students
    const queries = [
      Query.lessThanEqual('min_jamb_score', user.jamb_score),
      Query.limit(500) // Increase if you have more tracks
    ];
    
    // Only add CGPA filter if user is NOT 100 Level
    if (!isUser100Level) {
      queries.unshift(Query.lessThanEqual('min_cgpa', user.current_cgpa));
    }

    const tracksResponse = await databases.listDocuments(DB_ID, TRACKS_COL_ID, queries);
    const allTracks = tracksResponse.documents;

    log(`Fetched ${allTracks.length} tracks for filtering`);

    // Filter tracks in code
    const matchedTracks = [];

    for (const track of allTracks) {
      if (!isTrackMatch(track, user)) continue;
      matchedTracks.push(track);
    }

    log(`${matchedTracks.length} tracks passed all filters`);

    // Group by scholarship and fetch parent details
    const scholarshipIds = [...new Set(matchedTracks.map(t => t.scholarship_id))];
    const results = [];

    for (const scholarshipId of scholarshipIds) {
      try {
        const scholarship = await databases.getDocument(DB_ID, SCHOLARSHIP_COL_ID, scholarshipId);
        
        // Get all matching tracks for this scholarship
        const tracks = matchedTracks
          .filter(t => t.scholarship_id === scholarshipId)
          .map(t => ({
            track_id: t.$id,
            track_name: t.track_name,
            specific_requirements: t.specific_requirements || []
          }));

        results.push({
          scholarship_id: scholarship.$id,
          scholarship_name: scholarship.scholarship_name,
          provider: scholarship.provider,
          deadline: scholarship.deadline,
          official_link: scholarship.official_link,
          is_aptitude_test_required: scholarship.is_aptitude_test_required,
          matched_tracks: tracks
        });
      } catch (e) {
        error(`Failed to fetch scholarship ${scholarshipId}: ${e.message}`);
      }
    }

    return res.json({
      success: true,
      total_matches: results.length,
      matches: results
    });

  } catch (e) {
    error(`Matching failed: ${e.message}`);
    return res.json({ error: 'Internal server error' }, 500);
  }
};

/**
 * Check if a track matches a user profile
 */
function isTrackMatch(track, user) {
  // 1. Gender Check
  if (track.required_gender !== 'ANY' && track.required_gender !== user.gender) {
    return false;
  }

  // 2. Level Check
  if (!track.allowed_levels || !track.allowed_levels.includes(user.current_level)) {
    return false;
  }

  // 3. State of Origin Check
  const stateList = track.required_state_of_origin || [];
  if (!stateList.includes('ALL') && !stateList.map(s => s.toLowerCase()).includes(user.state_of_origin.toLowerCase())) {
    return false;
  }

  // 4. University Check
  const uniList = track.required_universities || [];
  if (!uniList.includes('ALL') && !uniList.map(u => u.toLowerCase()).includes(user.university_alias.toLowerCase())) {
    return false;
  }

  // 5. Course Category Check
  const courseList = track.course_category || [];
  if (!courseList.includes('ALL') && !courseList.map(c => c.toLowerCase()).includes(user.course_category.toLowerCase())) {
    return false;
  }

  // 6. LGA Check (empty array = no restriction)
  const lgaList = track.required_lga_list || [];
  if (lgaList.length > 0 && !lgaList.map(l => l.toLowerCase()).includes(user.lga_of_origin.toLowerCase())) {
    return false;
  }

  // 7. Orphan/Single Parent Check
  if (track.is_orphan_or_single_parent_required === true && user.is_orphan_single_parent !== true) {
    return false;
  }

  // 8. CGPA and JAMB checks
  // SKIP CGPA check for 100 Level students (they don't have CGPA yet)
  const isUser100Level = user.current_level === 100 || String(user.current_level).includes('100');
  if (!isUser100Level && (track.min_cgpa || 0) > user.current_cgpa) {
    return false;
  }
  if ((track.min_jamb_score || 0) > user.jamb_score) {
    return false;
  }

  return true;
}
