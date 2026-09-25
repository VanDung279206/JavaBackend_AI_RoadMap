import java.util.*;
/** Public contracts: mixed/EXERCISES.md. */
public final class MixedLab {
    // M01
    public static int longestRun(int[] events) {
        Map<Integer,Integer> last=new HashMap<>();int left=0,best=0;
        for(int right=0;right<events.length;right++) {Integer old=last.put(events[right],right);if(old!=null)left=Math.max(left,old+1);best=Math.max(best,right-left+1);}return best;
    }
    // M02
    public static long balancedWindows(int[] changes,long target) {
        Map<Long,Long> seen=new HashMap<>();seen.put(0L,1L);long sum=0,count=0;
        for(int x:changes){sum+=x;count+=seen.getOrDefault(sum-target,0L);seen.merge(sum,1L,Long::sum);}return count;
    }
    // M03
    public static int desks(int[][] visits) {
        int[][] copy=new int[visits.length][];for(int i=0;i<visits.length;i++){if(visits[i].length!=2||visits[i][0]>=visits[i][1])throw new IllegalArgumentException("interval");copy[i]=visits[i].clone();}
        Arrays.sort(copy,Comparator.comparingInt(a->a[0]));PriorityQueue<Integer> ends=new PriorityQueue<>();int best=0;
        for(int[] v:copy){while(!ends.isEmpty()&&ends.peek()<=v[0])ends.poll();ends.add(v[1]);best=Math.max(best,ends.size());}return best;
    }
    // M04
    public static int intakePosition(int[] times,int cutoff) {
        int left=0,right=times.length;while(left<right){int mid=left+(right-left)/2;if(times[mid]<=cutoff)left=mid+1;else right=mid;}return left;
    }
    // M05
    public static int deliverySteps(List<List<Integer>> routes,int start,int destination) {
        int n=routes.size();if(start<0||start>=n||destination<0||destination>=n)throw new IllegalArgumentException("node");
        for(var row:routes)for(int v:row)if(v<0||v>=n)throw new IllegalArgumentException("edge");
        int[] distance=new int[n];Arrays.fill(distance,-1);distance[start]=0;Deque<Integer> q=new ArrayDeque<>();q.add(start);
        while(!q.isEmpty()){int u=q.remove();if(u==destination)return distance[u];for(int v:routes.get(u))if(distance[v]<0){distance[v]=distance[u]+1;q.add(v);}}return -1;
    }
    // M06
    public static int packages(int[] sizes,int amount) {
        if(amount<0||amount>100000)throw new IllegalArgumentException("amount");for(int size:sizes)if(size<=0)throw new IllegalArgumentException("size");
        int[] dp=new int[amount+1];Arrays.fill(dp,amount+1);dp[0]=0;for(int s=1;s<=amount;s++)for(int size:sizes)if(size<=s)dp[s]=Math.min(dp[s],dp[s-size]+1);return dp[amount]>amount?-1:dp[amount];
    }
    // M07
    public static int loads(int[] access,int slots) {
        if(slots<=0)throw new IllegalArgumentException("slots");LinkedHashMap<Integer,Boolean> cache=new LinkedHashMap<>(16,.75f,true);int loads=0;
        for(int key:access){if(cache.get(key)==null){loads++;cache.put(key,true);}if(cache.size()>slots)cache.remove(cache.keySet().iterator().next());}return loads;
    }
    // M08
    public static List<Integer> priorities(int[] reports,int limit) {
        Map<Integer,Integer> counts=new HashMap<>();for(int id:reports)counts.merge(id,1,Integer::sum);if(limit<0||limit>counts.size())throw new IllegalArgumentException("limit");
        Comparator<Integer> worst=Comparator.<Integer>comparingInt(counts::get).thenComparing(Comparator.reverseOrder());PriorityQueue<Integer> heap=new PriorityQueue<>(worst);
        for(int id:counts.keySet()){heap.add(id);if(heap.size()>limit)heap.poll();}List<Integer> out=new ArrayList<>(heap);out.sort(worst.reversed());return List.copyOf(out);
    }
}