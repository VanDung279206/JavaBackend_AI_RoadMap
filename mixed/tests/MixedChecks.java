import java.util.*;
public final class MixedChecks {
    static int assertions=0;static Random random;
    static void eq(Object expected,Object actual){assertions++;if(!Objects.equals(expected,actual))throw new AssertionError("expected="+expected+" actual="+actual);}
    static void invalid(Runnable action){assertions++;try{action.run();}catch(IllegalArgumentException okay){return;}throw new AssertionError("expected IllegalArgumentException");}
    static int[] values(int n){return random.ints(n,-4,5).toArray();}
    static void m01(){
        eq(2,MixedLab.longestRun(new int[]{1,2,2,1}));eq(0,MixedLab.longestRun(new int[0]));
        for(int t=0;t<60;t++){int[] a=values(random.nextInt(16));int best=0;for(int l=0;l<a.length;l++){Set<Integer>s=new HashSet<>();for(int r=l;r<a.length&&s.add(a[r]);r++)best=Math.max(best,r-l+1);}eq(best,MixedLab.longestRun(a));}
    }
    static void m02(){
        eq(1L,MixedLab.balancedWindows(new int[]{Integer.MAX_VALUE,Integer.MAX_VALUE},4294967294L));eq(3L,MixedLab.balancedWindows(new int[]{0,0},0));
        for(int t=0;t<60;t++){int[] a=values(random.nextInt(16));long target=random.nextInt(11)-5,count=0;for(int l=0;l<a.length;l++){long sum=0;for(int r=l;r<a.length;r++){sum+=a[r];if(sum==target)count++;}}eq(count,MixedLab.balancedWindows(a,target));}
    }
    static void m03(){
        eq(1,MixedLab.desks(new int[][]{{1,3},{3,5}}));invalid(()->MixedLab.desks(new int[][]{{2,2}}));
        for(int t=0;t<60;t++){int[][] a=new int[random.nextInt(10)][2];for(int[] v:a){v[0]=random.nextInt(10);v[1]=v[0]+random.nextInt(5)+1;}String before=Arrays.deepToString(a);int best=0;
            for(int[] v:a){int active=0;for(int[] w:a)if(w[0]<=v[0]&&v[0]<w[1])active++;best=Math.max(best,active);}eq(best,MixedLab.desks(a));eq(before,Arrays.deepToString(a));}
    }
    static void m04(){
        eq(3,MixedLab.intakePosition(new int[]{1,3,3,7},3));eq(0,MixedLab.intakePosition(new int[0],0));
        for(int t=0;t<60;t++){int[] a=values(random.nextInt(16));Arrays.sort(a);int cut=random.nextInt(11)-5,expected=0;while(expected<a.length&&a[expected]<=cut)expected++;eq(expected,MixedLab.intakePosition(a,cut));}
    }
    static void m05(){
        eq(-1,MixedLab.deliverySteps(List.of(List.of(),List.of()),0,1));invalid(()->MixedLab.deliverySteps(List.of(List.of(2)),0,0));
        for(int t=0;t<30;t++){int n=2+random.nextInt(7);List<List<Integer>> graph=new ArrayList<>();int[][] d=new int[n][n];
            for(int i=0;i<n;i++){graph.add(new ArrayList<>());Arrays.fill(d[i],999);d[i][i]=0;}
            for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(i!=j&&random.nextInt(4)==0){graph.get(i).add(j);d[i][j]=1;}
            for(int k=0;k<n;k++)for(int i=0;i<n;i++)for(int j=0;j<n;j++)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);
            int s=random.nextInt(n),g=random.nextInt(n);eq(d[s][g]>=999?-1:d[s][g],MixedLab.deliverySteps(graph,s,g));}
    }
    static void m06(){
        eq(2,MixedLab.packages(new int[]{1,3,4},6));invalid(()->MixedLab.packages(new int[]{0},3));
        for(int t=0;t<60;t++){int[] sizes=random.ints(1+random.nextInt(4),1,8).toArray();int goal=random.nextInt(25);int[] distance=new int[goal+1];Arrays.fill(distance,-1);distance[0]=0;Deque<Integer> q=new ArrayDeque<>();q.add(0);
            while(!q.isEmpty()){int u=q.remove();for(int step:sizes)if(u+step<=goal&&distance[u+step]<0){distance[u+step]=distance[u]+1;q.add(u+step);}}eq(distance[goal],MixedLab.packages(sizes,goal));}
    }
    static void m07(){
        eq(4,MixedLab.loads(new int[]{1,2,1,3,2},2));invalid(()->MixedLab.loads(new int[0],0));
        for(int t=0;t<60;t++){int[] a=values(random.nextInt(20));int cap=1+random.nextInt(4),misses=0;List<Integer> recent=new ArrayList<>();for(int x:a){if(!recent.remove(Integer.valueOf(x)))misses++;recent.add(x);if(recent.size()>cap)recent.remove(0);}eq(misses,MixedLab.loads(a,cap));}
    }
    static void m08(){
        eq(List.of(1),MixedLab.priorities(new int[]{2,2,1,1,3},1));invalid(()->MixedLab.priorities(new int[0],1));
        for(int t=0;t<60;t++){int[] a=values(random.nextInt(20));Map<Integer,Integer> c=new TreeMap<>();for(int x:a)c.merge(x,1,Integer::sum);int limit=random.nextInt(c.size()+1);List<Integer> expected=new ArrayList<>(c.keySet());expected.sort(Comparator.<Integer>comparingInt(c::get).reversed().thenComparingInt(x->x));eq(expected.subList(0,limit),MixedLab.priorities(a,limit));}
    }
    public static void main(String[] args){
        long seed=args.length>1?Long.parseLong(args[1]):20260924L;random=new Random(seed);
        Map<String,Runnable> tests=new LinkedHashMap<>();tests.put("M01",MixedChecks::m01);tests.put("M02",MixedChecks::m02);tests.put("M03",MixedChecks::m03);tests.put("M04",MixedChecks::m04);tests.put("M05",MixedChecks::m05);tests.put("M06",MixedChecks::m06);tests.put("M07",MixedChecks::m07);tests.put("M08",MixedChecks::m08);
        List<String> ids=args.length==0||args[0].equals("all")?new ArrayList<>(tests.keySet()):Arrays.asList(args[0].split(","));int failed=0;
        for(String id:ids){if(!tests.containsKey(id))throw new IllegalArgumentException("unknown ID "+id);try{tests.get(id).run();System.out.println("PASS "+id);}catch(Throwable e){failed++;System.out.println("FAIL "+id+" "+e);}}
        System.out.println("Mixed groups="+ids.size()+" assertions="+assertions+" failed="+failed+" seed="+seed);if(failed>0)System.exit(1);
    }
}