-- =====================================================================
--  DrogueriePro V46 → MAJ « V47 » — à exécuter UNE fois dans Supabase → SQL Editor
--  Idempotent : peut être relancé sans risque. Ne supprime aucune donnée.
-- =====================================================================

-- 1) Documents : suivi de la facturation partielle + colonnes utilisées par l'app
alter table sales     add column if not exists invoiced_lines_json jsonb default '{}'::jsonb;
alter table purchases add column if not exists invoiced_lines_json jsonb default '{}'::jsonb;
alter table sales     add column if not exists vat_rate   numeric default 20;
alter table sales     add column if not exists delivered  boolean default false;
alter table sales     add column if not exists doc_status text    default 'open';
alter table sales     add column if not exists trip_id    bigint;
alter table purchases add column if not exists vat_rate   numeric default 20;
alter table purchases add column if not exists received   boolean default false;
alter table purchases add column if not exists doc_status text    default 'open';
create index if not exists idx_sales_base_doc     on sales(base_doc_id);
create index if not exists idx_purchases_base_doc on purchases(base_doc_id);

-- 2) Catégories et unités produits (listes gérées depuis l'écran Produits)
create table if not exists product_categories (
  id         bigserial primary key,
  name       text unique not null,
  name_ar    text,
  created_at timestamptz default now()
);
create table if not exists product_units (
  id         bigserial primary key,
  name       text unique not null,
  created_at timestamptz default now()
);
alter table product_categories disable row level security;
alter table product_units      disable row level security;

insert into product_categories(name, name_ar) values
 ('Peinture','دهانات'), ('Solvants','مذيبات'), ('Colles & Silicones','غراء وسيليكون'),
 ('Ciment & Plâtre','إسمنت وجبس'), ('Outillage','أدوات'), ('Droguerie','مواد التنظيف'),
 ('Hygiène','نظافة'), ('Divers','متنوع')
on conflict (name) do nothing;

insert into product_units(name) values
 ('Pièce'), ('Kg'), ('Litre'), ('Sac'), ('Bidon'), ('Carton'), ('Mètre'), ('m²'), ('Paire'), ('Rouleau')
on conflict (name) do nothing;

-- Reprise : on ajoute aux listes les catégories / unités déjà utilisées par vos produits
insert into product_categories(name)
  select distinct trim(category) from products where coalesce(trim(category),'') <> ''
on conflict (name) do nothing;
insert into product_units(name)
  select distinct trim(unit) from products where coalesce(trim(unit),'') <> ''
on conflict (name) do nothing;

-- 3) Mode SaaS : module « Application mobile » activable/désactivable
insert into saas_modules(code, name, description, enabled, monthly_price, yearly_price, sort_order)
values ('mobileApp', 'Application mobile', 'Accès à l''application mobile Android / iOS', true, 0, 0, 52)
on conflict (code) do nothing;

-- 4) Paramètres d'alertes (valeurs par défaut, modifiables dans Paramètres)
insert into app_settings(key, value) values
 ('alert_stock_enabled','1'),
 ('alert_expiry_enabled','1'), ('alert_expiry_days','30'),
 ('alert_unpaid_enabled','1'), ('alert_unpaid_days','30'),
 ('alert_margin_enabled','1'), ('alert_margin_min','10')
on conflict (key) do nothing;

-- 5) Vérification
select 'invoiced_lines_json (ventes)' as element,
       case when exists (select 1 from information_schema.columns where table_name='sales' and column_name='invoiced_lines_json') then 'OK' else '❌' end as etat
union all select 'product_categories', case when to_regclass('public.product_categories') is not null then 'OK (' || (select count(*) from product_categories) || ')' else '❌' end
union all select 'product_units',      case when to_regclass('public.product_units') is not null then 'OK (' || (select count(*) from product_units) || ')' else '❌' end
union all select 'module mobileApp',   case when exists (select 1 from saas_modules where code='mobileApp') then 'OK' else '❌' end
union all select 'alertes',            (select count(*)::text || ' réglages' from app_settings where key like 'alert_%');
