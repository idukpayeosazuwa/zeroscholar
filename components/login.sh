#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# LOGIN TO APPWRITE CLI WITH SFO REGIONAL ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════

echo "🔐 Logging into Appwrite CLI..."
echo ""
echo "⚠️  IMPORTANT: Use these exact values:"
echo "   - Endpoint: https://sfo.cloud.appwrite.io/v1"
echo "   - Email: idukpayealex@gmail.com"
echo "   - Password: Your Appwrite account password"
echo ""
echo "🎯 The endpoint MUST match your project's region (SFO)"
echo ""

appwrite login

echo ""
if [ -d ".appwrite" ]; then
    echo "✅ Login successful!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Initialize project: appwrite init project"
    echo "   2. Deploy function: appwrite push"
else
    echo "❌ Login failed. Please try again."
fi
