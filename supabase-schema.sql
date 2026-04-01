create table if not exists public.site_content (
  language text not null,
  page text not null,
  key text not null,
  value text not null default '',
  updated_at timestamptz not null default now(),
  primary key (language, page, key)
);

alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can manage site content" on public.site_content;
create policy "Authenticated users can manage site content"
on public.site_content
for all
to authenticated
using (true)
with check (true);

insert into public.site_content (language, page, key, value)
values
  ('zh', 'site', 'company_name', '冠德精密工業'),
  ('zh', 'site', 'company_name_full', '冠鋐精密工業股份有限公司'),
  ('zh', 'site', 'english_name', 'Precision Stamping & Manufacturing'),
  ('zh', 'site', 'footer_text', '精密沖壓｜模具開發｜金屬零組件製造'),
  ('en', 'site', 'company_name', 'Grand Harvest Precision'),
  ('en', 'site', 'company_name_full', 'Grand Harvest Precision Industrial Co., Ltd.'),
  ('en', 'site', 'english_name', 'Precision Stamping & Manufacturing'),
  ('en', 'site', 'footer_text', 'Precision Stamping | Tooling Development | Metal Component Manufacturing')
on conflict (language, page, key) do nothing;
