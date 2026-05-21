-- ══════════════════════════════════════════════════════════════
-- EduLite — Complete Schema
-- Run drop_all.sql first for a clean setup.
--
-- SCHEMA OVERVIEW (for teachers):
-- ─────────────────────────────────────────────────────────────
-- profiles       → Each user (student/teacher/admin)
-- classes        → A class created by a teacher
-- class_members  → Links users to classes (student or teacher role)
-- assignments    → Tasks teachers assign to students
-- submissions    → Student work submitted for assignments
-- class_notes    → Posts/announcements in the class feed
-- note_comments  → Comments on posts
--
-- quizzes        → Quizzes/polls created by teachers
-- quiz_questions → Questions inside a quiz
-- quiz_responses → Student answers to quizzes
-- class_resources→ Files/links shared in a class
-- chats          → Direct messages and group chats
-- chat_members   → Who is in each chat
-- messages       → Individual chat messages
-- notifications  → In-app notifications
--
-- DELETION RULES:
-- When a USER is deleted → their profile, memberships,
--   submissions, messages, notifications, and storage files
--   are all deleted automatically (ON DELETE CASCADE).
-- When a CLASS is deleted → all assignments, submissions,
--   notes, quizzes, resources, chats, and storage files
--   inside that class are deleted (ON DELETE CASCADE).
-- ══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema for SECURITY DEFINER helpers. Hidden from PostgREST (only
-- the `public` schema is exposed), so anon/authenticated cannot
-- invoke these via /rest/v1/rpc.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO postgres, service_role, authenticated, anon;


-- ══════════════════════════════════════
--  1. PROFILES (users)
-- ══════════════════════════════════════
-- Each authenticated user gets one profile.
-- Created automatically via trigger when they sign up.

