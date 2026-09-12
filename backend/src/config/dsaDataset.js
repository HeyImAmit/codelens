/**
 * CodeLens Curated DSA Problem Catalog & Test Cases
 * 42 Problems across 18 Topics:
 * - 13 Easy
 * - 22 Medium
 * - 7 Hard
 * Total Test Cases: > 230
 */

const DSA_PROBLEMS = [
  // ==========================================
  // 1. ARRAYS (4 problems: 2 Easy, 2 Medium)
  // ==========================================
  {
    title: "Two Sum",
    difficulty: "EASY",
    topic: "Arrays",
    description: "Given an array of integers nums and an integer target, return the zero-based indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nExactly one valid answer exists.",
    input_format: "First line contains two integers n (array length) and target.\nSecond line contains n space-separated integers representing nums.",
    output_format: "Print two space-separated indices in ascending order (e.g. '0 1').",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "4 9\n2 7 11 15", expectedOutput: "0 1", isHidden: false },
      { input: "3 6\n3 2 4", expectedOutput: "1 2", isHidden: false },
      { input: "2 6\n3 3", expectedOutput: "0 1", isHidden: true },
      { input: "5 10\n1 2 3 4 8", expectedOutput: "1 4", isHidden: true },
      { input: "4 -8\n-1 -2 -5 -7", expectedOutput: "0 3", isHidden: true },
      { input: "6 0\n-5 1 2 3 5 8", expectedOutput: "0 4", isHidden: true }
    ]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    difficulty: "EASY",
    topic: "Arrays",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    input_format: "First line contains an integer n (number of days).\nSecond line contains n space-separated integers representing stock prices.",
    output_format: "Print a single integer representing the maximum profit.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "6\n7 1 5 3 6 4", expectedOutput: "5", isHidden: false },
      { input: "5\n7 6 4 3 1", expectedOutput: "0", isHidden: false },
      { input: "1\n10", expectedOutput: "0", isHidden: true },
      { input: "2\n2 4", expectedOutput: "2", isHidden: true },
      { input: "6\n2 1 2 1 0 1", expectedOutput: "1", isHidden: true },
      { input: "6\n3 2 6 5 0 3", expectedOutput: "4", isHidden: true }
    ]
  },
  {
    title: "Product of Array Except Self",
    difficulty: "MEDIUM",
    topic: "Arrays",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
    constraints: "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30",
    input_format: "First line contains an integer n.\nSecond line contains n space-separated integers representing nums.",
    output_format: "Print n space-separated integers representing the resulting products.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6", isHidden: false },
      { input: "5\n-1 1 0 -3 3", expectedOutput: "0 0 9 0 0", isHidden: false },
      { input: "2\n2 3", expectedOutput: "3 2", isHidden: true },
      { input: "3\n0 0 2", expectedOutput: "0 0 0", isHidden: true },
      { input: "4\n-1 -2 -3 -4", expectedOutput: "-24 -12 -8 -6", isHidden: true },
      { input: "5\n2 3 4 5 6", expectedOutput: "360 240 180 144 120", isHidden: true }
    ]
  },
  {
    title: "Maximum Subarray",
    difficulty: "MEDIUM",
    topic: "Arrays",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    input_format: "First line contains an integer n.\nSecond line contains n space-separated integers representing nums.",
    output_format: "Print a single integer representing the maximum subarray sum.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isHidden: false },
      { input: "1\n1", expectedOutput: "1", isHidden: false },
      { input: "5\n5 4 -1 7 8", expectedOutput: "23", isHidden: true },
      { input: "5\n-5 -4 -1 -7 -8", expectedOutput: "-1", isHidden: true },
      { input: "4\n-2 -1 -3 -4", expectedOutput: "-1", isHidden: true },
      { input: "6\n-2 3 -1 2 -5 4", expectedOutput: "4", isHidden: true }
    ]
  },

  // ==========================================
  // 2. STRINGS (3 problems: 2 Easy, 1 Medium)
  // ==========================================
  {
    title: "Valid Palindrome",
    difficulty: "EASY",
    topic: "Strings",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
    constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
    input_format: "A single line containing string s.",
    output_format: "Print 'true' if s is a valid palindrome, otherwise print 'false'.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isHidden: false },
      { input: "race a car", expectedOutput: "false", isHidden: false },
      { input: " ", expectedOutput: "true", isHidden: true },
      { input: "0P", expectedOutput: "false", isHidden: true },
      { input: "a.", expectedOutput: "true", isHidden: true },
      { input: "ab_a", expectedOutput: "true", isHidden: true }
    ]
  },
  {
    title: "Longest Common Prefix",
    difficulty: "EASY",
    topic: "Strings",
    description: "Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string (or print 'EMPTY').",
    constraints: "1 <= strs.length <= 200\n0 <= strs[i].length <= 200\nstrs[i] consists of only lowercase English letters.",
    input_format: "First line contains an integer n (number of strings).\nNext n lines each contain one string.",
    output_format: "Print the longest common prefix. If empty, print 'EMPTY'.",
    expected_time_complexity: "O(S)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "3\nflower\nflow\nflight", expectedOutput: "fl", isHidden: false },
      { input: "3\ndog\nracecar\ncar", expectedOutput: "EMPTY", isHidden: false },
      { input: "1\nabc", expectedOutput: "abc", isHidden: true },
      { input: "2\na\na", expectedOutput: "a", isHidden: true },
      { input: "3\nprefix\npre\nprefixing", expectedOutput: "pre", isHidden: true },
      { input: "2\ninterstellar\ninternet", expectedOutput: "inter", isHidden: true }
    ]
  },
  {
    title: "Longest Palindromic Substring",
    difficulty: "MEDIUM",
    topic: "Strings",
    description: "Given a string s, return the longest palindromic substring in s. If there are multiple palindromes of the same maximum length, return the one that appears earliest in s.",
    constraints: "1 <= s.length <= 1000\ns consists of only digits and English letters.",
    input_format: "A single line containing string s.",
    output_format: "Print the longest palindromic substring.",
    expected_time_complexity: "O(n^2)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "babad", expectedOutput: "bab", isHidden: false },
      { input: "cbbd", expectedOutput: "bb", isHidden: false },
      { input: "a", expectedOutput: "a", isHidden: true },
      { input: "ac", expectedOutput: "a", isHidden: true },
      { input: "racecar", expectedOutput: "racecar", isHidden: true },
      { input: "forgeeksskeegfor", expectedOutput: "geeksskeeg", isHidden: true }
    ]
  },

  // ==========================================
  // 3. HASHING (3 problems: 1 Easy, 2 Medium)
  // ==========================================
  {
    title: "Contains Duplicate",
    difficulty: "EASY",
    topic: "Hashing",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    constraints: "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    input_format: "First line contains an integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print 'true' if duplicate exists, otherwise print 'false'.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "true", isHidden: false },
      { input: "4\n1 2 3 4", expectedOutput: "false", isHidden: false },
      { input: "10\n1 1 1 3 3 4 3 2 4 2", expectedOutput: "true", isHidden: true },
      { input: "1\n42", expectedOutput: "false", isHidden: true },
      { input: "5\n-1 -2 -3 -4 -1", expectedOutput: "true", isHidden: true },
      { input: "5\n0 5 10 15 20", expectedOutput: "false", isHidden: true }
    ]
  },
  {
    title: "Group Anagrams",
    difficulty: "MEDIUM",
    topic: "Hashing",
    description: "Given an array of strings strs, group the anagrams together.\n\nTo ensure deterministic output, sort each group alphabetically, and print groups in lexicographical order of their first element.",
    constraints: "1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters.",
    input_format: "First line contains integer n.\nNext n lines each contain one string.",
    output_format: "Print each group of anagrams on a new line, words space-separated.",
    expected_time_complexity: "O(n * k log k)",
    expected_space_complexity: "O(n * k)",
    testCases: [
      { input: "6\neat\ntea\ntan\nate\nnat\nbat", expectedOutput: "ate eat tea\nbat\nnat tan", isHidden: false },
      { input: "1\na", expectedOutput: "a", isHidden: false },
      { input: "2\nab\nba", expectedOutput: "ab ba", isHidden: true },
      { input: "4\nlisten\nsilent\nenlist\ngoogle", expectedOutput: "enlist listen silent\ngoogle", isHidden: true },
      { input: "3\nrat\ntar\nart", expectedOutput: "art rat tar", isHidden: true },
      { input: "2\na\nb", expectedOutput: "a\nb", isHidden: true }
    ]
  },
  {
    title: "Top K Frequent Elements",
    difficulty: "MEDIUM",
    topic: "Hashing",
    description: "Given an integer array nums and an integer k, return the k most frequent elements.\n\nPrint the resulting elements in ascending order.",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\nk is in the range [1, the number of unique elements in the array].",
    input_format: "First line contains two integers n and k.\nSecond line contains n space-separated integers representing nums.",
    output_format: "Print k space-separated integers in ascending order.",
    expected_time_complexity: "O(n log k)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "6 2\n1 1 1 2 2 3", expectedOutput: "1 2", isHidden: false },
      { input: "1 1\n1", expectedOutput: "1", isHidden: false },
      { input: "4 2\n-1 -1 2 2", expectedOutput: "-1 2", isHidden: true },
      { input: "6 1\n4 4 4 1 2 3", expectedOutput: "4", isHidden: true },
      { input: "8 3\n1 2 2 3 3 3 4 4", expectedOutput: "2 3 4", isHidden: true },
      { input: "5 2\n5 5 6 6 7", expectedOutput: "5 6", isHidden: true }
    ]
  },

  // ==========================================
  // 4. TWO POINTERS (2 problems: 2 Medium)
  // ==========================================
  {
    title: "3Sum",
    difficulty: "MEDIUM",
    topic: "Two Pointers",
    description: "Given an integer array nums, return all the unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nEach triplet must be sorted internally in non-descending order. Output all unique triplets printed on separate lines sorted lexicographically. If none exist, print 'NONE'.",
    constraints: "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
    input_format: "First line contains an integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print each triplet on a new line with three space-separated integers, or 'NONE'.",
    expected_time_complexity: "O(n^2)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "6\n-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2\n-1 0 1", isHidden: false },
      { input: "3\n0 1 1", expectedOutput: "NONE", isHidden: false },
      { input: "3\n0 0 0", expectedOutput: "0 0 0", isHidden: true },
      { input: "5\n-2 0 0 2 2", expectedOutput: "-2 0 2", isHidden: true },
      { input: "4\n1 2 3 4", expectedOutput: "NONE", isHidden: true },
      { input: "7\n-4 -2 -2 -2 0 1 2", expectedOutput: "-4 2 2\n-2 0 2", isHidden: true }
    ]
  },
  {
    title: "Container With Most Water",
    difficulty: "MEDIUM",
    topic: "Two Pointers",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    constraints: "2 <= n <= 10^5\n0 <= height[i] <= 10^4",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers representing heights.",
    output_format: "Print a single integer representing the maximum water volume.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49", isHidden: false },
      { input: "2\n1 1", expectedOutput: "1", isHidden: false },
      { input: "4\n4 3 2 1", expectedOutput: "4", isHidden: true },
      { input: "4\n1 2 3 4", expectedOutput: "4", isHidden: true },
      { input: "5\n5 5 5 5 5", expectedOutput: "20", isHidden: true },
      { input: "6\n1 2 4 3 2 1", expectedOutput: "6", isHidden: true }
    ]
  },

  // ==========================================
  // 5. SLIDING WINDOW (2 problems: 1 Medium, 1 Hard)
  // ==========================================
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    topic: "Sliding Window",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    input_format: "A single line containing string s (which may be empty).",
    output_format: "Print a single integer representing the length.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(min(m, n))",
    testCases: [
      { input: "abcabcbb", expectedOutput: "3", isHidden: false },
      { input: "bbbbb", expectedOutput: "1", isHidden: false },
      { input: "pwwkew", expectedOutput: "3", isHidden: true },
      { input: "", expectedOutput: "0", isHidden: true },
      { input: "au", expectedOutput: "2", isHidden: true },
      { input: "dvdf", expectedOutput: "3", isHidden: true }
    ]
  },
  {
    title: "Minimum Window Substring",
    difficulty: "HARD",
    topic: "Sliding Window",
    description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return an empty string (or 'EMPTY').",
    constraints: "1 <= s.length, t.length <= 10^5\ns and t consist of uppercase and lowercase English letters.",
    input_format: "First line contains string s.\nSecond line contains string t.",
    output_format: "Print the minimum window substring, or 'EMPTY'.",
    expected_time_complexity: "O(m + n)",
    expected_space_complexity: "O(m + n)",
    testCases: [
      { input: "ADOBECODEBANC\nABC", expectedOutput: "BANC", isHidden: false },
      { input: "a\na", expectedOutput: "a", isHidden: false },
      { input: "a\naa", expectedOutput: "EMPTY", isHidden: true },
      { input: "ab\nb", expectedOutput: "b", isHidden: true },
      { input: "cabwefgewcwaefgcf\ncae", expectedOutput: "cwae", isHidden: true },
      { input: "DONOTPANIC\nPAN", expectedOutput: "PAN", isHidden: true }
    ]
  },

  // ==========================================
  // 6. BINARY SEARCH (3 problems: 1 Easy, 2 Medium)
  // ==========================================
  {
    title: "Binary Search",
    difficulty: "EASY",
    topic: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its 0-based index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    constraints: "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.",
    input_format: "First line contains two integers n (length) and target.\nSecond line contains n space-separated integers representing nums.",
    output_format: "Print the index of target if found, otherwise print -1.",
    expected_time_complexity: "O(log n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "6 9\n-1 0 3 5 9 12", expectedOutput: "4", isHidden: false },
      { input: "6 2\n-1 0 3 5 9 12", expectedOutput: "-1", isHidden: false },
      { input: "1 5\n5", expectedOutput: "0", isHidden: true },
      { input: "1 0\n5", expectedOutput: "-1", isHidden: true },
      { input: "5 -5\n-5 -2 0 3 9", expectedOutput: "0", isHidden: true },
      { input: "5 9\n-5 -2 0 3 9", expectedOutput: "4", isHidden: true }
    ]
  },
  {
    title: "Search in Rotated Sorted Array",
    difficulty: "MEDIUM",
    topic: "Binary Search",
    description: "There is an integer array nums sorted in ascending order (with distinct values).\n\nPrior to being passed to your function, nums is possibly rotated at an unknown pivot index k. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
    constraints: "1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.\nnums is an ascending array that is possibly rotated.",
    input_format: "First line contains two integers n and target.\nSecond line contains n space-separated integers representing nums.",
    output_format: "Print the 0-based index of target, or -1.",
    expected_time_complexity: "O(log n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "7 0\n4 5 6 7 0 1 2", expectedOutput: "4", isHidden: false },
      { input: "7 3\n4 5 6 7 0 1 2", expectedOutput: "-1", isHidden: false },
      { input: "1 0\n1", expectedOutput: "-1", isHidden: true },
      { input: "1 1\n1", expectedOutput: "0", isHidden: true },
      { input: "2 1\n1 3", expectedOutput: "0", isHidden: true },
      { input: "5 1\n3 5 1 2 4", expectedOutput: "2", isHidden: true }
    ]
  },
  {
    title: "Find First and Last Position of Element in Sorted Array",
    difficulty: "MEDIUM",
    topic: "Binary Search",
    description: "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.\n\nIf target is not found in the array, return [-1, -1].\n\nYou must write an algorithm with O(log n) runtime complexity.",
    constraints: "0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\nnums is a non-decreasing array.\n-10^9 <= target <= 10^9",
    input_format: "First line contains two integers n and target.\nSecond line contains n space-separated integers (if n > 0).",
    output_format: "Print two space-separated integers representing the first and last indices.",
    expected_time_complexity: "O(log n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "6 8\n5 7 7 8 8 10", expectedOutput: "3 4", isHidden: false },
      { input: "6 6\n5 7 7 8 8 10", expectedOutput: "-1 -1", isHidden: false },
      { input: "0 0\n", expectedOutput: "-1 -1", isHidden: true },
      { input: "1 1\n1", expectedOutput: "0 0", isHidden: true },
      { input: "4 2\n2 2 2 2", expectedOutput: "0 3", isHidden: true },
      { input: "5 3\n1 2 3 4 5", expectedOutput: "2 2", isHidden: true }
    ]
  },

  // ==========================================
  // 7. LINKED LISTS (3 problems: 2 Easy, 1 Medium)
  // ==========================================
  {
    title: "Reverse Linked List",
    difficulty: "EASY",
    topic: "Linked Lists",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nRepresentation: The list is given as a sequence of n integers. Print the values of the reversed linked list space-separated. If the list is empty (n=0), print 'EMPTY'.",
    constraints: "0 <= Number of nodes <= 5000\n-5000 <= Node.val <= 5000",
    input_format: "First line contains integer n (number of nodes).\nSecond line contains n space-separated integers (if n > 0).",
    output_format: "Print the reversed values space-separated, or 'EMPTY'.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1", isHidden: false },
      { input: "2\n1 2", expectedOutput: "2 1", isHidden: false },
      { input: "0\n", expectedOutput: "EMPTY", isHidden: true },
      { input: "1\n42", expectedOutput: "42", isHidden: true },
      { input: "4\n1 1 1 1", expectedOutput: "1 1 1 1", isHidden: true },
      { input: "6\n-1 -2 -3 -4 -5 -6", expectedOutput: "-6 -5 -4 -3 -2 -1", isHidden: true }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    difficulty: "EASY",
    topic: "Linked Lists",
    description: "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the space-separated values of the merged linked list, or 'EMPTY' if both are empty.",
    constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
    input_format: "First line contains n1 followed by n1 integers for list1.\nSecond line contains n2 followed by n2 integers for list2.",
    output_format: "Print space-separated merged sorted values, or 'EMPTY'.",
    expected_time_complexity: "O(n + m)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "3 1 2 4\n3 1 3 4", expectedOutput: "1 1 2 3 4 4", isHidden: false },
      { input: "0\n0", expectedOutput: "EMPTY", isHidden: false },
      { input: "0\n1 0", expectedOutput: "0", isHidden: true },
      { input: "2 5 10\n2 1 2", expectedOutput: "1 2 5 10", isHidden: true },
      { input: "3 -3 -1 1\n3 -2 0 2", expectedOutput: "-3 -2 -1 0 1 2", isHidden: true },
      { input: "1 10\n1 20", expectedOutput: "10 20", isHidden: true }
    ]
  },
  {
    title: "Remove Nth Node From End of List",
    difficulty: "MEDIUM",
    topic: "Linked Lists",
    description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.\n\nPrint the space-separated values of the modified list, or 'EMPTY' if the list becomes empty.",
    constraints: "The number of nodes in the list is sz.\n1 <= sz <= 30\n0 <= Node.val <= 100\n1 <= n <= sz",
    input_format: "First line contains two integers sz (total nodes) and n (from end).\nSecond line contains sz space-separated integers.",
    output_format: "Print the remaining space-separated values, or 'EMPTY'.",
    expected_time_complexity: "O(sz)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "5 2\n1 2 3 4 5", expectedOutput: "1 2 3 5", isHidden: false },
      { input: "1 1\n1", expectedOutput: "EMPTY", isHidden: false },
      { input: "2 1\n1 2", expectedOutput: "1", isHidden: true },
      { input: "2 2\n1 2", expectedOutput: "2", isHidden: true },
      { input: "4 4\n10 20 30 40", expectedOutput: "20 30 40", isHidden: true },
      { input: "6 3\n1 2 3 4 5 6", expectedOutput: "1 2 3 5 6", isHidden: true }
    ]
  },

  // ==========================================
  // 8. STACK (2 problems: 1 Easy, 1 Medium)
  // ==========================================
  {
    title: "Valid Parentheses",
    difficulty: "EASY",
    topic: "Stack",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    input_format: "A single line containing string s.",
    output_format: "Print 'true' if valid, otherwise print 'false'.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "()", expectedOutput: "true", isHidden: false },
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "(]", expectedOutput: "false", isHidden: false },
      { input: "([)]", expectedOutput: "false", isHidden: true },
      { input: "{[]}", expectedOutput: "true", isHidden: true },
      { input: "]", expectedOutput: "false", isHidden: true }
    ]
  },
  {
    title: "Daily Temperatures",
    difficulty: "MEDIUM",
    topic: "Stack",
    description: "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.",
    constraints: "1 <= temperatures.length <= 10^5\n30 <= temperatures[i] <= 100",
    input_format: "First line contains an integer n.\nSecond line contains n space-separated integers representing temperatures.",
    output_format: "Print n space-separated integers representing waiting days.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "8\n73 74 75 71 69 72 76 73", expectedOutput: "1 1 4 2 1 1 0 0", isHidden: false },
      { input: "4\n30 40 50 60", expectedOutput: "1 1 1 0", isHidden: false },
      { input: "3\n30 60 90", expectedOutput: "1 1 0", isHidden: true },
      { input: "1\n50", expectedOutput: "0", isHidden: true },
      { input: "5\n80 70 60 50 40", expectedOutput: "0 0 0 0 0", isHidden: true },
      { input: "6\n40 50 40 50 40 50", expectedOutput: "1 0 1 0 1 0", isHidden: true }
    ]
  },

  // ==========================================
  // 9. QUEUE (2 problems: 1 Easy, 1 Medium)
  // ==========================================
  {
    title: "Implement Queue using Stacks",
    difficulty: "EASY",
    topic: "Queue",
    description: "Implement a first in first out (FIFO) queue using only two stacks.\n\nOperations:\n- push x: Pushes element x to the back of the queue.\n- pop: Removes the element from the front of the queue and returns it.\n- peek: Returns the element at the front of the queue.\n- empty: Returns true if the queue is empty, false otherwise.",
    constraints: "1 <= x <= 9\nAt most 100 calls will be made to push, pop, peek, and empty.\nAll the calls to pop and peek are valid.",
    input_format: "First line contains integer q (number of operations).\nNext q lines each contain an operation command.",
    output_format: "Print the output of each 'pop', 'peek', and 'empty' operation on a new line.",
    expected_time_complexity: "O(1) amortized",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "5\npush 1\npush 2\npeek\npop\nempty", expectedOutput: "1\n1\nfalse", isHidden: false },
      { input: "3\npush 10\npop\nempty", expectedOutput: "10\ntrue", isHidden: false },
      { input: "4\npush 5\npush 6\npop\npeek", expectedOutput: "5\n6", isHidden: true },
      { input: "6\npush 1\npush 2\npush 3\npop\npop\npop", expectedOutput: "1\n2\n3", isHidden: true },
      { input: "2\npush 99\npeek", expectedOutput: "99", isHidden: true }
    ]
  },
  {
    title: "Rotting Oranges",
    difficulty: "MEDIUM",
    topic: "Queue",
    description: "You are given an m x n grid where each cell can have one of three values:\n- 0 representing an empty cell,\n- 1 representing a fresh orange, or\n- 2 representing a rotten orange.\n\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.\n\nReturn the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.",
    constraints: "m == grid.length\nn == grid[i].length\n1 <= m, n <= 10\ngrid[i][j] is 0, 1, or 2.",
    input_format: "First line contains two integers m and n.\nNext m lines each contain n space-separated integers (0, 1, or 2).",
    output_format: "Print a single integer representing minutes, or -1.",
    expected_time_complexity: "O(m * n)",
    expected_space_complexity: "O(m * n)",
    testCases: [
      { input: "3 3\n2 1 1\n1 1 0\n0 1 1", expectedOutput: "4", isHidden: false },
      { input: "3 3\n2 1 1\n0 1 1\n1 0 1", expectedOutput: "-1", isHidden: false },
      { input: "1 2\n0 2", expectedOutput: "0", isHidden: true },
      { input: "1 1\n1", expectedOutput: "-1", isHidden: true },
      { input: "1 1\n2", expectedOutput: "0", isHidden: true },
      { input: "3 3\n0 2 0\n2 1 2\n0 2 0", expectedOutput: "1", isHidden: true }
    ]
  },

  // ==========================================
  // 10. RECURSION (2 problems: 1 Easy, 1 Medium)
  // ==========================================
  {
    title: "Fibonacci Number",
    difficulty: "EASY",
    topic: "Recursion",
    description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is:\nF(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2), for n > 1.\n\nGiven n, calculate F(n).",
    constraints: "0 <= n <= 30",
    input_format: "A single line containing integer n.",
    output_format: "Print F(n).",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "2", expectedOutput: "1", isHidden: false },
      { input: "3", expectedOutput: "2", isHidden: false },
      { input: "4", expectedOutput: "3", isHidden: true },
      { input: "0", expectedOutput: "0", isHidden: true },
      { input: "1", expectedOutput: "1", isHidden: true },
      { input: "10", expectedOutput: "55", isHidden: true },
      { input: "20", expectedOutput: "6765", isHidden: true }
    ]
  },
  {
    title: "Pow(x, n)",
    difficulty: "MEDIUM",
    topic: "Recursion",
    description: "Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).\n\nFormat: Output the float rounded to 5 decimal places.",
    constraints: "-100.0 < x < 100.0\n-2^31 <= n <= 2^31-1\nn is an integer.\nEither x is not zero, or n > 0.\n-10^4 <= x^n <= 10^4",
    input_format: "A single line containing double x and integer n.",
    output_format: "Print x^n rounded to 5 decimal places (e.g. '1024.00000').",
    expected_time_complexity: "O(log n)",
    expected_space_complexity: "O(log n)",
    testCases: [
      { input: "2.00000 10", expectedOutput: "1024.00000", isHidden: false },
      { input: "2.10000 3", expectedOutput: "9.26100", isHidden: false },
      { input: "2.00000 -2", expectedOutput: "0.25000", isHidden: true },
      { input: "1.00000 2147483647", expectedOutput: "1.00000", isHidden: true },
      { input: "-1.00000 2", expectedOutput: "1.00000", isHidden: true },
      { input: "-1.00000 3", expectedOutput: "-1.00000", isHidden: true }
    ]
  },

  // ==========================================
  // 11. BACKTRACKING (2 problems: 1 Medium, 1 Hard)
  // ==========================================
  {
    title: "Subsets",
    difficulty: "MEDIUM",
    topic: "Backtracking",
    description: "Given an integer array nums of unique elements, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Print subsets sorted by size, and lexicographically within the same size. Print each subset on a new line with space-separated integers. The empty subset should be printed as 'EMPTY'.",
    constraints: "1 <= nums.length <= 10\n-10 <= nums[i] <= 10\nAll the numbers of nums are unique.",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print each subset on a new line (or 'EMPTY' for empty set).",
    expected_time_complexity: "O(n * 2^n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "3\n1 2 3", expectedOutput: "EMPTY\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3", isHidden: false },
      { input: "1\n0", expectedOutput: "EMPTY\n0", isHidden: false },
      { input: "2\n1 2", expectedOutput: "EMPTY\n1\n2\n1 2", isHidden: true },
      { input: "2\n-1 1", expectedOutput: "EMPTY\n-1\n1\n-1 1", isHidden: true },
      { input: "3\n3 2 1", expectedOutput: "EMPTY\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3", isHidden: true }
    ]
  },
  {
    title: "N-Queens",
    difficulty: "HARD",
    topic: "Backtracking",
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return the total number of distinct solutions to the n-queens puzzle.",
    constraints: "1 <= n <= 9",
    input_format: "A single line containing integer n.",
    output_format: "Print a single integer representing the count of distinct solutions.",
    expected_time_complexity: "O(n!)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "4", expectedOutput: "2", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: false },
      { input: "2", expectedOutput: "0", isHidden: true },
      { input: "3", expectedOutput: "0", isHidden: true },
      { input: "5", expectedOutput: "10", isHidden: true },
      { input: "8", expectedOutput: "92", isHidden: true },
      { input: "9", expectedOutput: "352", isHidden: true }
    ]
  },

  // ==========================================
  // 12. TREES (2 problems: 1 Easy, 1 Medium)
  // ==========================================
  {
    title: "Maximum Depth of Binary Tree",
    difficulty: "EASY",
    topic: "Trees",
    description: "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.\n\nRepresentation: First line contains n (total entries). Second line contains level-order node values, where -1 represents a null node.",
    constraints: "The number of nodes in the tree is in the range [0, 10^4].\n-100 <= Node.val <= 100",
    input_format: "First line contains integer n (count of level-order items).\nSecond line contains n space-separated integers (-1 for null).",
    output_format: "Print a single integer representing maximum depth.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "7\n3 9 20 -1 -1 15 7", expectedOutput: "3", isHidden: false },
      { input: "3\n1 -1 2", expectedOutput: "2", isHidden: false },
      { input: "0\n", expectedOutput: "0", isHidden: true },
      { input: "1\n10", expectedOutput: "1", isHidden: true },
      { input: "5\n1 2 3 4 5", expectedOutput: "3", isHidden: true },
      { input: "7\n1 2 -1 3 -1 4 -1", expectedOutput: "4", isHidden: true }
    ]
  },
  {
    title: "Binary Tree Level Order Traversal",
    difficulty: "MEDIUM",
    topic: "Trees",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).\n\nRepresentation: Input is level-order entries (-1 for null). Print each level on a new line space-separated, or 'EMPTY' if the tree is empty.",
    constraints: "The number of nodes in the tree is in the range [0, 2000].\n-1000 <= Node.val <= 1000",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers (-1 for null).",
    output_format: "Print each level on a new line space-separated, or 'EMPTY'.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "7\n3 9 20 -1 -1 15 7", expectedOutput: "3\n9 20\n15 7", isHidden: false },
      { input: "1\n1", expectedOutput: "1", isHidden: false },
      { input: "0\n", expectedOutput: "EMPTY", isHidden: true },
      { input: "3\n1 -1 2", expectedOutput: "1\n2", isHidden: true },
      { input: "5\n1 2 3 4 5", expectedOutput: "1\n2 3\n4 5", isHidden: true },
      { input: "7\n1 2 3 -1 -1 4 5", expectedOutput: "1\n2 3\n4 5", isHidden: true }
    ]
  },

  // ==========================================
  // 13. BINARY SEARCH TREES (2 problems: 2 Medium)
  // ==========================================
  {
    title: "Validate Binary Search Tree",
    difficulty: "MEDIUM",
    topic: "Binary Search Trees",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys strictly less than the node's key.\n- The right subtree of a node contains only nodes with keys strictly greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
    constraints: "The number of nodes in the tree is in the range [1, 10^4].\n-2^31 <= Node.val <= 2^31 - 1",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers in level-order (-1 for null).",
    output_format: "Print 'true' if valid BST, otherwise 'false'.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "3\n2 1 3", expectedOutput: "true", isHidden: false },
      { input: "7\n5 1 4 -1 -1 3 6", expectedOutput: "false", isHidden: false },
      { input: "1\n10", expectedOutput: "true", isHidden: true },
      { input: "3\n1 1 -1", expectedOutput: "false", isHidden: true },
      { input: "7\n10 5 15 -1 -1 6 20", expectedOutput: "false", isHidden: true },
      { input: "7\n8 3 10 1 6 -1 14", expectedOutput: "true", isHidden: true }
    ]
  },
  {
    title: "Kth Smallest Element in a BST",
    difficulty: "MEDIUM",
    topic: "Binary Search Trees",
    description: "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
    constraints: "The number of nodes in the tree is n.\n1 <= k <= n <= 10^4\n0 <= Node.val <= 10^4",
    input_format: "First line contains two integers n (items in representation) and k.\nSecond line contains n space-separated integers in level-order (-1 for null).",
    output_format: "Print the kth smallest integer.",
    expected_time_complexity: "O(H + k)",
    expected_space_complexity: "O(H)",
    testCases: [
      { input: "5 1\n3 1 4 -1 2", expectedOutput: "1", isHidden: false },
      { input: "11 3\n5 3 6 2 4 -1 -1 1", expectedOutput: "3", isHidden: false },
      { input: "1 1\n42", expectedOutput: "42", isHidden: true },
      { input: "5 2\n3 1 4 -1 2", expectedOutput: "2", isHidden: true },
      { input: "5 3\n3 1 4 -1 2", expectedOutput: "3", isHidden: true },
      { input: "7 4\n4 2 6 1 3 5 7", expectedOutput: "4", isHidden: true }
    ]
  },

  // ==========================================
  // 14. HEAPS / PRIORITY QUEUE (2 problems: 1 Medium, 1 Hard)
  // ==========================================
  {
    title: "Kth Largest Element in an Array",
    difficulty: "MEDIUM",
    topic: "Heaps",
    description: "Given an integer array nums and an integer k, return the kth largest element in the array.\n\nNote that it is the kth largest element in the sorted order, not the kth distinct element.\n\nCan you solve it without sorting in O(n) average time?",
    constraints: "1 <= k <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    input_format: "First line contains two integers n and k.\nSecond line contains n space-separated integers.",
    output_format: "Print the kth largest integer.",
    expected_time_complexity: "O(n log k)",
    expected_space_complexity: "O(k)",
    testCases: [
      { input: "6 2\n3 2 1 5 6 4", expectedOutput: "5", isHidden: false },
      { input: "9 4\n3 2 3 1 2 4 5 5 6", expectedOutput: "4", isHidden: false },
      { input: "1 1\n10", expectedOutput: "10", isHidden: true },
      { input: "5 1\n1 2 3 4 5", expectedOutput: "5", isHidden: true },
      { input: "5 5\n1 2 3 4 5", expectedOutput: "1", isHidden: true },
      { input: "6 3\n-1 -2 -3 -4 -5 -6", expectedOutput: "-3", isHidden: true }
    ]
  },
  {
    title: "Merge k Sorted Lists",
    difficulty: "HARD",
    topic: "Heaps",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return its space-separated elements (or 'EMPTY' if all lists are empty).",
    constraints: "k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500\n-10^4 <= lists[i][j] <= 10^4\nlists[i] is sorted in ascending order.",
    input_format: "First line contains integer k (number of lists).\nNext k lines each start with length len followed by len sorted integers.",
    output_format: "Print space-separated merged integers, or 'EMPTY'.",
    expected_time_complexity: "O(N log k)",
    expected_space_complexity: "O(k)",
    testCases: [
      { input: "3\n3 1 4 5\n3 1 3 4\n2 2 6", expectedOutput: "1 1 2 3 4 4 5 6", isHidden: false },
      { input: "0", expectedOutput: "EMPTY", isHidden: false },
      { input: "1\n0", expectedOutput: "EMPTY", isHidden: true },
      { input: "2\n1 1\n1 0", expectedOutput: "0 1", isHidden: true },
      { input: "3\n2 -2 -1\n2 0 1\n2 2 3", expectedOutput: "-2 -1 0 1 2 3", isHidden: true },
      { input: "2\n3 5 10 15\n3 2 8 20", expectedOutput: "2 5 8 10 15 20", isHidden: true }
    ]
  },

  // ==========================================
  // 15. GRAPHS (2 problems: 2 Medium)
  // ==========================================
  {
    title: "Number of Islands",
    difficulty: "MEDIUM",
    topic: "Graphs",
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    constraints: "m == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is '0' or '1'.",
    input_format: "First line contains two integers m and n.\nNext m lines each contain n space-separated integers (0 or 1).",
    output_format: "Print a single integer representing the island count.",
    expected_time_complexity: "O(m * n)",
    expected_space_complexity: "O(m * n)",
    testCases: [
      { input: "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", expectedOutput: "1", isHidden: false },
      { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", expectedOutput: "3", isHidden: false },
      { input: "1 1\n1", expectedOutput: "1", isHidden: true },
      { input: "1 1\n0", expectedOutput: "0", isHidden: true },
      { input: "3 3\n1 0 1\n0 1 0\n1 0 1", expectedOutput: "5", isHidden: true },
      { input: "3 3\n0 0 0\n0 0 0\n0 0 0", expectedOutput: "0", isHidden: true }
    ]
  },
  {
    title: "Course Schedule",
    difficulty: "MEDIUM",
    topic: "Graphs",
    description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a, b] indicates that you must take course b first if you want to take course a.\n\nReturn true if you can finish all courses. Otherwise, return false.",
    constraints: "1 <= numCourses <= 2000\n0 <= prerequisites.length <= 5000\nAll the pairs prerequisites[i] are unique.",
    input_format: "First line contains two integers numCourses and p (number of prerequisite pairs).\nNext p lines each contain two integers a and b (b must be taken before a).",
    output_format: "Print 'true' if possible to finish all courses, otherwise 'false'.",
    expected_time_complexity: "O(V + E)",
    expected_space_complexity: "O(V + E)",
    testCases: [
      { input: "2 1\n1 0", expectedOutput: "true", isHidden: false },
      { input: "2 2\n1 0\n0 1", expectedOutput: "false", isHidden: false },
      { input: "4 4\n1 0\n2 0\n3 1\n3 2", expectedOutput: "true", isHidden: true },
      { input: "3 3\n0 1\n1 2\n2 0", expectedOutput: "false", isHidden: true },
      { input: "1 0\n", expectedOutput: "true", isHidden: true },
      { input: "3 2\n1 0\n2 1", expectedOutput: "true", isHidden: true }
    ]
  },

  // ==========================================
  // 16. GREEDY (2 problems: 2 Medium)
  // ==========================================
  {
    title: "Jump Game",
    difficulty: "MEDIUM",
    topic: "Greedy",
    description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.\n\nReturn true if you can reach the last index, or false otherwise.",
    constraints: "1 <= nums.length <= 10^4\n0 <= nums[i] <= 10^5",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print 'true' if last index is reachable, otherwise 'false'.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "5\n2 3 1 1 4", expectedOutput: "true", isHidden: false },
      { input: "5\n3 2 1 0 4", expectedOutput: "false", isHidden: false },
      { input: "1\n0", expectedOutput: "true", isHidden: true },
      { input: "2\n2 0", expectedOutput: "true", isHidden: true },
      { input: "4\n1 0 1 0", expectedOutput: "false", isHidden: true },
      { input: "6\n2 0 0 0 0 0", expectedOutput: "false", isHidden: true }
    ]
  },
  {
    title: "Gas Station",
    difficulty: "MEDIUM",
    topic: "Greedy",
    description: "There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i].\n\nYou have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. You begin the journey with an empty tank at one of the gas stations.\n\nGiven two integer arrays gas and cost, return the starting gas station's 0-based index if you can travel around the circuit once in the clockwise direction, otherwise return -1. If there exists a solution, it is guaranteed to be unique.",
    constraints: "n == gas.length == cost.length\n1 <= n <= 10^5\n0 <= gas[i], cost[i] <= 10^4",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers for gas.\nThird line contains n space-separated integers for cost.",
    output_format: "Print the starting station index, or -1.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "5\n1 2 3 4 5\n3 4 5 1 2", expectedOutput: "3", isHidden: false },
      { input: "3\n2 3 4\n3 4 3", expectedOutput: "-1", isHidden: false },
      { input: "1\n5\n4", expectedOutput: "0", isHidden: true },
      { input: "1\n2\n3", expectedOutput: "-1", isHidden: true },
      { input: "4\n3 1 1 5\n2 2 2 2", expectedOutput: "3", isHidden: true },
      { input: "5\n4 5 2 6 5\n3 2 7 3 2", expectedOutput: "0", isHidden: true }
    ]
  },

  // ==========================================
  // 17. DYNAMIC PROGRAMMING (4 problems: 1 Easy, 2 Medium, 1 Hard)
  // ==========================================
  {
    title: "Climbing Stairs",
    difficulty: "EASY",
    topic: "Dynamic Programming",
    description: "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: "1 <= n <= 45",
    input_format: "A single line containing integer n.",
    output_format: "Print the number of distinct ways.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "2", expectedOutput: "2", isHidden: false },
      { input: "3", expectedOutput: "3", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: true },
      { input: "5", expectedOutput: "8", isHidden: true },
      { input: "10", expectedOutput: "89", isHidden: true },
      { input: "20", expectedOutput: "10946", isHidden: true }
    ]
  },
  {
    title: "Coin Change",
    difficulty: "MEDIUM",
    topic: "Dynamic Programming",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.\n\nYou may assume that you have an infinite number of each kind of coin.",
    constraints: "1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
    input_format: "First line contains two integers n (coins count) and amount.\nSecond line contains n space-separated integers for coin denominations.",
    output_format: "Print a single integer representing minimum coins, or -1.",
    expected_time_complexity: "O(n * amount)",
    expected_space_complexity: "O(amount)",
    testCases: [
      { input: "3 11\n1 2 5", expectedOutput: "3", isHidden: false },
      { input: "1 3\n2", expectedOutput: "-1", isHidden: false },
      { input: "1 0\n1", expectedOutput: "0", isHidden: true },
      { input: "3 6\n1 3 4", expectedOutput: "2", isHidden: true },
      { input: "4 6249\n186 419 83 408", expectedOutput: "20", isHidden: true },
      { input: "2 7\n2 5", expectedOutput: "2", isHidden: true }
    ]
  },
  {
    title: "Longest Increasing Subsequence",
    difficulty: "MEDIUM",
    topic: "Dynamic Programming",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.\n\nA subsequence is an array that can be derived from another array by deleting some or no elements without changing the order of the remaining elements.",
    constraints: "1 <= nums.length <= 2500\n-10^4 <= nums[i] <= 10^4",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print a single integer representing the length.",
    expected_time_complexity: "O(n log n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "8\n10 9 2 5 3 7 101 18", expectedOutput: "4", isHidden: false },
      { input: "6\n0 1 0 3 2 3", expectedOutput: "4", isHidden: false },
      { input: "7\n7 7 7 7 7 7 7", expectedOutput: "1", isHidden: true },
      { input: "1\n42", expectedOutput: "1", isHidden: true },
      { input: "5\n1 3 6 7 9", expectedOutput: "5", isHidden: true },
      { input: "6\n3 5 6 2 5 4 19 5 6 7 12", expectedOutput: "6", isHidden: true }
    ]
  },
  {
    title: "Trapping Rain Water",
    difficulty: "HARD",
    topic: "Dynamic Programming",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    constraints: "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers representing elevations.",
    output_format: "Print a single integer representing total trapped water.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6", isHidden: false },
      { input: "6\n4 2 0 3 2 5", expectedOutput: "9", isHidden: false },
      { input: "1\n5", expectedOutput: "0", isHidden: true },
      { input: "3\n2 0 2", expectedOutput: "2", isHidden: true },
      { input: "5\n5 4 3 2 1", expectedOutput: "0", isHidden: true },
      { input: "5\n1 2 3 4 5", expectedOutput: "0", isHidden: true }
    ]
  },

  // ==========================================
  // 18. BIT MANIPULATION (2 problems: 2 Easy)
  // ==========================================
  {
    title: "Single Number",
    difficulty: "EASY",
    topic: "Bit Manipulation",
    description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
    constraints: "1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4\nEach element in the array appears twice except for one element which appears only once.",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print the single integer.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "3\n2 2 1", expectedOutput: "1", isHidden: false },
      { input: "5\n4 1 2 1 2", expectedOutput: "4", isHidden: false },
      { input: "1\n1", expectedOutput: "1", isHidden: true },
      { input: "5\n-1 -1 -2 -2 99", expectedOutput: "99", isHidden: true },
      { input: "7\n0 1 0 1 9 8 8", expectedOutput: "9", isHidden: true },
      { input: "3\n-5 10 -5", expectedOutput: "10", isHidden: true }
    ]
  },
  {
    title: "Counting Bits",
    difficulty: "EASY",
    topic: "Bit Manipulation",
    description: "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.",
    constraints: "0 <= n <= 10^5",
    input_format: "A single line containing integer n.",
    output_format: "Print n + 1 space-separated integers representing bit counts from 0 to n.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "2", expectedOutput: "0 1 1", isHidden: false },
      { input: "5", expectedOutput: "0 1 1 2 1 2", isHidden: false },
      { input: "0", expectedOutput: "0", isHidden: true },
      { input: "1", expectedOutput: "0 1", isHidden: true },
      { input: "7", expectedOutput: "0 1 1 2 1 2 2 3", isHidden: true },
      { input: "10", expectedOutput: "0 1 1 2 1 2 2 3 1 2 2", isHidden: true }
    ]
  },

  // ==========================================
  // ADDITIONAL DIVERSE PROBLEMS TO REACH 42
  // ==========================================
  // Linked Lists (1 Medium)
  {
    title: "Add Two Numbers",
    difficulty: "MEDIUM",
    topic: "Linked Lists",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list in reverse order.",
    constraints: "The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9\nIt is guaranteed that the list represents a number that does not have leading zeros.",
    input_format: "First line contains n1 followed by n1 integers for list1.\nSecond line contains n2 followed by n2 integers for list2.",
    output_format: "Print space-separated digits of the sum linked list.",
    expected_time_complexity: "O(max(n, m))",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "3 2 4 3\n3 5 6 4", expectedOutput: "7 0 8", isHidden: false },
      { input: "1 0\n1 0", expectedOutput: "0", isHidden: false },
      { input: "7 9 9 9 9 9 9 9\n4 9 9 9 9", expectedOutput: "8 9 9 9 0 0 0 1", isHidden: true },
      { input: "2 1 8\n1 0", expectedOutput: "1 8", isHidden: true },
      { input: "1 5\n1 5", expectedOutput: "0 1", isHidden: true },
      { input: "3 9 9 9\n1 1", expectedOutput: "0 0 0 1", isHidden: true }
    ]
  },
  // Stack (1 Medium)
  {
    title: "Evaluate Reverse Polish Notation",
    difficulty: "MEDIUM",
    topic: "Stack",
    description: "You are given an array of strings tokens that represents an arithmetic expression in a Reverse Polish Notation (Postfix).\n\nEvaluate the expression. Return an integer that represents the value of the expression.\n\nValid operators are '+', '-', '*', and '/'. Each operand may be an integer or another expression. Division between two integers truncates toward zero.",
    constraints: "1 <= tokens.length <= 10^4\ntokens[i] is either an operator ('+', '-', '*', or '/'), or an integer in the range [-200, 200].",
    input_format: "First line contains integer n (number of tokens).\nSecond line contains n space-separated tokens.",
    output_format: "Print a single integer representing the evaluation result.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "5\n2 1 + 3 *", expectedOutput: "9", isHidden: false },
      { input: "5\n4 13 5 / +", expectedOutput: "6", isHidden: false },
      { input: "13\n10 6 9 3 + -11 * / * 17 + 5 +", expectedOutput: "22", isHidden: true },
      { input: "1\n42", expectedOutput: "42", isHidden: true },
      { input: "3\n3 4 -", expectedOutput: "-1", isHidden: true },
      { input: "5\n4 2 / 2 -", expectedOutput: "0", isHidden: true }
    ]
  },
  // Backtracking (1 Medium)
  {
    title: "Permutations",
    difficulty: "MEDIUM",
    topic: "Backtracking",
    description: "Given an array nums of distinct integers, return all the possible permutations.\n\nPrint permutations sorted lexicographically, each on a new line space-separated.",
    constraints: "1 <= nums.length <= 6\n-10 <= nums[i] <= 10\nAll the integers of nums are unique.",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print each permutation on a new line space-separated.",
    expected_time_complexity: "O(n * n!)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "3\n1 2 3", expectedOutput: "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1", isHidden: false },
      { input: "1\n1", expectedOutput: "1", isHidden: false },
      { input: "2\n0 1", expectedOutput: "0 1\n1 0", isHidden: true },
      { input: "2\n2 1", expectedOutput: "1 2\n2 1", isHidden: true },
      { input: "3\n-1 0 1", expectedOutput: "-1 0 1\n-1 1 0\n0 -1 1\n0 1 -1\n1 -1 0\n1 0 -1", isHidden: true }
    ]
  },
  // Dynamic Programming (2 Medium)
  {
    title: "House Robber",
    difficulty: "MEDIUM",
    topic: "Dynamic Programming",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    constraints: "1 <= nums.length <= 100\n0 <= nums[i] <= 400",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers representing house values.",
    output_format: "Print a single integer representing maximum loot.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "4", isHidden: false },
      { input: "5\n2 7 9 3 1", expectedOutput: "12", isHidden: false },
      { input: "1\n100", expectedOutput: "100", isHidden: true },
      { input: "2\n5 10", expectedOutput: "10", isHidden: true },
      { input: "5\n0 0 0 0 0", expectedOutput: "0", isHidden: true },
      { input: "6\n2 1 1 2 1 1", expectedOutput: "4", isHidden: true }
    ]
  },
  {
    title: "Unique Paths",
    difficulty: "MEDIUM",
    topic: "Dynamic Programming",
    description: "There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.\n\nGiven the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.",
    constraints: "1 <= m, n <= 100\nThe answer will be less than or equal to 2 * 10^9.",
    input_format: "A single line containing two integers m and n.",
    output_format: "Print a single integer representing unique path count.",
    expected_time_complexity: "O(m * n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "3 7", expectedOutput: "28", isHidden: false },
      { input: "3 2", expectedOutput: "3", isHidden: false },
      { input: "1 1", expectedOutput: "1", isHidden: true },
      { input: "1 10", expectedOutput: "1", isHidden: true },
      { input: "10 1", expectedOutput: "1", isHidden: true },
      { input: "7 3", expectedOutput: "28", isHidden: true },
      { input: "10 10", expectedOutput: "48620", isHidden: true }
    ]
  },
  // Bit Manipulation (1 Easy)
  {
    title: "Missing Number",
    difficulty: "EASY",
    topic: "Bit Manipulation",
    description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
    constraints: "n == nums.length\n1 <= n <= 10^4\n0 <= nums[i] <= n\nAll the numbers of nums are unique.",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print the single missing integer.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "3\n3 0 1", expectedOutput: "2", isHidden: false },
      { input: "2\n0 1", expectedOutput: "2", isHidden: false },
      { input: "9\n9 6 4 2 3 5 7 0 1", expectedOutput: "8", isHidden: true },
      { input: "1\n0", expectedOutput: "1", isHidden: true },
      { input: "1\n1", expectedOutput: "0", isHidden: true },
      { input: "4\n0 1 2 4", expectedOutput: "3", isHidden: true }
    ]
  },
  // Binary Search (1 Hard)
  {
    title: "Koko Eating Bananas",
    difficulty: "MEDIUM",
    topic: "Binary Search",
    description: "Koko loves to eat bananas. There are n piles of bananas, the ith pile has piles[i] bananas. The guards have gone and will come back in h hours.\n\nKoko can decide her bananas-per-hour eating speed of k. Each hour, she chooses some pile of bananas and eats k bananas from that pile. If the pile has less than k bananas, she eats all of them instead and will not eat any more bananas during this hour.\n\nKoko likes to eat slowly but still wants to finish eating all the bananas before the guards return.\n\nReturn the minimum integer k such that she can eat all the bananas within h hours.",
    constraints: "1 <= piles.length <= 10^4\npiles.length <= h <= 10^9\n1 <= piles[i] <= 10^9",
    input_format: "First line contains two integers n (piles count) and h (hours).\nSecond line contains n space-separated integers representing piles.",
    output_format: "Print the minimum integer speed k.",
    expected_time_complexity: "O(n log(max(piles)))",
    expected_space_complexity: "O(1)",
    testCases: [
      { input: "4 8\n3 6 7 11", expectedOutput: "4", isHidden: false },
      { input: "5 5\n30 11 23 4 20", expectedOutput: "30", isHidden: false },
      { input: "5 6\n30 11 23 4 20", expectedOutput: "23", isHidden: true },
      { input: "1 3\n9", expectedOutput: "3", isHidden: true },
      { input: "3 100\n1 1 1", expectedOutput: "1", isHidden: true },
      { input: "4 4\n10 10 10 10", expectedOutput: "10", isHidden: true }
    ]
  },
  // Graph (1 Hard)
  {
    title: "Pacific Atlantic Water Flow",
    difficulty: "MEDIUM",
    topic: "Graphs",
    description: "There is an m x n rectangular island that borders both the Pacific Ocean (top and left edges) and Atlantic Ocean (bottom and right edges).\n\nThe island is partitioned into a grid of square cells. You are given an m x n integer matrix heights where heights[r][c] represents the height above sea level of the cell at coordinate (r, c).\n\nRain water can flow to neighboring cells directly north, south, east, and west if the neighboring cell's height is less than or equal to the current cell's height. Water can flow from any cell adjacent to an ocean into that ocean.\n\nReturn a list of grid coordinates [r, c] where rain water can flow to both the Pacific and Atlantic oceans. Print each coordinate on a new line space-separated, sorted by row then column.",
    constraints: "m == heights.length\nn == heights[r].length\n1 <= m, n <= 200\n0 <= heights[r][c] <= 10^5",
    input_format: "First line contains two integers m and n.\nNext m lines each contain n space-separated integers.",
    output_format: "Print each valid coordinate pair 'r c' on a new line, sorted lexicographically.",
    expected_time_complexity: "O(m * n)",
    expected_space_complexity: "O(m * n)",
    testCases: [
      { input: "5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4", expectedOutput: "0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0", isHidden: false },
      { input: "1 1\n1", expectedOutput: "0 0", isHidden: false },
      { input: "2 2\n1 1\n1 1", expectedOutput: "0 0\n0 1\n1 0\n1 1", isHidden: true },
      { input: "3 3\n10 10 10\n10 1 10\n10 10 10", expectedOutput: "0 0\n0 1\n0 2\n1 0\n1 2\n2 0\n2 1\n2 2", isHidden: true },
      { input: "2 1\n1\n2", expectedOutput: "0 0\n1 0", isHidden: true }
    ]
  },
  // Hashing (1 Hard)
  {
    title: "Longest Consecutive Sequence",
    difficulty: "MEDIUM",
    topic: "Hashing",
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.",
    constraints: "0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers (if n > 0).",
    output_format: "Print a single integer representing sequence length.",
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "6\n100 4 200 1 3 2", expectedOutput: "4", isHidden: false },
      { input: "10\n0 3 7 2 5 8 4 6 0 1", expectedOutput: "9", isHidden: false },
      { input: "0\n", expectedOutput: "0", isHidden: true },
      { input: "1\n42", expectedOutput: "1", isHidden: true },
      { input: "5\n9 1 4 7 3", expectedOutput: "1", isHidden: true },
      { input: "7\n-5 -4 -3 -2 -1 0 10", expectedOutput: "6", isHidden: true }
    ]
  },
  // Greedy (1 Medium)
  {
    title: "Merge Intervals",
    difficulty: "MEDIUM",
    topic: "Greedy",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\nPrint the merged intervals sorted by start time, each on a new line formatted as 'start end'.",
    constraints: "1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= starti <= endi <= 10^4",
    input_format: "First line contains integer n.\nNext n lines each contain two integers start and end.",
    output_format: "Print each merged interval 'start end' on a new line.",
    expected_time_complexity: "O(n log n)",
    expected_space_complexity: "O(n)",
    testCases: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", expectedOutput: "1 6\n8 10\n15 18", isHidden: false },
      { input: "2\n1 4\n4 5", expectedOutput: "1 5", isHidden: false },
      { input: "1\n1 4", expectedOutput: "1 4", isHidden: true },
      { input: "3\n1 4\n2 3\n5 6", expectedOutput: "1 4\n5 6", isHidden: true },
      { input: "4\n1 10\n2 3\n4 5\n6 7", expectedOutput: "1 10", isHidden: true },
      { input: "3\n5 8\n1 4\n3 6", expectedOutput: "1 8", isHidden: true }
    ]
  },
  // Dynamic Programming (1 Hard)
  {
    title: "Partition Equal Subset Sum",
    difficulty: "MEDIUM",
    topic: "Dynamic Programming",
    description: "Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or false otherwise.",
    constraints: "1 <= nums.length <= 200\n1 <= nums[i] <= 100",
    input_format: "First line contains integer n.\nSecond line contains n space-separated integers.",
    output_format: "Print 'true' if partition is possible, otherwise 'false'.",
    expected_time_complexity: "O(n * sum)",
    expected_space_complexity: "O(sum)",
    testCases: [
      { input: "4\n1 5 11 5", expectedOutput: "true", isHidden: false },
      { input: "4\n1 2 3 5", expectedOutput: "false", isHidden: false },
      { input: "1\n2", expectedOutput: "false", isHidden: true },
      { input: "2\n2 2", expectedOutput: "true", isHidden: true },
      { input: "3\n1 2 5", expectedOutput: "false", isHidden: true },
      { input: "6\n1 2 3 4 5 5", expectedOutput: "true", isHidden: true }
    ]
  }
];

module.exports = DSA_PROBLEMS;
module.exports.DSA_PROBLEMS = DSA_PROBLEMS;
