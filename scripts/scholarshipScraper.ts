import { Client, Databases } from 'node-appwrite';
import * as cheerio from 'cheerio';
import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ID } from 'node-appwrite';

const APPWRITE_API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';
const GMAIL_USER = 'idukpayealex@gmail.com';
const GMAIL_PASS = 'yeop ydwl tqbx csat';
const GEMINI_API_KEY = 'AIzaSyBWUCQdn_c3889aDZg2byga-OqExPKucAA'; // Add your Gemini API key
const DATABASE_ID = '690f7e600037897da65f';
const SCHOLARSHIPS_COLLECTION_ID = 'eveything';
const USERS_COLLECTION_ID = 'users';

// Initialize Appwrite client with API key for server-side operations
const serverClient = new Client();
serverClient
  .setEndpoint('https://sfo.cloud.appwrite.io/v1')
  .setProject('690f7de40013993815c1')
  .setKey(APPWRITE_API_KEY);

const serverDatabases = new Databases(serverClient);

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

interface ScholarshipUpdate {
  id: string;
  title: string;
  oldDeadline: string;
  newDeadline: string;
  oldStartDate?: string;
  newStartDate?: string;
  link: string;
  status: string;
}

interface ScholarshipOpening {
  id: string;
  title: string;
  startDate: string;
  deadline: string;
  link: string;
  daysUntilDeadline: number;
}

