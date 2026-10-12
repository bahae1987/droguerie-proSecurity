-- =====================================================================
--  DrogueriePro V46 — SETUP COMPLET (à exécuter UNE fois dans Supabase)
--  =====================================================================
--  Contenu :
--    PARTIE A : schéma de base complet (tables manquantes créées,
--               tables existantes conservées telles quelles)
--    PARTIE B : données de base (rôles, permissions, droits, branche,
--               société, modules SaaS)
--    PARTIE C : MAJ (péremption, pièces jointes, déplacements, charges,
--               rattachement ventes, modules SaaS des nouveautés)
--    PARTIE D : diagnostic final
--    PARTIE E : MAJ V47   ·   PARTIE F : MAJ V48 (sécurité + nouvelles fonctions)
--  100% idempotent : "create if not exists" + "on conflict". Ne détruit
--  AUCUNE donnée existante. Vos comptes/mots de passe actuels sont gardés.
-- =====================================================================


-- =====================================================================
--  PARTIE A — SCHÉMA DE BASE (identique à votre source V46)
-- =====================================================================
create table if not exists roles (
  id bigserial primary key,
  name text unique not null,
  description text
);

create table if not exists permissions (
  id bigserial primary key,
  code text unique not null,
  module text,
  label text
);

create table if not exists role_permissions (
  role_id bigint references roles(id) on delete cascade,
  permission_id bigint references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists branches (
  id bigserial primary key,
  name text not null,
  city text,
  address text,
  phone text,
  manager_name text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists users (
  id bigserial primary key,
  username text unique not null,
  full_name text,
  password_hash text not null,
  active boolean default true,
  branch_id bigint references branches(id),
  role_id bigint references roles(id),
  created_at timestamptz default now()
);

create table if not exists clients (
  id bigserial primary key,
  name text not null,
  type text,
  ice text,
  phone text,
  city text,
  address text,
  branch_id bigint references branches(id),
  created_by bigint references users(id),
  created_by_label text,
  assigned_to bigint references users(id),
  created_at timestamptz default now()
);

create table if not exists suppliers (
  id bigserial primary key,
  name text not null,
  ice text,
  phone text,
  city text,
  contact text,
  address text,
  branch_id bigint references branches(id),
  created_by bigint references users(id),
  created_by_label text,
  assigned_to bigint references users(id),
  created_at timestamptz default now()
);

create table if not exists products (
  id bigserial primary key,
  ref text not null,
  name text not null,
  name_ar text,
  category text,
  unit text,
  purchase_price numeric default 0,
  sale_price numeric default 0,
  quantity numeric default 0,
  min_stock numeric default 0,
  supplier_id bigint references suppliers(id),
  branch_id bigint references branches(id),
  created_at timestamptz default now()
);

create unique index if not exists products_ref_branch_unique
on products(ref, coalesce(branch_id, 0));

create table if not exists sales (
  id bigserial primary key,
  stage text not null,
  date date default current_date,
  client_id bigint references clients(id),
  client_name text,
  numbers_json jsonb default '{}'::jsonb,
  lines_json jsonb default '[]'::jsonb,
  payments_json jsonb default '[]'::jsonb,
  total_ht numeric default 0,
  vat numeric default 0,
  total_ttc numeric default 0,
  base_doc_id bigint,
  qty_done numeric default 0,
  processed_lines_json jsonb default '{}'::jsonb,
  created_by bigint references users(id),
  created_by_label text,
  branch_id bigint references branches(id),
  created_at timestamptz default now()
);

create table if not exists purchases (
  id bigserial primary key,
  stage text not null,
  date date default current_date,
  supplier_id bigint references suppliers(id),
  supplier_name text,
  numbers_json jsonb default '{}'::jsonb,
  lines_json jsonb default '[]'::jsonb,
  payments_json jsonb default '[]'::jsonb,
  total_ht numeric default 0,
  vat numeric default 0,
  total_ttc numeric default 0,
  base_doc_id bigint,
  qty_done numeric default 0,
  processed_lines_json jsonb default '{}'::jsonb,
  created_by bigint references users(id),
  created_by_label text,
  branch_id bigint references branches(id),
  created_at timestamptz default now()
);

create table if not exists stock_movements (
  id bigserial primary key,
  product_id bigint references products(id),
  quantity numeric default 0,
  reason text,
  branch_id bigint references branches(id),
  doc_type text,
  doc_number text,
  user_id bigint references users(id),
  user_label text,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  module text,
  action text,
  object_label text,
  detail text,
  user_id bigint,
  user_label text,
  branch_id bigint,
  created_at timestamptz default now()
);

create table if not exists app_settings (
  key text primary key,
  value text
);

create table if not exists counters (
  name text primary key,
  value bigint default 1
);

create table if not exists saas_modules (
  code text primary key,
  name text not null,
  description text,
  enabled boolean default true,
  monthly_price numeric default 0,
  yearly_price numeric default 0,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists tenants (
  id bigserial primary key,
  name text not null,
  contact_name text,
  email text,
  phone text,
  plan text default 'standard',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists tenant_modules (
  tenant_id bigint references tenants(id) on delete cascade,
  module_code text references saas_modules(code) on delete cascade,
  enabled boolean default true,
  primary key (tenant_id, module_code)
);

create index if not exists idx_products_branch_id on products(branch_id);
create index if not exists idx_clients_branch_id on clients(branch_id);
create index if not exists idx_suppliers_branch_id on suppliers(branch_id);
create index if not exists idx_sales_branch_id on sales(branch_id);
create index if not exists idx_purchases_branch_id on purchases(branch_id);
create index if not exists idx_sales_created_by on sales(created_by);
create index if not exists idx_purchases_created_by on purchases(created_by);
create index if not exists idx_stock_movements_branch_id on stock_movements(branch_id);
create index if not exists idx_audit_logs_branch_id on audit_logs(branch_id);

-- RLS désactivé (sécurité gérée côté application par permissions)
alter table roles disable row level security;
alter table permissions disable row level security;
alter table role_permissions disable row level security;
alter table branches disable row level security;
alter table users disable row level security;
alter table clients disable row level security;
alter table suppliers disable row level security;
alter table products disable row level security;
alter table sales disable row level security;
alter table purchases disable row level security;
alter table stock_movements disable row level security;
alter table audit_logs disable row level security;
alter table app_settings disable row level security;
alter table counters disable row level security;
alter table saas_modules disable row level security;
alter table tenants disable row level security;
alter table tenant_modules disable row level security;


-- =====================================================================
--  PARTIE B — DONNÉES DE BASE (idempotent, n'écrase pas vos comptes)
-- =====================================================================
insert into branches(id, name, city, active)
values (1, 'Droguerie principale', 'Casablanca', true)
on conflict (id) do nothing;

insert into roles(id, name, description) values
(1, 'Administrateur', 'Administration métier'),
(2, 'Gérant', 'Gestion droguerie'),
(3, 'Vendeur', 'Ventes et clients affectés'),
(4, 'Magasinier', 'Stock et achats'),
(99, 'SuperAdmin', 'Administration plateforme SaaS')
on conflict (id) do update set name = excluded.name, description = excluded.description;

insert into permissions(code, module, label) values
('dashboard.read','Tableau de bord','Consulter tableau de bord'),
('products.read','Produits','Consulter produits'),
('products.write','Produits','Créer modifier produits'),
('products.delete','Produits','Supprimer produits'),
('stock.read','Stock','Consulter stock'),
('stock.adjust','Stock','Ajuster stock'),
('stock.transfer','Stock','Transfert stock'),
('clients.read','Clients','Consulter clients'),
('clients.write','Clients','Créer modifier clients'),
('clients.delete','Clients','Supprimer clients'),
('clients.assign','Clients','Affecter clients'),
('suppliers.read','Fournisseurs','Consulter fournisseurs'),
('suppliers.write','Fournisseurs','Créer modifier fournisseurs'),
('suppliers.delete','Fournisseurs','Supprimer fournisseurs'),
('sales.read','Ventes','Consulter ventes'),
('sales.write','Ventes','Créer modifier ventes'),
('sales.delete','Ventes','Supprimer ventes'),
('sales.pay','Ventes','Encaisser ventes'),
('purchases.read','Achats','Consulter achats'),
('purchases.write','Achats','Créer modifier achats'),
('purchases.delete','Achats','Supprimer achats'),
('purchases.pay','Achats','Régler achats'),
('payments.read','Paiements','Consulter paiements'),
('payments.cancel','Paiements','Annuler paiements'),
('users.read','Utilisateurs','Consulter utilisateurs'),
('users.write','Utilisateurs','Créer modifier utilisateurs'),
('settings.manage','Paramètres','Gérer paramètres'),
('permissions.manage','Autorisations','Gérer autorisations'),
('branches.manage','Drogueries','Gérer drogueries'),
('mobile.manage','Application mobile','Gérer application mobile'),
('reporting.read','Reporting','Consulter reporting'),
('superadmin.manage','SaaS','Centre SuperAdmin'),
('modules.manage','SaaS','Gérer modules'),
('database.manage','SaaS','Base données'),
('backup.manage','SaaS','Sauvegarde base'),
-- Nouveautés MAJ
('expenses.read','Charges','Consulter charges/déplacements'),
('expenses.write','Charges','Gérer charges/déplacements')
on conflict (code) do update set module = excluded.module, label = excluded.label;

-- Administrateur (role 1) : tout sauf le périmètre SaaS plateforme
insert into role_permissions(role_id, permission_id)
select 1, id from permissions
where code not in ('superadmin.manage','modules.manage','database.manage','backup.manage')
on conflict do nothing;

-- SuperAdmin (role 99) : tout
insert into role_permissions(role_id, permission_id)
select 99, id from permissions
on conflict do nothing;

-- Comptes par défaut créés SEULEMENT s'ils n'existent pas déjà
insert into users(username, full_name, password_hash, active, branch_id, role_id)
values
('admin', 'Administrateur', 'admin123', true, 1, 1),
('superadmin', 'Super Administrateur', 'superadmin123', true, null, 99)
on conflict (username) do nothing;

insert into app_settings(key, value) values
('vat_rate','20'),
('theme','light'),
('company_name','DrogueriePro'),
('company_ice',''),
('company_phone',''),
('company_address','')
on conflict (key) do nothing;

-- Modules SaaS (centre SuperAdmin) — activables/désactivables
insert into saas_modules(code, name, description, enabled, sort_order) values
('dashboard','Tableau de bord','Vue d''ensemble', true, 1),
('products','Produits','Catalogue et stock', true, 2),
('sales','Ventes','Devis, BL, factures clients', true, 3),
('purchases','Achats','Commandes, réceptions, factures fournisseurs', true, 4),
('payments','Paiements','Encaissements et règlements', true, 5),
('stockMoves','Mouvements de stock','Historique des mouvements', true, 6),
('clients','Clients','Gestion des clients', true, 7),
('suppliers','Fournisseurs','Gestion des fournisseurs', true, 8),
('reporting','Reporting','Créances, dettes, relevés', true, 9),
('profit','Rentabilité','Analyse des marges', true, 10),
('tools','Outils','Calculateurs et utilitaires', true, 11),
('expenses','Charges & Déplacements','Charges et marge nette par déplacement', true, 50),
('attachments','Pièces jointes','Fichiers joints aux documents/clients/fournisseurs/produits', true, 51)
on conflict (code) do nothing;


-- =====================================================================
--  PARTIE C — MAJ (nouveautés et correctifs)
-- =====================================================================

-- Péremption produits
alter table products add column if not exists date_expiration date;

-- Pièces jointes
create table if not exists attachments (
  id           bigserial primary key,
  entity_type  text not null,
  entity_id    text not null,
  file_name    text,
  storage_path text not null,
  mime         text,
  size         bigint,
  branch_id    bigint,
  uploaded_by  text,
  created_at   timestamptz default now()
);
create index if not exists idx_attach_entity on attachments(entity_type, entity_id);
alter table attachments disable row level security;

-- Déplacements
create table if not exists trips (
  id          bigserial primary key,
  num_dep     text,
  date        date not null default current_date,
  label       text,
  destination text,
  manager     text,
  vehicle     text,
  status      text default 'ouvert',
  branch_id   bigint,
  note        text,
  created_by  text,
  created_at  timestamptz default now()
);
alter table trips disable row level security;

-- Charges
create table if not exists expenses (
  id           bigserial primary key,
  num_chg      text,
  date         date not null default current_date,
  category     text not null,
  label        text,
  amount       numeric not null default 0,
  trip_id      bigint references trips(id) on delete set null,
  beneficiary  text,
  mode         text,
  branch_id    bigint,
  created_by   text,
  created_at   timestamptz default now()
);
create index if not exists idx_expenses_trip on expenses(trip_id);
alter table expenses disable row level security;

-- Rattacher une vente à un déplacement (sales existe désormais)
alter table sales add column if not exists trip_id bigint;
create index if not exists idx_sales_trip on sales(trip_id);

-- ⚠ Après ce script : Supabase → Storage → New bucket → nom = attachments


-- =====================================================================
--  PARTIE D — DIAGNOSTIC (doit afficher "OK présente" partout)
-- =====================================================================
select t.name as table_attendue,
       case when to_regclass('public.' || t.name) is not null
            then 'OK présente' else '❌ manquante' end as etat
from (values ('products'),('sales'),('purchases'),('clients'),('suppliers'),
             ('users'),('roles'),('permissions'),('role_permissions'),
             ('branches'),('saas_modules'),('app_settings'),('stock_movements'),
             ('attachments'),('trips'),('expenses'),('audit_logs'),('counters')) as t(name)
order by etat, table_attendue;


-- =====================================================================
--  PARTIE E — MAJ V47 (facturation partielle, catégories/unités, mobile SaaS, alertes)
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


-- =====================================================================================
--  PARTIE F — MAJ V48 (sécurité : mots de passe chiffrés, sessions, RLS ; caisse, avoirs, inventaire, clôture…)
--  Contenu identique à MAJ_V48_SUPABASE.sql
-- =====================================================================================
-- =====================================================================================
--  DrogueriePro — MAJ V48 : sécurité, fiabilité et nouvelles fonctions
--  À exécuter UNE fois dans Supabase → SQL Editor, APRÈS MAJ_V47_SUPABASE.sql.
--  Idempotent (relançable). Ne supprime aucune donnée métier.
--
--  ORDRE DE DÉPLOIEMENT CONSEILLÉ :
--    1) Déployer d'abord le nouveau main.jsx (il fonctionne aussi avec l'ancienne base)
--    2) Exécuter ce script
--    3) Tous les utilisateurs se reconnectent (les anciennes sessions sont fermées)
--  En cas de problème : ROLLBACK_SECURITE_V48.sql désactive immédiatement la protection RLS.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- PARTIE A — Nouvelles colonnes et tables (fonctionnalités)
-- -------------------------------------------------------------------------------------
alter table products  add column if not exists barcode text;
alter table products  add column if not exists sale_price_wholesale numeric default 0;
create index if not exists idx_products_barcode on products(barcode);

alter table clients   add column if not exists price_tier   text    default 'detail';
alter table clients   add column if not exists credit_limit numeric default 0;

alter table sales     add column if not exists returned_lines_json jsonb   default '{}'::jsonb;
alter table sales     add column if not exists restocked           boolean default true;
alter table sales     add column if not exists imputed_amount      numeric default 0;
alter table purchases add column if not exists returned_lines_json jsonb   default '{}'::jsonb;
alter table purchases add column if not exists restocked           boolean default true;
alter table purchases add column if not exists imputed_amount      numeric default 0;

create table if not exists inventories (
  id               bigserial primary key,
  number           text,
  inv_date         date default current_date,
  branch_id        bigint,
  category         text,
  lines_json       jsonb default '[]'::jsonb,
  gap_value        numeric default 0,
  note             text,
  created_by       bigint,
  created_by_label text,
  created_at       timestamptz default now()
);

create table if not exists cash_closures (
  id               bigserial primary key,
  closure_date     date not null,
  branch_id        bigint,
  totals_json      jsonb default '{}'::jsonb,
  opening_cash     numeric default 0,
  expected_cash    numeric default 0,
  counted_cash     numeric default 0,
  gap              numeric default 0,
  note             text,
  created_by       bigint,
  created_by_label text,
  created_at       timestamptz default now()
);
create unique index if not exists uq_cash_closure_day on cash_closures(closure_date, coalesce(branch_id, 0));

insert into saas_modules(code, name, description, enabled, monthly_price, yearly_price, sort_order)
values ('pos', 'Caisse rapide', 'Vente comptoir, codes-barres et ticket 80 mm', true, 0, 0, 53)
on conflict (code) do nothing;

-- -------------------------------------------------------------------------------------
-- PARTIE B — Connexion sécurisée (mots de passe hachés bcrypt + sessions)
-- -------------------------------------------------------------------------------------
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists user_credentials (
  user_id         bigint primary key references users(id) on delete cascade,
  password_bcrypt text not null,
  updated_at      timestamptz default now()
);
create table if not exists app_sessions (
  token      text primary key,
  user_id    bigint not null references users(id) on delete cascade,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  user_agent text
);
create index if not exists idx_app_sessions_user on app_sessions(user_id);
-- Tables secrètes : RLS activé SANS aucune politique → inaccessibles via l'API
alter table user_credentials enable row level security;
alter table app_sessions     enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on table user_credentials, app_sessions from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on table user_credentials, app_sessions from authenticated';
  end if;
end $$;

-- Utilisateur courant = jeton envoyé par l'application dans l'en-tête x-app-token
create or replace function app_current_user_id() returns bigint
language sql stable security definer set search_path = public, extensions as $$
  select s.user_id
  from app_sessions s join users u on u.id = s.user_id
  where s.token = coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-app-token'
    and s.expires_at > now()
    and u.active is true
  limit 1
$$;

create or replace function app_current_role() returns text
language sql stable security definer set search_path = public, extensions as $$
  select r.name from users u left join roles r on r.id = u.role_id where u.id = app_current_user_id()
$$;

create or replace function app_current_branch() returns bigint
language sql stable security definer set search_path = public, extensions as $$
  select u.branch_id from users u where u.id = app_current_user_id()
$$;

create or replace function app_is_admin() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select coalesce(app_current_role() in ('Administrateur', 'SuperAdmin', 'Super Administrateur'), false)
$$;

create or replace function app_is_manager() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select coalesce(app_current_role() = 'Gérant', false)
$$;

create or replace function app_has_perm(p_code text) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from users u
    join role_permissions rp on rp.role_id = u.role_id
    join permissions p on p.id = rp.permission_id
    where u.id = app_current_user_id() and p.code = p_code
  )