CREATE TABLE public.profiles (
  id            uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email         text,
  username      text UNIQUE,
  name          text,
  avatar_url    text,
  banner_url    text,
  bio           text,
  location      text,
  contact_email text,
  is_verified   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Auto-create profile when a new user signs up.
-- Lives in `private` schema so PostgREST cannot expose it as RPC.
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_username text;
BEGIN
  default_username := coalesce(
    lower(regexp_replace(new.raw_user_meta_data->>'username', '[^a-z0-9]', '', 'gi')),
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'gi')) || floor(random() * 9000 + 1000)::text
  );

  INSERT INTO public.profiles (id, email, username, name, avatar_url)
  VALUES (
    new.id, new.email, default_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', default_username),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE private.handle_new_user();


-- ══════════════════════════════════════
--  2. CLASSES
-- ══════════════════════════════════════
-- A class is created by a teacher (owner_id).
-- Has a 6-character invite code for students to join.

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || chars[1+floor(random()*array_length(chars, 1))];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TABLE public.classes (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name         text NOT NULL,
  description  text,
  subject      text,
  banner_url   text,
  avatar_url   text,
  color        text DEFAULT '#6366f1',
  invite_code  text UNIQUE DEFAULT generate_invite_code() NOT NULL,
  chat_enabled boolean DEFAULT true,
  is_locked    boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);


-- ══════════════════════════════════════
--  3. CLASS MEMBERS
-- ══════════════════════════════════════
-- Links users to classes. Role is 'student' or 'teacher'.
-- A user can only be in a class once (UNIQUE constraint).

CREATE TABLE public.class_members (
  id        uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id  uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  user_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role      text DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(class_id, user_id)
);


-- ══════════════════════════════════════
--  4. ASSIGNMENTS
-- ══════════════════════════════════════
-- Tasks that teachers create inside a class.
-- When the class is deleted, all assignments are deleted.
-- When the teacher (created_by) is deleted, set to NULL
-- (the class owner can still manage the assignments).

CREATE TABLE public.assignments (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id    uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       text NOT NULL,
  description text,
  file_url    text,
  due_at      timestamptz,
  has_grading boolean DEFAULT false,
  max_grade   numeric(5,1) DEFAULT 20,
  created_at  timestamptz DEFAULT now()
);


-- ══════════════════════════════════════
--  5. SUBMISSIONS
-- ══════════════════════════════════════
-- Student work submitted for an assignment.
-- When assignment is deleted → submission deleted (CASCADE).
-- When student is deleted → submission deleted (CASCADE).

CREATE TABLE public.submissions (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  user_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content       text,
  file_path     text,
  submitted_at  timestamptz DEFAULT now(),
  status        text DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  grade         numeric(5,1) CHECK (grade >= 0),
  feedback      text,
  graded_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  graded_at     timestamptz,
  UNIQUE(assignment_id, user_id)
);


-- ══════════════════════════════════════
--  6. CLASS NOTES (Feed Posts)
-- ══════════════════════════════════════

CREATE TABLE public.class_notes (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id   uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title      text NOT NULL,
  content    text,
  pinned     boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.note_comments (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  note_id    uuid REFERENCES public.class_notes(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);


-- ══════════════════════════════════════
--  7. QUIZZES & POLLS
-- ══════════════════════════════════════

CREATE TABLE public.quizzes (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id     uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  created_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title        text NOT NULL,
  description  text,
  time_limit   integer,
  is_published boolean DEFAULT false,
  allow_retake boolean DEFAULT false,
  show_answers boolean DEFAULT true,
  due_at       timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_questions (
  id             uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id        uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text  text NOT NULL,
  question_type  text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'poll')),
  options        jsonb NOT NULL DEFAULT '[]',
  correct_answer integer,
  points         numeric(5,1) DEFAULT 1,
  sort_order     integer DEFAULT 0
);

CREATE TABLE public.quiz_responses (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id      uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers      jsonb NOT NULL DEFAULT '{}',
  score        numeric(5,1),
  max_score    numeric(5,1),
  started_at   timestamptz DEFAULT now(),
  submitted_at timestamptz,
  UNIQUE(quiz_id, user_id)
);


-- ══════════════════════════════════════
--  8. RESOURCES
-- ══════════════════════════════════════

CREATE TABLE public.class_resources (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id      uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  uploaded_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  file_url      text,
  link_url      text,
  resource_type text DEFAULT 'file' CHECK (resource_type IN ('file', 'link', 'video', 'document')),
  folder        text DEFAULT 'Geral',
  created_at    timestamptz DEFAULT now()
);


-- ══════════════════════════════════════
--  9. CHAT & MESSAGES
-- ══════════════════════════════════════

CREATE TABLE public.chats (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type       text DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'class')),
  class_id   uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name       text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.chat_members (
  chat_id     uuid REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_read_at timestamptz DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE public.messages (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id     uuid REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content     text NOT NULL,
  file_url    text,
  reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  is_deleted  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.messages REPLICA IDENTITY FULL;


-- ══════════════════════════════════════
--  10. NOTIFICATIONS
-- ══════════════════════════════════════

CREATE TABLE public.notifications (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type         text NOT NULL,
  title        text NOT NULL,
  body         text,
  link         text,
  reference_id uuid,
  is_read      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.notifications REPLICA IDENTITY FULL;


-- ══════════════════════════════════════
--  Realtime (Postgres CDC)
-- ══════════════════════════════════════
-- Add tables to the supabase_realtime publication so clients can use
-- supabase.channel('...').on('postgres_changes', ...). Without this the
-- realtime client receives nothing for these tables and apps fall back
-- to lossy custom Broadcast — which silently drops events.
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.note_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_resources;


-- ══════════════════════════════════════
--  Indexes
-- ══════════════════════════════════════
-- Each foreign key gets a covering btree index so joins/cascades
-- don't sequential-scan the child table.

CREATE INDEX idx_notifications_user             ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX idx_classes_owner                  ON public.classes(owner_id);
CREATE INDEX idx_class_members_user             ON public.class_members(user_id);
CREATE INDEX idx_assignments_class              ON public.assignments(class_id);
CREATE INDEX idx_assignments_created_by         ON public.assignments(created_by);
CREATE INDEX idx_submissions_user               ON public.submissions(user_id);
CREATE INDEX idx_submissions_graded_by          ON public.submissions(graded_by);
CREATE INDEX idx_class_notes_class              ON public.class_notes(class_id);
CREATE INDEX idx_class_notes_created_by         ON public.class_notes(created_by);
CREATE INDEX idx_note_comments_note             ON public.note_comments(note_id);
CREATE INDEX idx_note_comments_user             ON public.note_comments(user_id);
CREATE INDEX idx_quizzes_class                  ON public.quizzes(class_id);
CREATE INDEX idx_quizzes_created_by             ON public.quizzes(created_by);
CREATE INDEX idx_quiz_questions_quiz            ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_responses_user            ON public.quiz_responses(user_id);
CREATE INDEX idx_class_resources_class          ON public.class_resources(class_id);
CREATE INDEX idx_class_resources_uploaded_by    ON public.class_resources(uploaded_by);
CREATE INDEX idx_chats_class                    ON public.chats(class_id);
CREATE INDEX idx_chats_created_by               ON public.chats(created_by);
CREATE INDEX idx_chat_members_user              ON public.chat_members(user_id);
CREATE INDEX idx_messages_chat                  ON public.messages(chat_id);
CREATE INDEX idx_messages_sender                ON public.messages(sender_id);
CREATE INDEX idx_messages_reply_to              ON public.messages(reply_to_id);


-- ══════════════════════════════════════
--  Helper Functions
-- ══════════════════════════════════════
-- Lives in `private` schema so PostgREST cannot expose it as RPC.
-- RLS policies call it as `private.is_chat_member(...)`.

CREATE OR REPLACE FUNCTION private.is_chat_member(_chat_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_id = _chat_id AND user_id = (select auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION private.is_chat_member(uuid) TO authenticated, anon;


-- ══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════
-- RLS controls WHO can read/write each row.
-- Performance note: `auth.uid()` is wrapped in `(select auth.uid())`
-- so Postgres caches its value once per query instead of evaluating
-- it per row. `FOR ALL` is avoided in favour of explicit
-- INSERT/UPDATE/DELETE policies so they don't overlap with SELECT.

-- ── Profiles ────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles"      ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Self insert profiles" ON public.profiles FOR INSERT WITH CHECK (id = (select auth.uid()));
CREATE POLICY "Self update profiles" ON public.profiles FOR UPDATE
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ── Classes ─────────────────────────────────────────────────
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View classes"          ON public.classes FOR SELECT USING (true);
CREATE POLICY "Owner insert classes"  ON public.classes FOR INSERT WITH CHECK (owner_id = (select auth.uid()));
CREATE POLICY "Owner update classes"  ON public.classes FOR UPDATE
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));
CREATE POLICY "Owner delete classes"  ON public.classes FOR DELETE USING (owner_id = (select auth.uid()));

-- ── Class Members ───────────────────────────────────────────
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View class members"   ON public.class_members FOR SELECT USING (true);
CREATE POLICY "Join classes"         ON public.class_members FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Leave or be removed"  ON public.class_members FOR DELETE USING (
  user_id = (select auth.uid())
  OR EXISTS (SELECT 1 FROM public.classes WHERE id = class_members.class_id AND owner_id = (select auth.uid()))
);

-- ── Assignments ─────────────────────────────────────────────
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View assignments" ON public.assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_members WHERE class_id = assignments.class_id AND user_id = (select auth.uid()))
  OR EXISTS (SELECT 1 FROM public.classes WHERE id = assignments.class_id AND owner_id = (select auth.uid()))
);
CREATE POLICY "Insert assignments" ON public.assignments FOR INSERT WITH CHECK (created_by = (select auth.uid()));
CREATE POLICY "Update assignments" ON public.assignments FOR UPDATE
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));
CREATE POLICY "Delete assignments" ON public.assignments FOR DELETE USING (created_by = (select auth.uid()));

