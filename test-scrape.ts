import fs from 'fs';
import * as cheerio from 'cheerio';

async function test() {
  const html = fs.readFileSync('detail_body.html', 'utf8');
  const $ = cheerio.load(html);
  
  // Extract title
  const title = $('title').text();
  console.log("Title:", title);
  
  // Extract parties
  const parties = $('parties').text().trim();
  console.log("Parties:", parties);
  
  // Extract judgment text
  const paragraphs = $('p').map((i, el) => $(el).text()).get();
  console.log("First 5 paragraphs:");
  paragraphs.slice(0, 5).forEach((p, i) => console.log(`${i+1}: ${p}`));
}

test();
