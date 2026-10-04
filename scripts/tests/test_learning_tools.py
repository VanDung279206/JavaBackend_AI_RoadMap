from pathlib import Path
from datetime import date
import json,sys,tempfile,subprocess,unittest
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'scripts'))
import review
class ReviewTests(unittest.TestCase):
 def test_intervals_and_same_day(self):
  s={};review.record(s,'D01','pass','trace',date(2026,1,1));self.assertEqual(s['D01']['due'],'2026-01-02')
  review.record(s,'D01','pass','repeat',date(2026,1,1));self.assertEqual(s['D01']['stage'],0)
  review.record(s,'D01','pass','recall',date(2026,1,2));self.assertEqual(s['D01']['due'],'2026-01-05')
 def test_hints_do_not_advance_and_failure_resets(self):
  s={};review.record(s,'D01','pass','with help',date(2026,1,1),['duplicates'],2)
  self.assertEqual(s['D01']['stage'],-1);self.assertEqual(s['D01']['active_tags'],['duplicates'])
  review.record(s,'D01','pass','independent',date(2026,1,2));self.assertEqual(s['D01']['active_tags'],[])
  review.record(s,'D01','fail','wrong',date(2026,1,3),['duplicates']);self.assertEqual(s['D01']['stage'],-1)
 def test_legacy_fields_and_history_are_preserved(self):
  s={'D01':{'id':'D01','stage':2,'last_review':'2026-01-01','due':'2026-01-08','result':'pass','evidence':'old','custom_note':'keep'}}
  review.record(s,'D01','partial','new',date(2026,1,8),['duplicates'])
  self.assertEqual(s['D01']['custom_note'],'keep');self.assertEqual(s['D01']['stage'],2);self.assertEqual(len(s['D01']['history']),1)
 def test_invalid_record_does_not_change_state(self):
  s={};review.record(s,'D01','pass','proof',date(2026,1,2));before=json.dumps(s)
  with self.assertRaises(ValueError):review.record(s,'D01','pass','backdated',date(2026,1,1))
  with self.assertRaises(ValueError):review.record(s,'D01','pass',' ',date(2026,1,2))
  self.assertEqual(json.dumps(s),before)
 def test_due_order_and_tag_recommendations(self):
  s={};review.record(s,'P3.3','fail','overflow',date(2026,1,1),['overflow'])
  catalogue=review.read_json(ROOT/'learning/catalogue.json',{})
  picks=review.recommend(s,catalogue,30)
  self.assertNotIn('P3.3',[x['id'] for x in picks]);self.assertIn('B02',[x['id'] for x in picks])
  self.assertEqual(review.due_items(s,date(2026,1,1)),[]);self.assertEqual(len(review.due_items(s,date(2026,1,2))),1)
 def test_cli_rejects_unknown_tag_without_writing(self):
  with tempfile.TemporaryDirectory() as d:
   state=Path(d)/'state.json'
   p=subprocess.run([sys.executable,str(ROOT/'scripts/review.py'),'--state',str(state),'record','D01','--result','fail','--tags','made-up','--evidence','x'],capture_output=True,text=True)
   self.assertNotEqual(p.returncode,0);self.assertFalse(state.exists())
 def test_atomic_save_and_unicode(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'state.json';review.save_json(p,{'ghi_chú':'tiếng Việt'});self.assertEqual(review.read_json(p,{}),{'ghi_chú':'tiếng Việt'});self.assertEqual(len(list(Path(d).iterdir())),1)
class LearningTests(unittest.TestCase):
 def test_curriculum_coverage_and_paths(self):
  sessions=review.read_json(ROOT/'learning/sessions.json',[]);hints=review.read_json(ROOT/'learning/hints.json',{});catalogue=review.read_json(ROOT/'learning/catalogue.json',{})
  self.assertEqual(len(sessions),32);self.assertEqual(len({s['id'] for s in sessions}),32);self.assertEqual(len(hints),51)
  for id,levels in hints.items():self.assertIn(id,catalogue['exercises']);self.assertEqual(len(levels),3);self.assertTrue(all(x.strip() for x in levels))
  for s in sessions:self.assertTrue((ROOT/s['reading']).is_file())
  for item in catalogue['exercises'].values():self.assertTrue((ROOT/item['reading']).is_file());self.assertTrue(set(item['tags'])<=catalogue['tags'].keys())
 def test_session_progress_is_separate_from_exercise_mastery(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'session.json';cmd=[sys.executable,str(ROOT/'scripts/learn.py'),'--state',str(p)]
   self.assertIn('S01',subprocess.check_output(cmd+['next'],text=True));self.assertFalse(p.exists())
   subprocess.run(cmd+['done','S01','--evidence','my output'],check=True,capture_output=True)
   self.assertIn('S02',subprocess.check_output(cmd+['next'],text=True));self.assertEqual(set(review.read_json(p,{})),{'S01'})
 def test_hint_only_reveals_requested_level(self):
  result=subprocess.check_output([sys.executable,str(ROOT/'scripts/learn.py'),'hint','P1.1','--level','1'],text=True)
  levels=review.read_json(ROOT/'learning/hints.json',{})['P1.1'];self.assertIn(levels[0],result);self.assertNotIn(levels[1],result);self.assertNotIn(levels[2],result)
if __name__=='__main__':unittest.main()