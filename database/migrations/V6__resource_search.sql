BEGIN;
ALTER TABLE public.community_resources ADD COLUMN search_text text
 GENERATED ALWAYS AS (title || ' ' || description || ' ' || phase_slug || ' ' || purpose) STORED;
-- Keep the old Phase 0 resource label valid while normalizing it to the catalogue.
ALTER TABLE public.community_resources DROP CONSTRAINT IF EXISTS community_resources_phase_slug_check;
UPDATE public.community_resources SET phase_slug='00_setup' WHERE phase_slug='00_Setup';
ALTER TABLE public.community_resources ADD CONSTRAINT community_resources_phase_fk
 FOREIGN KEY(phase_slug) REFERENCES public.learning_phases(slug);
COMMIT;
