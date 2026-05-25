-- =============================================================================
-- SustainPro — Report Templates schema additions (run AFTER seed-supabase.sql)
-- =============================================================================
-- Adds:
--   * report_generations  — log of every GRI/ISO/template PDF generated
--   * report_templates    — saved custom report templates
--
-- Run this in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/iqjlbqhpojsqxcpdvkbs/sql
-- Safe to re-run; uses IF NOT EXISTS + DO blocks for policies.
-- =============================================================================

-- 1) report_generations
CREATE TABLE IF NOT EXISTS public.report_generations (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id       UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    business_unit_id TEXT,
    report_type      TEXT NOT NULL,
    template_id      UUID,
    generated_by     TEXT NOT NULL,
    generated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_generations_project
  ON public.report_generations(project_id, business_unit_id);

-- 2) report_templates
CREATE TABLE IF NOT EXISTS public.report_templates (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                     TEXT NOT NULL,
    description              TEXT,
    base_type                TEXT NOT NULL,
    reporting_org_name       TEXT,
    reporting_year           INTEGER,
    person_responsible       TEXT,
    source_project_id        UUID,
    source_business_unit_id  TEXT,
    template_structure       JSONB NOT NULL DEFAULT '{"sections":[]}'::jsonb,
    created_by               TEXT NOT NULL,
    created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) RLS
ALTER TABLE public.report_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "all_rg_select" ON public.report_generations FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "all_rg_insert" ON public.report_generations FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "all_rg_update" ON public.report_generations FOR UPDATE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "all_rg_delete" ON public.report_generations FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "all_rt_select" ON public.report_templates FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "all_rt_insert" ON public.report_templates FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "all_rt_update" ON public.report_templates FOR UPDATE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "all_rt_delete" ON public.report_templates FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Realtime
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.report_generations; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.report_templates;   EXCEPTION WHEN others THEN NULL; END $$;

-- Verify:
-- SELECT * FROM public.report_generations;
-- SELECT * FROM public.report_templates;
