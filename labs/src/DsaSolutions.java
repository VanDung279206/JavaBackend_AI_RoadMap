import java.util.*;

/** Twelve educational algorithms. Null inputs are outside the exercise contract. */
public final class DsaSolutions {
    // D01: expected O(n) map operations, O(u) distinct values.
    public static Map<Integer, Integer> frequency(int[] values) {
        Map<Integer, Integer> out = new HashMap<>();
        for (int value : values) out.merge(value, 1, Integer::sum);
        return out;
    }
    // D02: return any pair of distinct indices, or an empty array.
    public static int[] twoSum(int[] values, long target) {
        Map<Long, Integer> previous = new HashMap<>();
        for (int i = 0; i < values.length; i++) {
            Integer j = previous.get(target - (long) values[i]);
            if (j != null) return new int[] {j, i};
            previous.putIfAbsent((long) values[i], i);
        }
        return new int[0];
    }
    // D03: exact, case-sensitive palindrome of UTF-16 code units; lessons use ASCII.
    public static boolean palindrome(String text) {
        int l = 0, r = text.length() - 1;
        while (l < r) if (text.charAt(l++) != text.charAt(r--)) return false;
        return true;
    }
    // D04: no repeated UTF-16 code units; lessons use ASCII.
    public static int longestDistinct(String text) {
        Map<Character, Integer> last = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < text.length(); right++) {
            char c = text.charAt(right);
            Integer prior = last.put(c, right);
            if (prior != null) left = Math.max(left, prior + 1);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
    // D05: build prefix once, then inclusive queries [left, right].
    public static long[] prefix(int[] values) {
        long[] p = new long[values.length + 1];
        for (int i = 0; i < values.length; i++) p[i + 1] = p[i] + values[i];
        return p;
    }
    public static long rangeSum(long[] prefix, int left, int right) {
        if (left < 0 || right < left || right >= prefix.length - 1)
            throw new IllegalArgumentException("invalid interval");
        return prefix[right + 1] - prefix[left];
    }
    // D06: input alphabet restricted to ()[]{}; other characters return false.
    public static boolean brackets(String text) {
        Deque<Character> expected = new ArrayDeque<>();
        for (char c : text.toCharArray()) {
            switch (c) {
                case '(' -> expected.push(')');
                case '[' -> expected.push(']');
                case '{' -> expected.push('}');
                case ')', ']', '}' -> {
                    if (expected.isEmpty() || expected.pop() != c) return false;
                }
                default -> { return false; }
            }
        }
        return expected.isEmpty();
    }
    // D07: sorted ascending input; returns n when no value >= target exists.
    public static int lowerBound(int[] sorted, int target) {
        int left = 0, right = sorted.length;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (sorted[mid] < target) left = mid + 1;
            else right = mid;
        }
        return left;
    }
    // D08: closed intervals; endpoints that touch are merged. Does not mutate input.
    public static int[][] merge(int[][] intervals) {
        int[][] sorted = new int[intervals.length][2];
        for (int i = 0; i < intervals.length; i++) {
            if (intervals[i].length != 2 || intervals[i][0] > intervals[i][1])
                throw new IllegalArgumentException("invalid interval");
            sorted[i] = intervals[i].clone();
        }
        Arrays.sort(sorted, Comparator.comparingInt(a -> a[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] interval : sorted) {
            if (out.isEmpty() || interval[0] > out.get(out.size() - 1)[1])
                out.add(interval.clone());
            else {
                int[] last = out.get(out.size() - 1);
                last[1] = Math.max(last[1], interval[1]);
            }
        }
        return out.toArray(int[][]::new);
    }
    // D09: k largest values, descending, duplicates kept. k=0 is allowed.
    public static List<Integer> topK(int[] values, int k) {
        if (k < 0 || k > values.length) throw new IllegalArgumentException("invalid k");
        if (k == 0) return List.of();
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int value : values) {
            minHeap.offer(value);
            if (minHeap.size() > k) minHeap.poll();
        }
        List<Integer> out = new ArrayList<>(minHeap);
        out.sort(Comparator.reverseOrder());
        return List.copyOf(out);
    }
    // D10: unweighted graph; adjacency list nodes and endpoints must be valid.
    public static int shortestDistance(List<List<Integer>> graph, int start, int goal) {
        int n = graph.size();
        if (start < 0 || goal < 0 || start >= n || goal >= n)
            throw new IllegalArgumentException("invalid node");
        int[] dist = new int[n]; Arrays.fill(dist, -1);
        Deque<Integer> queue = new ArrayDeque<>();
        dist[start] = 0; queue.addLast(start);
        while (!queue.isEmpty()) {
            int node = queue.removeFirst();
            if (node == goal) return dist[node];
            for (int next : graph.get(node)) {
                if (next < 0 || next >= n) throw new IllegalArgumentException("invalid edge");
                if (dist[next] == -1) {
                    dist[next] = dist[node] + 1;
                    queue.addLast(next);
                }
            }
        }
        return -1;
    }
    // D11: unlimited positive coin denominations. Bound is part of this exercise contract.
    public static int minCoins(int[] coins, int amount) {
        if (amount < 0 || amount > 100_000) throw new IllegalArgumentException("amount out of range");
        for (int coin : coins) if (coin <= 0) throw new IllegalArgumentException("coin must be positive");
        int[] dp = new int[amount + 1]; Arrays.fill(dp, amount + 1); dp[0] = 0;
        for (int sum = 1; sum <= amount; sum++)
            for (int coin : coins)
                if (coin <= sum) dp[sum] = Math.min(dp[sum], dp[sum - coin] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
    // D12: single-threaded LRU, capacity>0, non-null keys and values.
    public static final class Lru<K, V> {
        private final LinkedHashMap<K, V> map;
        public Lru(int capacity) {
            if (capacity <= 0) throw new IllegalArgumentException("capacity must be positive");
            map = new LinkedHashMap<>(16, 0.75f, true) {
                protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                    return size() > capacity;
                }
            };
        }
        public V get(K key) { return map.get(Objects.requireNonNull(key)); }
        public void put(K key, V value) {
            map.put(Objects.requireNonNull(key), Objects.requireNonNull(value));
        }
        public int size() { return map.size(); }
    }
}