/**
 * Export Merit-Based Scholarships to Markdown
 * 
 * This script fetches all scholarships from Appwrite database,
 * filters for merit-based ones with no strings attached,
 * and outputs them to a Markdown file.
 */

import { Client, Databases, Query } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';

// Appwrite Configuration
const ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '690f7de40013993815c1';
const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';
const DATABASE_ID = 'scholarship_db';
const SCHOLARSHIPS_COLLECTION_ID = 'scholarships';

interface Scholarship {
  $id: string;
  name: string;
  provider: string;
  description: string;
  eligibility: string[];
  rewardAmount: string;
  deadline: string;
  link: string;
  status?: string;
  modeOfSelection?: string;
}

// Keywords that indicate merit-based scholarships
const MERIT_KEYWORDS = ['merit', 'academic', 'excellence', 'cgpa', 'gpa', 'performance', 'achievement'];

// Keywords that indicate "strings attached" (we want to EXCLUDE these)
const STRINGS_ATTACHED_KEYWORDS = ['bond', 'service', 'work for', 'repayment', 'return to'];

function isMeritBased(scholarship: Scholarship): boolean {
  const text = `${scholarship.name} ${scholarship.description} ${scholarship.eligibility?.join(' ') || ''} ${scholarship.modeOfSelection || ''}`.toLowerCase();
  
  // Check if it's merit-based
  const hasMeritIndicator = MERIT_KEYWORDS.some(keyword => text.includes(keyword));
  
  // Check for "strings attached"
  const hasStringsAttached = STRINGS_ATTACHED_KEYWORDS.some(keyword => text.includes(keyword));
  
  // Return true if merit-based AND no strings attached
  return hasMeritIndicator && !hasStringsAttached;
}

function generateMarkdown(scholarships: Scholarship[]): string {
  const now = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let md = `# 🎓 Merit-Based Scholarships - No Strings Attached

> **Generated:** ${now}  
> **Total Found:** ${scholarships.length} scholarships

---

`;

  scholarships.forEach((s, index) => {
    md += `## ${index + 1}. ${s.name}

| Field | Details |
|-------|---------|
| **Provider** | ${s.provider || 'N/A'} |
| **Reward** | ${s.rewardAmount || 'N/A'} |
| **Deadline** | ${s.deadline || 'N/A'} |
| **Status** | ${s.status || 'N/A'} |
| **Mode of Selection** | ${s.modeOfSelection || 'N/A'} |

**Description:**  
${s.description || 'No description available.'}

**Eligibility:**
${s.eligibility?.length ? s.eligibility.map(e => `- ${e}`).join('\n') : '- Not specified'}

**Apply:** [${s.link || 'Link not available'}](${s.link || '#'})

---

`;
  });

  md += `
## Summary

- **Total Merit Scholarships:** ${scholarships.length}
- **Report Generated:** ${now}

> *This report contains scholarships awarded based on academic merit with no service bonds or repayment obligations.*
`;

  return md;
}

async function main() {
  console.log('🚀 Starting Merit Scholarships Export...\n');

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);

  try {
    // Fetch all scholarships from database
    console.log('📡 Fetching scholarships from Appwrite database...');
    
    let allScholarships: Scholarship[] = [];
    let offset = 0;
    const limit = 100;
    
    // Paginate through all scholarships
    while (true) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SCHOLARSHIPS_COLLECTION_ID,
        [Query.limit(limit), Query.offset(offset)]
      );
      
      allScholarships = allScholarships.concat(response.documents as unknown as Scholarship[]);
      
      if (response.documents.length < limit) break;
      offset += limit;
    }

    console.log(`✅ Fetched ${allScholarships.length} total scholarships\n`);

    // Filter for merit-based scholarships
    console.log('🔍 Filtering for merit-based scholarships (no strings attached)...');
    const meritScholarships = allScholarships.filter(isMeritBased);
    console.log(`✅ Found ${meritScholarships.length} merit-based scholarships\n`);

    // Log each scholarship to console
    console.log('📋 Merit-Based Scholarships:');
    console.log('='.repeat(60));
    meritScholarships.forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.name}`);
      console.log(`   Provider: ${s.provider}`);
      console.log(`   Reward: ${s.rewardAmount}`);
      console.log(`   Deadline: ${s.deadline}`);
      console.log(`   Link: ${s.link}`);
    });
    console.log('\n' + '='.repeat(60));

    // Generate Markdown
    const markdown = generateMarkdown(meritScholarships);

    // Write to file
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'merit-scholarships.md');
    fs.writeFileSync(outputPath, markdown);

    console.log(`\n📄 Markdown file saved to: ${outputPath}`);
    console.log('✨ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
