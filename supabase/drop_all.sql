-- EduLite — Drop All
-- Removes everything for a clean reset. Run before create_all.sql.

-- Storage policies (remove all policies on storage.objects)
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Storage data — cannot be deleted via SQL (Supabase blocks direct storage table writes).
-- To clear storage: use the Supabase Dashboard → Storage, or the Storage API.
-- The buckets will be re-upserted by create_all.sql (ON CONFLICT DO UPDATE).

-- Public RLS policies
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Tables (reverse dependency order)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_members CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.resource_bookmarks CASCADE;
DROP TABLE IF EXISTS public.class_resources CASCADE;

DROP TABLE IF EXISTS public.note_comments CASCADE;
DROP TABLE IF EXISTS public.quiz_responses CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.class_notes CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.class_members CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Functions (both public and private schemas)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.generate_invite_code() CASCADE;
DROP FUNCTION IF EXISTS public.is_chat_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS private.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS private.is_chat_member(uuid) CASCADE;

-- Private schema (recreated by create_all.sql)
DROP SCHEMA IF EXISTS private CASCADE;
