-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/iqjlbqhpojsqxcpdvkbs/sql)

-- 1. Create table for Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    year INTEGER NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create table for Business Units assigned to projects
CREATE TABLE IF NOT EXISTS public.project_business_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    business_unit_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, business_unit_id)
);

-- 3. Create table for Activity Data Submissions (from Customer to SA)
CREATE TABLE IF NOT EXISTS public.activity_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    business_unit_id TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    status TEXT DEFAULT 'submitted',
    file_name TEXT,
    calculated_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) and allow public access for this MVP
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_submissions ENABLE ROW LEVEL SECURITY;

-- Allow completely open access for this MVP (can restrict later based on auth)
CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.project_business_units FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.project_business_units FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.project_business_units FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.project_business_units FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.activity_submissions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.activity_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.activity_submissions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.activity_submissions FOR DELETE USING (true);

-- Enable realtime subscriptions for the submissions table
alter publication supabase_realtime add table public.activity_submissions;
