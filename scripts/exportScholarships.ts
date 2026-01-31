/**
 * Export Scholarships Script
 * Fetches all scholarships with eligibility tracks from Appwrite database and outputs to Markdown/HTML
 */

import { Client, Databases, Query } from 'node-appwrite';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Appwrite Configuration
const ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '690f7de40013993815c1';
const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';
const DATABASE_ID = 'scholarship_db';
const SCHOLARSHIPS_COLLECTION_ID = 'scholarships';
const TRACKS_COLLECTION_ID = 'eligibility_tracks';

interface EligibilityTrack {
  $id: string;
  scholarship_id: string;
  min_cgpa: number;
  min_jamb_score: number;
  required_gender: string;
  required_state_of_origin: string[];
  required_lga_list: string[];
  required_universities: string[];
  course_category: string[];
  allowed_levels: number[];
  required_religion: string;
  is_financial_need_required: boolean;
  is_orphan_or_single_parent_required: boolean;
  is_disability_specific: boolean;
  is_aptitude_test_required: boolean;
  specific_requirements: string[];
}

interface Scholarship {
  $id: string;
  scholarship_name: string;
  provider: string;
  deadline: string;
  official_link: string;
  award_amount: string;
  is_active: boolean;
  done_for_the_year: boolean;
  tracks?: EligibilityTrack[];
}

interface ScholarshipWithTracks extends Scholarship {
  tracks: EligibilityTrack[];
}

async function fetchAllScholarshipsWithTracks(): Promise<ScholarshipWithTracks[]> {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);
  const allScholarships: Scholarship[] = [];
  let offset = 0;
  const limit = 100;

  console.log('🔍 Fetching scholarships from database...\n');

  // Fetch all scholarships
  while (true) {
    const response = await databases.listDocuments(
      DATABASE_ID,
      SCHOLARSHIPS_COLLECTION_ID,
      [Query.limit(limit), Query.offset(offset)]
    );

    allScholarships.push(...(response.documents as unknown as Scholarship[]));

    if (response.documents.length < limit) break;
    offset += limit;
  }

  console.log(`✅ Found ${allScholarships.length} scholarships`);
  console.log('🔍 Fetching eligibility tracks...\n');

  // Fetch all tracks
  const allTracks: EligibilityTrack[] = [];
  offset = 0;

  while (true) {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TRACKS_COLLECTION_ID,
      [Query.limit(limit), Query.offset(offset)]
    );

    allTracks.push(...(response.documents as unknown as EligibilityTrack[]));

    if (response.documents.length < limit) break;
    offset += limit;
  }

  console.log(`✅ Found ${allTracks.length} eligibility tracks\n`);

  // Map tracks to scholarships
  const tracksByScholarshipId = new Map<string, EligibilityTrack[]>();
  for (const track of allTracks) {
    const scholarshipId = track.scholarship_id;
    if (!tracksByScholarshipId.has(scholarshipId)) {
      tracksByScholarshipId.set(scholarshipId, []);
    }
    tracksByScholarshipId.get(scholarshipId)!.push(track);
  }

  // Combine scholarships with their tracks
  const scholarshipsWithTracks: ScholarshipWithTracks[] = allScholarships.map(scholarship => ({
    ...scholarship,
    tracks: tracksByScholarshipId.get(scholarship.$id) || []
  }));

  // Filter out scholarships with location requirements (state or LGA)
  const filteredScholarships = scholarshipsWithTracks.filter(scholarship => {
    if (!scholarship.tracks || scholarship.tracks.length === 0) {
      return true; // Keep if no tracks (no restrictions known)
    }

    // Check if ANY track has location restrictions
    const hasLocationRestriction = scholarship.tracks.some(track => {
      // Check state restriction
      const hasStateRestriction = track.required_state_of_origin && 
        track.required_state_of_origin.length > 0 &&
        !track.required_state_of_origin.some(s => 
          s && (s.toUpperCase() === 'ALL' || s.toUpperCase() === 'ANY' || s.toUpperCase() === 'NONE')
        );

      // Check LGA restriction
      const hasLGARestriction = track.required_lga_list && 
        track.required_lga_list.length > 0 &&
        !track.required_lga_list.some(l => 
          l && (l.toUpperCase() === 'ALL' || l.toUpperCase() === 'ANY' || l.toUpperCase() === 'NONE')
        );

      return hasStateRestriction || hasLGARestriction;
    });

    return !hasLocationRestriction;
  });

  console.log(`🔍 Filtered: ${scholarshipsWithTracks.length - filteredScholarships.length} scholarships with location restrictions removed`);
  console.log(`✅ Remaining: ${filteredScholarships.length} scholarships without location restrictions\n`);

  return filteredScholarships;
}

