const { Client, Databases } = require('node-appwrite');
const nodemailer = require('nodemailer');
const cheerio = require('cheerio');

// Your entire scraper code here...

module.exports = async ({ req, res, log, error }) => {
  try {
    log('Starting scheduled scholarship scraper...');
    await main();
    log('Scraper completed successfully');
    return res.json({ success: true, message: 'Scraper ran successfully' });
  } catch (err) {
    error('Scraper failed:', err);
    return res.json({ success: false, error: err.message }, 500);
  }
};
