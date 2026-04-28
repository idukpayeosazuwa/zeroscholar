// COMBINED VERSION: Main logic with all helper functions included

import { Client, Databases, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeDate(dateString) {
  if (!dateString || dateString === 'Not Specified' || dateString === 'Open Deadline') {
    return null;
  }
  
  const cleaned = dateString.replace(/(\d+)(st|nd|rd|th)/g, '$1');
  const date = new Date(cleaned);
  
  return isNaN(date.getTime()) ? null : date;
}

function arrayIncludesCaseInsensitive(arr, value) {
  if (!arr || !value) return false;
  const valueLower = value.toLowerCase();
  return arr.some(item => item?.toLowerCase() === valueLower);
}

function hasAllWildcard(arr) {
  if (!arr || arr.length === 0) return false;
  return arr.some(item => item?.toUpperCase() === 'ALL');
}

function checkTrackMatch(track, userProfile) {
  if (track.allowed_levels?.length > 0) {
    const userLevel = Number(userProfile.level);
    const levelMatch = track.allowed_levels.some(level => Number(level) === userLevel);
    if (!levelMatch) return false;
  }

  if (track.min_cgpa > 0 && userProfile.cgpa < track.min_cgpa) return false;
  if (track.min_jamb_score > 0 && userProfile.jamb < track.min_jamb_score) return false;

  const genderUpper = track.required_gender?.toUpperCase();
  const userGenderUpper = userProfile.gender?.toUpperCase();
  if (track.required_gender && genderUpper !== 'ANY' && genderUpper !== 'ALL' && genderUpper !== userGenderUpper) {
    return false;
  }

  if (track.required_state_of_origin?.length > 0 && !hasAllWildcard(track.required_state_of_origin) &&
      !arrayIncludesCaseInsensitive(track.required_state_of_origin, userProfile.state)) {
    return false;
  }

  if (track.required_lga_list?.length > 0 && !hasAllWildcard(track.required_lga_list) &&
      !arrayIncludesCaseInsensitive(track.required_lga_list, userProfile.lga)) {
    return false;
  }

  if (track.required_universities?.length > 0 && !hasAllWildcard(track.required_universities) &&
      !arrayIncludesCaseInsensitive(track.required_universities, userProfile.uni)) {
    return false;
  }

  if (track.course_category?.length > 0 && !hasAllWildcard(track.course_category) &&
      !arrayIncludesCaseInsensitive(track.course_category, userProfile.course)) {
    return false;
  }

  const religionUpper = track.required_religion?.toUpperCase();
  if (track.required_religion && religionUpper !== 'NONE' && religionUpper !== 'ANY' &&
      religionUpper !== 'ALL' && track.required_religion?.toLowerCase() !== userProfile.rel?.toLowerCase()) {
    return false;
  }

  if (track.is_disability_specific && !userProfile.chal) {
    return false;
  }

  return true;
}

function generateEmailHTML(userName, scholarships) {
  const scholarshipRows = scholarships.map((s, index) => {
    const hasLink = s.official_link && s.official_link.toLowerCase() !== 'none';
    const applyButton = hasLink
      ? `<a href="${s.official_link}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Apply Now →
        </a>`
      : `<span style="display: inline-block; background-color: #6b7280; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Check Requirements on Website
        </span>`;

    return `
    <tr style="background-color: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
          ${s.scholarship_name}
        </h3>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
          <strong>Provider:</strong> ${s.provider}
        </p>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
          <strong>Award:</strong> ${s.award_amount || 'Tuition Support'}
        </p>
        <p style="margin: 0 0 12px 0; color: #ef4444; font-size: 14px;">
          <strong>Deadline:</strong> ${s.deadline}
        </p>
        ${applyButton}
      </td>
    </tr>
  `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎓 New Scholarship Matches!</h1>
              <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">ScholarAI</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937;">Hello ${userName}! 👋</h2>
              <p style="margin: 0 0 16px 0; color: #4b5563;">
                We found <strong>${scholarships.length}</strong> new scholarship${scholarships.length !== 1 ? 's' : ''} for you!
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${scholarshipRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>Good luck with your applications! 🎉</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export default async ({ req, res, log, error }) => {
  try {
    log('🔍 EMAIL NOTIFICATION STARTED');
    
    const CLIENT_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1';
    const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
    const API_KEY = process.env.APPWRITE_API_KEY;
    const DB_ID = process.env.APPWRITE_DATABASE_ID || 'scholarship_db';
    const SCHOLARSHIP_COL_ID = process.env.APPWRITE_SCHOLARSHIP_COLLECTION_ID || 'scholarships';
    const TRACKS_COL_ID = process.env.APPWRITE_TRACKS_COLLECTION_ID || 'eligibility_tracks';
    const USER_COL_ID = process.env.APPWRITE_USER_COLLECTION_ID || 'users';
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
    
    if (!PROJECT_ID || !API_KEY || !GMAIL_USER || !GMAIL_PASS) {
      error('❌ Missing configuration');
      return res.json({ success: false, error: 'Missing config' }, 500);
    }
    
    log('✅ Config validated');

    const client = new Client().setEndpoint(CLIENT_ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
    const databases = new Databases(client);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });
    
    log('✅ Clients initialized');

    // Deactivate expired scholarships
    log('📅 Deactivating expired scholarships...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let deactivatedCount = 0;
    
    const allActiveScholarships = [];
    let offset = 0;
    while (true) {
      const scholarshipsRes = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
        Query.equal('is_active', true),
        Query.limit(100),
        Query.offset(offset)
      ]);
      if (scholarshipsRes.documents.length === 0) break;
      allActiveScholarships.push(...scholarshipsRes.documents);
      if (scholarshipsRes.documents.length < 100) break;
      offset += 100;
    }

    for (const scholarship of allActiveScholarships) {
      if (scholarship.deadline) {
        const deadlineDate = normalizeDate(scholarship.deadline);
        if (deadlineDate && deadlineDate < today) {
          try {
            await databases.updateDocument(DB_ID, SCHOLARSHIP_COL_ID, scholarship.$id, { is_active: false });
            deactivatedCount++;
          } catch (e) {}
        }
      }
    }
    
    log(`✅ Deactivated ${deactivatedCount} scholarships`);

    // Fetch active scholarships
    log('📋 Fetching active scholarships...');
    const activeScholarshipsRes = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
      Query.equal('is_active', true),
      Query.limit(500)
    ]);
    const activeScholarships = activeScholarshipsRes.documents;
    log(`✅ Found ${activeScholarships.length} active scholarships`);

    if (activeScholarships.length === 0) {
      return res.json({ success: true, message: 'No active scholarships', emailsSent: 0 });
    }

    // Fetch all tracks
    log('📚 Fetching tracks...');
    const allTracks = [];
    let trackOffset = 0;
    while (true) {
      const tracksRes = await databases.listDocuments(DB_ID, TRACKS_COL_ID, [
        Query.limit(500),
        Query.offset(trackOffset)
      ]);
      allTracks.push(...tracksRes.documents);
      if (tracksRes.documents.length < 500) break;
      trackOffset += 500;
    }
    log(`✅ Fetched ${allTracks.length} tracks`);

    const activeScholarshipIds = new Set(activeScholarships.map(s => s.$id));
    const relevantTracks = allTracks.filter(track => activeScholarshipIds.has(track.scholarship_id));
    
    const tracksByScholarship = {};
    relevantTracks.forEach(track => {
      if (!tracksByScholarship[track.scholarship_id]) {
        tracksByScholarship[track.scholarship_id] = [];
      }
      tracksByScholarship[track.scholarship_id].push(track);
    });

    // Fetch users
    log('👥 Fetching users...');
    const allUsers = [];
    let userOffset = 0;
    while (true) {
      const usersRes = await databases.listDocuments(DB_ID, USER_COL_ID, [
        Query.limit(100),
        Query.offset(userOffset)
      ]);
      allUsers.push(...usersRes.documents);
      if (usersRes.documents.length < 100) break;
      userOffset += 100;
    }
    log(`✅ Found ${allUsers.length} users`);

    let emailsSent = 0;
    let notifiedUsers = 0;

    // Process users sequentially
    for (const user of allUsers) {
      if (!user.email || !user.uni || !user.course) continue;

      const notifiedIds = user.notified || [];
      const newMatches = [];

      for (const scholarship of activeScholarships) {
        if (notifiedIds.includes(scholarship.$id)) continue;

        const tracks = tracksByScholarship[scholarship.$id] || [];
        const hasMatch = tracks.length === 0 || tracks.some(track => checkTrackMatch(track, user));

        if (hasMatch) newMatches.push(scholarship);
      }

      if (newMatches.length > 0) {
        log(`📨 ${user.email}: ${newMatches.length} matches`);
        
        const matchesToSend = newMatches.slice(0, 10);
        
        try {
          const mailOptions = {
            from: `ScholarAI <${GMAIL_USER}>`,
            to: user.email,
            subject: `🎓 ${matchesToSend.length} New Scholarship Match${matchesToSend.length !== 1 ? 'es' : ''}!`,
            html: generateEmailHTML(user.email.split('@')[0], matchesToSend)
          };
          
          await transporter.sendMail(mailOptions);
          
          const newNotifiedIds = [...notifiedIds, ...matchesToSend.map(s => s.$id)];
          await databases.updateDocument(DB_ID, USER_COL_ID, user.$id, { notified: newNotifiedIds });
          
          emailsSent++;
          notifiedUsers++;
          log(`✅ Email sent to ${user.email}`);
        } catch (emailError) {
          error(`❌ Error for ${user.email}: ${emailError.message}`);
        }
      }
    }

    log(`📊 SUMMARY: ${allUsers.length} users, ${notifiedUsers} notified, ${emailsSent} emails sent`);

    return res.json({
      success: true,
      totalUsers: allUsers.length,
      notifiedUsers,
      emailsSent
    });

  } catch (err) {
    error(`❌ ERROR: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
