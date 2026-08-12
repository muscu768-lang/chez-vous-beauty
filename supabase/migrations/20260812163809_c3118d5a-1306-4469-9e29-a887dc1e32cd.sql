
-- utility
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- estheticians
CREATE TABLE public.estheticians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  reviews_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.estheticians TO anon, authenticated;
GRANT ALL ON public.estheticians TO service_role;
ALTER TABLE public.estheticians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estheticians public read" ON public.estheticians FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  esthetician_id UUID NOT NULL REFERENCES public.estheticians ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  duration_min INT NOT NULL DEFAULT 60
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  esthetician_id UUID NOT NULL REFERENCES public.estheticians ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  position INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.portfolio_items TO anon, authenticated;
GRANT ALL ON public.portfolio_items TO service_role;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio public read" ON public.portfolio_items FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  esthetician_id UUID NOT NULL REFERENCES public.estheticians ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews own insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  esthetician_id UUID NOT NULL REFERENCES public.estheticians ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES public.services ON DELETE RESTRICT,
  service_name TEXT NOT NULL,
  esthetician_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmee' CHECK (status IN ('en_attente','confirmee','annulee','terminee')),
  payment_status TEXT NOT NULL DEFAULT 'en_attente' CHECK (payment_status IN ('en_attente','paye','rembourse')),
  payment_method TEXT,
  price_cents INT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings own all" ON public.bookings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe','paypal','mastercard','visa','apple_pay')),
  label TEXT NOT NULL,
  last4 TEXT,
  expires_at TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment methods own all" ON public.payment_methods FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  line1 TEXT NOT NULL,
  postal_code TEXT,
  city TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses own all" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  esthetician_id UUID NOT NULL REFERENCES public.estheticians ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('client','pro')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX messages_thread_idx ON public.messages (user_id, esthetician_id, created_at);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages own read" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "messages own insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- seed catalogue
INSERT INTO public.estheticians (id, name, city, headline, bio, avatar_url, cover_url, categories, rating, reviews_count) VALUES
('11111111-1111-4111-8111-111111111111','Camille Laurent','Paris','Nail artist minimaliste','Nail artist passionnée, 8 ans d''expérience en manucure minimaliste et gel.','https://i.pravatar.cc/300?img=47','/__l5e/assets-v1/6737b3df-1d26-4cc2-a091-f2714baf263f/manucure.jpg','{manucure,gel}',4.9,129),
('22222222-2222-4222-8222-222222222222','Inès Berthier','Rouen','Spécialiste pédicure & soin','Podologue esthétique formée à Milan. Soins doux, produits vegan.','https://i.pravatar.cc/300?img=32','/__l5e/assets-v1/0f64cdda-152c-4f52-afdb-6dd122161b52/pedicure.jpg','{pedicure,manucure}',4.8,86),
('33333333-3333-4333-8333-333333333333','Sofia Mendes','Rouen','Extensions gel & nail art','Créatrice d''ongles sur-mesure, finitions couture, salon lumineux au centre-ville.','https://i.pravatar.cc/300?img=45','/__l5e/assets-v1/6993f41d-efb2-479d-b54c-c5863a4ccf5a/gel.jpg','{gel,manucure}',5.0,54),
('44444444-4444-4444-8444-444444444444','Nadia Cherif','Lyon','Épilation douce à la cire tiède','Protocole d''épilation apaisant, cire tiède sans bandes, peaux sensibles bienvenues.','https://i.pravatar.cc/300?img=27','/__l5e/assets-v1/a43062e1-fa61-4d8c-b403-f00268113ba9/epilation.jpg','{epilation}',4.7,212);

INSERT INTO public.services (esthetician_id, name, category, description, price_cents, duration_min) VALUES
('11111111-1111-4111-8111-111111111111','Manucure Classique','manucure','Limage, cuticules, pose vernis.',3500,45),
('11111111-1111-4111-8111-111111111111','Pose gel couleur','gel','Pose complète en gel, finition brillante.',5500,90),
('11111111-1111-4111-8111-111111111111','Nail art minimaliste','manucure','Manucure + motifs fins.',4500,60),
('22222222-2222-4222-8222-222222222222','Pédicure Spa','pedicure','Bain, gommage, soin et vernis.',4800,75),
('22222222-2222-4222-8222-222222222222','Manucure express','manucure','Mise en beauté rapide des mains.',2800,30),
('33333333-3333-4333-8333-333333333333','Extensions gel','gel','Chablon, longueur sur-mesure.',6500,120),
('33333333-3333-4333-8333-333333333333','Remplissage gel','gel','Entretien 3-4 semaines.',4000,75),
('44444444-4444-4444-8444-444444444444','Épilation jambes complètes','epilation','Cire tiède, soin apaisant inclus.',3900,45),
('44444444-4444-4444-8444-444444444444','Épilation sourcils','epilation','Restructuration au fil ou cire.',1500,20);

INSERT INTO public.portfolio_items (esthetician_id, image_url, caption, position) VALUES
('11111111-1111-4111-8111-111111111111','/__l5e/assets-v1/6737b3df-1d26-4cc2-a091-f2714baf263f/manucure.jpg','Nude glossy',1),
('11111111-1111-4111-8111-111111111111','/__l5e/assets-v1/6993f41d-efb2-479d-b54c-c5863a4ccf5a/gel.jpg','Gel sauge',2),
('11111111-1111-4111-8111-111111111111','/__l5e/assets-v1/8f9d0a63-80fb-4186-ba88-0b43f1fa99a8/studio.jpg','Le studio',3),
('22222222-2222-4222-8222-222222222222','/__l5e/assets-v1/0f64cdda-152c-4f52-afdb-6dd122161b52/pedicure.jpg','Rituel pédicure',1),
('22222222-2222-4222-8222-222222222222','/__l5e/assets-v1/8f9d0a63-80fb-4186-ba88-0b43f1fa99a8/studio.jpg','Cabine',2),
('33333333-3333-4333-8333-333333333333','/__l5e/assets-v1/6993f41d-efb2-479d-b54c-c5863a4ccf5a/gel.jpg','Gel couture',1),
('33333333-3333-4333-8333-333333333333','/__l5e/assets-v1/6737b3df-1d26-4cc2-a091-f2714baf263f/manucure.jpg','Finitions',2),
('44444444-4444-4444-8444-444444444444','/__l5e/assets-v1/a43062e1-fa61-4d8c-b403-f00268113ba9/epilation.jpg','Protocole cire tiède',1),
('44444444-4444-4444-8444-444444444444','/__l5e/assets-v1/8f9d0a63-80fb-4186-ba88-0b43f1fa99a8/studio.jpg','Salon',2);

INSERT INTO public.reviews (esthetician_id, author_name, rating, comment) VALUES
('11111111-1111-4111-8111-111111111111','Léa M.',5,'Travail d''une précision folle, je ne vais plus ailleurs.'),
('11111111-1111-4111-8111-111111111111','Sarah B.',5,'Ambiance calme et résultat parfait.'),
('11111111-1111-4111-8111-111111111111','Julie R.',4,'Très joli rendu, un peu d''attente.'),
('22222222-2222-4222-8222-222222222222','Manon T.',5,'Pédicure la plus relaxante de Rouen.'),
('33333333-3333-4333-8333-333333333333','Alice D.',5,'Des ongles impeccables pendant 4 semaines.'),
('44444444-4444-4444-8444-444444444444','Fatou S.',5,'Épilation quasi indolore, je recommande.');
