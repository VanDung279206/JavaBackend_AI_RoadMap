"""Bounded local /health load probe; no benchmark claims from one machine."""
import argparse,concurrent.futures,statistics,time,urllib.request,urllib.parse,json
def main():
 p=argparse.ArgumentParser();p.add_argument('--url',default='http://127.0.0.1:8080/health');p.add_argument('--requests',type=int,default=40);p.add_argument('--workers',type=int,default=4);a=p.parse_args()
 url=urllib.parse.urlparse(a.url)
 if url.hostname not in ('127.0.0.1','localhost','::1') or url.scheme!='http':p.error('Only local HTTP targets are supported')
 if not 1<=a.requests<=1000 or not 1<=a.workers<=16:p.error('requests 1..1000, workers 1..16')
 def call(index):
  start=time.monotonic()
  try:
   with urllib.request.urlopen(urllib.request.Request(a.url,headers={'X-Request-ID':f'load-{index}'}),timeout=3) as r:return {'ok':r.status==200,'ms':(time.monotonic()-start)*1000,'request_id':r.headers.get('X-Request-ID')}
  except Exception as error:return {'ok':False,'ms':(time.monotonic()-start)*1000,'error':type(error).__name__}
 with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:rows=list(pool.map(call,range(a.requests)))
 values=sorted(r['ms'] for r in rows);report={'requests':len(rows),'failed':sum(not r['ok'] for r in rows),'p50_ms':statistics.median(values),'p95_ms':values[min(len(values)-1,int(len(values)*.95))],'rows':rows}
 print(json.dumps(report,indent=2));return int(report['failed']>0)
if __name__=='__main__':raise SystemExit(main())
