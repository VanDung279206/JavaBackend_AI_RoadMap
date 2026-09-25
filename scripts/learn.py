"""Session itinerary and one hint level at a time; never awards exercise mastery."""
from pathlib import Path
from datetime import date
import argparse
from review import read_json, save_json, ROOT

def main():
    p=argparse.ArgumentParser(); p.add_argument('--state',type=Path,default=ROOT/'progress/session-state.json')
    sub=p.add_subparsers(dest='command',required=True); sub.add_parser('next'); sub.add_parser('list')
    show=sub.add_parser('show'); show.add_argument('id')
    done=sub.add_parser('done'); done.add_argument('id'); done.add_argument('--evidence',required=True)
    hint=sub.add_parser('hint'); hint.add_argument('id'); hint.add_argument('--level',type=int,choices=[1,2,3],required=True)
    a=p.parse_args()
    try:
        sessions=read_json(ROOT/'learning/sessions.json',[]); state=read_json(a.state,{})
        if a.command=='hint':
            hints=read_json(ROOT/'learning/hints.json',{})
            if a.id not in hints: raise ValueError('No hint set for this ID')
            print(a.id,'— hint level',a.level); print(hints[a.id][a.level-1])
            print('When recording this attempt, use --hint',a.level); return 0
        if a.command=='list':
            for s in sessions: print('[x]' if s['id'] in state else '[ ]',s['id'],s['title'])
            return 0
        if a.command=='next':
            item=next((s for s in sessions if s['id'] not in state),None)
            if item is None:
                print('All sessions have recorded evidence. Review due exercises and unresolved errors next.'); return 0
        else:
            item=next((s for s in sessions if s['id']==a.id),None)
            if item is None: raise ValueError('Unknown session ID')
        if a.command=='done':
            if not a.evidence.strip(): raise ValueError('Evidence must not be blank')
            state[item['id']]={'date':date.today().isoformat(),'evidence':a.evidence.strip()}
            save_json(a.state,state); print('Recorded evidence for',item['id'],'(self-report, not an automatic test verdict).')
        else:
            print(item['id'],item['title']); print('REQUIRED (45–60 min; may be split):',item['required'])
            print('EVIDENCE:',item['evidence']); print('EXTENSION (20–30 min, optional):',item['extension']); print('READ:',item['reading'])
    except (ValueError,OSError,KeyError,TypeError) as error: p.error(str(error))
    return 0
if __name__=='__main__': raise SystemExit(main())