$$;

create or replace function app_security_version() returns int
language sql stable as $$ select 48 $$;

create or replace function app_login(p_username text, p_password text, p_user_agent text default null)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare
  v record; c record; tok text; perms json;
begin
  select u.id, u.username, u.full_name, u.password_hash, u.active, u.branch_id, u.role_id,
         r.name as role_name, b.name as branch_name
    into v
    from users u left join roles r on r.id = u.role_id left join branches b on b.id = u.branch_id
   where u.username = p_username;
  if not found or v.active is not true then
    perform pg_sleep(0.4);
    raise exception 'Identifiant incorrect' using errcode = '28000';
  end if;

  select * into c from user_credentials where user_id = v.id;
  if found then
    if c.password_bcrypt <> crypt(p_password, c.password_bcrypt) then
      perform pg_sleep(0.4);
      raise exception 'Mot de passe incorrect' using errcode = '28P01';
    end if;
  else
    -- Compte pas encore migré : contrôle avec l'ancien mot de passe puis migration immédiate
    if coalesce(v.password_hash, '') in ('', '***') or v.password_hash <> p_password then
      perform pg_sleep(0.4);
      raise exception 'Mot de passe incorrect' using errcode = '28P01';
    end if;
    insert into user_credentials(user_id, password_bcrypt) values (v.id, crypt(p_password, gen_salt('bf', 10)));
    update users set password_hash = '***' where id = v.id;
  end if;

  delete from app_sessions where expires_at < now();
  tok := encode(gen_random_bytes(32), 'hex');
  insert into app_sessions(token, user_id, expires_at, user_agent)
  values (tok, v.id, now() + interval '7 days', left(coalesce(p_user_agent, ''), 200));

  select coalesce(json_agg(p.code), '[]'::json) into perms
    from role_permissions rp join permissions p on p.id = rp.permission_id
   where rp.role_id = v.role_id;

  return json_build_object(
    'token', tok,
    'user', json_build_object('id', v.id, 'username', v.username, 'full_name', v.full_name,
                              'role', coalesce(v.role_name, 'Sans profil'),
                              'branch_id', v.branch_id, 'branch_name', coalesce(v.branch_name, '')),
    'perms', perms);
