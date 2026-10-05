DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.progress WHERE exercise_id='P1.1' AND done AND status='self_completed')
 THEN RAISE EXCEPTION 'valid legacy progress lost'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.progress_unmapped_v3 WHERE phase='legacy-phase' AND exercise_id='old-exercise' AND done)
 THEN RAISE EXCEPTION 'unmapped legacy progress lost'; END IF;
 IF EXISTS(SELECT 1 FROM public.verified_leaderboard) THEN RAISE EXCEPTION 'legacy progress promoted to verified'; END IF;
END $$;
SET ROLE authenticated;
DO $$ BEGIN
 BEGIN PERFORM * FROM public.progress_unmapped_v3;RAISE EXCEPTION 'private archive readable';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
DELETE FROM auth.users WHERE id='00000000-0000-0000-0000-000000000003';
SELECT 'PASS upgrade: valid self-report retained, unmapped archived privately, no fake evidence';
