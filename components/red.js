import { Client, Databases, Query } from 'node-appwrite';

const CLIENT_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '690f7de40013993815c1';
const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669';

const DB_ID = 'scholarship_db';
const SCHOLARSHIP_COL_ID = 'scholarships';

const client = new Client()
  .setEndpoint(CLIENT_ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function activateAll() {
  console.log('🚀 Starting bulk activation of ALL scholarships...');
  let offset = 0;
  const limit = 100;
  let count = 0;
  let skipped = 0;

  try {
    while (true) {
      const response = await databases.listDocuments(
        DB_ID, 
        SCHOLARSHIP_COL_ID, 
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      if (response.documents.length === 0) break;

      console.log(`\n📥 Processing batch (Offset: ${offset})...`);

      // Process batch in parallel
      const updates = response.documents.map(async (doc) => {
        
        try {
            await databases.updateDocument(
              DB_ID,
              SCHOLARSHIP_COL_ID,
              doc.$id,
              { is_active: false }
            );
            console.log(`   ✅ DeActivated: "${doc.scholarship_name}"`);
            count++;
        } catch (err) {
            console.error(`   ❌ Failed "${doc.scholarship_name}": ${err.message}`);
        }
      });

      await Promise.all(updates);
      
      if (response.documents.length < limit) break;
      offset += limit;
    }
    console.log(`\n${'='.repeat(50)}`);
    console.log(`✨ Complete!`);
    console.log(`   ✅ Activated: ${count}`);
    console.log(`   ⏭️  Already Active: ${skipped}`);
    console.log(`${'='.repeat(50)}\n`);
  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
  }
}

activateAll();
