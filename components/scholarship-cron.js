import { Client, Databases, Query, ID } from 'node-appwrite';
import * as cheerio from 'cheerio';
import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CLIENT_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '690f7de40013993815c1';
const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';

const DB_ID = 'scholarship_db';
const SCHOLARSHIP_COL_ID = 'scholarships';
const TRACKS_COL_ID = 'eligibility_tracks';

const GMAIL_USER = 'idukpayealex@gmail.com';
const GMAIL_PASS = 'yeop ydwl tqbx csat';

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyBWUCQdn_c3889aDZg2byga-OqExPKucAA';

// DeepSeek API Configuration (for later use)
// const DEEPSEEK_API_KEY = 'sk-62035b329310466ea4c991b82850f18e';

// ═══════════════════════════════════════════════════════════════════════════
// SCRAPER CONFIGURATION - Change this to scrape different pages
// ═══════════════════════════════════════════════════════════════════════════
const SCRAPE_PAGE = 18;
const SCRAPE_URL = SCRAPE_PAGE === 1 
  ? 'https://scholarsworld.ng/nigerian-scholarships/'
  : `https://scholarsworld.ng/nigerian-scholarships/page/${SCRAPE_PAGE}/`;

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE SERVICES
// ═══════════════════════════════════════════════════════════════════════════

const client = new Client()
  .setEndpoint(CLIENT_ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-3-pro-preview',
  generationConfig: {
    temperature: 0
  }
});

// Fast model for duplicate detection
const flashModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function parseDeadlineDate(deadlineStr) {
  if (!deadlineStr || deadlineStr === 'Not Specified') return null;
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(deadlineStr)) return new Date(deadlineStr);
    const cleaned = deadlineStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) return date;
    const monthMatch = deadlineStr.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
    const yearMatch = deadlineStr.match(/\d{4}/);
    const dayMatch = deadlineStr.match(/\d{1,2}/);
    if (monthMatch && yearMatch && dayMatch) {
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      return new Date(parseInt(yearMatch[0]), monthNames.indexOf(monthMatch[0].toLowerCase()), parseInt(dayMatch[0]));
    }
    return null;
  } catch { return null; }
}