interface ExtractedScholarshipData {
  isForNigerianUndergraduates: boolean;
  title: string;
  deadline: string;
  startDate: string;
  eligibilityRules: {
    minCGPA?: number;
    levels?: string[]; // e.g., ["200L", "300L"]
    courseCategories?: string[]; // e.g., ["Engineering", "Sciences"]
    gender?: "Male" | "Female" | "All";
    states?: string[]; // e.g., ["Lagos", "Ogun"] or ["All"]
    universities?: string[];
    ageLimit?: number;
    otherRequirements?: string[];
  };
  benefits: string;
  applicationMode: string;
  provider: string;
  officialLink: string;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Scrape scholarships from aggregator site with AI extraction
async function scrapeAggregatorSite(): Promise<Map<string, ExtractedScholarshipData>> {
  const scholarshipMap = new Map();
  
  try {
    console.log('Fetching scholarships from scholarsworld.ng...');
    const response = await fetch('https://scholarsworld.ng/nigerian-scholarships/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find all scholarship cards using the correct class
    const scholarshipCards = $('.grid-base-post').toArray();
    console.log(`Found ${scholarshipCards.length} scholarship cards\n`);
    
    // Limit to 10 cards (first page only)
    for (const card of scholarshipCards.slice(0, 10)) {
      try {
        // Get the title and link from each card
        const titleElement = $(card).find('h2 a, h3 a, .entry-title a').first();
        const title = titleElement.text().trim();
        const detailLink = titleElement.attr('href');
        
        if (!title || !detailLink) {
          console.log('  ✗ Skipping card - no title or link found');
          continue;
        }
        
        console.log(`\n📄 Processing: ${title}`);
        console.log(`   Link: ${detailLink}`);
        
        // Visit the detail page
        await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limit: 3 seconds for API calls
        
        const detailResponse = await fetch(detailLink, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const detailHtml = await detailResponse.text();
        const $detail = cheerio.load(detailHtml);
        
        // Extract ONLY from .post-content-wrap using TEXT (not HTML) for precision
        const contentWrap = $detail('.post-content-wrap');
        let extractionText = '';
        
        if (contentWrap.length > 0) {
          extractionText = contentWrap.text(); // Use .text() instead of .html()
          console.log(`   📍 Found .post-content-wrap (${extractionText.length} chars)`);
        } else {
          // Fallback to body if .post-content-wrap not found
          extractionText = $detail('body').text();
          console.log(`   ⚠️  .post-content-wrap not found, using body text`);
        }
        
        // Use Gemini AI to extract structured data
        console.log(`   🤖 Extracting data with Gemini AI...`);
        const extractedData = await extractScholarshipDataWithAI(extractionText, detailLink, title);
        
        if (extractedData) {
          scholarshipMap.set(extractedData.title, extractedData);
          console.log(`   ✓ Extracted successfully`);
          console.log(`   ✓ Deadline: ${extractedData.deadline}`);
          console.log(`   ✓ Min CGPA: ${extractedData.eligibilityRules.minCGPA || 'Not specified'}`);
          console.log(`   ✓ Levels: ${JSON.stringify(extractedData.eligibilityRules) } ` );
        }
        
      } catch (error: any) {
        console.error(`   ✗ Error processing card: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Successfully extracted ${scholarshipMap.size} Nigerian undergraduate scholarships\n`);
    
  } catch (error: any) {
    console.error('Error scraping aggregator site:', error.message);
  }
  
  return scholarshipMap;
}

// Use Gemini to extract scholarship information from TEXT
async function extractScholarshipDataWithAI(text2: string, url: string, pageTitle: string): Promise<ExtractedScholarshipData | null> {
  try {
    const prompt = `
You are a scholarship information extraction expert. Analyze the following TEXT content from a scholarship webpage's main content area (.post-content-wrap) and extract structured information.

**Important:** Only extract information for scholarships that are:
1. Available to Nigerian students
2. For undergraduate students (100L to 500L)
3. NOT for postgraduate, masters, PhD, or international students only

URL: ${url}
Page Title: ${pageTitle}

TEXT Content from .post-content-wrap:
${text2.substring(0, 10000)}

Extract the following information in JSON format:

{
  "isForNigerianUndergraduates": boolean, // true only if explicitly for Nigerian undergraduates
  "title": string,
  "deadline": string, // Format: "15th December 2025" or "31st March 2025"
  "startDate": string, // When application opens
  "eligibilityRules": {
    "minCGPA": number, // Minimum CGPA required (e.g., 3.5)
    "levels": string[], // e.g., ["200L", "300L", "400L"] or ["All Levels"]
    "courseCategories": string[], // e.g., ["Engineering", "Sciences", "All Courses"]
    "gender": "Male" | "Female" | "All",
    "states": string[], // Nigerian states eligible, or ["All States"]
    "universities": string[], // Specific universities, or ["All Universities"]
    "ageLimit": number, // Maximum age if specified
    "otherRequirements": string[] // Any other specific requirements
  },
  "benefits": string, // Amount and what it covers
  "applicationMode": string, // "Online Application", "Aptitude Test Required", etc.
  "provider": string,
  "officialLink": string
}

**Rules:**
- Set isForNigerianUndergraduates to false if scholarship is for:
  - International students only
  - Postgraduate/Masters/PhD only
  - Non-Nigerian citizens
- Extract exact dates in readable format
- Be specific about eligibility rules
- Extract benefits and application mode
- Display the minimun Levels as 100L, 200L, 300L for  first year, second year, third year respectively
- If a scholarship is open to all levels, use ["All Levels"]
- If a scholarship says Complete academic transcripts from 100 level, meaning first year not eligble but 200L and above are eligible
- If information is not found, use null or empty array
- For nationwide scholarships, use ["All States"]
- For all courses, use ["All Courses"]
- Look for eligibility criteria, requirements, and structured information

Return ONLY valid JSON, no markdown or explanations.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const data: ExtractedScholarshipData = JSON.parse(jsonText);
    
    // Validate that it's for Nigerian undergraduates
    if (!data.isForNigerianUndergraduates) {
      console.log(`   ⚠️  NOT for Nigerian undergraduates - skipping`);
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.error(`   ✗ Gemini extraction error: ${error.message}`);
    return null;
  }
}

// Helper function to parse deadline string into Date object
function parseDeadlineDate(deadlineStr: string): Date | null {
  try {
    // Remove ordinal suffixes (st, nd, rd, th)
    const cleaned = deadlineStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
    
    // Try to parse the date
    const date = new Date(cleaned);
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Fallback: try extracting month and year manually
    const monthMatch = deadlineStr.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
    const yearMatch = deadlineStr.match(/\d{4}/);
    const dayMatch = deadlineStr.match(/\d{1,2}/);
    
    if (monthMatch && yearMatch && dayMatch) {
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const month = monthNames.indexOf(monthMatch[0].toLowerCase());
      const year = parseInt(yearMatch[0]);
      const day = parseInt(dayMatch[0]);
      
      return new Date(year, month, day);
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Fuzzy match scholarship titles
function fuzzyMatch(str1: string, str2: string): boolean {
  const normalize = (s: string) => s.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/scholarship/g, '')
    .replace(/award/g, '')
    .replace(/programme/g, '')
    .replace(/program/g, '');
  
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  // Check if one contains significant portion of the other
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Check word overlap (at least 40% of words match)
  const words1 = s1.split(' ').filter(w => w.length > 3);
  const words2 = s2.split(' ').filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return false;
  
  const matchCount = words1.filter(word => s2.includes(word)).length;
  const threshold = Math.min(words1.length, words2.length) * 0.4;
  
  return matchCount >= threshold;
}

// Calculate status from dates
function calculateStatus(startDate: string, deadline: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const deadlineDate = parseDeadlineDate(deadline);
  const startDateParsed = parseDeadlineDate(startDate);
  
  if (!deadlineDate) return 'Closed';
  
  const daysUntilDeadline = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (startDateParsed) {
    const daysUntilStart = Math.floor((startDateParsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart > 0) return 'Upcoming';
    if (daysUntilDeadline >= 0) return 'Open';
    return 'Closed';
  }
  
  if (daysUntilDeadline > 30) return 'Upcoming';
  if (daysUntilDeadline >= 0) return 'Open';
  return 'Closed';
}

// Update scholarships in database and track changes
async function updateScholarships(): Promise<{ updates: ScholarshipUpdate[], openings: ScholarshipOpening[], newScholarships: number }> {
  const updates: ScholarshipUpdate[] = [];
  const openings: ScholarshipOpening[] = [];
  let newScholarshipsCount = 0;
  
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ZEROSCHOLAR AI-POWERED SCHOLARSHIP SCRAPER');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Step 1: Scrape with AI extraction
    const scrapedData = await scrapeAggregatorSite();
    
    // Step 2: Fetch current scholarships from database
    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      SCHOLARSHIPS_COLLECTION_ID
    );
    
    console.log('───────────────────────────────────────────────────────────');
    console.log(`📊 Database has ${response.documents.length} scholarships`);
    console.log(`📊 Extracted ${scrapedData.size} scholarships from website`);
    console.log('───────────────────────────────────────────────────────────\n');
    
    // Create a map of existing scholarships by title
    const existingScholarships = new Map(
      response.documents.map(doc => [doc.title.toLowerCase(), doc])
    );
    
    // Step 3: Process each scraped scholarship
    for (const [scrapedTitle, result] of scrapedData.entries()) {
      const normalizedTitle = scrapedTitle.toLowerCase();
      const status = calculateStatus(result.startDate, result.deadline);
      
      // Check if scholarship exists in database
      let matchedScholarship = existingScholarships.get(normalizedTitle);
      
      // If not found by exact match, try fuzzy matching
      if (!matchedScholarship) {
        for (const [dbTitle, dbScholarship] of existingScholarships.entries()) {
          if (fuzzyMatch(scrapedTitle, dbTitle)) {
            matchedScholarship = dbScholarship;
            break;
          }
        }
      }
      
      if (matchedScholarship) {
        // EXISTING SCHOLARSHIP - UPDATE IT
        console.log(`🔍 Updating: ${result.title}`);
        
        const oldStatus = matchedScholarship.status;
        
        // Check if scholarship just opened
        if (oldStatus === 'Closed' && (status === 'Open' || status === 'Upcoming')) {
          const daysUntilDeadline = calculateDaysUntilDeadline(result.deadline);
          openings.push({
            id: matchedScholarship.$id,
            title: result.title,
            startDate: result.startDate,
            deadline: result.deadline,
            link: result.officialLink,
            daysUntilDeadline,
          });
          console.log(`   🎉 SCHOLARSHIP STATUS CHANGED: Closed → ${status}`);
        }
        
        // Update in database with AI-extracted data
        const updateData: any = {
          title: result.title,
          deadline: result.deadline,
          startDate: result.startDate,
          status: status,
          officialLink: result.officialLink,
          provider: result.provider,
          benefitInCash: result.benefits,
          modeSelection: result.applicationMode,
          eligibilityRules: JSON.stringify(result.eligibilityRules),
          // Keep backward compatibility
          cgpaRequirement: `Minimum CGPA: ${result.eligibilityRules.minCGPA || 'Not specified'}`,
          level: result.eligibilityRules.levels?.join(', ') || 'Not specified',
          courseCategory: result.eligibilityRules.courseCategories?.join(', ') || 'Not specified'
        };
        
        await serverDatabases.updateDocument(
          DATABASE_ID,
          SCHOLARSHIPS_COLLECTION_ID,
          matchedScholarship.$id,
          updateData
        );
        
        updates.push({
          id: matchedScholarship.$id,
          title: result.title,
          oldDeadline: matchedScholarship.deadline,
          newDeadline: result.deadline,
          link: result.officialLink,
          status: status,
        });
        
        console.log(`   ✅ UPDATED with AI-extracted data`);
        
      } else {
        // NEW SCHOLARSHIP - CREATE IT
        console.log(`🆕 New scholarship found: ${result.title}`);
        
        try {
          const newScholarship = await serverDatabases.createDocument(
            DATABASE_ID,
            SCHOLARSHIPS_COLLECTION_ID,
            ID.unique(),
            {
              title: result.title,
              deadline: result.deadline,
              startDate: result.startDate,
              status: status,
              officialLink: result.officialLink,
              provider: result.provider,
              benefitInCash: result.benefits,
              modeSelection: result.applicationMode,
              eligibilityRules: JSON.stringify(result.eligibilityRules),
              description: `${result.provider} scholarship for Nigerian undergraduates`,
              // Backward compatibility fields
              cgpaRequirement: `Minimum CGPA: ${result.eligibilityRules.minCGPA || 'Not specified'}`,
              level: result.eligibilityRules.levels?.join(', ') || 'Not specified',
              courseCategory: result.eligibilityRules.courseCategories?.join(', ') || 'Not specified'
            }
          );
          
          newScholarshipsCount++;
          console.log(`   ✅ CREATED new scholarship with ID: ${newScholarship.$id}`);
          
          // If the new scholarship is Open, add to openings for notification
          if (status === 'Open') {
            const daysUntilDeadline = calculateDaysUntilDeadline(result.deadline);
            openings.push({
              id: newScholarship.$id,
              title: result.title,
              startDate: result.startDate,
              deadline: result.deadline,
              link: result.officialLink,
              daysUntilDeadline,
            });
          }
          
        } catch (error: any) {
          console.error(`   ✗ Failed to create scholarship: ${error.message}`);
        }
      }
      
      console.log('');
    }
  } catch (error: any) {
    console.error('❌ Error updating scholarships:', error.message);
  }
  
  return { updates, openings, newScholarships: newScholarshipsCount };
}

// Check if date string matches today
function isToday(dateStr: string): boolean {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const date = parseDeadlineDate(dateStr);
    if (!date) return false;
    
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  } catch {
    return false;
  }
}

// Calculate days until deadline
function calculateDaysUntilDeadline(deadlineStr: string): number {
  const deadline = parseDeadlineDate(deadlineStr);
  if (!deadline) return -1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Send email notifications to all users
async function sendNotifications(updates: ScholarshipUpdate[]): Promise<void> {
  if (updates.length === 0) {
    console.log('No updates to notify users about.');
    return;
  }
  
  try {
    // Fetch all users
    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID
    );
    
    const emailPromises = response.documents.map(async (user) => {
      const emailContent = generateEmailContent(updates, user.level);
      
      const mailOptions = {
        from: GMAIL_USER,
        to: user.email,
        subject: '🎓 Scholarship Deadlines Updated - ZeroScholar',
        html: emailContent,
      };
      
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✓ Email sent to: ${user.email}`);
      } catch (error) {
        console.error(`✗ Failed to send email to ${user.email}:`, error);
      }
    });
    
    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

// Generate HTML email content
function generateEmailContent(updates: ScholarshipUpdate[], userLevel: string): string {
  const relevantUpdates = updates.filter(u => 
    u.title.toLowerCase().includes(userLevel.toLowerCase().replace('l', ''))
  );
  
  const allUpdates = relevantUpdates.length > 0 ? relevantUpdates : updates;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .scholarship { background: #f9f9f9; margin: 15px 0; padding: 20px; border-left: 4px solid #667eea; border-radius: 5px; }
        .scholarship h3 { margin: 0 0 10px 0; color: #667eea; }
        .deadline { color: #e74c3c; font-weight: bold; }
        .status-open { color: #27ae60; font-weight: bold; }
        .status-closed { color: #e74c3c; font-weight: bold; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 ZeroScholar Alert</h1>
          <p>Scholarship Updates Available!</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello Scholar,</p>
          <p>We've found updates for your scholarships:</p>
          
          ${allUpdates.map(update => `
            <div class="scholarship">
              <h3>${update.title}</h3>
              ${update.oldDeadline !== update.newDeadline ? `
                <p><strong>Previous Deadline:</strong> ${update.oldDeadline}</p>
                <p class="deadline"><strong>New Deadline:</strong> ${update.newDeadline}</p>
              ` : ''}
              <p><strong>Status:</strong> <span class="status-${update.status.toLowerCase()}">${update.status}</span></p>
              ${update.link ? `<a href="${update.link}" class="btn">View Details</a>` : ''}
            </div>
          `).join('')}
          
          <p style="margin-top: 30px;">
            Don't miss out on these opportunities! Log in to ZeroScholar to see all updates.
          </p>
        </div>
        
        <div class="footer">
          <p>You're receiving this email because you signed up for ZeroScholar notifications.</p>
          <p>&copy; 2025 ZeroScholar. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function for strict matching (same logic as client-side)
function userMatchesScholarship(user: any, eligibilityRules: any): boolean {
  try {
    const rules = JSON.parse(eligibilityRules);
    
    const isAllInclusive = (arr: string[] | undefined) => {
      return arr && (
        arr.includes('All') || 
        arr.includes('All Levels') || 
        arr.includes('All Courses') || 
        arr.includes('All States') ||
        arr.includes('All Universities')
      );
    };
    
    // Check CGPA
    if (rules.minCGPA && user.cgpa < rules.minCGPA) return false;
    
    // Check Level
    if (rules.levels && !isAllInclusive(rules.levels) && !rules.levels.includes(user.level)) return false;
    
    // Check Course
    if (rules.courseCategories && !isAllInclusive(rules.courseCategories) && !rules.courseCategories.includes(user.course)) return false;
    
    // Check Gender
    if (rules.gender && rules.gender !== 'All' && user.gender !== rules.gender) return false;
    
    // Check State
    if (rules.states && !isAllInclusive(rules.states) && !rules.states.includes(user.state)) return false;
    
    // Check University
    if (rules.universities && !isAllInclusive(rules.universities) && !rules.universities.includes(user.university)) return false;
    
    // All checks passed
    return true;
  } catch (error) {
    console.error('Error matching user:', error);
    return false;
  }
}

// Send opening notifications to users (STRICT MATCHING)
async function sendOpeningNotifications(openings: ScholarshipOpening[]): Promise<void> {
  if (openings.length === 0) {
    console.log('No new scholarship openings.');
    return;
  }
  
  try {
    console.log(`\n📧 Found ${openings.length} scholarship(s) that just opened!`);
    
    // Fetch all users
    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID
    );
    
    console.log(`   Checking ${response.documents.length} users for matches...\n`);
    
    // For each opening, find matching users
    for (const opening of openings) {
      console.log(`\n   Processing: ${opening.title}`);
      
      // Get the scholarship's eligibility rules
      const scholarship = await serverDatabases.getDocument(
        DATABASE_ID,
        SCHOLARSHIPS_COLLECTION_ID,
        opening.id
      );
      
      let emailsSent = 0;
      
      for (const user of response.documents) {
        // Check if already notified
        const notifiedScholarships = user.notifiedScholarships || [];
        if (notifiedScholarships.includes(opening.id)) {
          continue; // Skip - already notified
        }
        
        // STRICT MATCHING: Check if user qualifies
        if (!userMatchesScholarship(user, scholarship.eligibilityRules)) {
          continue; // Skip - doesn't meet requirements
        }
        
        // User qualifies - send email
        const emailContent = generateOpeningEmailContent([opening]);
        
        const mailOptions = {
          from: GMAIL_USER,
          to: user.email,
          subject: '🎉 Scholarship Application Now Open - ZeroScholar',
          html: emailContent,
        };
        
        try {
          await transporter.sendMail(mailOptions);
          
          // Update user's notifiedScholarships array
          const updatedNotified = [...notifiedScholarships, opening.id];
          await serverDatabases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id,
            { notifiedScholarships: updatedNotified }
          );
          
          emailsSent++;
        } catch (error) {
          console.error(`      ✗ Failed to send to ${user.email}:`, error);
        }
      }
      
      console.log(`      ✓ Sent ${emailsSent} notification(s) to qualified users`);
    }
    
  } catch (error) {
    console.error('Error sending opening notifications:', error);
  }
}

// Generate HTML email content for scholarship openings
function generateOpeningEmailContent(openings: ScholarshipOpening[]): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .scholarship { background: #f9f9f9; margin: 15px 0; padding: 20px; border-left: 4px solid #27ae60; border-radius: 5px; }
        .scholarship h3 { margin: 0 0 10px 0; color: #27ae60; }
        .urgent { color: #e74c3c; font-weight: bold; }
        .deadline-info { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #27ae60; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Applications Now Open!</h1>
          <p>Don't miss these scholarship opportunities</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello Scholar,</p>
          <p><strong>Great news!</strong> The following scholarship(s) have just opened for applications:</p>
          
          ${openings.map(opening => `
            <div class="scholarship">
              <h3>${opening.title}</h3>
              <p><strong>Application Started:</strong> ${opening.startDate}</p>
              <div class="deadline-info">
                <p><strong>⏰ Deadline:</strong> ${opening.deadline}</p>
                <p class="${opening.daysUntilDeadline <= 7 ? 'urgent' : ''}">
                  ${opening.daysUntilDeadline > 0 
                    ? `You have ${opening.daysUntilDeadline} day(s) to apply!` 
                    : 'Deadline has passed or is today!'}
                </p>
              </div>
              ${opening.link ? `<a href="${opening.link}" class="btn">Apply Now</a>` : ''}
            </div>
          `).join('')}
          
          <p style="margin-top: 30px; background: #e8f5e9; padding: 15px; border-radius: 5px;">
            <strong>💡 Pro Tip:</strong> Start your application as soon as possible. Scholarships with aptitude tests may require preparation time.
          </p>
        </div>
        
        <div class="footer">
          <p>You're receiving this email because you signed up for ZeroScholar notifications.</p>
          <p>&copy; 2025 Scholarkit. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  console.log('\n');
  console.log('🚀 Starting scholarship scraper...\n');
  
  const { updates, openings, newScholarships } = await updateScholarships();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 SUMMARY:`);
  console.log(`   • ${updates.length} scholarship(s) updated`);
  console.log(`   • ${newScholarships} new scholarship(s) added`);
  console.log(`   • ${openings.length} scholarship(s) opened`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Send opening notifications first (higher priority)
  if (openings.length > 0) {
    console.log('📧 Sending opening notifications...\n');
    await sendOpeningNotifications(openings);
  }
  
  // Then send regular update notifications
  if (updates.length > 0) {
    console.log('\n📧 Sending update notifications...\n');
    await sendNotifications(updates);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Scraper completed in ${duration}s\n`);
}

main().catch(console.error);
