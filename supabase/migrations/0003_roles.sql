-- Renté by Kisha: role-based access. Roles live on the user profile: 'customer' (default) or 'admin'.
-- Replaces the separate admins table. Run after 0002_customers.sql. Safe to re-run.

alter table public.profiles
  add column if not exists role text not null default 'customer' check (role in ('customer', 'admin'));

-- Carry over everyone who was in the old admins table.
do $$
begin
  if to_regclass('public.admins') is not null then
    update public.profiles p set role = 'admin' from public.admins a where a.user_id = p.id;
  end if;
end $$;

-- Every existing policy and function asks is_admin(), so switching its source switches the whole app.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop table if exists public.admins;

-- Customers can change only name and phone (set in 0002), so nobody can promote themselves.
-- Admins change roles through this function, which refuses to lock the last admin out.
create or replace function public.set_user_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change roles.' using errcode = '42501';
  end if;
  if p_role not in ('customer', 'admin') then
    raise exception 'Unknown role.';
  end if;
  if p_user = auth.uid() and p_role <> 'admin' then
    raise exception 'You cannot remove your own admin access.';
  end if;
  update public.profiles set role = p_role where id = p_user;
  if not found then
    raise exception 'We could not find that user.';
  end if;
end;
$$;

revoke execute on function public.set_user_role(uuid, text) from public, anon;
grant  execute on function public.set_user_role(uuid, text) to authenticated;
