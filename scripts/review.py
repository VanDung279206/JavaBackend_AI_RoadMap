"""Local review queue, backward compatible with the v2 state dictionary."""
from pathlib import Path
from datetime import date, timedelta
import argparse, json, os, tempfile
ROOT = Path(__file__).resolve().parents[1]
GAPS = [1, 3, 7, 14, 30]

def read_json(path, default):
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default

def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=path.name+'.', suffix='.tmp', dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(value, stream, ensure_ascii=False, indent=2); stream.write('\n')
        Path(name).replace(path)
    finally: Path(name).unlink(missing_ok=True)

def record(state, exercise_id, result, evidence, today, tags=(), hint=0):
    if not evidence.strip(): raise ValueError('Evidence must not be blank')
    previous = state.get(exercise_id, {})
    if previous and today < date.fromisoformat(previous['last_review']):
        raise ValueError('Review date precedes the previous review')
    stage = previous.get('stage', -1)
    same_day = previous.get('last_review') == today.isoformat()
    if result == 'fail': stage, gap = -1, 1
    elif result == 'partial' or hint > 0: gap = 1
    elif same_day: gap = max(1, (date.fromisoformat(previous['due']) - today).days)
    else: stage = min(stage+1, len(GAPS)-1); gap = GAPS[stage]
    active = [] if result == 'pass' and hint == 0 else sorted(set(tags) | set(previous.get('active_tags', [])))
    event = {'date': str(today), 'result': result, 'hint': hint, 'tags': sorted(set(tags)), 'evidence': evidence.strip()}
    state[exercise_id] = {**previous, 'id': exercise_id, 'stage': stage,
        'last_review': str(today), 'due': str(today+timedelta(days=gap)),
        'result': result, 'evidence': evidence.strip(), 'hint': hint,
        'active_tags': active, 'history': [*previous.get('history', []), event]}
    return state[exercise_id]

def due_items(state, today):
    return sorted((v for v in state.values() if date.fromisoformat(v['due']) <= today), key=lambda v: (v['due'], v['id']))

def recommend(state, catalogue, limit=5):
    weights = {}
    for item in state.values():
        weight = 3 if item['result'] == 'fail' else 1
        for tag in item.get('active_tags', []): weights[tag] = weights.get(tag, 0)+weight
    candidates = []
    for exercise_id, item in catalogue['exercises'].items():
        prior = state.get(exercise_id)
        if prior and (prior['result'] != 'pass' or prior.get('hint', 0)>0): continue
        matching = sorted(set(item['tags']) & weights.keys())
        if matching:
            candidates.append({'id': exercise_id, 'score': sum(weights[t] for t in matching),
                'tags': matching, 'title': item['title'], 'new': prior is None})
    return sorted(candidates, key=lambda x: (-x['score'], not x['new'], x['id']))[:limit]

def main():
    p=argparse.ArgumentParser(); p.add_argument('--state', type=Path, default=ROOT/'progress/review-state.json')
    sub=p.add_subparsers(dest='command', required=True)
    d=sub.add_parser('due'); d.add_argument('--date', default=date.today().isoformat())
    r=sub.add_parser('record'); r.add_argument('id'); r.add_argument('--result', choices=['pass','partial','fail'], required=True)
    r.add_argument('--evidence', required=True); r.add_argument('--tags', default=''); r.add_argument('--hint', type=int, choices=range(4), default=0)
    r.add_argument('--date', default=date.today().isoformat())
    n=sub.add_parser('recommend'); n.add_argument('--limit', type=int, default=5); sub.add_parser('tags')
    a=p.parse_args()
    try:
        catalogue=read_json(ROOT/'learning/catalogue.json', {}); state=read_json(a.state, {})
        if not isinstance(state, dict): raise ValueError('State must be a dictionary')
        if a.command=='tags':
            for tag, description in catalogue['tags'].items(): print(tag, '—', description)
        elif a.command=='due':
            items=due_items(state, date.fromisoformat(a.date))
            for item in items: print(item['due'],item['id'],item['result'],item['evidence'])
            if not items: print('No recorded exercises are due.')
        elif a.command=='recommend':
            if not 1<=a.limit<=30: raise ValueError('limit must be 1..30')
            items=recommend(state,catalogue,a.limit)
            for item in items: print(item['id'],item['title'],'| tags:',','.join(item['tags']),'| priority:',item['score'])
            if not items: print('No active error tags. Record a failed/partial attempt with --tags first.')
        else:
            if a.id not in catalogue['exercises']: raise ValueError('Unknown exercise ID')
            tags={t.strip() for t in a.tags.split(',') if t.strip()}
            if tags-catalogue['tags'].keys(): raise ValueError('Unknown error tag; run review.py tags')
            item=record(state,a.id,a.result,a.evidence,date.fromisoformat(a.date),tags,a.hint)
            save_json(a.state,state); print(a.id,'next review:',item['due'],'| interval stage:',item['stage'])
    except (ValueError,OSError,KeyError,TypeError) as error: p.error(str(error))
    return 0
if __name__=='__main__': raise SystemExit(main())