"""Exercise real PostgreSQL RLS in a disposable container; no production credentials."""
from pathlib import Path
import subprocess,uuid
ROOT=Path(__file__).resolve().parents[1]
def main():
 name='roadmap-rls-'+uuid.uuid4().hex
 try:
  probe=subprocess.run(['docker','info'],capture_output=True,timeout=15)
  if probe.returncode:print('BLOCKED: Docker daemon unavailable');return 2
  subprocess.run(['docker','run','-d','--name',name,'-e','POSTGRES_PASSWORD='+uuid.uuid4().hex,'postgres:17'],check=True,capture_output=True,timeout=180)
  import time
  for _ in range(60):
   if subprocess.run(['docker','exec',name,'pg_isready','-U','postgres'],capture_output=True).returncode==0:break
   time.sleep(.5)
  files=['database/tests/bootstrap.sql',*['database/migrations/'+p for p in ['V1__website_schema.sql','V2__public_leaderboard_and_auth_backfill.sql','V3__community_resources.sql']],
   'database/tests/legacy_before_v4.sql','database/migrations/V4__learning_evidence.sql',
   'database/catalogue_seed.sql','database/migrations/V5__catalogue_constraints.sql','database/migrations/V6__resource_search.sql',
   'database/tests/legacy_after_v6.sql','database/tests/rls.sql',
   'practice/sql/advanced/fixture.sql','practice/sql/advanced/solution.sql','practice/sql/advanced/tests.sql']
  for file in files:
   result=subprocess.run(['docker','exec','-i',name,'psql','-U','postgres','-v','ON_ERROR_STOP=1'],input=(ROOT/file).read_text(encoding='utf8'),text=True,capture_output=True,timeout=60)
   if result.returncode:print('FAIL',file,result.stderr);return 1
   print('PASS',file)
  def sql(text,database='postgres'):
   return subprocess.run(['docker','exec','-i',name,'psql','-U','postgres','-d',database,'-v','ON_ERROR_STOP=1'],input=text,text=True,capture_output=True,timeout=60)
  starter=sql((ROOT/'practice/sql/advanced/starter.sql').read_text(encoding='utf8'))
  if starter.returncode:print('FAIL Q01 starter setup',starter.stderr);return 1
  unfinished=sql((ROOT/'practice/sql/advanced/tests.sql').read_text(encoding='utf8'))
  if unfinished.returncode==0 or 'FAIL Q01 expected' not in unfinished.stderr:print('FAIL Q01 starter was not rejected by expected assertion');return 1
  print('PASS Q01 unfinished starter rejected by expected row assertion')
  repaired=sql((ROOT/'practice/sql/advanced/solution.sql').read_text(encoding='utf8'))
  if repaired.returncode:print('FAIL Q01 restore solution',repaired.stderr);return 1
  dump=subprocess.run(['docker','exec',name,'pg_dump','-U','postgres','--format=custom','postgres'],capture_output=True,check=True,timeout=60).stdout
  subprocess.run(['docker','exec',name,'createdb','-U','postgres','restore_check'],capture_output=True,check=True,timeout=30)
  subprocess.run(['docker','exec','-i',name,'pg_restore','-U','postgres','--exit-on-error','--dbname=restore_check'],input=dump,capture_output=True,check=True,timeout=60)
  assertions="""DO $$ BEGIN
   IF (SELECT count(*) FROM roadmap_analytics.events)<>100000 THEN RAISE EXCEPTION 'restore events lost'; END IF;
   IF NOT EXISTS(SELECT 1 FROM public.progress_unmapped_v3 WHERE exercise_id='old-exercise' AND done) THEN RAISE EXCEPTION 'restore archive lost'; END IF;
  END $$;"""
  for content in [assertions,(ROOT/'database/tests/rls.sql').read_text(encoding='utf8'),(ROOT/'practice/sql/advanced/tests.sql').read_text(encoding='utf8')]:
   restored=sql(content,'restore_check')
   if restored.returncode:print('FAIL restored database',restored.stderr);return 1
  print('PASS backup/restore: custom dump, restored seed/archive, RLS and SQL assertions on new database')
  return 0
 except (OSError,subprocess.TimeoutExpired) as error:print('BLOCKED',type(error).__name__);return 2
 except subprocess.CalledProcessError as error:print('FAIL',str(error));return 1
 finally:
  try:subprocess.run(['docker','rm','-f',name],capture_output=True,timeout=15)
  except (OSError,subprocess.TimeoutExpired):pass
if __name__=='__main__':raise SystemExit(main())
