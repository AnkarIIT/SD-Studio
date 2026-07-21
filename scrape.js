import scrape from 'website-scraper';
import fs from 'fs';

const options = {
  urls: ['https://3dbysd.in/'],
  directory: './scraped_frontend',
  recursive: true,
  maxDepth: 1,
  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  }
};

if (fs.existsSync('./scraped_frontend')) {
    fs.rmSync('./scraped_frontend', { recursive: true, force: true });
}

scrape(options).then((result) => {
    console.log("Successfully scraped the website.");
}).catch((err) => {
    console.error("Error scraping website:", err);
});
