// ═══════════════════════════════════════════════════════════════════════════
// EMAIL NOTIFICATION CRON JOB
// ═══════════════════════════════════════════════════════════════════════════
// Purpose: Send personalized scholarship match notifications to users
// Frequency: Run daily or weekly
// 
// Features:
// - Fetches all users with complete profiles
// - Matches active scholarships against each user's eligibility
// - Sends email digest with new matches only
// - Updates user's 'notified' array to prevent duplicate notifications
// - Deactivates scholarships past their deadline
// ═══════════════════════════════════════════════════════════════════════════

import { Client, Databases, Query, ID } from 'node-appwrite';
import nodemailer from 'nodemailer';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CLIENT_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '690f7de40013993815c1';
const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';

const DB_ID = 'scholarship_db';
const SCHOLARSHIP_COL_ID = 'scholarships';
const TRACKS_COL_ID = 'eligibility_tracks';
const USER_COL_ID = 'users';

const GMAIL_USER = 'idukpayealex@gmail.com';
const GMAIL_PASS = 'yeop ydwl tqbx csat';

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE APPWRITE
// ═══════════════════════════════════════════════════════════════════════════

const client = new Client()
  .setEndpoint(CLIENT_ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL TRANSPORTER
// ═══════════════════════════════════════════════════════════════════════════

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DEACTIVATE EXPIRED SCHOLARSHIPS
// ═══════════════════════════════════════════════════════════════════════════

async function deactivateExpiredScholarships() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let deactivatedCount = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const scholarshipsRes = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
      Query.equal('is_active', true),
      Query.limit(limit),
      Query.offset(offset)
    ]);

    if (scholarshipsRes.documents.length === 0) break;

    for (const scholarship of scholarshipsRes.documents) {
      if (!scholarship.deadline) continue;

      const deadlineDate = new Date(scholarship.deadline);
      deadlineDate.setHours(23, 59, 59, 999);

      if (deadlineDate < today) {
        try {
          await databases.updateDocument(DB_ID, SCHOLARSHIP_COL_ID, scholarship.$id, {
            is_active: false
          });
          deactivatedCount++;
        } catch (error) {
          // Silent fail for individual scholarship updates
        }
      }
    }

    if (scholarshipsRes.documents.length < limit) break;
    offset += limit;
  }

  return deactivatedCount;
}

// ═══════════════════════════════════════════════════════════════════════════
// MATCHING LOGIC
// ═══════════════════════════════════════════════════════════════════════════