function isDeadlineActive(deadline) {
  // TODO: Handle "Not Specified" deadlines differently in the future
  // For now, treat them as active (true)
  if (!deadline || deadline === 'Not Specified') return true;
  const deadlineDate = parseDeadlineDate(deadline);
  if (!deadlineDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  return deadlineDate >= today;
}

function updateTitleWithCurrentYear(title) {
  const currentYear = new Date().getFullYear();
  // Replace any 4-digit year (2020-2030) with current year
  const yearPattern = /\b(20[2-3][0-9])\b/g;
  if (yearPattern.test(title)) {
    return title.replace(yearPattern, currentYear.toString());
  }
  // If no year found, append current year
  return `${title} ${currentYear}`;
}

function parseDeadlineToISO(deadlineText) {
  if (!deadlineText) return 'Not Specified';
  
  // Clean the text
  const cleaned = deadlineText.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
  
  // Try direct parse
  const date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  
  // Try to extract components
  const monthMatch = cleaned.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
  const yearMatch = cleaned.match(/\b(20[2-3][0-9])\b/);
  const dayMatch = cleaned.match(/\b(\d{1,2})\b/);
  
  if (monthMatch && yearMatch && dayMatch) {
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const month = monthNames.indexOf(monthMatch[0].toLowerCase());
    const year = parseInt(yearMatch[0]);
    const day = parseInt(dayMatch[0]);
    const parsedDate = new Date(year, month, day);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  }
  
  return 'Not Specified';
}

async function updateExistingScholarship(existingDoc, scraped) {
  const newTitle = updateTitleWithCurrentYear(scraped.title);
  const newDeadline = parseDeadlineToISO(scraped.deadlineFromPage);
  const newIsActive = isDeadlineActive(newDeadline);
  
  try {
    await databases.updateDocument(DB_ID, SCHOLARSHIP_COL_ID, existingDoc.$id, {
      scholarship_name: newTitle,
      official_link: scraped.detailLink,
      deadline: newDeadline,
      is_active: newIsActive
    });
    
    console.log(`   ✅ UPDATED: "${existingDoc.scholarship_name}" → "${newTitle}"`);
    console.log(`   📅 Deadline: ${existingDoc.deadline} → ${newDeadline}`);
    console.log(`   🔗 Link: ${scraped.detailLink}`);
    console.log(`   ✓ is_active: ${newIsActive}`);
    return true;
  } catch (error) {
    console.error(`   ✗ Update error: ${error.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DUPLICATE DETECTION
// ═══════════════════════════════════════════════════════════════════════════

const COMMON_WORDS = [
  'undergraduates', 'alert', 'how', 'opportunity', 'fully', 'funded', 'empowering','education',
  'exciting', 'nigerians', 'opportunities', 'available', 'details', 'more',
  'scholarship', 'scholarships', 'undergraduate', 'university', 'universities',
  'nigerian', 'nigeria', 'program', 'programme', 'award', 'awards', 'scheme',
  'foundation', 'the', 'a', 'an', 'for', 'of', 'and', 'in', 'to', 'with','guide',
  'scholars', 'stem','educational','youth','per','research','guide','energy','complete',
  'students', 'student', 'application', 'applications', 'apply', 'now', 'open',
  'edition', 'annual', 'year', 'new', 'latest', 'current', 'get', 'win','board',
  'state' ,'government', 'private', 'public', 'sector', 'company', 'corporate',
  'girl','girls','project', 'study', 'studies', 'course', 'courses', 'field', 'nnpc','joint','venture',
  'future','empowerment','builders','career','academy','fund', 'impact', 'change',
 'opens', 'soon', 'communities', 'community', 'support', 'academic', 'excellence',
 'development', 'leadership','need', 'based', 'criteria', 'eligibility',
 'trust','network', 'tech', 'technology', 'science', 'sciences', 'engineering',
  'free', 'full', 'partial', 'grant', 'grants', 'bursaries','she',
];

// Pre-compute lowercase set for fast lookup
const COMMON_WORDS_SET = new Set(COMMON_WORDS.map(w => w.toLowerCase()));

function normalizeTitle(title) {
  // Lowercase and remove special characters
  let normalized = title.toLowerCase().replace(/[^a-z\s]/g, ' '); // Remove numbers and special chars
  // Split into words and filter out common words (case-insensitive)
  const words = normalized.split(/\s+/).filter(word => 
    word.length > 2 && !COMMON_WORDS_SET.has(word)
  );
  return words;
}

async function findExistingScholarship(scrapedTitle) {
  const uniqueWords = normalizeTitle(scrapedTitle);
  
  if (uniqueWords.length === 0) {
    console.log(`   ⚠️ No unique words extracted from title`);
    return null;
  }
  
  console.log(`   🔍 Unique words: [${uniqueWords.join(', ')}]`);
  
  // Collect all candidates from ALL unique words
  const candidateMap = new Map(); // docId -> { doc, matchCount }
  
  for (const searchWord of uniqueWords) {
    try {
      const results = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
        Query.contains('scholarship_name', searchWord)
      ]);
      
      // console.log(`   🔍 Word "${searchWord}": ${results.documents.length} hits`);
      
      for (const doc of results.documents) {
        if (candidateMap.has(doc.$id)) {
          candidateMap.get(doc.$id).matchCount++;
        } else {
          candidateMap.set(doc.$id, { doc, matchCount: 1 });
        }
      }
    } catch (error) {
      console.error(`   ✗ DB search error for "${searchWord}": ${error.message}`);
    }
  }
  
  // No candidates found → proceed to extraction
  if (candidateMap.size === 0) {
    console.log(`   ✓ No candidates found in DB`);
    return null;
  }
  
  // Sort candidates by match count (descending)
  const sortedCandidates = Array.from(candidateMap.values())
    .sort((a, b) => b.matchCount - a.matchCount);
  
  console.log(`   📊 Total unique candidates: ${sortedCandidates.length}`);
  for (const { doc, matchCount } of sortedCandidates.slice(0, 5)) {
    console.log(`      • "${doc.scholarship_name}" (${matchCount}/${uniqueWords.length} words)`);
  }
  
  // Check for Perfect Match (Two-way strict equality of unique words)
  const topCandidate = sortedCandidates[0];
  const scrapedSet = new Set(uniqueWords);
  const dbWords = normalizeTitle(topCandidate.doc.scholarship_name);
  const dbSet = new Set(dbWords);

  // 1. All scraped words must be in DB (Scraped ⊆ DB)
  // 2. All DB words must be in scraped (DB ⊆ Scraped)
  // Implies Sets are equal size and every element matches
  const isTwoWayMatch = scrapedSet.size === dbSet.size && [...scrapedSet].every(w => dbSet.has(w));

  if (isTwoWayMatch) {
    console.log(`   ✓ Perfect match found (100% Two-way: [${uniqueWords.join(', ')}] == [${dbWords.join(', ')}])`);
    return topCandidate.doc;
  }
  
  // Not 100% match → Use LLM to verify with top 3 candidates
  const top3Candidates = sortedCandidates.slice(0, 3).map(c => c.doc);
  console.log(`   🤖 No 100% match (Strict two-way check failed), using Gemini Flash with top ${top3Candidates.length} candidates...`);
  
  return await llmDisambiguate(scrapedTitle, top3Candidates);
}

async function llmDisambiguate(scrapedTitle, candidates) {
  const candidateList = candidates.map((doc, i) => `${i + 1}. "${doc.scholarship_name}"`).join('\n');
  
  const prompt = `You are a scholarship matching engine. Determine if the scraped title refers to the same scholarship as any candidate.

SCRAPED TITLE: "${scrapedTitle}"

CANDIDATES IN DATABASE:
${candidateList}

RULES:
- Ignore year differences (2024 vs 2025 = same scholarship)
- You must be precise one company can have multiple different scholarships
- PROVIDER PRECISION: Treat distinct names (e.g., 'Michael Taiwo Scholarship' and 'Taiwo Bankole Scholarship') as two different providers/entities.

OUTPUT: Return ONLY the number (1, 2, 3...) of the matching candidate, or "0" if none match.
Example: 1`;

  try {
    const result = await flashModel.generateContent(prompt);
    const response = result.response.text().trim();
    const matchIndex = parseInt(response) - 1;
    
    if (matchIndex >= 0 && matchIndex < candidates.length) {
      console.log(`   ✓ LLM matched: "${candidates[matchIndex].scholarship_name}"`);
      return candidates[matchIndex];
    } else {
      console.log(`   ✗ LLM found no match (response: ${response})`);
      return null;
    }
  } catch (error) {
    console.error(`   ✗ LLM disambiguation error: ${error.message}`);
    // Fallback: check exact normalized match
    const scrapedNormalized = normalizeTitle(scrapedTitle).join(' ');
    for (const candidate of candidates) {
      const candidateNormalized = normalizeTitle(candidate.scholarship_name).join(' ');
      if (scrapedNormalized === candidateNormalized) {
        return candidate;
      }
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT CLEANING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

function cleanScrapedText(text) {
  const originalLength = text.length;
  let cleaned = text;
  
  // Remove JavaScript, CSS, ads
  cleaned = cleaned.replace(/googletag\.cmd\.push\([^)]*\);?/gi, '');
  cleaned = cleaned.replace(/\(adsbygoogle\s*=\s*window\.adsbygoogle\s*\|\|\s*\[\]\)\.push\(\{\}\);?/gi, '');
  cleaned = cleaned.replace(/window\.\w+\s*=\s*[^;]+;/gi, '');
  cleaned = cleaned.replace(/\.sp-form\[sp-id="[^"]*"\][^}]*\{[^}]*\}/gi, '');
  cleaned = cleaned.replace(/\.sp-[a-z-]+\s*\{[^}]*\}/gi, '');
  cleaned = cleaned.replace(/\.[a-z-]+\s*\{[^}]*\}/gi, '');
  cleaned = cleaned.replace(/srcset="[^"]*"/gi, '');
  cleaned = cleaned.replace(/<img[^>]*>/gi, '');
  
  // Remove related scholarships section
  cleaned = cleaned.replace(/Explore more scholarship opportunities below\.[\s\S]*?Load More/gi, '');
  cleaned = cleaned.replace(/WAAW Foundation Scholarship.*?\d{4}/gi, '');
  cleaned = cleaned.replace(/NNPC\/TotalEnergies.*?\d{4}/gi, '');
  cleaned = cleaned.replace(/University of Manchester.*?\d{4}/gi, '');
  cleaned = cleaned.replace(/Queen Elizabeth Commonwealth.*?\d{4}/gi, '');
  cleaned = cleaned.replace(/Khalifa University.*?\d{4}/gi, '');
  cleaned = cleaned.replace(/King Fahd University.*?\d{4}/gi, '');
  
  // Remove social media CTAs
  cleaned = cleaned.replace(/Join our WhatsApp and Telegram groups[\s\S]*?Scholars World News Alerts/gi, '');
  cleaned = cleaned.replace(/Join the Scholars World community on X \(Twitter\)[\s\S]*?opportunities!/gi, '');
  cleaned = cleaned.replace(/Get Realtime Updates from Scholars World[\s\S]*?\(Follow us\)/gi, '');
  cleaned = cleaned.replace(/WhatsApp\s*Scholars World Scholarships \d/gi, '');
  cleaned = cleaned.replace(/Telegram\s*Scholars World Scholarships/gi, '');
  cleaned = cleaned.replace(/Scholars World WhatsApp Channel/gi, '');
  cleaned = cleaned.replace(/Scholars World News Alerts/gi, '');
  
  // Remove subscribe forms and footer
  cleaned = cleaned.replace(/Get the latest Admission[\s\S]*?Subscribe/gi, '');
  cleaned = cleaned.replace(/Name\*Email\*Subscribe/gi, '');
  cleaned = cleaned.replace(/For more scholarship updates[\s\S]*?ngscholarsworld/gi, '');
  cleaned = cleaned.replace(/Click HERE To receive more daily scholarship updates[^.]*\./gi, '');
  cleaned = cleaned.replace(/Share This Scholarship/gi, '');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/[\t]+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/[ ]{2,}/g, ' ');
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');
  cleaned = cleaned.replace(/\(\s*\)/g, '');
  cleaned = cleaned.replace(/\[\s*\]/g, '');
  
  const cleanedLength = cleaned.trim().length;
  const reduction = ((1 - cleanedLength / originalLength) * 100).toFixed(1);
  
  return { cleaned: cleaned.trim(), originalLength, cleanedLength, reduction: `${reduction}%` };
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM EXTRACTION PROMPT
// ═══════════════════════════════════════════════════════════════════════════

function getExtractionPrompt(textContent, url) {
  return`You are a strict Data Normalization Engine for Nigerian undergraduate scholarships. Extract a valid JSON Object.

🛑 FILTER GATE: Output null if ANY of these are true:
1. International (study outside Nigeria)
2. Post-Graduate Only (Masters, PhD, Law School)
3. Research/Project Grants
4. EXCLUSIVE to staff/children (Note: Do NOT filter if staff are simply *excluded* from applying)
5. Non-Scholarships (Internships, Loans, Training)

🛠️ RULES:
- Geography: Nigerian Official State names. National = ["ALL"]
- Local Government Areas (LGA): If the text says "Must be a resident of [Place Name] and place name is NOT a Nigerian State" and the Place Name is NOT a State, treat [Place Name] as an LGA and store it here (e.g., "Must be a resident of Ilorin" → ["Ilorin"]). Use [] if none are mentioned.
- Grades: CGPA (0.0 - 5.0), JAMB Score (0 - 400), IF NOT specified output -> 0
- Financial Need / Orphan / Disability / Aptitude Test: true/false

⚠️ LEVEL LOGIC (Apply per Track):
- Default: If text says "Freshers", "First Year", or requires JAMB/O-Level only -> [100]
- Returning Override: If a SPECIFIC TRACK requires "University Transcripts" or "Current CGPA" -> [200, 300, 400, 500]
- Note: A scholarship can have one track for Freshers [100] and another for Host Communities [200+] in the same JSON.
- Universities: Acronyms (UNILAG, OAU, UNN). Open = ["ALL"]
- HIERARCHY OF TRUTH: The "Requirements", "Eligibility", or "Criteria" section is the **SUPREME AUTHORITY**. Ignore conflicting information found only in the intro or historical narrative (e.g., past editions or sub-schemes lacking full criteria)
- required_universities: You **MUST** extract the specific list of universities provided entirely, regardless of length. **ONLY** use ["ALL"] if the text explicitly says "open to all universities" or "any accredited Nigerian university."
- course_category: Must output an array of strings. Extract ALL applicable categories from the definitive list below. If the text lists specific courses (e.g., Civil Engineering), you MUST map and include all corresponding codes (e.g., ["ENG", "BLD"]). Use ["ALL"] ONLY if open to every course.
- CATEGORY LIST: 
    - ENG: Core Engineering (Chemical, Civil, Electrical, Mechanical, Production).
    - BLD: Building, Architecture, Construction (Applied Building Tech, Quantity Surveying).
    - SCI: Pure Sciences (Physics, Chemistry, Maths).
    - ICT: Information/Computer Technology.
    - MED: Medical/Health Sciences.
    - LAW: Law.
    - ARTS/HUM: Arts, Humanities, Languages.
    - BUS: Business, Finance, Accounting.
- Gender: "M", "F", or "ANY"
- Religion: "Muslim", "Christian", or "NONE"
- Award Amount: if an amount is given adhere stricly and output in the format:currency + numerical value, you must not output text like "full scholarship", "accomodation", "books", etc. if no numerical amount is given output "Tuition support"
URL: ${url}

TEXT:
${textContent.substring(0, 12000)}

OUTPUT (raw JSON only, no markdown):
{
  "scholarship_name": "string",
  "provider": "string",
  "deadline": "YYYY-MM-DD or Not Specified",
  "award_amount": "string",
  "official_link": "${url}",
  "tracks": [{
    "track_name": "string (e.g. 'Merit Award' or 'Host Community Category')",
    "allowed_levels": [integer],
    "min_cgpa": float,
    "min_jamb_score": integer,
    "required_gender": "ANY",
    "is_financial_need_required": boolean,
    "is_orphan_or_single_parent_required": boolean,
    "required_religion": "NONE",
    "is_disability_specific": boolean,
    "is_aptitude_test_required": boolean,
    "required_state_of_origin": ["ALL"],
    "required_lga_list": [],
    "required_universities": ["ALL"],
    "course_category": ["ALL"],
    "specific_requirements": ["string"]
  }]
}

If filtered out: null`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCRAPING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function scrapeScholarsWorld() {
  const scrapedScholarships = [];
  try {
    console.log(`📡 Fetching from: ${SCRAPE_URL} (Page ${SCRAPE_PAGE})\n`);
    const response = await fetch(SCRAPE_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const scholarshipCards = $('.grid-base-post').toArray();
    console.log(`📋 Found ${scholarshipCards.length} cards\n`);
    
    for (const card of scholarshipCards.slice(0, 10)) {
      try {
        const titleElement = $(card).find('h2.post-title a').first();
        const title = titleElement.text().trim();
        const detailLink = titleElement.attr('href');
        if (!title || !detailLink) continue;
        
        console.log(`\n📄 ${title}`);
        console.log(`   🔗 ${detailLink}`);
        
        await new Promise(r => setTimeout(r, 2000));
        const detailResponse = await fetch(detailLink, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const detailHtml = await detailResponse.text();
        const $detail = cheerio.load(detailHtml);
        
        const deadlineText = $detail('h4.elementor-heading-title').first().text().trim();
        console.log(`   📅 Deadline: ${deadlineText || 'Not found'}`);
        
        const postContent = $detail('.post-content');
        let rawText = postContent.length > 0 ? postContent.text() : $detail('body').text();
        console.log(`   📍 Raw: ${rawText.length} chars`);
        
        const { cleaned, originalLength, cleanedLength, reduction } = cleanScrapedText(rawText);
        console.log(`   🧹 Cleaned: ${originalLength} → ${cleanedLength} (${reduction})`);
        
        scrapedScholarships.push({ title, detailLink, textContent: cleaned, deadlineFromPage: deadlineText });
        console.log(`   ✓ Queued`);
      } catch (error) {
        console.error(`   ✗ Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Scrape error:', error.message);
  }
  return scrapedScholarships;
}

async function extractWithLLM(textContent, url) {
  try {
    console.log(`   🤖 Calling Gemini 2.5 Flash...`);
    const result = await model.generateContent(getExtractionPrompt(textContent, url));
    const content = result.response.text();
    console.log(`   ✓ Response: ${content.length} chars`);
    
    let jsonText = content.trim();
    if (jsonText.startsWith('```json')) jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    else if (jsonText.startsWith('```')) jsonText = jsonText.replace(/```\n?/g, '');
    
    if (jsonText.toLowerCase() === 'null') return null;
    const parsed = JSON.parse(jsonText);
    return parsed?.scholarship_name ? parsed : null;
  } catch (error) {
    console.error(`   ✗ LLM error: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

async function createScholarship(scholarshipData) {
  try {
    const { tracks, ...parentData } = scholarshipData;
    parentData.is_active = isDeadlineActive(parentData.deadline);
    
    const parentDoc = await databases.createDocument(DB_ID, SCHOLARSHIP_COL_ID, ID.unique(), parentData);
    console.log(`   ✓ Created: ${parentDoc.scholarship_name} (${parentDoc.$id})`);
    
    if (tracks?.length > 0) {
      for (const track of tracks) {
        await databases.createDocument(DB_ID, TRACKS_COL_ID, ID.unique(), { ...track, scholarship_id: parentDoc.$id });
      }
      console.log(`   ✓ ${tracks.length} track(s) created`);
    }
    return parentDoc;
  } catch (error) {
    console.error(`   ✗ DB error: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEADLINE MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════

async function deactivateExpiredScholarships() {
  console.log('🧹 Checking for expired scholarships...\n');
  
  let deactivatedCount = 0;
  let offset = 0;
  const limit = 100;
  
  try {
    while (true) {
      const results = await databases.listDocuments(DB_ID, SCHOLARSHIP_COL_ID, [
        Query.equal('is_active', true),
        Query.limit(limit),
        Query.offset(offset)
      ]);
      
      if (results.documents.length === 0) break;
      
      for (const doc of results.documents) {
        // Skip "Not Specified" deadlines (they stay active)
        // TODO: Handle "Not Specified" deadlines differently in the future
        if (!doc.deadline || doc.deadline === 'Not Specified') continue;
        
        if (!isDeadlineActive(doc.deadline)) {
          try {
            await databases.updateDocument(DB_ID, SCHOLARSHIP_COL_ID, doc.$id, {
              is_active: false
            });
            console.log(`   ⏰ Deactivated: "${doc.scholarship_name}" (deadline: ${doc.deadline})`);
            deactivatedCount++;
          } catch (error) {
            console.error(`   ✗ Failed to deactivate ${doc.$id}: ${error.message}`);
          }
        }
      }
      
      if (results.documents.length < limit) break;
      offset += limit;
    }
    
    if (deactivatedCount > 0) {
      console.log(`\n   ✓ Deactivated ${deactivatedCount} expired scholarship(s)\n`);
    } else {
      console.log(`   ✓ No expired scholarships found\n`);
    }
    
    return deactivatedCount;
  } catch (error) {
    console.error(`   ✗ Error checking expired scholarships: ${error.message}`);
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CRON FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function runCron() {
  const startTime = Date.now();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ZEROSCHOLAR - SCHOLARSHIP EXTRACTOR');
  console.log('  LLM: Gemini 2.5 Pro | Mode: Extraction Only');
  console.log('  Started:', new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  let newCount = 0, skippedCount = 0, filteredCount = 0, updatedCount = 0;
  
  // STEP 0: Deactivate expired scholarships
  console.log('🧹 STEP 0: Maintenance...\n');
  const deactivatedCount = await deactivateExpiredScholarships();
  
  console.log('📡 STEP 1: Scraping...\n');
  const scrapedScholarships = await scrapeScholarsWorld();
  console.log(`\n✓ Scraped ${scrapedScholarships.length} scholarships\n`);
  
  console.log('🤖 STEP 2: Checking duplicates & Extracting with Gemini...\n');
  for (const scraped of scrapedScholarships) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`🤖 ${scraped.title}`);
    
    // Check for duplicates BEFORE LLM extraction
    const existingDoc = await findExistingScholarship(scraped.title);
    if (existingDoc) {
      console.log(`   ⏭️ DUPLICATE FOUND in DB`);
      console.log(`   📌 Matched: "${existingDoc.scholarship_name}" (${existingDoc.$id})`);
      
      // Update existing record with new year, link, deadline
      const updated = await updateExistingScholarship(existingDoc, scraped);
      if (updated) updatedCount++;
      continue;
    }
    
    console.log(`   ✓ No duplicate found, proceeding with extraction...`);
    

    const extractedData = await extractWithLLM(scraped.textContent, scraped.detailLink);
    
    if (!extractedData) {
      console.log(`   ⚠️ FILTERED by LLM`);
      filteredCount++;
      continue;
    }
    
    if (extractedData.scholarship_name && extractedData.tracks) {
      extractedData.scholarship_name = scraped.title;
      console.log(`   📋 Provider: ${extractedData.provider}`);
      console.log(`   📋 Deadline: ${extractedData.deadline}`);
      console.log(`   📋 Award: ${extractedData.award_amount}`);
      console.log(`   📋 Tracks: ${extractedData.tracks.length}`);
      
      for (let i = 0; i < extractedData.tracks.length; i++) {
        const track = extractedData.tracks[i];
        console.log(`\n      ┌─ Track ${i + 1}: ${track.track_name}`);
        console.log(`      │  Levels: [${track.allowed_levels?.join(', ') || 'N/A'}]`);
        console.log(`      │  Min CGPA: ${track.min_cgpa ?? 'N/A'} | Min JAMB: ${track.min_jamb_score ?? 'N/A'}`);
        console.log(`      │  Gender: ${track.required_gender || 'ANY'} | Religion: ${track.required_religion || 'NONE'}`);
        console.log(`      │  States: [${track.required_state_of_origin?.join(', ') || 'ALL'}]`);
        console.log(`      │  LGAs: [${track.required_lga_list?.length ? track.required_lga_list.join(', ') : 'None'}]`);
        console.log(`      │  Universities: [${track.required_universities?.join(', ') || 'ALL'}]`);
        console.log(`      │  Courses: [${track.course_category?.join(', ') || 'ALL'}]`);
        console.log(`      │  Financial Need: ${track.is_financial_need_required ? '✓' : '✗'} | Orphan/Single Parent: ${track.is_orphan_or_single_parent_required ? '✓' : '✗'}`);
        console.log(`      │  Disability: ${track.is_disability_specific ? '✓' : '✗'} | Aptitude Test: ${track.is_aptitude_test_required ? '✓' : '✗'}`);
        console.log(`      │  Specific Reqs: ${track.specific_requirements?.length ? track.specific_requirements.join('; ') : 'None'}`);
        console.log(`      └─────────────────────────────────────`);
      }
      
      const created = await createScholarship(extractedData);
      created ? newCount++ : skippedCount++;
    } else {
      console.log(`   ⚠️ Invalid data`);
      skippedCount++;
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  • Page: ${SCRAPE_PAGE}`);
  console.log(`  • Deactivated (expired): ${deactivatedCount}`);
  console.log(`  • Scraped: ${scrapedScholarships.length}`);
  console.log(`  • Updated (duplicates): ${updatedCount}`);
  console.log(`  • LLM filtered: ${filteredCount}`);
  console.log(`  • Saved (new): ${newCount}`);
  console.log(`  • Skipped: ${skippedCount}`);
  console.log(`  • Duration: ${duration}s`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`📋 Next: Change SCRAPE_PAGE to ${SCRAPE_PAGE + 1}\n`);
}

runCron().catch(console.error);