function formatArrayField(arr: string[] | number[] | undefined, defaultValue = 'Any'): string {
  if (!arr || arr.length === 0) return defaultValue;
  const filtered = arr.filter(item => item && String(item).toUpperCase() !== 'NONE');
  if (filtered.length === 0) return defaultValue;
  if (filtered.some(item => String(item).toUpperCase() === 'ALL' || String(item).toUpperCase() === 'ANY')) {
    return 'Any';
  }
  return filtered.join(', ');
}

function getStatus(s: Scholarship): string {
  if (s.done_for_the_year) return '🔴 Closed for this year';
  if (s.is_active === false) return '🟡 Inactive';
  if (s.is_active === true) return '🟢 Active';
  return '⚪ Unknown';
}

function escapeMarkdown(text: string): string {
  if (!text) return 'N/A';
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function generateMarkdown(scholarships: ScholarshipWithTracks[]): string {
  let md = `# 📚 Complete Scholarships Report\n\n`;
  md += `**Generated:** ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}\n\n`;
  md += `**Total Scholarships:** ${scholarships.length}\n\n`;
  md += `---\n\n`;

  // Summary Table
  md += `## 📋 Quick Summary\n\n`;
  md += `| # | Name | Provider | Amount | Deadline | Status |\n`;
  md += `|---|------|----------|--------|----------|--------|\n`;

  scholarships.forEach((s, index) => {
    const name = escapeMarkdown(s.scholarship_name || s.provider);
    const provider = escapeMarkdown(s.provider);
    const amount = escapeMarkdown(s.award_amount || 'Tuition Support');
    const deadline = s.deadline || 'Not Specified';
    const status = s.is_active ? '🟢' : (s.done_for_the_year ? '🔴' : '🟡');
    
    md += `| ${index + 1} | ${name} | ${provider} | ${amount} | ${deadline} | ${status} |\n`;
  });

  md += `\n---\n\n`;

  // Detailed Cards with Eligibility Information
  md += `## 📝 Detailed Scholarship Information\n\n`;

  scholarships.forEach((s, index) => {
    const name = s.scholarship_name || s.provider;
    
    md += `### ${index + 1}. ${name}\n\n`;
    
    // Basic Info Table
    md += `#### Basic Information\n\n`;
    md += `| Field | Details |\n`;
    md += `|-------|--------|\n`;
    md += `| **Provider** | ${escapeMarkdown(s.provider)} |\n`;
    md += `| **Award Amount** | ${escapeMarkdown(s.award_amount || 'Tuition Support')} |\n`;
    md += `| **Deadline** | ${s.deadline || 'Not Specified'} |\n`;
    md += `| **Status** | ${getStatus(s)} |\n`;
    
    if (s.official_link && s.official_link !== 'None') {
      md += `| **Apply Link** | [Apply Here](${s.official_link}) |\n`;
    }
    
    md += `\n`;

    // Eligibility Requirements
    if (s.tracks && s.tracks.length > 0) {
      md += `#### Eligibility Requirements\n\n`;
      
      s.tracks.forEach((track, trackIndex) => {
        if (s.tracks!.length > 1) {
          md += `**Track ${trackIndex + 1}:**\n\n`;
        }
        
        md += `| Requirement | Criteria |\n`;
        md += `|-------------|----------|\n`;
        
        // Academic Requirements
        if (track.min_cgpa > 0) {
          md += `| **Minimum CGPA** | ${track.min_cgpa} |\n`;
        }
        if (track.min_jamb_score > 0) {
          md += `| **Minimum JAMB Score** | ${track.min_jamb_score} |\n`;
        }
        if (track.allowed_levels && track.allowed_levels.length > 0) {
          const levels = track.allowed_levels.map(l => `${l} Level`).join(', ');
          md += `| **Allowed Levels** | ${levels} |\n`;
        }
        
        // Personal Requirements
        if (track.required_gender && track.required_gender.toUpperCase() !== 'ANY' && track.required_gender.toUpperCase() !== 'ALL') {
          md += `| **Gender** | ${track.required_gender} |\n`;
        }
        if (track.required_religion && track.required_religion.toUpperCase() !== 'NONE' && track.required_religion.toUpperCase() !== 'ANY') {
          md += `| **Religion** | ${track.required_religion} |\n`;
        }
        
        // Location Requirements
        const states = formatArrayField(track.required_state_of_origin);
        if (states !== 'Any') {
          md += `| **State of Origin** | ${escapeMarkdown(states)} |\n`;
        }
        
        const lgas = formatArrayField(track.required_lga_list);
        if (lgas !== 'Any') {
          md += `| **LGA** | ${escapeMarkdown(lgas)} |\n`;
        }
        
        // Academic Institution Requirements
        const universities = formatArrayField(track.required_universities);
        if (universities !== 'Any') {
          md += `| **Universities** | ${escapeMarkdown(universities)} |\n`;
        }
        
        const courses = formatArrayField(track.course_category);
        if (courses !== 'Any') {
          md += `| **Course Categories** | ${escapeMarkdown(courses)} |\n`;
        }
        
        // Special Requirements
        if (track.is_financial_need_required) {
          md += `| **Financial Need** | ✅ Required |\n`;
        }
        if (track.is_orphan_or_single_parent_required) {
          md += `| **Orphan/Single Parent** | ✅ Required |\n`;
        }
        if (track.is_disability_specific) {
          md += `| **Disability Status** | ✅ Required |\n`;
        }
        
        // Test Requirement
        md += `| **Aptitude Test** | ${track.is_aptitude_test_required ? '✅ Required' : '❌ Not Required'} |\n`;
        
        // Specific Requirements
        if (track.specific_requirements && track.specific_requirements.length > 0) {
          const reqs = track.specific_requirements.filter(r => r && r.trim());
          if (reqs.length > 0) {
            md += `\n**Additional Requirements:**\n`;
            reqs.forEach(req => {
              md += `- ${escapeMarkdown(req)}\n`;
            });
          }
        }
        
        md += `\n`;
      });
    } else {
      md += `> ℹ️ *Eligibility requirements not specified. Check official link for details.*\n\n`;
    }
    
    md += `---\n\n`;
  });

  return md;
}

function generateHTML(scholarships: ScholarshipWithTracks[]): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scholarships Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.5;
      padding: 12px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { 
      color: #2563eb; 
      text-align: center; 
      font-size: 1.5rem; 
      margin-bottom: 8px;
    }
    .meta { 
      text-align: center; 
      color: #666; 
      font-size: 0.85rem;
      margin-bottom: 16px; 
    }
    
    /* Table Styles */
    .table-wrapper {
      overflow-x: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    table { 
      width: 100%; 
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    th, td { 
      padding: 10px 8px; 
      text-align: left; 
      border-bottom: 1px solid #eee;
    }
    th { 
      background: #2563eb; 
      color: white; 
      font-weight: 600;
      position: sticky;
      top: 0;
      white-space: nowrap;
    }
    tr:hover { background: #f0f7ff; }
    
    /* Details Button */
    .details-btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .details-btn:hover { background: #1d4ed8; }
    
    /* Modal Styles */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      padding: 16px;
      overflow-y: auto;
    }
    .modal-overlay.active { display: flex; align-items: flex-start; justify-content: center; }
    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      margin-top: 20px;
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .modal-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      position: sticky;
      top: 0;
      background: white;
      border-radius: 16px 16px 0 0;
    }
    .modal-title { 
      font-size: 1rem; 
      font-weight: 700; 
      color: #1e3a8a;
      flex: 1;
    }
    .close-btn {
      background: #f3f4f6;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .close-btn:hover { background: #e5e7eb; }
    .modal-body { padding: 16px; }
    
    /* Modal Info Grid */
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
      gap: 8px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { 
      color: #64748b; 
      font-size: 0.8rem;
      flex-shrink: 0;
    }
    .info-value { 
      font-weight: 600; 
      color: #1e293b;
      font-size: 0.85rem;
      text-align: right;
    }
    
    /* Requirements Section */
    .req-section {
      background: #f0f9ff;
      border-radius: 10px;
      padding: 12px;
      margin-top: 12px;
    }
    .req-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0369a1;
      margin-bottom: 10px;
    }
    .req-badge {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.7rem;
      margin: 2px;
      font-weight: 500;
    }
    .req-badge.warning { background: #fef3c7; color: #92400e; }
    .req-badge.success { background: #dcfce7; color: #166534; }
    .req-badge.danger { background: #fee2e2; color: #991b1b; }
    
    /* Apply Button */
    .apply-btn {
      display: block;
      width: 100%;
      background: #2563eb;
      color: white;
      text-align: center;
      padding: 14px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      margin-top: 16px;
      transition: background 0.2s;
    }
    .apply-btn:hover { background: #1d4ed8; }
    
    /* Mobile-first responsive */
    @media (max-width: 600px) {
      body { padding: 8px; }
      h1 { font-size: 1.25rem; }
      table { font-size: 0.75rem; }
      th, td { padding: 8px 6px; }
      .hide-mobile { display: none; }
      .modal { margin-top: 10px; }
    }
    
    @media print {
      .details-btn, .modal-overlay { display: none !important; }
      body { background: white; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📚 Scholarships Report</h1>
    <p class="meta">
      ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${scholarships.length} scholarships
    </p>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th class="hide-mobile">Amount</th>
            <th class="hide-mobile">Deadline</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
`;

  scholarships.forEach((s, index) => {
    const name = s.scholarship_name || s.provider;
    const shortName = name.length > 40 ? name.substring(0, 37) + '...' : name;
    
    html += `          <tr>
            <td>${index + 1}</td>
            <td>${shortName}</td>
            <td class="hide-mobile">${s.award_amount || 'Tuition'}</td>
            <td class="hide-mobile">${s.deadline || 'Open'}</td>
            <td><button class="details-btn" onclick="openModal(${index})">Details</button></td>
          </tr>\n`;
  });

  html += `        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal Overlay -->
  <div class="modal-overlay" id="modalOverlay" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="modal-title" id="modalTitle"></div>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body" id="modalBody"></div>
    </div>
  </div>

  <script>
    const scholarships = ${JSON.stringify(scholarships.map(s => ({
      name: s.scholarship_name || s.provider,
      provider: s.provider,
      amount: s.award_amount || 'Tuition Support',
      deadline: s.deadline || 'Not Specified',
      link: s.official_link,
      is_active: s.is_active,
      done_for_the_year: s.done_for_the_year,
      tracks: (s.tracks || []).map(t => ({
        min_cgpa: t.min_cgpa,
        min_jamb: t.min_jamb_score,
        levels: t.allowed_levels,
        gender: t.required_gender,
        religion: t.required_religion,
        courses: t.course_category,
        universities: t.required_universities,
        test: t.is_aptitude_test_required,
        financial: t.is_financial_need_required,
        orphan: t.is_orphan_or_single_parent_required,
        disability: t.is_disability_specific
      }))
    })))};

    function openModal(index) {
      const s = scholarships[index];
      document.getElementById('modalTitle').textContent = s.name;
      
      let body = '';
      
      // Basic Info
      body += '<div class="info-row"><span class="info-label">Provider</span><span class="info-value">' + s.provider + '</span></div>';
      body += '<div class="info-row"><span class="info-label">Amount</span><span class="info-value">' + s.amount + '</span></div>';
      body += '<div class="info-row"><span class="info-label">Deadline</span><span class="info-value">' + s.deadline + '</span></div>';
      
      const status = s.is_active ? '🟢 Active' : (s.done_for_the_year ? '🔴 Closed' : '🟡 Inactive');
      body += '<div class="info-row"><span class="info-label">Status</span><span class="info-value">' + status + '</span></div>';
      
      // Requirements
      if (s.tracks && s.tracks.length > 0) {
        body += '<div class="req-section"><div class="req-title">Eligibility Requirements</div>';
        
        const track = s.tracks[0];
        const badges = [];
        
        if (track.min_cgpa > 0) badges.push('<span class="req-badge">CGPA ≥ ' + track.min_cgpa + '</span>');
        if (track.min_jamb > 0) badges.push('<span class="req-badge">JAMB ≥ ' + track.min_jamb + '</span>');
        if (track.levels && track.levels.length > 0 && track.levels.length < 5) {
          badges.push('<span class="req-badge">' + track.levels.map(l => l + 'L').join(', ') + '</span>');
        }
        if (track.gender && track.gender.toUpperCase() !== 'ANY' && track.gender.toUpperCase() !== 'ALL') {
          badges.push('<span class="req-badge">' + (track.gender === 'F' ? 'Female Only' : 'Male Only') + '</span>');
        }
        if (track.religion && track.religion.toUpperCase() !== 'NONE' && track.religion.toUpperCase() !== 'ANY') {
          badges.push('<span class="req-badge">' + track.religion + '</span>');
        }
        if (track.courses && track.courses.length > 0 && !track.courses.includes('ALL')) {
          badges.push('<span class="req-badge">' + track.courses.slice(0,3).join(', ') + '</span>');
        }
        if (track.universities && track.universities.length > 0 && !track.universities.includes('ALL')) {
          badges.push('<span class="req-badge">Specific Unis</span>');
        }
        if (track.test) badges.push('<span class="req-badge warning">Test Required</span>');
        if (track.financial) badges.push('<span class="req-badge warning">Financial Need</span>');
        if (track.orphan) badges.push('<span class="req-badge warning">Orphan/Single Parent</span>');
        if (track.disability) badges.push('<span class="req-badge warning">Disability Specific</span>');
        
        if (badges.length === 0) badges.push('<span class="req-badge success">Open to All</span>');
        
        body += badges.join('');
        body += '</div>';
      }
      
      // Apply Button
      if (s.link && s.link !== 'None') {
        body += '<a href="' + s.link + '" class="apply-btn" target="_blank">Apply Now →</a>';
      }
      
      document.getElementById('modalBody').innerHTML = body;
      document.getElementById('modalOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(event) {
      if (!event || event.target === document.getElementById('modalOverlay')) {
        document.getElementById('modalOverlay').classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>`;

  return html;
}

async function main() {
  try {
    const scholarships = await fetchAllScholarshipsWithTracks();

    // Log summary to console
    console.log('='.repeat(70));
    console.log('SCHOLARSHIPS WITH ELIGIBILITY DETAILS');
    console.log('='.repeat(70));
    
    scholarships.slice(0, 10).forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.scholarship_name || s.provider}`);
      console.log(`   Provider: ${s.provider}`);
      console.log(`   Amount: ${s.award_amount || 'Tuition Support'}`);
      console.log(`   Deadline: ${s.deadline || 'Not Specified'}`);
      console.log(`   Status: ${getStatus(s)}`);
      console.log(`   Tracks: ${s.tracks?.length || 0}`);
      
      if (s.tracks && s.tracks.length > 0) {
        const track = s.tracks[0];
        if (track.min_cgpa > 0) console.log(`   Min CGPA: ${track.min_cgpa}`);
        if (track.min_jamb_score > 0) console.log(`   Min JAMB: ${track.min_jamb_score}`);
        if (track.allowed_levels?.length > 0) console.log(`   Levels: ${track.allowed_levels.join(', ')}`);
        if (track.required_gender && track.required_gender !== 'ANY') console.log(`   Gender: ${track.required_gender}`);
        if (track.is_aptitude_test_required) console.log(`   Aptitude Test: Required`);
      }
    });
    
    console.log(`\n... and ${scholarships.length - 10} more scholarships`);

    // Generate and save Markdown
    const markdown = generateMarkdown(scholarships);
    const mdPath = join(__dirname, '../output/scholarships-report.md');
    mkdirSync(dirname(mdPath), { recursive: true });
    writeFileSync(mdPath, markdown);
    console.log(`\n✅ Markdown saved to: ${mdPath}`);

    // Generate and save HTML
    const htmlContent = generateHTML(scholarships);
    const htmlPath = join(__dirname, '../output/scholarships-report.html');
    writeFileSync(htmlPath, htmlContent);
    console.log(`✅ HTML saved to: ${htmlPath}`);

    console.log(`\n📊 Total scholarships: ${scholarships.length}`);
    console.log(`📊 With eligibility tracks: ${scholarships.filter(s => s.tracks && s.tracks.length > 0).length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