function checkTrackMatch(track, userProfile) {
  if (track.allowed_levels?.length > 0 && !track.allowed_levels.includes(userProfile.level)) {
    return false;
  }

  const isUser100Level = userProfile.level === 100 || String(userProfile.level).includes('100');
  if (!isUser100Level && track.min_cgpa > 0 && userProfile.cgpa < track.min_cgpa) {
    return false;
  }

  if (track.min_jamb_score > 0 && userProfile.jamb < track.min_jamb_score) {
    return false;
  }

  if (track.required_gender && track.required_gender !== 'ANY' && track.required_gender !== userProfile.gender) {
    return false;
  }

  if (track.required_state_of_origin?.length > 0 && 
      !track.required_state_of_origin.includes('ALL') &&
      !track.required_state_of_origin.includes(userProfile.state)) {
    return false;
  }

  if (track.required_lga_list?.length > 0 && 
      !track.required_lga_list.includes(userProfile.lga)) {
    return false;
  }

  if (track.required_universities?.length > 0 && 
      !track.required_universities.includes('ALL') &&
      !track.required_universities.includes(userProfile.uni)) {
    return false;
  }

  if (track.course_category?.length > 0 && 
      !track.course_category.includes('ALL') &&
      !track.course_category.includes(userProfile.course)) {
    return false;
  }

  if (track.required_religion && track.required_religion !== 'NONE' && track.required_religion !== userProfile.rel) {
    return false;
  }

  if (track.is_financial_need_required && !userProfile.finance) {
    return false;
  }

  if (track.is_orphan_or_single_parent_required && !userProfile.orphan) {
    return false;
  }

  if (track.is_disability_specific && !userProfile.chal) {
    return false;
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

function generateEmailHTML(userName, scholarships) {
  const scholarshipRows = scholarships.map((s, index) => `
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
        <a href="${s.official_link}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Apply Now →
        </a>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎓 New Scholarship Matches!
              </h1>
              <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">
                ScholarAI - Your Personal Scholarship Finder
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                Hello ${userName}! 👋
              </h2>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Great news! We found <strong>${scholarships.length}</strong> new scholarship${scholarships.length !== 1 ? 's' : ''} 
                that match your profile. These opportunities are currently active and accepting applications.
              </p>
            </td>
          </tr>

          <!-- Scholarships -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${scholarshipRows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                Don't miss out on these opportunities! Apply before the deadline.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                You're receiving this email because you signed up for ZeroScholar scholarship notifications.
              </p>
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

// ═══════════════════════════════════════════════════════════════════════════
// SEND EMAIL FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function sendScholarshipEmail(userEmail, userName, scholarships) {
  const mailOptions = {
    from: `ZeroScholar <${GMAIL_USER}>`,
    to: userEmail,
    subject: `🎓 ${scholarships.length} New Scholarship Match${scholarships.length !== 1 ? 'es' : ''} for You!`,
    html: generateEmailHTML(userName, scholarships)
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN NOTIFICATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function runEmailNotifications() {
  let totalUsers = 0;
  let notifiedUsers = 0;
  let emailsSent = 0;

  try {
    // STEP 0: Deactivate expired scholarships
    await deactivateExpiredScholarships();

    // STEP 1: Fetch all active scholarships with their tracks
    const scholarshipsRes = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
      Query.equal('is_active', true),
      Query.limit(500)
    ]);

    const activeScholarships = scholarshipsRes.documents;

    if (activeScholarships.length === 0) {
      return;
    }

    // Fetch all tracks for active scholarships
    const scholarshipIds = activeScholarships.map(s => s.$id);
    const tracksRes = await databases.listDocuments(DB_ID, TRACKS_COL_ID, [
      Query.equal('scholarship_id', scholarshipIds),
      Query.limit(5000)
    ]);

    const allTracks = tracksRes.documents;

    // Group tracks by scholarship
    const tracksByScholarship = {};
    allTracks.forEach(track => {
      if (!tracksByScholarship[track.scholarship_id]) {
        tracksByScholarship[track.scholarship_id] = [];
      }
      tracksByScholarship[track.scholarship_id].push(track);
    });

    // STEP 2: Fetch all users
    let allUsers = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const usersRes = await databases.listDocuments(DB_ID, USER_COL_ID, [
        Query.limit(limit),
        Query.offset(offset)
      ]);

      allUsers = allUsers.concat(usersRes.documents);
      
      if (usersRes.documents.length < limit) break;
      offset += limit;
    }

    totalUsers = allUsers.length;

    // STEP 3: Process each user
    for (const user of allUsers) {
      if (!user.email || !user.uni || !user.course) {
        continue;
      }

      const notifiedIds = user.notified || [];
      const newMatches = [];

      for (const scholarship of activeScholarships) {
        if (notifiedIds.includes(scholarship.$id)) {
          continue;
        }

        const tracks = tracksByScholarship[scholarship.$id] || [];
        const hasMatch = tracks.some(track => checkTrackMatch(track, user));

        if (hasMatch) {
          newMatches.push(scholarship);
        }
      }

      if (newMatches.length > 0) {
        const emailSent = await sendScholarshipEmail(
          user.email,
          user.email.split('@')[0],
          newMatches
        );

        if (emailSent) {
          const newNotifiedIds = [...notifiedIds, ...newMatches.map(s => s.$id)];
          
          try {
            await databases.updateDocument(DB_ID, USER_COL_ID, user.$id, {
              notified: newNotifiedIds
            });
            emailsSent++;
            notifiedUsers++;
          } catch (updateError) {
            // Silent fail
          }
        }
      }
    }

  } catch (error) {
    // Silent fail
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════

runEmailNotifications()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    process.exit(1);
  });
