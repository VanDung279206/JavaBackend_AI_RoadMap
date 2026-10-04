-- Disposable fixture to prove an upgrade preserves both valid and unmapped rows.
INSERT INTO auth.users(id) VALUES ('00000000-0000-0000-0000-000000000003');
INSERT INTO public.progress(user_id,phase,exercise_id,done)
VALUES ('00000000-0000-0000-0000-000000000003','01_Java','P1.1',true),
       ('00000000-0000-0000-0000-000000000003','legacy-phase','old-exercise',true);
