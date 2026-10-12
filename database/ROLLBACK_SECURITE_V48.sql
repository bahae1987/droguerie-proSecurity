-- =====================================================================
--  DrogueriePro — RETOUR ARRIÈRE de la protection RLS V48 (à n'utiliser qu'en cas de blocage)
--  Effet : la base redevient accessible comme avant la V48.
--  Conservé : les mots de passe chiffrés et la connexion sécurisée (l'app continue de fonctionner).
--  Pour réactiver la protection : relancer MAJ_V48_SUPABASE.sql.
-- =====================================================================
do $$
declare t text; pol record;
begin
  foreach t in array array['roles','permissions','role_permissions','branches','users','clients','suppliers','products',
                           'sales','purchases','stock_movements','audit_logs','app_settings','counters','saas_modules',
                           'tenants','tenant_modules','attachments','trips','expenses','product_categories','product_units',
                           'inventories','cash_closures']
  loop
    if to_regclass('public.' || t) is not null then
      for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t and policyname like 'app\_%' loop
        execute format('drop policy if exists %I on %I', pol.policyname, t);
      end loop;
      execute format('alter table %I disable row level security', t);
    end if;
  end loop;
end $$;

select 'Tables encore protégées' as element, count(*)::text as etat
  from pg_tables where schemaname = 'public' and rowsecurity
   and tablename not in ('user_credentials', 'app_sessions');
