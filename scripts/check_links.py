"""Validate repository Markdown file targets and local anchors; never fetch secrets/URLs."""
from pathlib import Path
import argparse, concurrent.futures, ipaddress, json, re, subprocess, sys
from urllib.parse import unquote, urlsplit, urlunsplit, quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
ROOT=Path(__file__).resolve().parents[1]
def slug(text):
    text=re.sub(r'\[([^]]+)\]\([^)]*\)',r'\1',text).replace('`','').lower().strip()
    return re.sub(r'[^\w\- ]','',text,flags=re.UNICODE).replace(' ','-')
def probe_url(url):
    parts=urlsplit(url)
    # Documentation for localhost/private deployments is not a public-link probe.
    try:
        if not ipaddress.ip_address(parts.hostname).is_global: return {'url':url,'status':'BLOCKED','detail':'private/local example'}
    except ValueError: pass
    if parts.hostname in ('localhost',None) or parts.username or parts.password:
        return {'url':url,'status':'BLOCKED','detail':'local or credentialed URL'}
    request_url=urlunsplit((parts.scheme,parts.netloc,quote(parts.path,safe='/%:@'),parts.query,''))
    try:
        try:
            response=urlopen(Request(request_url,method='HEAD',headers={'User-Agent':'RoadMap-LinkCheck/3'}),timeout=12)
        except HTTPError as error:
            if error.code!=405:raise
            response=urlopen(Request(request_url,headers={'User-Agent':'RoadMap-LinkCheck/3','Range':'bytes=0-0'}),timeout=12)
        with response:return {'url':url,'status':'PASS','http':response.status}
    except HTTPError as error:return {'url':url,'status':'FAIL' if error.code in (404,410) else 'BLOCKED','http':error.code}
    except (URLError,OSError,ValueError) as error:return {'url':url,'status':'BLOCKED','detail':type(error).__name__}

def check(external_check=False,output=None):
    files=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','*.md'],cwd=ROOT,text=True).splitlines()
    errors=[]; external=set(); count=0
    for name in sorted(set(files)):
        file=ROOT/name
        if not file.exists(): continue
        content=file.read_text(encoding='utf-8-sig')
        content=re.sub(r'(?ms)^\s*(`{3,}|~{3,}).*?^\s*\1\s*$', '', content)
        # Inline links and reference definitions; allow optional quoted titles.
        targets=re.findall(r'!?\[[^\]\n]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\s*\)',content)
        targets+=re.findall(r'(?m)^\s*\[[^]]+\]:\s*(\S+)',content)
        targets+=re.findall(r'<(https?://[^>\s]+)>',content)
        for target in targets:
            target=unquote(target.strip('<>'))
            if re.match(r'^(https?://)',target):external.add(target);continue
            if re.match(r'^\w+:',target):continue
            if '{' in target or '<' in target:continue
            part,_,anchor=target.partition('#');part=part.split('?')[0]
            dest=file.parent/part if part else file
            count+=1
            if not dest.exists():errors.append(f'{name}: missing {target}');continue
            if anchor and dest.suffix=='.md':
                text=dest.read_text(encoding='utf-8-sig');heads=re.findall(r'(?m)^#{1,6}\s+(.+)$',text)
                anchors=[];seen={}
                for head in heads:
                    value=slug(head);n=seen.get(value,0);seen[value]=n+1;anchors.append(value if not n else f'{value}-{n}')
                if anchor not in anchors and f'id="{anchor}"' not in text and f'name="{anchor}"' not in text:errors.append(f'{name}: missing anchor {target}')
    for error in errors:print('FAIL',error)
    print(f'{"FAIL" if errors else "PASS"}: {count} local Markdown links; {len(external)} external URLs inventoried (network checks not included).')
    results=[]
    if external_check:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(probe_url,sorted(external)))
        counts={state:sum(row['status']==state for row in results) for state in ('PASS','FAIL','BLOCKED')}
        print('External HTTP reachability (anchors/content not verified):',counts)
        for row in results:
            if row['status']=='FAIL':print('FAIL',row['url'],row.get('http'))
    if output:
        output.parent.mkdir(parents=True,exist_ok=True)
        output.write_text(json.dumps({'local_count':count,'local_errors':errors,'external':results},indent=2,ensure_ascii=False),encoding='utf8')
    if errors or any(row['status']=='FAIL' for row in results):return 1
    return 2 if any(row['status']=='BLOCKED' for row in results) else 0
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--external',action='store_true');parser.add_argument('--output',type=Path);args=parser.parse_args()
    sys.exit(check(args.external,args.output))
