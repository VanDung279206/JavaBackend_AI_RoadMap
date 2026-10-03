-- Run after V1..V6 on a disposable database. All fixtures roll back.
BEGIN;
INSERT INTO auth.users(id) VALUES('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
SELECT public.save_learning_progress('01_Java','P1.1','self_completed',0,p_owner=>auth.uid());
DO $$ BEGIN
 BEGIN PERFORM public.save_learning_progress('01_Java','P1.1','needs_review',1,p_owner=>'00000000-0000-0000-0000-000000000002');RAISE EXCEPTION 'account change accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'ACCOUNT_CHANGED' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_learning_progress('01_Java','P1.1','needs_review',NULL,p_owner=>auth.uid());RAISE EXCEPTION 'null revision accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'INVALID_REVISION' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_learning_progress('01_Java','P1.1','needs_review',-1,p_owner=>auth.uid());RAISE EXCEPTION 'negative revision accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'INVALID_REVISION' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_learning_progress('01_Java','FAKE','self_completed',0,p_owner=>auth.uid());RAISE EXCEPTION 'invalid ID accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'INVALID_EXERCISE' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_learning_progress('06_RAG','P1.1','self_completed',0,p_owner=>auth.uid());RAISE EXCEPTION 'wrong phase accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'INVALID_EXERCISE' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_learning_progress('01_Java','P1.1','tested_pass',1,p_owner=>auth.uid());RAISE EXCEPTION 'fake verified status accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'INVALID_STATUS' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_learning_progress('01_Java','P1.1','needs_review',0,p_owner=>auth.uid());RAISE EXCEPTION 'stale revision accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'PROGRESS_CONFLICT' THEN RAISE; END IF; END;
 BEGIN UPDATE public.profiles SET is_admin=true WHERE id=auth.uid();RAISE EXCEPTION 'self promotion accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.progress(user_id,phase,exercise_id,done) VALUES(auth.uid(),'01_Java','P1.2',true);RAISE EXCEPTION 'direct progress write accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.submissions(user_id,phase,exercise_id,source,intent,verdict) VALUES(auth.uid(),'01_Java','P1.1','fake','submit','PASS');RAISE EXCEPTION 'fake grade accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.submit_learning_attempt('01_Java','P1.1','class Learner {}','submit',p_owner=>auth.uid());
DO $$ BEGIN
 BEGIN UPDATE public.submissions SET verdict='PASS',test_version='forged',finished_at=now() WHERE user_id=auth.uid();RAISE EXCEPTION 'browser grade update accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
INSERT INTO public.learning_notes(user_id,resource_key,note) VALUES(auth.uid(),'exercise:P1.1','private');
UPDATE public.profiles SET display_name='An' WHERE id=auth.uid();
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.progress) OR EXISTS(SELECT 1 FROM public.learning_notes) OR EXISTS(SELECT 1 FROM public.submissions) THEN RAISE EXCEPTION 'cross-account read'; END IF;
 UPDATE public.learning_notes SET note='attack' WHERE user_id='00000000-0000-0000-0000-000000000001';
 IF FOUND THEN RAISE EXCEPTION 'cross-account update'; END IF;
 IF EXISTS(SELECT 1 FROM public.verified_leaderboard) THEN RAISE EXCEPTION 'BLOCKED result counted'; END IF;
 BEGIN INSERT INTO public.learning_notes(user_id,resource_key,note) VALUES('00000000-0000-0000-0000-000000000001','stolen','attack');RAISE EXCEPTION 'cross-account insert';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.learning_notes WHERE note='private') THEN RAISE EXCEPTION 'private note changed'; END IF;
 IF (SELECT count(*) FROM public.progress)<>1 THEN RAISE EXCEPTION 'progress lost'; END IF;
END $$;
SET LOCAL ROLE service_role;
INSERT INTO public.submissions(user_id,phase,exercise_id,source,intent,verdict,test_version,finished_at)
VALUES('00000000-0000-0000-0000-000000000001','01_Java','P1.1','local run','run','PASS','test-v1',now()),
('00000000-0000-0000-0000-000000000001','01_Java','P1.2','incomplete proof','submit','PASS',NULL,now());
RESET ROLE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.verified_leaderboard) THEN RAISE EXCEPTION 'run/incomplete evidence counted'; END IF;
END $$;
SET LOCAL ROLE service_role;
UPDATE public.submissions SET verdict='PASS',test_version='fixture-tests-v1',finished_at=now()
WHERE intent='submit' AND exercise_id='P1.1';
RESET ROLE;
DO $$ BEGIN
 IF (SELECT completed_count FROM public.verified_leaderboard WHERE user_id='00000000-0000-0000-0000-000000000001') IS DISTINCT FROM 1
 THEN RAISE EXCEPTION 'trusted evidence not counted once'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS RLS: invalid ID/phase, fake grade, admin escalation, cross-account, stale revision, preserved data';
