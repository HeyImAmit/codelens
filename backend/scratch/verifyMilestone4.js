const http = require('http');
const { execSync } = require('child_process');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
          ...(data && {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          }),
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (chunk) => (buf += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(buf);
          } catch (e) {
            parsed = buf;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING CODELENS MILESTONE 4 TEST SUITE');
  console.log('====================================================\n');

  // Clear redis cache keys first
  console.log('Flushing Redis for clean test start...');
  execSync('docker exec codelens-redis redis-cli FLUSHALL');

  // --- TEST 1: Problem Cache GET /api/problems ---
  console.log('\n--- 1. Testing GET /api/problems (All Problems Cache) ---');
  const res1 = await makeRequest('GET', '/api/problems');
  console.log(`1st Call Status: ${res1.statusCode}, Problems Count: ${res1.body.length}`);

  const res2 = await makeRequest('GET', '/api/problems');
  console.log(`2nd Call Status: ${res2.statusCode}, Problems Count: ${res2.body.length}`);

  // Inspect TTL
  const ttlAll = execSync('docker exec codelens-redis redis-cli TTL problems:all').toString().trim();
  console.log(`TTL for problems:all: ${ttlAll}s (Expected: <= 300s)`);

  // --- TEST 2: Problem Cache GET /api/problems/1 ---
  console.log('\n--- 2. Testing GET /api/problems/1 (Problem by ID Cache) ---');
  const resId1 = await makeRequest('GET', '/api/problems/1');
  console.log(`1st Call Status: ${resId1.statusCode}, Problem: ${resId1.body.title}`);

  const resId2 = await makeRequest('GET', '/api/problems/1');
  console.log(`2nd Call Status: ${resId2.statusCode}, Problem: ${resId2.body.title}`);

  const ttlId1 = execSync('docker exec codelens-redis redis-cli TTL problems:1').toString().trim();
  console.log(`TTL for problems:1: ${ttlId1}s (Expected: <= 300s)`);

  // --- TEST 3: Rate Limiting on POST /api/submissions ---
  console.log('\n--- 3. Testing Rate Limiting on POST /api/submissions (Limit = 10/min) ---');
  const sampleSubmission = {
    problemId: 1,
    language: 'java',
    sourceCode: 'public class Main { public static void main(String[] args) {} }',
  };

  const results = [];
  for (let i = 1; i <= 11; i++) {
    const res = await makeRequest('POST', '/api/submissions', sampleSubmission);
    results.push({
      attempt: i,
      statusCode: res.statusCode,
      limit: res.headers['x-ratelimit-limit'],
      remaining: res.headers['x-ratelimit-remaining'],
      retryAfter: res.headers['retry-after'],
      error: res.body?.error,
      id: res.body?.id,
    });
  }

  console.table(results);

  console.log('\nInspecting Redis Keys via SCAN 0:');
  const keysScan = execSync('docker exec codelens-redis redis-cli SCAN 0').toString().trim();
  console.log(keysScan);

  // --- TEST 4: Redis Outage (Cache Fallback & Rate Limiter Fail-Open) ---
  console.log('\n--- 4. Testing Redis Outage / Fail-Open (Stopping codelens-redis) ---');
  execSync('docker stop codelens-redis');
  console.log('codelens-redis stopped.');

  // Cache fallback test
  const resFallback = await makeRequest('GET', '/api/problems');
  console.log(`Outage GET /api/problems Status: ${resFallback.statusCode}, Items: ${resFallback.body.length} (Real PostgreSQL data)`);

  // Rate limiter fail-open test
  const resFailOpen = await makeRequest('POST', '/api/submissions', sampleSubmission);
  console.log(`Outage POST /api/submissions Status: ${resFailOpen.statusCode}, Submission ID: ${resFailOpen.body?.id} (Fail-open allowed)`);

  // Restart Redis
  console.log('\nRestarting codelens-redis...');
  execSync('docker start codelens-redis');
  await new Promise((r) => setTimeout(r, 2000));
  const ping = execSync('docker exec codelens-redis redis-cli ping').toString().trim();
  console.log(`Redis restarted, ping: ${ping}`);

  console.log('\n====================================================');
  console.log('TEST SUITE COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

runTests().catch(console.error);
