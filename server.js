import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hosting environments usually provide the port via process.env.PORT
const PORT = process.env.PORT || 3000;

// --- STORAGE CONFIGURATION ---
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)){
    fs.mkdirSync(DATA_DIR);
}
const LOCAL_DB_FILE = path.join(DATA_DIR, 'db.json');

// Check for Cloud Storage Environment Variables (JSONBin.io)
const CLOUD_ID = process.env.JSONBIN_BIN_ID;
const CLOUD_KEY = process.env.JSONBIN_API_KEY;

const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// --- HELPER FUNCTIONS FOR DATA ACCESS ---

async function readData() {
  // Option 1: Cloud Storage (if configured)
  if (CLOUD_ID && CLOUD_KEY) {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_ID}/latest`, {
        headers: {
          'X-Master-Key': CLOUD_KEY
        }
      });
      if (response.ok) {
        const json = await response.json();
        // JSONBin wraps data in a "record" property usually, or returns direct based on config.
        // Standard v3 returns { record: { ... }, metadata: { ... } }
        return JSON.stringify(json.record); 
      }
      console.error("Cloud Read Error:", await response.text());
      return null;
    } catch (error) {
      console.error("Cloud Fetch Error:", error);
      return null;
    }
  }

  // Option 2: Local File System (Fallback)
  return new Promise((resolve, reject) => {
    fs.readFile(LOCAL_DB_FILE, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') resolve(null);
        else reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function writeData(dataString) {
  // Option 1: Cloud Storage (if configured)
  if (CLOUD_ID && CLOUD_KEY) {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': CLOUD_KEY
        },
        body: dataString
      });
      if (!response.ok) throw new Error(await response.text());
      return true;
    } catch (error) {
      console.error("Cloud Write Error:", error);
      throw error;
    }
  }

  // Option 2: Local File System (Fallback)
  return new Promise((resolve, reject) => {
    fs.writeFile(LOCAL_DB_FILE, dataString, (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

// --- SERVER ---

const server = http.createServer(async (req, res) => {
  // API: GET Data
  if (req.url === '/api/data' && req.method === 'GET') {
    try {
      const data = await readData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data || JSON.stringify(null));
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Database read error' }));
    }
    return;
  }

  // API: POST Data
  if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        await writeData(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Database write error' }));
      }
    });
    return;
  }

  // --- STATIC FILES ---
  let filePath = req.url === '/' 
    ? path.join(DIST_DIR, 'index.html') 
    : path.join(DIST_DIR, req.url);

  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err, indexContent) => {
           if (err) {
             res.writeHead(500); res.end('Error loading index.html');
           } else {
             res.writeHead(200, { 'Content-Type': 'text/html' });
             res.end(indexContent, 'utf-8');
           }
        });
      } else {
        res.writeHead(500); res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  if (CLOUD_ID) console.log("--- CLOUD STORAGE ACTIVE (JSONBin) ---");
  else console.log("--- LOCAL FILE STORAGE ACTIVE ---");
});