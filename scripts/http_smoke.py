"""HTTP contract checks using owned synthetic fixtures on an otherwise empty app."""
import base64,json,time,urllib.request,urllib.error,urllib.parse,uuid
class Blocked(RuntimeError):pass
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
class Client:
 def __init__(self,base,passwords,timeout=90):
  parts=urllib.parse.urlsplit(base)
  if parts.scheme not in ('http','https') or not parts.hostname or parts.username or parts.password or parts.query or parts.fragment:raise ValueError('Invalid app base URL')
  self.base=base.rstrip('/');self.passwords=passwords;self.timeout=timeout;self.opener=urllib.request.build_opener(NoRedirect());self.calls=[]
 def request(self,method,path,expected,user=None,body=None):
  headers={'Accept':'application/json'}
  if user:
   auth=base64.b64encode((user+':'+self.passwords[user]).encode()).decode();headers['Authorization']='Basic '+auth
  data=None if body is None else json.dumps(body).encode()
  if data is not None:headers['Content-Type']='application/json'
  req=urllib.request.Request(self.base+path,data=data,headers=headers,method=method);start=time.monotonic()
  try:
   with self.opener.open(req,timeout=self.timeout) as response:status=response.status;raw=response.read(1048576)
  except urllib.error.HTTPError as response:status=response.code;raw=response.read(1048576)
  elapsed=round((time.monotonic()-start)*1000,2);self.calls.append({'method':method,'path':path,'status':status,'elapsed_ms':elapsed})
  if status!=expected:raise AssertionError(f'{method} {path}: expected HTTP {expected}, got {status}')
  return json.loads(raw) if raw else None

def exercise(client,live=False,restart=None,evidence=None):
 if evidence is None:evidence={}
 for user in ['an','binh']:
  page=client.request('GET','/documents?size=1',200,user)
  if page.get('totalElements')!=0:raise Blocked('Use a dedicated empty app for both demo users; existing documents were not modified.')
 client.request('GET','/documents',401)
 client.request('POST','/documents',400,'an',{'title':' ','content':'x'})
 fixture='ROADMAP-'+uuid.uuid4().hex
 content=f'{fixture}. The launch code is ORCHID-482. The meeting room is Cedar. No launch date is specified.'
 created=[];evidence.update({'fixture':fixture,'semantic_review':'REQUIRED' if live else 'NOT_APPLICABLE_EXTRACTIVE_DEMO','cases':[]})
 try:
  doc=client.request('POST','/documents',201,'an',{'title':fixture,'content':content});created.append(doc['id']);path='/documents/'+str(doc['id'])
  if doc['version']!=0:raise AssertionError('New document must have version 0')
  if restart:client.base=restart();persisted=client.request('GET',path,200,'an');assert persisted['content']==content,'Document did not survive app restart'
  client.request('GET',path,404,'binh');client.request('POST',path+'/summary',404,'binh');client.request('POST',path+'/index',404,'binh')
  client.request('PUT',path,404,'binh',{'title':'Other','content':'x','expectedVersion':0})
  summary=client.request('POST',path+'/summary',200,'an');expected_mode='ollama' if live else 'extractive-demo'
  assert summary['mode']==expected_mode,'Wrong runtime model mode'
  assert summary['summary']['title'].strip() and 1<=len(summary['summary']['bullets'])<=3
  assert all(isinstance(x,str) and x.strip() for x in summary['summary']['bullets'])
  index=client.request('POST',path+'/index',200,'an');assert index['chunks']>0
  assert index['mode']==('pgvector-exact' if live else 'lexical-demo'),'Wrong retrieval adapter'
  question={'question':f'What is the launch code in {fixture}?','k':3}
  answer=client.request('POST','/questions',200,'an',question)
  assert answer['mode']==expected_mode and answer['status']=='ANSWERED' and answer['sources']
  assert all(s['documentId']==doc['id'] and s['version']==0 for s in answer['sources']),'Unexpected document/version in citations'
  evidence['cases'].append({'id':'known_fact','question':question['question'],'reference':'ORCHID-482','answer':answer})
  evidence['summary']=summary;evidence['document_text']=content
  other=client.request('POST','/questions',200,'binh',question)
  assert other['status']=='INSUFFICIENT_CONTEXT' and not other['sources'],'Cross-owner source leakage'
  evidence['cases'].append({'id':'other_owner','answer':other})
  if live:
   unknown=client.request('POST','/questions',200,'an',{'question':f'On what exact date will {fixture} launch?','k':3})
   evidence['cases'].append({'id':'unknown_fact','reference':'No date is specified; must not invent a date.','answer':unknown})
   assert unknown['status']=='INSUFFICIENT_CONTEXT','Expected abstention for the fixture with no launch date'
  client.request('PUT',path,400,'an',{'title':'Missing version','content':'x'})
  changed=client.request('PUT',path,200,'an',{'title':fixture,'content':content.replace('ORCHID-482','LILAC-917'),'expectedVersion':0})
  assert changed['version']==1
  client.request('PUT',path,409,'an',{'title':'Stale edit','content':'old','expectedVersion':0})
  if live:
   invalidated=client.request('POST','/questions',200,'an',question)
   assert invalidated['status']=='INSUFFICIENT_CONTEXT' and not invalidated['sources'],'Old chunks survived invalidation'
   client.request('POST',path+'/index',200,'an')
   fresh=client.request('POST','/questions',200,'an',question)
   assert fresh['status']=='ANSWERED' and fresh['sources']
   assert all(s['documentId']==doc['id'] and s['version']==1 for s in fresh['sources'])
   evidence['cases'].append({'id':'after_update','reference':'LILAC-917; must not return the old code.','answer':fresh})
  return evidence
 finally:
  failures=[]
  for id in reversed(created):
   try:client.request('DELETE','/documents/'+str(id),204,'an')
   except Exception as error:failures.append(str(id)+': '+type(error).__name__)
  evidence['http_calls']=client.calls
  if failures:raise RuntimeError('Fixture cleanup failed for created IDs '+', '.join(failures))