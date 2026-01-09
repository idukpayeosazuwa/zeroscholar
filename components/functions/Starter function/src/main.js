// SLIM VERSION: Main logic only, helpers imported

import { Client, Databases, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';
import { normalizeDate, checkTrackMatch, generateEmailHTML } from './helpers.js';

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
