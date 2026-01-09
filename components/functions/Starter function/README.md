# Email Notification Function

Automated serverless function that sends personalized scholarship match emails to users daily.

## What It Does

1. **Deactivates Expired Scholarships**: Checks deadlines and disables past opportunities
2. **Matches Scholarships**: Finds new scholarships for each user based on eligibility tracks
3. **Sends Emails**: Delivers HTML email digest with up to 10 new matches
4. **Updates Database**: Records which scholarships have been notified to prevent duplicates

## Schedule

Runs daily at **8:00 AM WAT** (UTC+1)

To change the schedule:
1. Go to Appwrite Console → Functions → Starter function → Settings
2. Update the **Schedule** field with a cron expression:
   - `0 7 * * *` = Daily at 8 AM WAT
   - `0 8 * * 1` = Every Monday at 9 AM WAT
   - `0 */6 * * *` = Every 6 hours

## Environment Variables

Required (set in Appwrite Console):

```
APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key (needs Database read, Users read permissions)
APPWRITE_DATABASE_ID=scholarship_db
APPWRITE_SCHOLARSHIP_COLLECTION_ID=scholarships
APPWRITE_TRACKS_COLLECTION_ID=eligibility_tracks
APPWRITE_USER_COLLECTION_ID=users
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password (16 chars, no spaces)
```

## Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 900           |
| Memory            | 4GB           |
| CPU               | 4 vCPU        |
| Schedule          | `0 7 * * *`   |

## Performance

- **Cold Start**: ~100ms
- **Email Delivery**: <2s per email
- **Max Users**: 1000+ (with sequential processing)

## Deployment

```bash
cd components
appwrite push function
```

## Monitoring

Check execution logs in Appwrite Console:
- Functions → Starter function → Logs
- Each run shows:
  - Scholarships deactivated
  - Scholarships fetched
  - Tracks loaded
  - Users processed
  - Emails sent
  - Total duration

## Troubleshooting

**No emails sent?**
- Check Gmail credentials are correct
- Verify users have complete profiles (email, uni, course)
- Check if scholarships have eligibility tracks

**Function times out?**
- Check that CPU allocation is 4 vCPU/4GB
- Reduce Query.limit() values in code
- Increase function timeout in appwrite.json

**Emails in spam?**
- Add ScholarAI to Gmail contacts
- Check Gmail authentication settings
- Verify DKIM/SPF records if using custom domain

## Files

- `main.js` - Production function handler
- `helpers.js` - Matching logic and utilities
- `.appwriteignore` - Excludes node_modules from deployment