end $$;

create or replace function app_logout() returns void
language sql security definer set search_path = public, extensions as $$
  delete from app_sessions
  where token = coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-app-token'
$$;

-- Session encore valide ? (renvoie null si expirée → l'application déconnecte)
create or replace function app_session_info() returns json
language plpgsql stable security definer set search_path = public, extensions as $$
declare uid bigint := app_current_user_id(); perms json;
begin
  if uid is null then return null; end if;
  select coalesce(json_agg(p.code), '[]'::json) into perms
    from users u join role_permissions rp on rp.role_id = u.role_id join permissions p on p.id = rp.permission_id
   where u.id = uid;
  return json_build_object('user_id', uid, 'perms', perms);
end $$;

-- Changer un mot de passe : soi-même (avec l'ancien) ou un administrateur (droit users.write)
create or replace function app_set_password(p_user_id bigint, p_new_password text, p_old_password text default null)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare uid bigint := app_current_user_id(); c record; target_role text;
begin
  if uid is null then raise exception 'Session expirée : reconnectez-vous' using errcode = '28000'; end if;
  if length(coalesce(p_new_password, '')) < 4 then raise exception 'Mot de passe trop court (4 caractères minimum)'; end if;
  select r.name into target_role from users u left join roles r on r.id = u.role_id where u.id = p_user_id;
  if p_user_id = uid and not app_has_perm('users.write') then
    select * into c from user_credentials where user_id = uid;
    if found and c.password_bcrypt <> crypt(coalesce(p_old_password, ''), c.password_bcrypt) then
      raise exception 'Ancien mot de passe incorrect';
    end if;
  elsif p_user_id <> uid then
    if not app_has_perm('users.write') then raise exception 'Changement de mot de passe non autorisé'; end if;
    if target_role in ('SuperAdmin', 'Super Administrateur') and app_current_role() not in ('SuperAdmin', 'Super Administrateur') then
      raise exception 'Seul le SuperAdmin peut modifier ce compte';
    end if;
  end if;
  insert into user_credentials(user_id, password_bcrypt, updated_at)
  values (p_user_id, crypt(p_new_password, gen_salt('bf', 10)), now())
  on conflict (user_id) do update set password_bcrypt = excluded.password_bcrypt, updated_at = now();
  update users set password_hash = '***' where id = p_user_id;
  -- Par sécurité, on ferme les autres sessions de ce compte
  delete from app_sessions where user_id = p_user_id
    and token <> coalesce(coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-app-token', '');
end $$;

-- -------------------------------------------------------------------------------------
-- PARTIE C — Opérations atomiques (stock, numérotation, transfert)
-- -------------------------------------------------------------------------------------
create or replace function app_next_number(p_prefix text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v bigint;
begin
  if app_current_user_id() is null then raise exception 'Session expirée : reconnectez-vous' using errcode = '28000'; end if;
  insert into counters(name, value) values (p_prefix, 2)
  on conflict (name) do update set value = counters.value + 1
  returning value - 1 into v;
  return p_prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(v::text, 4, '0');
end $$;

create or replace function app_stock_move(
  p_product_id bigint, p_qty numeric, p_cost numeric default null, p_reverse_cost boolean default false,
  p_reason text default null, p_doc_type text default null, p_doc_number text default null)
returns numeric language plpgsql security definer set search_path = public, extensions as $$
declare
  uid bigint := app_current_user_id(); p record; newq numeric; base numeric; pmp numeric; v numeric; ulabel text;
begin
  if uid is null then raise exception 'Session expirée : reconnectez-vous' using errcode = '28000'; end if;
  if not (app_has_perm('sales.write') or app_has_perm('purchases.write') or app_has_perm('stock.adjust')
          or app_has_perm('sales.delete') or app_has_perm('purchases.delete')) then
    raise exception 'Mouvement de stock non autorisé';
  end if;
  select * into p from products where id = p_product_id for update;   -- verrou : pas de vente simultanée perdue
  if not found then raise exception 'Produit introuvable'; end if;
  if not app_is_admin() and coalesce(p.branch_id, 0) <> coalesce(app_current_branch(), 0) then
    raise exception 'Mouvement stock refusé : produit hors droguerie utilisateur';
  end if;

  newq := coalesce(p.quantity, 0) + coalesce(p_qty, 0);
  if newq < -0.0001 then
    raise exception 'Stock insuffisant pour le produit : % (en stock : %, demandé : %)',
      p.name, round(coalesce(p.quantity, 0), 2), round(abs(p_qty), 2);
  end if;

  pmp := coalesce(p.purchase_price, 0);
  if p_qty > 0 and coalesce(p_cost, 0) > 0 then
    base := greatest(coalesce(p.quantity, 0), 0);
    pmp := round((base * coalesce(p.purchase_price, 0) + p_qty * p_cost) / (base + p_qty), 4);
  elsif p_qty < 0 and p_reverse_cost and coalesce(p_cost, 0) > 0 and newq > 0.0001 then
    v := (coalesce(p.quantity, 0) * coalesce(p.purchase_price, 0) - abs(p_qty) * p_cost) / newq;
    if v > 0 then pmp := round(v, 4); end if;
  end if;

  update products set quantity = greatest(round(newq, 4), 0), purchase_price = pmp where id = p.id;
  select coalesce(full_name, username) into ulabel from users where id = uid;
  insert into stock_movements(product_id, quantity, reason, branch_id, doc_type, doc_number, user_id, user_label, created_at)
  values (p.id, p_qty, p_reason, p.branch_id, p_doc_type, p_doc_number, uid, ulabel, now());
  return newq;
end $$;

create or replace function app_stock_transfer(p_product_id bigint, p_to_branch bigint, p_qty numeric, p_reason text default null)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare
  uid bigint := app_current_user_id(); src record; dst record; num text; ulabel text; q numeric;
begin
  if uid is null then raise exception 'Session expirée : reconnectez-vous' using errcode = '28000'; end if;
  if not (app_has_perm('stock.adjust') or app_has_perm('stock.transfer')) then raise exception 'Transfert stock non autorisé'; end if;
  if coalesce(p_qty, 0) <= 0 or p_to_branch is null then raise exception 'Transfert stock invalide'; end if;
  select * into src from products where id = p_product_id for update;
  if not found then raise exception 'Produit introuvable'; end if;
  if not app_is_admin() and coalesce(src.branch_id, 0) <> coalesce(app_current_branch(), 0) then
    raise exception 'Transfert refusé : produit hors droguerie utilisateur';
  end if;
  if coalesce(src.branch_id, 0) = p_to_branch then raise exception 'La droguerie destination doit être différente'; end if;
  if coalesce(src.quantity, 0) < p_qty then raise exception 'Stock insuffisant pour le transfert'; end if;

  select * into dst from products where ref = src.ref and branch_id = p_to_branch for update;
  if not found then
    insert into products(ref, name, name_ar, category, unit, purchase_price, sale_price, sale_price_wholesale,
                         quantity, min_stock, supplier_id, branch_id, barcode, date_expiration)
    values (src.ref, src.name, src.name_ar, src.category, src.unit, src.purchase_price, src.sale_price, src.sale_price_wholesale,
            0, src.min_stock, src.supplier_id, p_to_branch, src.barcode, src.date_expiration)
    returning * into dst;
  end if;

  num := 'TRF-' || to_char(now(), 'YYYY') || '-' || (extract(epoch from clock_timestamp()) * 1000)::bigint;
  select coalesce(full_name, username) into ulabel from users where id = uid;
  q := greatest(coalesce(dst.quantity, 0), 0);
  update products set quantity = coalesce(src.quantity, 0) - p_qty where id = src.id;
  update products set quantity = coalesce(dst.quantity, 0) + p_qty,
         purchase_price = case when coalesce(src.purchase_price, 0) > 0
                               then round((q * coalesce(dst.purchase_price, 0) + p_qty * src.purchase_price) / (q + p_qty), 4)
                               else dst.purchase_price end
   where id = dst.id;
  insert into stock_movements(product_id, quantity, reason, branch_id, doc_type, doc_number, user_id, user_label, created_at)
  values (src.id, -p_qty, coalesce(p_reason, 'Transfert stock sortie'), src.branch_id, 'Transfert', num, uid, ulabel, now()),
         (dst.id,  p_qty, coalesce(p_reason, 'Transfert stock entrée'), p_to_branch, 'Transfert', num, uid, ulabel, now());
  return num;
end $$;

-- -------------------------------------------------------------------------------------
-- PARTIE D — Migration des mots de passe existants (en clair → bcrypt)
-- -------------------------------------------------------------------------------------
do $$
begin
  -- pgcrypto peut être installé dans "extensions" (Supabase) ou "public" (anciens projets)
  perform set_config('search_path', 'public, extensions', true);
  insert into user_credentials(user_id, password_bcrypt)
  select id, crypt(password_hash, gen_salt('bf', 10))
    from users
   where coalesce(password_hash, '') not in ('', '***')
  on conflict (user_id) do nothing;
  update users set password_hash = '***'
   where coalesce(password_hash, '') <> '***' and id in (select user_id from user_credentials);
end $$;
-- Les anciennes sessions (sans jeton) deviennent invalides : chacun se reconnecte une fois.

-- -------------------------------------------------------------------------------------
-- PARTIE E — Protection de la base (RLS) : session obligatoire, cloisonnement, droits
-- -------------------------------------------------------------------------------------
do $$
declare t text;
begin
  -- 1) Activer RLS et supprimer les anciennes politiques "app_*" (relance propre)
  foreach t in array array['roles','permissions','role_permissions','branches','users','clients','suppliers','products',
                           'sales','purchases','stock_movements','audit_logs','app_settings','counters','saas_modules',
                           'tenants','tenant_modules','attachments','trips','expenses','product_categories','product_units',
                           'inventories','cash_closures']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table %I enable row level security', t);
      execute (select coalesce(string_agg(format('drop policy if exists %I on %I;', policyname, t), ' '), 'select 1')
                 from pg_policies where schemaname = 'public' and tablename = t and policyname like 'app\_%');
    end if;
  end loop;
end $$;

-- Lecture réservée aux utilisateurs connectés (tables de référence)
do $$
declare t text;
begin
  foreach t in array array['roles','permissions','role_permissions','branches','users','app_settings','saas_modules',
                           'tenants','tenant_modules','product_categories','product_units']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('create policy app_read on %I for select using ((select app_current_user_id()) is not null)', t);
    end if;
  end loop;
end $$;

-- Écritures sur la configuration : selon les droits
create policy app_write on roles            for all using ((select app_has_perm('permissions.manage'))) with check ((select app_has_perm('permissions.manage')));
create policy app_write on permissions      for all using ((select app_has_perm('permissions.manage'))) with check ((select app_has_perm('permissions.manage')));
create policy app_write on role_permissions for all using ((select app_has_perm('permissions.manage'))) with check ((select app_has_perm('permissions.manage')));
create policy app_write on branches         for all using ((select app_has_perm('branches.manage')))    with check ((select app_has_perm('branches.manage')));
create policy app_write on users            for all using ((select app_has_perm('users.write')) or (select app_has_perm('branches.manage')))
                                                    with check ((select app_has_perm('users.write')) or (select app_has_perm('branches.manage')));
create policy app_write on app_settings     for all using ((select app_has_perm('settings.manage')))    with check ((select app_has_perm('settings.manage')));
create policy app_write on saas_modules     for all using ((select app_has_perm('modules.manage')) or (select app_has_perm('superadmin.manage')))
                                                    with check ((select app_has_perm('modules.manage')) or (select app_has_perm('superadmin.manage')));
create policy app_write on tenants          for all using ((select app_has_perm('superadmin.manage'))) with check ((select app_has_perm('superadmin.manage')));
create policy app_write on tenant_modules   for all using ((select app_has_perm('superadmin.manage'))) with check ((select app_has_perm('superadmin.manage')));
create policy app_write on product_categories for all using ((select app_has_perm('products.write'))) with check ((select app_has_perm('products.write')));
create policy app_write on product_units      for all using ((select app_has_perm('products.write'))) with check ((select app_has_perm('products.write')));

-- Données métier cloisonnées par droguerie (l'administrateur voit tout)
-- Lecture
create policy app_read on clients         for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on suppliers       for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on products        for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on sales           for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on purchases       for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on stock_movements for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on attachments     for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on inventories     for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on cash_closures   for select using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_read on audit_logs      for select using ((select app_is_admin()) or (select app_has_perm('audit.read')));
create policy app_read on counters        for select using ((select app_is_admin()));

-- Écriture (création / modification)
create policy app_ins on clients for insert with check (((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())) and ((select app_has_perm('clients.write')) or (select app_has_perm('sales.write'))));
create policy app_upd on clients for update using (((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())) and ((select app_has_perm('clients.write')) or (select app_has_perm('clients.assign'))))
                                       with check (((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_del on clients for delete using (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('clients.delete')));

create policy app_ins on suppliers for insert with check (((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())) and ((select app_has_perm('suppliers.write')) or (select app_has_perm('purchases.write'))));
create policy app_upd on suppliers for update using (((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())) and (select app_has_perm('suppliers.write')))
                                         with check (((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_del on suppliers for delete using (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('suppliers.delete')));

create policy app_ins on products for insert with check (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('products.write')));
create policy app_upd on products for update using (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('products.write')))
                                        with check (((select app_is_admin()) or branch_id = (select app_current_branch())));
create policy app_del on products for delete using (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('products.delete')));

create policy app_ins on sales for insert with check (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('sales.write')));
create policy app_upd on sales for update using (((select app_is_admin()) or branch_id = (select app_current_branch())) and ((select app_has_perm('sales.write')) or (select app_has_perm('sales.pay')) or (select app_has_perm('sales.delete')) or (select app_has_perm('payments.cancel'))))
                                     with check (((select app_is_admin()) or branch_id = (select app_current_branch())));
create policy app_del on sales for delete using (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('sales.delete')));

create policy app_ins on purchases for insert with check (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('purchases.write')));
create policy app_upd on purchases for update using (((select app_is_admin()) or branch_id = (select app_current_branch())) and ((select app_has_perm('purchases.write')) or (select app_has_perm('purchases.pay')) or (select app_has_perm('purchases.delete')) or (select app_has_perm('payments.cancel'))))
                                         with check (((select app_is_admin()) or branch_id = (select app_current_branch())));
create policy app_del on purchases for delete using (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('purchases.delete')));

-- Stock : uniquement via les fonctions atomiques (aucune écriture directe)
-- Journal d'audit : chaque utilisateur connecté peut écrire
create policy app_ins on audit_logs for insert with check ((select app_current_user_id()) is not null);

create policy app_ins on attachments for insert with check ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));
create policy app_del on attachments for delete using ((select app_current_user_id()) is not null and ((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())));

