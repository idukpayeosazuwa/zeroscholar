module.exports = {
  apps: [{
    name: 'scholarship-scraper',
    script: 'tsx',
    args: 'scripts/scholarshipScraper.ts',
    cron_restart: '0 * * * *', // Run every hour at minute 0
    autorestart: false,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
