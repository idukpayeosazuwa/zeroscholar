import { Client, Account, Databases, ID } from 'node-appwrite';
import fs from 'fs'

// --- CONFIGURATION ---
// 1. Get these from your Appwrite Console > Settings
const CLIENT_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1'; 
const PROJECT_ID = '690f7de40013993815c1';
const API_KEY = 'standard_7c19c1164a35f2bf71c7f04516cfbcb890b5bf92db032dec504257a44a0c1bfbabb6c022f1f571341648cc6f2395ecaf5a75aca7314d8f23fbcb1b4c52690aafcec43dc5fca01151f1d1867a8b9a7313a9a2c03f96207f8b23a2663c3634aa2a23475a7d1d3f25725874659c7c3d128aba58e67a5eaa85431f7c0f53f531f669'; // Create in "API Keys", give 'documents.write' access

// 2. Database IDs
const DATABASE_ID = 'scholarship_db';
const SCHOLARSHIP_COL = 'scholarships';
const TRACKS_COL = 'eligibility_tracks';

// --- INIT SDK ---
const client = new Client();
client
    .setEndpoint(CLIENT_ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

// --- LOAD DATA ---
const rawData = fs.readFileSync('./data.json', 'utf-8');
const scholarships = JSON.parse(rawData);

async function seed() {
    console.log(`🚀 Starting upload for ${scholarships.length} scholarships...`);

    for (const item of scholarships) {
        try {
            // 1. Separate Parent Data from Track Data
            const { tracks, ...parentData } = item;

            // 2. Clean Parent Data (Ensure no nulls where strings are expected if necessary)
            // Appwrite handles nulls fine if the attribute is set to nullable.
            parentData.is_active = true; 

            // 3. Upload Parent (Scholarship)
            const parentDoc = await databases.createDocument(
                DATABASE_ID,
                SCHOLARSHIP_COL,
                ID.unique(),
                parentData
            );

            console.log(`✅ [${parentDoc.scholarship_name}] uploaded. ID: ${parentDoc.$id}`);

            // 4. Upload Children (Tracks)
            if (tracks && Array.isArray(tracks)) {
                for (const track of tracks) {
                    // Add the Foreign Key link
                    track.scholarship_id = parentDoc.$id;

                    await databases.createDocument(
                        DATABASE_ID,
                        TRACKS_COL,
                        ID.unique(),
                        track
                    );
                }
                console.log(`   ╚═ 🔗 Added ${tracks.length} tracks.`);
            }

        } catch (error) {
            console.error(`❌ FAILED: ${item.scholarship_name}`);
            console.error(`   Reason: ${error.message}`);
        }
    }
    
    console.log("\n✨ SEEDING COMPLETE ✨");
}

seed();