const sdk = require('node-appwrite');

/*
    Track Referral Function
    Recommended Trigger:
        databases.[database_id].collections.[users_collection_id].documents.*.create
    (Counts referrals immediately on signup)
*/

module.exports = async function (context) {
    const client = new sdk.Client();
    
    // You can remove this or keep it if needed for env validation
    const project_id = process.env.APPWRITE_FUNCTION_PROJECT_ID;
    const endpoint = process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1';
    
    if (!project_id || !process.env.APPWRITE_API_KEY) {
        context.error("Environment variables are not fully set.");
        return context.res.send("Environment variables are not fully set", 500);
    }
    
    client
        .setEndpoint(endpoint)
        .setProject(project_id)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    // Parse event payload (Appwrite versions vary)
    let parsedData = null;
    const eventPayload = process.env.APPWRITE_FUNCTION_EVENT_DATA;
    if (eventPayload) {
        try {
            parsedData = JSON.parse(eventPayload);
        } catch(e) {
            context.error("Failed to parse event data");
        }
    } else if (typeof context.req.body === 'object') {
        parsedData = context.req.body;
    } else if (context.req.bodyRaw) {
        try {
            parsedData = JSON.parse(context.req.bodyRaw);
        } catch(e) {}
    }

    if (!parsedData) {
        return context.res.json({ success: false, message: "No valid data found" });
    }

    const DATABASE_ID = process.env.DATABASE_ID || 'scholarship_db';
    const USERS_COLLECTION_ID = process.env.USERS_COLLECTION_ID || 'users';
    const REFERRALS_COLLECTION_ID = process.env.REFERRALS_COLLECTION_ID || 'referrals';

    // Fetch the latest user document (more reliable than trusting event payload alone)
    let userDoc = parsedData;
    const userId = parsedData && (parsedData.$id || parsedData.documentId || parsedData.document_id);
    if (userId) {
        try {
            userDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
        } catch (e) {
            context.error('Failed to fetch user document: ' + (e.message || String(e)));
            // Fall back to parsedData if getDocument fails
            userDoc = parsedData;
        }
    }

    const referredByRaw = userDoc ? userDoc.referredBy : null;
    const referredBy = typeof referredByRaw === 'string' ? referredByRaw.trim().toLowerCase() : null;
    const referralProcessedFlag = userDoc ? userDoc.referralProcessed === true : false;

    if (!referredBy) {
        context.log("No referral code in user doc. Skipping.");
        return context.res.json({ success: true, message: "No referral code attached", skipped: true });
    }

    // Idempotency guard
    if (referralProcessedFlag) {
        context.log("Referral already processed (flag). Skipping.");
        return context.res.json({ success: true, message: "Already processed", skipped: true });
    }

    try {
        // Query to find the ambassador with this referral Code
        const ambassadors = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [
                sdk.Query.equal('referralCode', referredBy)
            ]
        );

        if (ambassadors.total === 0) {
            context.log(`No ambassador found with code: ${referredBy}`);
            return context.res.json({ success: true, message: "Invalid referral code", skipped: true });
        }

        const ambassador = ambassadors.documents[0];
        const currentCount = ambassador.referralCount || 0;

        // Idempotency gate:
        // If the `referrals` collection exists, create the referral record using refereeId as the document ID.
        // This makes retries/concurrent executions safe: only one will be able to create the record.
        let referralRecordCreated = false;
        if (userDoc && userDoc.$id) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    REFERRALS_COLLECTION_ID,
                    userDoc.$id,
                    {
                        referrerId: ambassador.$id,
                        referrerCode: referredBy,
                        refereeId: userDoc.$id,
                        refereeName: userDoc.fullName || 'Anonymous'
                    },
                    [
                        `read("user:${ambassador.$id}")`
                    ]
                );
                referralRecordCreated = true;
            } catch (e) {
                const msg = e && (e.message || String(e));

                // Document already exists => already processed
                if (String(msg).toLowerCase().includes('document') && String(msg).toLowerCase().includes('exists')) {
                    context.log('Referral record already exists. Skipping increment.');
                    return context.res.json({ success: true, message: 'Already processed', skipped: true });
                }

                // If the referrals collection isn't set up yet, allow counting to proceed,
                // but note that this loses the strongest idempotency guarantee.
                context.log('Could not create referral record (collection missing or schema mismatch?): ' + msg);
            }
        }

        // Increment the count (best-effort; dashboard can also derive totals from referrals collection when available)
        try {
            await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                ambassador.$id,
                {
                    referralCount: currentCount + 1
                }
            );
        } catch (e) {
            context.log('Failed to increment referralCount on ambassador doc: ' + (e.message || String(e)));
        }

        // Mark referral as processed on the referred user's profile (idempotent)
        if (userDoc && userDoc.$id) {
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    userDoc.$id,
                    {
                        referralProcessed: true,
                        referralProcessedAt: new Date().toISOString()
                    }
                );
            } catch (e) {
                // Schema may not include these fields yet; rely on referrals collection idempotency.
                context.log('Failed to mark referralProcessed on user doc: ' + (e.message || String(e)));
            }
        }

        context.log(`Incremented referral count for ambassador ${ambassador.$id} (${ambassador.referralCode}) to ${currentCount + 1}`);
        
        return context.res.json({ 
            success: true, 
            message: "Referral count incremented",
            ambassadorId: ambassador.$id,
            newCount: currentCount + 1
        });

    } catch (err) {
        context.error("Error occurred while processing referral: " + err.message);
        return context.res.json({ success: false, message: err.message }, 500);
    }
};
