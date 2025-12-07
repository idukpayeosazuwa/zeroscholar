#!/bin/bash
cd /workspaces/zeroscholar
npm run scrape-scholarships >> /var/log/scholarship-scraper.log 2>&1