-- ── Submissions ─────────────────────────────────────────────
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View submissions" ON public.submissions FOR SELECT USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.assignments a JOIN public.classes c ON c.id = a.class_id
    WHERE a.id = submissions.assignment_id AND c.owner_id = (select auth.uid())
  )
);
CREATE POLICY "Submit work" ON public.submissions FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Update submission" ON public.submissions FOR UPDATE USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.assignments a JOIN public.classes c ON c.id = a.class_id
    WHERE a.id = submissions.assignment_id AND c.owner_id = (select auth.uid())
  )
);

-- ── Class Notes ─────────────────────────────────────────────
ALTER TABLE public.class_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View class notes" ON public.class_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_members WHERE class_id = class_notes.class_id AND user_id = (select auth.uid()))
  OR EXISTS (SELECT 1 FROM public.classes WHERE id = class_notes.class_id AND owner_id = (select auth.uid()))
);
CREATE POLICY "Insert class notes" ON public.class_notes FOR INSERT WITH CHECK (created_by = (select auth.uid()));
CREATE POLICY "Update class notes" ON public.class_notes FOR UPDATE
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));
CREATE POLICY "Delete class notes" ON public.class_notes FOR DELETE USING (created_by = (select auth.uid()));

-- ── Note Comments ───────────────────────────────────────────
ALTER TABLE public.note_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View note comments" ON public.note_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.class_notes cn JOIN public.class_members cm ON cm.class_id = cn.class_id
    WHERE cn.id = note_comments.note_id AND cm.user_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.class_notes cn JOIN public.classes c ON c.id = cn.class_id
    WHERE cn.id = note_comments.note_id AND c.owner_id = (select auth.uid())
  )
);
CREATE POLICY "Create note comments" ON public.note_comments FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Delete own comments"  ON public.note_comments FOR DELETE
  USING (user_id = (select auth.uid()));

