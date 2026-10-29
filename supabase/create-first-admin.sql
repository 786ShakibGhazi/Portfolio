-- Run ONCE in the Supabase SQL Editor, after creating your user in
-- Dashboard > Authentication > Users > "Add user" (tick "Auto Confirm User").
-- Replace the e-mail below with the address of that user.
--
-- Only users listed in public.admins can read or change portfolio content.
-- Row Level Security enforces this in the database, regardless of the frontend.

insert into public.admins (user_id)
select id from auth.users where email = 'YOUR-ADMIN-EMAIL@example.com'
on conflict (user_id) do nothing;

-- Verify: should return exactly one row for your account.
select a.user_id, u.email, a.created_at
from public.admins a
join auth.users u on u.id = a.user_id;
