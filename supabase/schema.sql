create extension if not exists pgcrypto;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  companies text[] not null default '{}',
  property_types text[] not null default '{}',
  sales_focus text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  fbclid text,
  landing_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  position integer not null,
  created_at timestamptz not null default now()
);

create table if not exists subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  title text not null,
  summary text not null,
  position integer not null,
  duration_seconds integer not null,
  video_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists auth_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  type text not null check (type in ('form-access', 'resume-login', 'magic-link-sent', 'magic-link-opened')),
  created_at timestamptz not null default now()
);

create table if not exists watch_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  subtopic_id uuid not null references subtopics(id) on delete cascade,
  session_id text not null,
  watched_seconds integer not null,
  position_seconds integer not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on leads(email);
create index if not exists auth_events_lead_created_idx on auth_events(lead_id, created_at desc);
create index if not exists watch_events_lead_created_idx on watch_events(lead_id, created_at desc);
create index if not exists watch_events_subtopic_created_idx on watch_events(subtopic_id, created_at desc);
create unique index if not exists topics_position_unique_idx on topics(position);
create unique index if not exists subtopics_topic_position_unique_idx on subtopics(topic_id, position);
