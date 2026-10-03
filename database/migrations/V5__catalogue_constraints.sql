-- V4 and database/catalogue_seed.sql are prerequisites. No learner rows discarded.
BEGIN;
LOCK TABLE public.progress IN SHARE ROW EXCLUSIVE MODE;
CREATE TABLE public.progress_unmapped_v3 AS SELECT * FROM public.progress
 WHERE NOT EXISTS(SELECT 1 FROM public.exercise_catalogue c WHERE c.phase=progress.phase AND c.exercise_id=progress.exercise_id);
ALTER TABLE public.progress_unmapped_v3 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.progress_unmapped_v3 FROM PUBLIC,anon,authenticated;
DELETE FROM public.progress p WHERE EXISTS(SELECT 1 FROM public.progress_unmapped_v3 a WHERE a.id=p.id);
ALTER TABLE public.progress ADD CONSTRAINT progress_catalogue_fk FOREIGN KEY(phase,exercise_id)
 REFERENCES public.exercise_catalogue(phase,exercise_id);
COMMIT;