create policy app_ins on inventories for insert with check (((select app_is_admin()) or branch_id = (select app_current_branch())) and (select app_has_perm('stock.adjust')));

create policy app_ins on cash_closures for insert with check (((select app_is_admin()) or branch_id is null or branch_id = (select app_current_branch())) and ((select app_has_perm('payments.read')) or (select app_has_perm('sales.pay'))));
create policy app_upd on cash_closures for update using ((select app_is_admin()) or (select app_is_manager())) with check ((select app_is_admin()) or (select app_is_manager()));

-- Déplacements et charges : chacun les siens ; gérant = sa droguerie ; admin = tout
create policy app_all on trips for all
  using ((select app_current_user_id()) is not null and ((select app_is_admin())
         or ((select app_is_manager()) and branch_id = (select app_current_branch()))
         or created_by = (select app_current_user_id())::text))
  with check ((select app_current_user_id()) is not null and ((select app_is_admin())
         or ((select app_is_manager()) and branch_id = (select app_current_branch()))
         or created_by = (select app_current_user_id())::text));
create policy app_all on expenses for all
  using ((select app_current_user_id()) is not null and ((select app_is_admin())
         or ((select app_is_manager()) and branch_id = (select app_current_branch()))
         or created_by = (select app_current_user_id())::text))
  with check ((select app_current_user_id()) is not null and ((select app_is_admin())
         or ((select app_is_manager()) and branch_id = (select app_current_branch()))
         or created_by = (select app_current_user_id())::text));

-- -------------------------------------------------------------------------------------
-- Vérification
-- -------------------------------------------------------------------------------------
select 'Mots de passe migrés' as element, (select count(*) from user_credentials)::text as etat
union all select 'Mots de passe encore en clair', (select count(*) from users where coalesce(password_hash,'') not in ('','***'))::text
union all select 'Tables protégées (RLS)', (select count(*) from pg_tables where schemaname='public' and rowsecurity)::text
union all select 'Politiques installées', (select count(*) from pg_policies where schemaname='public' and policyname like 'app\_%')::text
union all select 'Module caisse (SaaS)', case when exists (select 1 from saas_modules where code='pos') then 'OK' else '❌' end;
