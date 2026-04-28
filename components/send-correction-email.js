// CORRECTION EMAIL SCRIPT
// Sends updated application link to users who were notified about a specific scholarship
// Run with: node send-correction-email.js

import { Client, Databases, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '/workspaces/zeroscholar/components/.env' });

const SCHOLARSHIP_ID = '693abae1002d3f9651ea';

async function main() {
  console.log('📧 CORRECTION EMAIL SCRIPT');
  console.log('==========================\n');
  
  const CLIENT_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1';
  const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
  const API_KEY = process.env.APPWRITE_API_KEY;
  const DB_ID = process.env.APPWRITE_DATABASE_ID || 'scholarship_db';
  const SCHOLARSHIP_COL_ID = process.env.APPWRITE_SCHOLARSHIP_COLLECTION_ID || 'scholarships';
  const USER_COL_ID = process.env.APPWRITE_USER_COLLECTION_ID || 'users';
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
  const SMTP_SECURE = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.toLowerCase() === 'true'
    : SMTP_PORT === 465;
  
  if (!PROJECT_ID || !API_KEY || !GMAIL_USER || !GMAIL_PASS) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const client = new Client().setEndpoint(CLIENT_ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
  const databases = new Databases(client);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: GMAIL_USER, pass: GMAIL_PASS }
  });

  // Fetch the scholarship details
  console.log('Fetching scholarship details...');
  const scholarship = await databases.getDocument(DB_ID, SCHOLARSHIP_COL_ID, SCHOLARSHIP_ID);
  console.log(`Scholarship: ${scholarship.scholarship_name}`);
  console.log(`Provider: ${scholarship.provider}`);
  console.log(`Link: ${scholarship.official_link}`);
  console.log(`Deadline: ${scholarship.deadline}\n`);

  // Fetch all users
  console.log('Fetching users...');
  const allUsers = [];
  let offset = 0;
  while (true) {
    const usersRes = await databases.listDocuments(DB_ID, USER_COL_ID, [
      Query.limit(100),
      Query.offset(offset)
    ]);
    allUsers.push(...usersRes.documents);
    if (usersRes.documents.length < 100) break;
    offset += 100;
  }

  // Filter users who were notified about this scholarship
  const affectedUsers = allUsers.filter(user => 
    user.email && user.notified && user.notified.includes(SCHOLARSHIP_ID)
  );

  console.log(`Total users: ${allUsers.length}`);
  console.log(`Affected users: ${affectedUsers.length}\n`);

  if (affectedUsers.length === 0) {
    console.log('No users to notify. Exiting.');
    return;
  }

  // Generate email HTML
  const generateHTML = (userName) => `
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
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Updated Application Link</h1>
              <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">ScholarAI</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px 0; color: #4b5563;">
                Hi ${userName},
              </p>
              <p style="margin: 0 0 24px 0; color: #4b5563;">
                Here's the direct application link for <strong>${scholarship.scholarship_name}</strong>:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">
                      ${scholarship.scholarship_name}
                    </h3>
                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                      <strong>Provider:</strong> ${scholarship.provider}
                    </p>
                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                      <strong>Award:</strong> ${scholarship.award_amount || 'Tuition Support'}
                    </p>
                    <p style="margin: 0 0 16px 0; color: #ef4444; font-size: 14px;">
                      <strong>Deadline:</strong> ${scholarship.deadline}
                    </p>
                    <a href="${scholarship.official_link}" 
                       style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                      Apply Now
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Good luck with your application!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0;">ScholarAI - Find scholarships that match you</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Send emails
  let emailsSent = 0;
  for (const user of affectedUsers) {
    const userName = user.email.split('@')[0];
    
    try {
      await transporter.sendMail({
        from: `ScholarAI <${GMAIL_USER}>`,
        to: user.email,
        subject: `New Application Link for ${scholarship.scholarship_name}`,
        html: generateHTML(userName)
      });
      emailsSent++;
      console.log(`Sent to ${user.email}`);
    } catch (err) {
      console.error(`Failed for ${user.email}: ${err.message}`);
    }
  }

  console.log(`\nDone! Sent ${emailsSent}/${affectedUsers.length} emails.`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
