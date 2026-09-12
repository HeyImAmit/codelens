const http = require('http');

const postSubmission = (sourceCode, language = 'java', problemId = 1) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ problemId, language, sourceCode });
    const req = http.request(
      'http://localhost:5000/api/submissions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve(JSON.parse(body)));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const getSubmission = (id) => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000/api/submissions/${id}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
};

async function runTests() {
  const testCase = process.argv[2] || '1';

  if (testCase === '1') {
    console.log('--- TEST 1: SUCCESS ---');
    const code = `public class Main {
        public static void main(String[] args) {
            System.out.println("Hello CodeLens");
        }
    }`;
    const sub = await postSubmission(code);
    console.log('Submission Created:', sub.id);
    await new Promise((r) => setTimeout(r, 4000));
    const result = await getSubmission(sub.id);
    console.log('Final Result:', result);
  }

  if (testCase === '2') {
    console.log('--- TEST 2: COMPILATION ERROR ---');
    const code = `public class Main {
        public static void main(String[] args) {
            int x = ;
        }
    }`;
    const sub = await postSubmission(code);
    console.log('Submission Created:', sub.id);
    await new Promise((r) => setTimeout(r, 4000));
    const result = await getSubmission(sub.id);
    console.log('Final Result:', result);
  }

  if (testCase === '3') {
    console.log('--- TEST 3: RUNTIME ERROR ---');
    const code = `public class Main {
        public static void main(String[] args) {
            throw new RuntimeException("CodeLens test");
        }
    }`;
    const sub = await postSubmission(code);
    console.log('Submission Created:', sub.id);
    await new Promise((r) => setTimeout(r, 4000));
    const result = await getSubmission(sub.id);
    console.log('Final Result:', result);
  }

  if (testCase === '4') {
    console.log('--- TEST 4: TIMEOUT (Infinite Loop) ---');
    const code = `public class Main {
        public static void main(String[] args) {
            while (true) {}
        }
    }`;
    const sub = await postSubmission(code);
    console.log('Submission Created:', sub.id);
    await new Promise((r) => setTimeout(r, 7000));
    const result = await getSubmission(sub.id);
    console.log('Final Result:', result);
  }

  if (testCase === '5') {
    console.log('--- TEST 5: RESOURCE LIMIT (Memory Alloc) ---');
    const code = `public class Main {
        public static void main(String[] args) {
            byte[][] bytes = new byte[10000][];
            for (int i = 0; i < 10000; i++) {
                bytes[i] = new byte[1024 * 1024 * 10]; // Request 100GB
            }
        }
    }`;
    const sub = await postSubmission(code);
    console.log('Submission Created:', sub.id);
    await new Promise((r) => setTimeout(r, 4000));
    const result = await getSubmission(sub.id);
    console.log('Final Result:', result);
  }
}

runTests();
