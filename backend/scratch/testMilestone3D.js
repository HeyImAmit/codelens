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

const pollUntilComplete = async (id, maxAttempts = 15) => {
  for (let i = 0; i < maxAttempts; i++) {
    const sub = await getSubmission(id);
    if (sub.status !== 'PENDING' && sub.status !== 'RUNNING') {
      return sub;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return await getSubmission(id);
};

async function runMilestone3DTests() {
  console.log('====================================================');
  console.log('CODELENS MILESTONE 3D TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Two Sum - ACCEPTED
  console.log('--- TEST 1: Two Sum (ACCEPTED) ---');
  const twoSumCorrect = `
import java.util.*;

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
}`;
  const sub1 = await postSubmission(twoSumCorrect, 'java', 1);
  console.log(`Created submission #${sub1.id}`);
  const res1 = await pollUntilComplete(sub1.id);
  console.log(`Verdict: ${res1.status} (Execution Time: ${res1.execution_time} ms, Output: ${res1.output})\n`);

  // Test 2: Two Sum - WRONG ANSWER
  console.log('--- TEST 2: Two Sum (WRONG_ANSWER) ---');
  const twoSumWrong = `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("99 99"); // Wrong answer
    }
}`;
  const sub2 = await postSubmission(twoSumWrong, 'java', 1);
  console.log(`Created submission #${sub2.id}`);
  const res2 = await pollUntilComplete(sub2.id);
  console.log(`Verdict: ${res2.status} (Execution Time: ${res2.execution_time} ms, Error: ${res2.error})\n`);

  // Test 3: Valid Parentheses - ACCEPTED
  console.log('--- TEST 3: Valid Parentheses (ACCEPTED) ---');
  const validParenCorrect = `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) {
                System.out.println("false");
                return;
            }
        }
        System.out.println(stack.isEmpty() ? "true" : "false");
    }
}`;
  const sub3 = await postSubmission(validParenCorrect, 'java', 2);
  console.log(`Created submission #${sub3.id}`);
  const res3 = await pollUntilComplete(sub3.id);
  console.log(`Verdict: ${res3.status} (Execution Time: ${res3.execution_time} ms, Output: ${res3.output})\n`);

  // Test 4: Compilation Error
  console.log('--- TEST 4: Compilation Error (COMPILATION_ERROR) ---');
  const compileError = `
public class Main {
    public static void main(String[] args) {
        int x = ;
    }
}`;
  const sub4 = await postSubmission(compileError, 'java', 1);
  console.log(`Created submission #${sub4.id}`);
  const res4 = await pollUntilComplete(sub4.id);
  console.log(`Verdict: ${res4.status} (Error: ${res4.error})\n`);

  // Test 5: Runtime Error
  console.log('--- TEST 5: Runtime Error (RUNTIME_ERROR) ---');
  const runtimeError = `
public class Main {
    public static void main(String[] args) {
        throw new RuntimeException("CodeLens test exception");
    }
}`;
  const sub5 = await postSubmission(runtimeError, 'java', 1);
  console.log(`Created submission #${sub5.id}`);
  const res5 = await pollUntilComplete(sub5.id);
  console.log(`Verdict: ${res5.status} (Error: ${res5.error})\n`);

  // Test 6: Timeout (Infinite Loop)
  console.log('--- TEST 6: Timeout (TIME_LIMIT_EXCEEDED) ---');
  const timeoutCode = `
public class Main {
    public static void main(String[] args) {
        while (true) {}
    }
}`;
  const sub6 = await postSubmission(timeoutCode, 'java', 1);
  console.log(`Created submission #${sub6.id}`);
  const res6 = await pollUntilComplete(sub6.id, 20);
  console.log(`Verdict: ${res6.status} (Error: ${res6.error}, Execution Time: ${res6.execution_time} ms)\n`);

  console.log('====================================================');
  console.log('ALL TESTS EXECUTED SUCCESSFULLY!');
  console.log('====================================================');
}

runMilestone3DTests();
