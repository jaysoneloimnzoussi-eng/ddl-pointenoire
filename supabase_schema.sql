-- ============================================================================
-- SYSTÈME INTÉGRÉ DDL-PN (POINTE-NOIRE) - RÉPUBLIQUE DU CONGO
-- Script SQL d'initialisation de la Base de Données Supabase (PostgreSQL)
-- ============================================================================

-- 1. Activation des extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table des Établissements de Loisirs (Cartographie & Recensement)
CREATE TABLE IF NOT EXISTS public.establishments (
    id TEXT PRIMARY KEY DEFAULT ('EST-PN-' || LPAD(nextval('establishments_id_seq'::regclass)::text, 3, '0')),
    name TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,
    address TEXT,
    arrondissement TEXT,
    quartier TEXT,
    activity_type TEXT DEFAULT 'Débit de Boissons',
    regime_type TEXT DEFAULT 'INFORMEL',
    latitude NUMERIC,
    longitude NUMERIC,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    assigned_agent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sequence de secours pour les identifiants
CREATE SEQUENCE IF NOT EXISTS establishments_id_seq START WITH 20;

-- 3. Table des Dossiers et Quittances Terrain (Recouvrement SAA & SAF)
CREATE TABLE IF NOT EXISTS public.terrain_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    establishment_id TEXT REFERENCES public.establishments(id) ON DELETE CASCADE,
    agent_id TEXT,
    created_by_user_id TEXT,
    record_date DATE DEFAULT CURRENT_DATE,
    total_fee NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    remaining_balance NUMERIC DEFAULT 0,
    notes TEXT,
    receipt_photo_url TEXT,
    status TEXT DEFAULT 'SOUMIS',
    is_deleted_by_agent BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    prochain_versement_date DATE,
    first_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table des Agents Assermentés DDL-PN
CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY,
    badge_id TEXT,
    matricule TEXT,
    nom TEXT NOT NULL,
    prenom TEXT,
    nom_complet TEXT,
    photo_url TEXT,
    fonction TEXT,
    service TEXT,
    departement TEXT DEFAULT 'Pointe-Noire',
    telephone TEXT,
    email TEXT,
    statut TEXT DEFAULT 'ACTIF',
    terrain_status TEXT DEFAULT 'DISPONIBLE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Table des Comptes Utilisateurs DDL-PN
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    badge TEXT,
    username TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    title TEXT,
    phone TEXT,
    service TEXT,
    email TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Table des Rendez-vous & Tournées Terrain
CREATE TABLE IF NOT EXISTS public.rendezvous (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agent_id TEXT,
    agent_name TEXT,
    establishment_id TEXT,
    establishment_name TEXT,
    date DATE,
    time_start TEXT,
    time_end TEXT,
    type TEXT,
    notes TEXT,
    status TEXT DEFAULT 'A_FAIRE',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- Autorise l'accès complet pour l'accès API Anon & Authenticated de l'application
-- ============================================================================

ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terrain_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendezvous ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture / écriture anonymes (Clé Anon Vercel / Client)
DROP POLICY IF EXISTS "Anon public access on establishments" ON public.establishments;
CREATE POLICY "Anon public access on establishments" ON public.establishments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access on terrain_records" ON public.terrain_records;
CREATE POLICY "Anon public access on terrain_records" ON public.terrain_records FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access on agents" ON public.agents;
CREATE POLICY "Anon public access on agents" ON public.agents FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access on app_users" ON public.app_users;
CREATE POLICY "Anon public access on app_users" ON public.app_users FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access on rendezvous" ON public.rendezvous;
CREATE POLICY "Anon public access on rendezvous" ON public.rendezvous FOR ALL TO anon USING (true) WITH CHECK (true);

-- Politiques pour utilisateurs authentifiés
DROP POLICY IF EXISTS "Auth access on establishments" ON public.establishments;
CREATE POLICY "Auth access on establishments" ON public.establishments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth access on terrain_records" ON public.terrain_records;
CREATE POLICY "Auth access on terrain_records" ON public.terrain_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth access on agents" ON public.agents;
CREATE POLICY "Auth access on agents" ON public.agents FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth access on app_users" ON public.app_users;
CREATE POLICY "Auth access on app_users" ON public.app_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth access on rendezvous" ON public.rendezvous;
CREATE POLICY "Auth access on rendezvous" ON public.rendezvous FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- AMORÇAGE DES DONNÉES OFFICIELLES DU RÉFÉRENTIEL DDL-PN
-- ============================================================================

INSERT INTO public.establishments (id, name, owner_name, phone, address, arrondissement, quartier, activity_type, regime_type, latitude, longitude)
VALUES
  ('EST-PN-001', 'Atlantic Palace Hôtel & Lounge', 'Christian BITEMO', '+242 06 612 88 90', 'Centre-Ville, Pointe-Noire', '1_LUMUMBA', 'Centre-Ville', 'Hôtel & Salons VIP', 'FORMEL', -4.7912, 11.8580),
  ('EST-PN-002', 'Hôtel Elaïs & Espace Loisirs', 'Jean-Pierre TCHICAYA', '+242 06 630 14 52', 'Centre-Ville, Pointe-Noire', '1_LUMUMBA', 'Centre-Ville', 'Discothèque & Danse', 'FORMEL', -4.7940, 11.8615),
  ('EST-PN-003', 'Le Kactus Club & Discothèque', 'Alain MPOUELE', '+242 06 940 77 12', 'Centre-Ville, Pointe-Noire', '1_LUMUMBA', 'Centre-Ville', 'Discothèque & Danse', 'FORMEL', -4.7925, 11.8590),
  ('EST-PN-004', 'Hôtel Palm Beach & Bar Plage', 'Solange MOUNTOU', '+242 05 510 40 33', 'Côte Sauvage, Pointe-Noire', '1_LUMUMBA', 'Côte Sauvage', 'Espace Récréatif & Plage', 'FORMEL', -4.8105, 11.8420),
  ('EST-PN-005', 'Complexe La Pyramide', 'Frédéric MOUKOKO', '+242 06 655 22 99', 'Côte Sauvage, Pointe-Noire', '1_LUMUMBA', 'Côte Sauvage', 'Hôtel & Salons VIP', 'FORMEL', -4.8080, 11.8445),
  ('EST-PN-006', 'Le No Stress Bar Lounge', 'Brice MAVOUNGOU', '+242 06 520 11 44', 'Côte Sauvage, Pointe-Noire', '1_LUMUMBA', 'Côte Sauvage', 'Hôtel & Salons VIP', 'FORMEL', -4.8120, 11.8410),
  ('EST-PN-007', 'Complexe La Villa Blanche', 'Sylvie LOEMBA', '+242 06 680 92 10', 'Mpita, Pointe-Noire', '1_LUMUMBA', 'Mpita', 'Complexe Touristique & Loisirs', 'FORMEL', -4.7995, 11.8530),
  ('EST-PN-008', 'Hôtel Twiga & Lounge', 'Guy Serge BOUKAKA', '+242 05 533 18 20', 'Côte Sauvage, Pointe-Noire', '1_LUMUMBA', 'Côte Sauvage', 'Hôtel & Salons VIP', 'FORMEL', -4.8140, 11.8395),
  ('EST-PN-009', 'Le Privilège Club VIP', 'Parfait PAMBOU', '+242 06 671 05 90', 'Centre-Ville, Pointe-Noire', '1_LUMUMBA', 'Centre-Ville', 'Discothèque & Danse', 'FORMEL', -4.7950, 11.8570),
  ('EST-PN-010', 'L''Orchidée Lounge & Salon de thé', 'Honorine MATONDO', '+242 06 915 44 30', 'Centre-Ville, Pointe-Noire', '1_LUMUMBA', 'Centre-Ville', 'Complexe Touristique & Loisirs', 'FORMEL', -4.7935, 11.8630),
  ('EST-PN-011', 'Le Balafon Bar-Dancing', 'Dieudonné NGOUALA', '+242 06 622 19 88', 'Grand Marché, Pointe-Noire', '2_MVOUMVOU', 'Grand Marché', 'Débit de Boissons & Musique', 'INFORMEL', -4.7830, 11.8650),
  ('EST-PN-012', 'Espace Récréatif Mbota Plage', 'Jean-Claude BASSINGA', '+242 05 540 80 12', 'Mbota, Pointe-Noire', '2_MVOUMVOU', 'Mbota', 'Espace Récréatif & Plage', 'INFORMEL', -4.7780, 11.8590),
  ('EST-PN-013', 'Le Safari Bar Dancing', 'Pascal TSOUMOU', '+242 06 820 45 60', 'Fond Tié-Tié, Pointe-Noire', '3_TIETIE', 'Fond Tié-Tié', 'Discothèque & Danse', 'INFORMEL', -4.8150, 11.8820),
  ('EST-PN-014', 'Complexe Loisirs Tié-Tié Canal 7', 'Sylvain MVOULA', '+242 06 644 11 02', 'Tié-Tié Centre, Pointe-Noire', '3_TIETIE', 'Tié-Tié Centre', 'Hôtel & Salons VIP', 'FORMEL', -4.8190, 11.8890),
  ('EST-PN-015', 'Espace Culturel & Loisirs Yaro', 'Pierre KIBAMBA', '+242 06 635 88 14', 'Loandjili Centre, Pointe-Noire', '4_LOANDJILI', 'Loandjili Centre', 'Complexe Touristique & Loisirs', 'FORMEL', -4.7610, 11.8820),
  ('EST-PN-016', 'Complexe Touristique Mâ-Loango', 'Gabriel POATY', '+242 06 660 77 00', 'Ngoyo Plage, Pointe-Noire', '6_NGOYO', 'Ngoyo Plage', 'Hôtel & Salons VIP', 'FORMEL', -4.8450, 11.8650)
ON CONFLICT (id) DO NOTHING;
