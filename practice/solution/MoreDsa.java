import java.util.*;
/** Null inputs are outside the contract; string exercises use ASCII. */
public final class MoreDsa {
    public static final class Node {
        public final int value; public Node next;
        public Node(int value) { this.value=value; }
    }
    // D13: acyclic list; reverse existing links, no node allocation.
    public static Node reverse(Node head) {
        Node previous=null;
        while(head!=null) { Node next=head.next; head.next=previous; previous=head; head=next; }
        return previous;
    }
    public record Tree(int value, Tree left, Tree right) {}
    private record Frame(Tree node, int depth) {}
    // D14: iterative DFS, avoids Java recursion-depth dependence.
    public static int maxDepth(Tree root) {
        if(root==null)return 0;
        Deque<Frame> stack=new ArrayDeque<>(); stack.push(new Frame(root,1)); int best=0;
        while(!stack.isEmpty()) {
            Frame f=stack.pop(); best=Math.max(best,f.depth());
            if(f.node().left()!=null)stack.push(new Frame(f.node().left(),f.depth()+1));
            if(f.node().right()!=null)stack.push(new Frame(f.node().right(),f.depth()+1));
        }
        return best;
    }
    // D15: iterative three-color DFS on a directed graph.
    public static boolean hasCycle(List<List<Integer>> graph) {
        validateGraph(graph); int n=graph.size(); int[] color=new int[n], nextIndex=new int[n];
        Deque<Integer> stack=new ArrayDeque<>();
        for(int start=0;start<n;start++) {
            if(color[start]!=0)continue;
            color[start]=1; stack.push(start);
            while(!stack.isEmpty()) {
                int node=stack.peek();
                if(nextIndex[node]==graph.get(node).size()) { color[node]=2; stack.pop(); continue; }
                int next=graph.get(node).get(nextIndex[node]++);
                if(color[next]==1)return true;
                if(color[next]==0) { color[next]=1; stack.push(next); }
            }
        }
        return false;
    }
    private static void validateGraph(List<List<Integer>> graph) {
        for(var edges:graph)for(int x:edges)if(x<0||x>=graph.size())throw new IllegalArgumentException("invalid edge");
    }
    // V01: preserve input order when selecting first unique value.
    public static OptionalInt firstUnique(int[] a) {
        Map<Integer,Integer> counts=new HashMap<>(); for(int x:a)counts.merge(x,1,Integer::sum);
        for(int x:a)if(counts.get(x)==1)return OptionalInt.of(x);
        return OptionalInt.empty();
    }
    // V02: count index pairs i<j, duplicate values allowed.
    public static long countPairs(int[] a, long target) {
        Map<Long,Long> counts=new HashMap<>(); long result=0;
        for(int x:a) { result+=counts.getOrDefault(target-(long)x,0L); counts.merge((long)x,1L,Long::sum); }
        return result;
    }
    // V03: lowercase and retain ASCII letters/digits only.
    public static boolean loosePalindrome(String text) {
        String s=text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]","");
        for(int l=0,r=s.length()-1;l<r;l++,r--)if(s.charAt(l)!=s.charAt(r))return false;
        return true;
    }
    // V04: at most k distinct UTF-16 code units; examples use ASCII.
    public static int atMostK(String text, int k) {
        if(k<0)throw new IllegalArgumentException("negative k");
        Map<Character,Integer> counts=new HashMap<>(); int left=0,best=0;
        for(int right=0;right<text.length();right++) {
            counts.merge(text.charAt(right),1,Integer::sum);
            while(counts.size()>k) {
                char c=text.charAt(left++); int v=counts.get(c)-1;
                if(v==0)counts.remove(c);else counts.put(c,v);
            }
            best=Math.max(best,right-left+1);
        }
        return best;
    }
    // V05: count contiguous nonempty subarrays with a given sum; negatives allowed.
    public static long subarrayCount(int[] a, long target) {
        Map<Long,Long> counts=new HashMap<>(); counts.put(0L,1L); long prefix=0,result=0;
        for(int x:a) { prefix+=x; result+=counts.getOrDefault(prefix-target,0L); counts.merge(prefix,1L,Long::sum); }
        return result;
    }
    // V06: only '(' and ')' are permitted.
    public static int minAdditions(String text) {
        int opens=0,missing=0;
        for(char c:text.toCharArray()) {
            if(c=='(')opens++;
            else if(c==')') { if(opens==0)missing++;else opens--; }
            else throw new IllegalArgumentException("parentheses only");
        }
        return opens+missing;
    }
    // V07: first index with value > target, sorted input.
    public static int upperBound(int[] a, int target) {
        int l=0,r=a.length;
        while(l<r) { int m=l+(r-l)/2; if(a[m]<=target)l=m+1;else r=m; }
        return l;
    }
    // V08: half-open meetings [start,end); touching endpoints can reuse a room.
    public static int meetingRooms(int[][] meetings) {
        int[][] sorted=new int[meetings.length][2];
        for(int i=0;i<meetings.length;i++) {
            if(meetings[i].length!=2||meetings[i][0]>=meetings[i][1])throw new IllegalArgumentException("nonempty interval required");
            sorted[i]=meetings[i].clone();
        }
        Arrays.sort(sorted,Comparator.comparingInt(x->x[0]));
        PriorityQueue<Integer> ends=new PriorityQueue<>(); int best=0;
        for(int[] m:sorted) { while(!ends.isEmpty()&&ends.peek()<=m[0])ends.poll(); ends.offer(m[1]); best=Math.max(best,ends.size()); }
        return best;
    }
    // V09: higher count first; equal counts => smaller integer first.
    public static List<Integer> frequent(int[] a,int k) {
        Map<Integer,Integer> c=new HashMap<>(); for(int x:a)c.merge(x,1,Integer::sum);
        if(k<0||k>c.size())throw new IllegalArgumentException("invalid k");
        if(k==0)return List.of();
        Comparator<Integer> worstFirst=Comparator.<Integer>comparingInt(c::get).thenComparing(Comparator.reverseOrder());
        PriorityQueue<Integer> heap=new PriorityQueue<>(worstFirst);
        for(int x:c.keySet()) { heap.offer(x);if(heap.size()>k)heap.poll(); }
        List<Integer> out=new ArrayList<>(heap);out.sort(worstFirst.reversed());return List.copyOf(out);
    }
    // V10: neighbors visited in supplied order; returns one shortest path.
    public static List<Integer> shortestPath(List<List<Integer>> graph,int start,int goal) {
        validateGraph(graph);int n=graph.size();
        if(start<0||goal<0||start>=n||goal>=n)throw new IllegalArgumentException("invalid node");
        int[] parent=new int[n];Arrays.fill(parent,-1);parent[start]=start;
        Deque<Integer> q=new ArrayDeque<>();q.add(start);
        while(!q.isEmpty()&&parent[goal]==-1) {
            int u=q.remove();for(int v:graph.get(u))if(parent[v]==-1) { parent[v]=u;q.add(v); }
        }
        if(parent[goal]==-1)return List.of();
        List<Integer> path=new ArrayList<>();
        for(int u=goal;;u=parent[u]) { path.add(u);if(u==start)break; }
        Collections.reverse(path);return List.copyOf(path);
    }
    // V11: combinations, not permutations; denominations positive and unique.
    // Throws ArithmeticException if the exact count exceeds long.
    public static long coinCombinations(int[] coins,int amount) {
        if(amount<0||amount>100_000)throw new IllegalArgumentException("amount out of range");
        Set<Integer> unique=new HashSet<>();for(int c:coins)if(c<=0||!unique.add(c))throw new IllegalArgumentException("positive unique coins required");
        long[] dp=new long[amount+1];dp[0]=1;
        for(int c:coins)for(int s=c;s<=amount;s++)dp[s]=Math.addExact(dp[s],dp[s-c]);
        return dp[amount];
    }
    // V12: a miss loads a key; each access refreshes recency, capacity >= 1.
    public static int cacheMisses(int[] requests,int capacity) {
        if(capacity<1)throw new IllegalArgumentException("positive capacity required");
        LinkedHashMap<Integer,Boolean> cache=new LinkedHashMap<>(16,.75f,true);int misses=0;
        for(int key:requests) {
            if(cache.get(key)==null) { misses++;cache.put(key,true); }
            if(cache.size()>capacity)cache.remove(cache.keySet().iterator().next());
        }
        return misses;
    }
}