-- ── Quizzes ─────────────────────────────────────────────────
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View quizzes" ON public.quizzes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_members WHERE class_id = quizzes.class_id AND user_id = (select auth.uid()))
  OR EXISTS (SELECT 1 FROM public.classes WHERE id = quizzes.class_id AND owner_id = (select auth.uid()))
);
CREATE POLICY "Insert quizzes" ON public.quizzes FOR INSERT WITH CHECK (created_by = (select auth.uid()));
CREATE POLICY "Update quizzes" ON public.quizzes FOR UPDATE
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));
CREATE POLICY "Delete quizzes" ON public.quizzes FOR DELETE USING (created_by = (select auth.uid()));

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View quiz questions" ON public.quiz_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q JOIN public.class_members cm ON cm.class_id = q.class_id
    WHERE q.id = quiz_questions.quiz_id AND cm.user_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.quizzes q JOIN public.classes c ON c.id = q.class_id
    WHERE q.id = quiz_questions.quiz_id AND c.owner_id = (select auth.uid())
  )
);
CREATE POLICY "Insert quiz questions" ON public.quiz_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_questions.quiz_id AND created_by = (select auth.uid()))
);
CREATE POLICY "Update quiz questions" ON public.quiz_questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_questions.quiz_id AND created_by = (select auth.uid()))
);
CREATE POLICY "Delete quiz questions" ON public.quiz_questions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_questions.quiz_id AND created_by = (select auth.uid()))
);

ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View quiz responses" ON public.quiz_responses FOR SELECT USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.quizzes q JOIN public.classes c ON c.id = q.class_id
    WHERE q.id = quiz_responses.quiz_id AND c.owner_id = (select auth.uid())
  )
);
CREATE POLICY "Submit response"   ON public.quiz_responses FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Update response"   ON public.quiz_responses FOR UPDATE USING (user_id = (select auth.uid()));

-- ── Resources ───────────────────────────────────────────────
ALTER TABLE public.class_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View resources" ON public.class_resources FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_members WHERE class_id = class_resources.class_id AND user_id = (select auth.uid()))
  OR EXISTS (SELECT 1 FROM public.classes WHERE id = class_resources.class_id AND owner_id = (select auth.uid()))
);
CREATE POLICY "Insert resources" ON public.class_resources FOR INSERT WITH CHECK (uploaded_by = (select auth.uid()));
CREATE POLICY "Update resources" ON public.class_resources FOR UPDATE
  USING (uploaded_by = (select auth.uid()))
  WITH CHECK (uploaded_by = (select auth.uid()));
CREATE POLICY "Delete resources" ON public.class_resources FOR DELETE USING (uploaded_by = (select auth.uid()));

