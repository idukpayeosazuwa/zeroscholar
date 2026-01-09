#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# DEPLOY SCHOLARSHIP EMAIL CRON TO APPWRITE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

echo "🚀 Deploying Scholarship Email Notifier to Appwrite Functions..."
echo ""

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo "❌ Appwrite CLI not found!"
    echo ""
    echo "📥 Installing Appwrite CLI..."
    npm install -g appwrite-cli
    echo ""
fi

# First time setup
echo "🔧 Checking Appwrite configuration..."
if [ ! -d ".appwrite" ]; then
    echo ""
    echo "📝 First time setup - let's configure Appwrite"
    echo "⚠️  You'll be prompted for:"
    echo "   - Email: Your Appwrite account email"
    echo "   - Password: Your Appwrite account password"
    echo "   - Endpoint: Your Appwrite server (e.g., https://cloud.appwrite.io/v1)"
    echo ""
    appwrite login
else
    echo "✅ Appwrite already configured"
fi

echo ""
echo "📦 Deploying function with appwrite push..."
appwrite push --verbose

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to Appwrite Console → Functions"
echo "   2. Find 'Scholarship Email Notifier'"
echo "   3. Set environment variables (see below)"
echo "   4. Test the function manually"
echo "   5. It will run automatically at 9 AM daily"
echo ""
echo "🔐 Required Environment Variables:"
echo "   - APPWRITE_ENDPOINT"
echo "   - APPWRITE_PROJECT_ID"
echo "   - APPWRITE_API_KEY"
echo "   - APPWRITE_DATABASE_ID"
echo "   - APPWRITE_SCHOLARSHIP_COLLECTION_ID"
echo "   - APPWRITE_TRACKS_COLLECTION_ID"
echo "   - APPWRITE_USER_COLLECTION_ID"
echo "   - GMAIL_USER"
echo "   - GMAIL_APP_PASSWORD"
echo ""
