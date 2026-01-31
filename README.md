<div align="center">
</div>

# ScholarAI - AI-Powered Scholarship Matching Platform

ScholarAI helps Nigerian students discover scholarship opportunities tailored to their profiles. Using intelligent matching algorithms, we connect students with scholarships they're actually eligible for—saving time and maximizing application success.

## Features

- **Smart Matching**: Advanced eligibility tracking that accounts for CGPA, JAMB score, level, gender, state, religion, and more
- **Case-Insensitive Matching**: Handles variations in data entry (e.g., "Lagos" vs "lagos")
- **Automated Email Notifications**: Daily cron job sends personalized scholarship matches
- **Offline Support**: PWA with offline capability for offline scholarship browsing
- **Real-Time Updates**: Automatic deactivation of expired scholarships

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Appwrite Cloud (Serverless)
- **Database**: Appwrite Database
- **Automation**: Node.js 18 Cloud Functions with Nodemailer
- **Hosting**: Vercel (frontend)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/zeroscholar.git
   cd zeroscholar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Appwrite and Gmail credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Environment Variables

See [.env.example](.env.example) for a complete list of required variables.

**Key Configuration:**
- `APPWRITE_PROJECT_ID`: Your Appwrite project ID
- `APPWRITE_API_KEY`: API key with Database + Users read permissions
- `GMAIL_USER`: Gmail address for sending notifications
- `GMAIL_APP_PASSWORD`: Google App Password (16 characters, no spaces)

## Architecture

### Scholarship Matching Algorithm

The matching engine checks eligibility across multiple dimensions:

1. **Academic Metrics**: CGPA, JAMB score, university level
2. **Demographics**: Gender, state of origin, LGA, university
3. **Profile**: Course category, religion
4. **Special Requirements**: Disability status, financial need, orphan status

All comparisons are **case-insensitive** and support wildcard values ("All", "ANY").

### Email Notification System

- Runs daily at **8:00 AM WAT** (configurable via Appwrite Console)
- Fetches all users and active scholarships
- Matches scholarships to each user based on eligibility tracks
- Sends personalized email digest with top 10 matches
- Updates user's `notified` array to prevent duplicate notifications
- Automatically deactivates expired scholarships

## Deployment

### Frontend
```bash
npm run build
# Deploy the /dist folder to Vercel
```

### Backend Functions
```bash
cd components
appwrite push function
```

## Testing

Run the matching algorithm test suite:
```bash
cd components/functions/"Starter function"/src
node helpers.js
```

## Performance Metrics

- Cold start time: ~100ms (Node 18, 4vCPU/4GB)
- Matching accuracy: 100% (10/10 test cases pass)
- Email delivery: <2s per email
- Max users per run: 1000+ (with batching)

## Revenue Model

- **Freemium**: Free scholarship matching
- **Premium**: N2,500 for aptitude test preparation (~20 scholarships require this)
- **Target**: 200 paying users = N500,000 MRR

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.
