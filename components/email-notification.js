// STANDALONE EMAIL NOTIFICATION SCRIPT
// Run with: node email-notification.js

import { Client, Databases, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '/workspaces/zeroscholar/components/.env' });

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Remove emojis from text to avoid spam filters
 */
function removeEmojis(text) {
  if (!text) return text;
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{2300}-\u{23FF}]|[\u{2000}-\u{206F}]|[\u{3000}-\u{303F}]/gu, '').trim();
}

/**
 * Clear notified array for all users to reset and prevent stale records
 */
async function clearAllNotifiedArrays(databases, DB_ID, USER_COL_ID) {
  try {
    console.log('🧹 Clearing notified arrays for all users...');
    let clearedCount = 0;
    let offset = 0;

    while (true) {
      const usersRes = await databases.listDocuments(DB_ID, USER_COL_ID, [
        Query.limit(100),
        Query.offset(offset)
      ]);

      if (usersRes.documents.length === 0) break;

      for (const user of usersRes.documents) {
        if (user.notified && user.notified.length > 0) {
          try {
            await databases.updateDocument(DB_ID, USER_COL_ID, user.$id, { notified: [] });
            clearedCount++;
          } catch (e) {
            console.error(`Failed to clear notified for ${user.$id}: ${e.message}`);
          }
        }
      }

      if (usersRes.documents.length < 100) break;
      offset += 100;
    }

    console.log(`✅ Cleared notified arrays for ${clearedCount} users`);
  } catch (err) {
    console.error(`❌ Error clearing notified arrays: ${err.message}`);
  }
}

/**
 * Queue-based email sender for rate limiting (50 emails per minute)
 */
async function sendEmailBatch(emailQueue, transporter, databases, DB_ID, USER_COL_ID) {
  const EMAILS_PER_MINUTE = 50;
  const MS_BETWEEN_EMAILS = (60 * 1000) / EMAILS_PER_MINUTE; // ~1200ms between emails

  let emailsSent = 0;
  let notifiedUsers = 0;

  for (const emailData of emailQueue) {
    try {
      const { user, matchesToSend, GMAIL_USER } = emailData;

      const mailOptions = {
        from: `ScholarAI <${GMAIL_USER}>`,
        to: user.email,
        subject: removeEmojis(`New Scholarship Matches - ${matchesToSend.length} Opportunity${matchesToSend.length !== 1 ? 's' : ''}`),
        html: generateEmailHTML(user.email.split('@')[0], matchesToSend),
        headers: {
          // Anti-spam headers
          'List-Unsubscribe': `<mailto:${GMAIL_USER}?subject=unsubscribe>`,
          'X-Mailer': 'ScholarAI Notification System',
          'X-Priority': '3',
          'Importance': 'Normal',
          'X-MSMail-Priority': 'Normal'
        }
      };

      await transporter.sendMail(mailOptions);

      const notifiedIds = user.notified || [];
      const newNotifiedIds = [...notifiedIds, ...matchesToSend.map(s => s.$id)];
      await databases.updateDocument(DB_ID, USER_COL_ID, user.$id, { notified: newNotifiedIds });

      emailsSent++;
      notifiedUsers++;
      console.log(`✅ Email sent to ${user.email} (${emailsSent} of ${emailQueue.length})`);

      // Rate limiting: wait between emails for 50/min
      if (emailsSent < emailQueue.length) {
        await new Promise(resolve => setTimeout(resolve, MS_BETWEEN_EMAILS));
      }

    } catch (emailError) {
      console.error(`❌ Error sending email: ${emailError.message}`);
    }
  }

  return { emailsSent, notifiedUsers };
}

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
          Apply Now
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">New Scholarship Matches</h1>
              <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">ScholarAI - Scholarship Finder</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937;">Hello ${userName},</h2>
              <p style="margin: 0 0 16px 0; color: #4b5563;">
                We found <strong>${scholarships.length}</strong> scholarship opportunity${scholarships.length !== 1 ? 'ies' : ''} matching your profile.
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
              <p>Best of luck with your applications. We hope this helps you achieve your educational goals.</p>
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

