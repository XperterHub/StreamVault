const fs = require('fs');
const path = require('path');
const http = require('http');

const routes = [
  { route: '', file: 'index.html' },
  { route: 'movies', file: 'movies.html', dir: 'movies' },
  { route: 'series', file: 'series.html', dir: 'series' },
  { route: 'originals', file: 'originals.html', dir: 'originals' },
  { route: 'search', file: 'search.html', dir: 'search' },
  { route: 'profile', file: 'profile.html', dir: 'profile' }
];

const outDir = path.resolve(__dirname, '..', 'out');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function exportAll() {
  console.log('Starting static export from http://localhost:3005...');
  for (const item of routes) {
    const url = `http://localhost:3005/${item.route}`;
    try {
      const html = await fetchUrl(url);
      if (!html || html.trim() === '/' || html.length < 50) {
        console.error(`ERROR: Route ${url} returned invalid content (${html.length} chars)`);
        process.exit(1);
      }
      
      const filePath = path.join(outDir, item.file);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`Saved ${filePath} (${html.length} bytes)`);

      if (item.dir) {
        const routeSubdir = path.join(outDir, item.dir);
        if (!fs.existsSync(routeSubdir)) {
          fs.mkdirSync(routeSubdir, { recursive: true });
        }
        const indexInSubdir = path.join(routeSubdir, 'index.html');
        fs.writeFileSync(indexInSubdir, html, 'utf8');
        console.log(`Saved ${indexInSubdir}`);
      }
    } catch (err) {
      console.error(`Failed to export ${url}:`, err);
      process.exit(1);
    }
  }
  console.log('Static export complete!');
}

exportAll();
