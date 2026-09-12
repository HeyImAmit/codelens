const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let buf = '';
      res.on('data', (chunk) => (buf += chunk));
      res.on('end', () => resolve(JSON.parse(buf)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 5000, path: path }, (res) => {
      let buf = '';
      res.on('data', (chunk) => (buf += chunk));
      res.on('end', () => resolve(JSON.parse(buf)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing submission creation + polling loop simulation...');
  const sub = await post('/api/submissions', {
    problemId: 1,
    language: 'java',
    sourceCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                System.out.println(map.get(complement) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}`,
  });
  console.log('Initial Submission Response:', sub);

  let attempts = 0;
  const terminalStatuses = ['ACCEPTED', 'WRONG_ANSWER', 'COMPILATION_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED'];

  while (attempts < 10) {
    await new Promise((r) => setTimeout(r, 1200));
    attempts++;
    const statusRes = await get(`/api/submissions/${sub.id}`);
    console.log(`Poll #${attempts} - Status: ${statusRes.status}, Execution Time: ${statusRes.execution_time}ms`);
    if (terminalStatuses.includes(statusRes.status)) {
      console.log('Final evaluation reached:', statusRes);
      break;
    }
  }
}

run().catch(console.error);