-- ── Chats ───────────────────────────────────────────────────
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View chats" ON public.chats FOR SELECT USING (
  created_by = (select auth.uid())
  OR private.is_chat_member(id)
  OR (
    type = 'class'
    AND EXISTS (
      SELECT 1 FROM public.class_members cm
      WHERE cm.class_id = chats.class_id AND cm.user_id = (select auth.uid())
    )
  )
);
CREATE POLICY "Create chats" ON public.chats FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Update chats" ON public.chats FOR UPDATE
  USING (private.is_chat_member(id))
  WITH CHECK (private.is_chat_member(id));

ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View members" ON public.chat_members FOR SELECT USING (
  user_id = (select auth.uid()) OR private.is_chat_member(chat_id)
);
CREATE POLICY "Add members"  ON public.chat_members FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Leave or be kicked from chat" ON public.chat_members FOR DELETE USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.chats c
    JOIN public.classes cl ON cl.id = c.class_id
    WHERE c.id = chat_members.chat_id AND c.type = 'class' AND cl.owner_id = (select auth.uid())
  )
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read messages"       ON public.messages FOR SELECT USING (private.is_chat_member(chat_id));
CREATE POLICY "Send messages"       ON public.messages FOR INSERT
  WITH CHECK (sender_id = (select auth.uid()) AND private.is_chat_member(chat_id));
CREATE POLICY "Update own messages" ON public.messages FOR UPDATE
  USING (sender_id = (select auth.uid()))
  WITH CHECK (sender_id = (select auth.uid()));

-- ── Notifications ───────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View notifications"   ON public.notifications FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Insert notifications" ON public.notifications FOR INSERT WITH CHECK (
  (select auth.role()) = 'authenticated' AND (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.class_members cm ON cm.class_id = c.id
      WHERE cm.user_id = notifications.user_id
        AND c.owner_id = (select auth.uid())
    )
  )
);
CREATE POLICY "Update notifications" ON public.notifications FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Delete notifications" ON public.notifications FOR DELETE USING (user_id = (select auth.uid()));


-- ══════════════════════════════════════════════════════════════
--  STORAGE BUCKETS
-- ══════════════════════════════════════════════════════════════
-- Buckets remain `public = true`, so URLs from
-- `storage.from(bucket).getPublicUrl(path)` continue to work
-- without any RLS SELECT policy. The broad "anyone can list this
-- bucket" SELECT policies have been removed — they only enabled
-- bucket enumeration which the app never uses.

-- Avatars (2MB, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/gif','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp'];

CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (select auth.uid())::text = split_part(name, '.', 1));
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (select auth.uid())::text = split_part(name, '.', 1));
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (select auth.uid())::text = split_part(name, '.', 1));

-- Banners (5MB, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('banners', 'banners', true, 5242880, ARRAY['image/jpeg','image/png','image/gif','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp'];

CREATE POLICY "Upload own banner" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND starts_with(name, (select auth.uid())::text));
CREATE POLICY "Update own banner" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'banners' AND starts_with(name, (select auth.uid())::text));
CREATE POLICY "Delete own banner" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'banners' AND starts_with(name, (select auth.uid())::text));

-- Assignment files (10MB, docs/images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assignments', 'assignments', true, 10485760, ARRAY[
  'application/pdf','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg','image/png','image/gif','image/webp','text/plain','application/zip'
])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg','image/png','image/gif','image/webp','text/plain','application/zip'
  ];

CREATE POLICY "Upload assignment files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assignments');
CREATE POLICY "Update assignment files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assignments');

-- Submission files (10MB, same types as assignments)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('submissions', 'submissions', true, 10485760, ARRAY[
  'application/pdf','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg','image/png','image/gif','image/webp','text/plain','application/zip'
])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg','image/png','image/gif','image/webp','text/plain','application/zip'
  ];

CREATE POLICY "Upload submission files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'submissions');

-- Chat attachments (10MB, media/docs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-attachments', 'chat-attachments', true, 10485760, ARRAY[
  'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
  'application/pdf','text/plain','application/zip',
  'audio/mpeg','audio/wav','audio/ogg',
  'video/mp4','video/webm'
])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
    'application/pdf','text/plain','application/zip',
    'audio/mpeg','audio/wav','audio/ogg',
    'video/mp4','video/webm'
  ];

CREATE POLICY "Upload chat files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-attachments');

-- Resources bucket (10MB, broad types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resources', 'resources', true, 10485760, ARRAY[
  'application/pdf','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg','image/png','image/gif','image/webp','text/plain','application/zip',
  'audio/mpeg','video/mp4','video/webm'
])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg','image/png','image/gif','image/webp','text/plain','application/zip',
    'audio/mpeg','video/mp4','video/webm'
  ];

CREATE POLICY "Upload resource files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources');
CREATE POLICY "Delete resource files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resources');