async function main() {
  try {
    console.log('EMAIL NOTIFICATION STARTED');
    
    const CLIENT_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1';
    const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
    const API_KEY = process.env.APPWRITE_API_KEY;
    const DB_ID = process.env.APPWRITE_DATABASE_ID || 'scholarship_db';
    const SCHOLARSHIP_COL_ID = process.env.APPWRITE_SCHOLARSHIP_COLLECTION_ID || 'scholarships';
    const TRACKS_COL_ID = process.env.APPWRITE_TRACKS_COLLECTION_ID || 'eligibility_tracks';
    const USER_COL_ID = process.env.APPWRITE_USER_COLLECTION_ID || 'users';
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT =  465;
    const SMTP_SECURE = 'true'
    
    if (!PROJECT_ID || !API_KEY || !GMAIL_USER || !GMAIL_PASS) {
      console.error('❌ Missing configuration');
      console.error('Required env vars: APPWRITE_PROJECT_ID, APPWRITE_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD');
      process.exit(1);
    }
    
    console.log('Config validated');

    const client = new Client().setEndpoint(CLIENT_ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
    const databases = new Databases(client);
    const transporter = nodemailer.createTransport({
      host:  "smtp.gmail.com",
      port: 465,
      secure: 'true',
      auth: { user: 'zuwaidukpaye@gmail.com', pass: 'ajuu oswi lifc iqpy' }
    });
    
    console.log('Clients initialized');

    // Optional: Clear notified arrays (set to true to reset)
    const CLEAR_NOTIFIED_ARRAYS = process.env.CLEAR_NOTIFIED_ARRAYS === 'true' ? true : false;
    if (CLEAR_NOTIFIED_ARRAYS) {
      await clearAllNotifiedArrays(databases, DB_ID, USER_COL_ID);
    }

    // Deactivate expired scholarships
    console.log('Deactivating expired scholarships...');
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
          } catch (e) {
            console.error(`Failed to deactivate ${scholarship.$id}: ${e.message}`);
          }
        }
      }
    }
    
    console.log(`Deactivated ${deactivatedCount} scholarships`);

    // Fetch active scholarships
    console.log('Fetching active scholarships...');
    const activeScholarshipsRes = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
      Query.equal('is_active', true),
      Query.limit(500)
    ]);
    const activeScholarships = activeScholarshipsRes.documents;
    console.log(`Found ${activeScholarships.length} active scholarships`);

    if (activeScholarships.length === 0) {
      console.log('No active scholarships found. Exiting.');
      return;
    }

    // Fetch all tracks
    console.log('Fetching tracks...');
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
    console.log(`Fetched ${allTracks.length} tracks`);

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
    console.log('Fetching users...');
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
    console.log(`Found ${allUsers.length} users`);

    // Build email queue with rate limiting (50 per minute)
    const emailQueue = [];

    // Process users to find matches
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
        console.log(`Found matches for ${user.email}: ${newMatches.length} scholarships`);
        
        const matchesToSend = newMatches.slice(0, 10);
        emailQueue.push({
          user,
          matchesToSend,
          GMAIL_USER
        });
      }
    }

    console.log(`Email queue prepared: ${emailQueue.length} users to notify`);

    // Send emails with rate limiting (50 per minute)
    if (emailQueue.length > 0) {
      console.log('Starting email batch sending at 50 emails per minute...');
      const { emailsSent, notifiedUsers } = await sendEmailBatch(emailQueue, transporter, databases, DB_ID, USER_COL_ID);
      
      console.log(`SUMMARY: ${allUsers.length} users processed, ${notifiedUsers} notified, ${emailsSent} emails sent`);
    } else {
      console.log('No users to notify.');
    }

  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
