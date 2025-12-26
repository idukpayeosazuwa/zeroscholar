import { databases, DATABASE_ID, ID } from '../appwriteConfig';
import { rawScholarshipData } from '../data/scholarships';

const SCHOLARSHIPS_COLLECTION_ID = 'eveything';

async function importScholarships() {
  console.log('Starting scholarship import...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const [key, scholarship] of Object.entries(rawScholarshipData)) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        SCHOLARSHIPS_COLLECTION_ID,
        ID.unique(),
        {
          scholarshipKey: key,
          title: scholarship.title,
          provider: scholarship.provider,
          startDate: scholarship.start_date,
          deadline: scholarship.deadline,
          officialLink: scholarship.official_link,
          status: scholarship.status,
          modeSelection: scholarship.mode_selection,
          cgpa: scholarship.cgpa_requirement,
          level: scholarship.level,
       
          benefitInCash: scholarship.benefit_in_cash,
         
        }
      );
      console.log(`✓ Imported: ${scholarship.title}`);
      successCount++;
    } catch (error: any) {
      console.error(`✗ Failed to import ${scholarship.title}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

importScholarships().catch(console.error);
