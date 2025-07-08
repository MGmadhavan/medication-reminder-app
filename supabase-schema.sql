-- SUPABASE DATABASE SETUP SCRIPT
-- Copy and paste this entire script into your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query

-- Note: RLS is already enabled on auth.users by default in Supabase
-- No need to enable it manually

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  caretaker_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (id)
);

-- Create medications table
create table public.medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  dosage text not null,
  time text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create medication_logs table
create table public.medication_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  medication_id uuid references public.medications on delete cascade not null,
  taken_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Prevent duplicate entries for same medication on same date
  unique(user_id, medication_id, date)
);

-- Set up Row Level Security (RLS)
-- Profiles policies
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Medications policies
alter table public.medications enable row level security;

create policy "Users can view own medications" on public.medications
  for select using (auth.uid() = user_id);

create policy "Users can insert own medications" on public.medications
  for insert with check (auth.uid() = user_id);

create policy "Users can update own medications" on public.medications
  for update using (auth.uid() = user_id);

create policy "Users can delete own medications" on public.medications
  for delete using (auth.uid() = user_id);

-- Medication logs policies
alter table public.medication_logs enable row level security;

create policy "Users can view own medication logs" on public.medication_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own medication logs" on public.medication_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own medication logs" on public.medication_logs
  for update using (auth.uid() = user_id);

create policy "Users can delete own medication logs" on public.medication_logs
  for delete using (auth.uid() = user_id);

-- Function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, caretaker_email)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'caretaker_email'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.medications
  for each row execute procedure public.handle_updated_at();

-- Function to get missed medications for email alerts
create or replace function public.get_missed_medications(target_date date default current_date)
returns table (
  medication_id uuid,
  medication_name text,
  medication_dosage text,
  medication_time text,
  user_id uuid,
  user_email text,
  user_full_name text,
  caretaker_email text
) as $$
begin
  return query
  select 
    m.id as medication_id,
    m.name as medication_name,
    m.dosage as medication_dosage,
    m.time as medication_time,
    m.user_id,
    p.email as user_email,
    p.full_name as user_full_name,
    p.caretaker_email
  from public.medications m
  join public.profiles p on p.id = m.user_id
  where m.id not in (
    select medication_id 
    from public.medication_logs 
    where date = target_date 
    and user_id = m.user_id
  )
  and p.caretaker_email is not null
  and p.caretaker_email != '';
end;
$$ language plpgsql security definer;

-- Demo data will be created automatically when users sign up
-- The handle_new_user() function will create profile entries automatically

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to anon, authenticated;
grant all on public.medications to anon, authenticated;
grant all on public.medication_logs to anon, authenticated;

-- Success message
do $$
begin
  raise notice 'Database setup completed successfully!';
  raise notice 'You can now use your Medication Reminder App with Supabase.';
end $$;
