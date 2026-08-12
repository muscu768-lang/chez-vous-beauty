import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Crosshair, Loader2, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/lib/geo";
import { removeProMedia, uploadProMedia } from "@/lib/media";
import { Media } from "@/components/Media";
import { CATEGORIES, euro } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "Espace pro — Edito" },
      {
        name: "description",
        content:
          "Créez votre vitrine Edito : photos de vos réalisations, prestations, tarifs et avis Google importés.",
      },
      { property: "og:title", content: "Espace pro — Edito" },
      { property: "og:description", content: "Gérez votre vitrine, vos photos, vos prestations et vos avis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProSpace,
});

const SECTION = "mt-10 border-t border-border pt-8";

function ProSpace() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const geo = useGeolocation();

  const { data: pro, isLoading } = useQuery({
    queryKey: ["my-esthetician", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estheticians")
        .select("*, services(*), portfolio_items(*), reviews(*)")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    city: "",
    address: "",
    google_place_url: "",
    categories: [] as string[],
    is_published: true,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (pro && !hydrated) {
      setForm({
        name: pro.name ?? "",
        headline: pro.headline ?? "",
        bio: pro.bio ?? "",
        city: pro.city ?? "",
        address: pro.address ?? "",
        google_place_url: pro.google_place_url ?? "",
        categories: pro.categories ?? [],
        is_published: pro.is_published ?? true,
      });
      setHydrated(true);
    }
  }, [pro, hydrated]);

  const saveProfile = useMutation({
    mutationFn: async (patch: Record<string, unknown> = {}) => {
      const payload = { ...form, ...patch, owner_id: user!.id };
      if (pro) {
        const { error } = await supabase.from("estheticians").update(payload as any).eq("id", pro.id);
        if (error) throw error;
        return pro.id as string;
      }
      const { data, error } = await supabase
        .from("estheticians")
        .insert(payload as any)
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-esthetician"] });
      qc.invalidateQueries({ queryKey: ["estheticians"] });
      toast.success("Vitrine enregistrée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!loading && !user) {
    return (
      <Centered>
        <h1 className="font-serif text-3xl">Espace professionnel</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connectez-vous pour créer votre vitrine Edito.</p>
        <Link to="/auth" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-7 text-primary-foreground">
          Se connecter
        </Link>
      </Centered>
    );
  }

  if (loading || isLoading) {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </Centered>
    );
  }

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md bg-background pb-24">
      <header className="flex items-center gap-3 px-6 pt-8">
        <button
          onClick={() => navigate({ to: "/profil" })}
          aria-label="Retour"
          className="grid size-10 place-items-center rounded-full border border-border"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <p className="eyebrow">Espace pro</p>
          <h1 className="font-serif text-2xl leading-tight">Votre vitrine</h1>
        </div>
      </header>

      <div className="px-6">
        {/* Cover + avatar */}
        <section className="mt-8">
          <ImagePicker
            label="Photo de couverture"
            value={pro?.cover_url}
            aspect="aspect-[4/3]"
            userId={user!.id}
            onChange={(path) => saveProfile.mutate({ cover_url: path })}
            disabled={!pro && !form.name}
          />
          <div className="mt-4 flex items-center gap-4">
            <ImagePicker
              label="Portrait"
              value={pro?.avatar_url}
              aspect="size-20 rounded-full"
              round
              userId={user!.id}
              onChange={(path) => saveProfile.mutate({ avatar_url: path })}
              disabled={!pro && !form.name}
            />
            <p className="text-xs text-muted-foreground">
              Vos propres photos, vos réalisations. Format JPG ou PNG, 5 Mo max.
            </p>
          </div>
        </section>

        {/* Identity */}
        <section className={SECTION}>
          <h2 className="font-serif text-xl">Identité</h2>
          <div className="mt-4 space-y-3">
            <Input placeholder="Nom affiché" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input
              placeholder="Spécialité (ex. Manucure minimaliste & gel)"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
            <Textarea
              placeholder="Votre présentation"
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <Input placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input
              placeholder="Adresse du salon"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <button
            onClick={() => {
              geo.request();
              toast.info("Autorisez la localisation pour placer votre salon sur la carte.");
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
          >
            <Crosshair className="size-4" />
            {pro?.lat ? "Mettre à jour ma position" : "Enregistrer ma position"}
          </button>
          {geo.coords && (
            <button
              onClick={() => saveProfile.mutate({ lat: geo.coords!.lat, lng: geo.coords!.lng })}
              className="mt-2 block text-sm underline underline-offset-4"
            >
              Utiliser la position détectée ({geo.coords.lat.toFixed(3)}, {geo.coords.lng.toFixed(3)})
            </button>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== "tout").map((c) => {
              const on = form.categories.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    setForm({
                      ...form,
                      categories: on ? form.categories.filter((x) => x !== c.id) : [...form.categories, c.id],
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-sm ${
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <label className="mt-6 flex items-center justify-between gap-4">
            <span className="text-sm">
              Vitrine visible publiquement
              <span className="block text-xs text-muted-foreground">Désactivez pour la masquer le temps de la préparer.</span>
            </span>
            <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
          </label>

          <button
            onClick={() => saveProfile.mutate({})}
            disabled={!form.name || saveProfile.isPending}
            className="mt-6 h-13 w-full rounded-full bg-primary py-4 text-primary-foreground disabled:opacity-50"
          >
            {pro ? "Enregistrer" : "Créer ma vitrine"}
          </button>
        </section>

        {pro && (
          <>
            <PortfolioSection pro={pro} userId={user!.id} />
            <ServicesSection pro={pro} />
            <GoogleReviewsSection pro={pro} form={form} setForm={setForm} save={saveProfile.mutate} />
            <Link
              to="/estheticienne/$id"
              params={{ id: pro.id }}
              className="mt-10 flex h-14 items-center justify-center rounded-full border border-border"
            >
              Voir ma vitrine publique
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center px-8 text-center">
      {children}
    </div>
  );
}

function ImagePicker({
  label,
  value,
  aspect,
  round,
  userId,
  onChange,
  disabled,
}: {
  label: string;
  value?: string | null;
  aspect: string;
  round?: boolean;
  userId: string;
  onChange: (path: string) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde (5 Mo max).");
      return;
    }
    setBusy(true);
    try {
      const path = await uploadProMedia(file, userId);
      onChange(path);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => ref.current?.click()}
        className={`relative block w-full overflow-hidden bg-muted ${round ? "" : "rounded-2xl"} ${aspect} disabled:opacity-50`}
        aria-label={label}
      >
        {value ? (
          <Media src={value} alt={label} className={`h-full w-full object-cover ${round ? "rounded-full" : ""}`} />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted-foreground">
            {busy ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
          </span>
        )}
        {value && busy && (
          <span className="absolute inset-0 grid place-items-center bg-background/60">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  );
}

function PortfolioSection({ pro, userId }: { pro: any; userId: string }) {
  const qc = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const items = ((pro.portfolio_items ?? []) as any[]).sort((a, b) => a.position - b.position);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const [i, file] of Array.from(files).entries()) {
        const path = await uploadProMedia(file, userId);
        const { error } = await supabase
          .from("portfolio_items")
          .insert({ esthetician_id: pro.id, image_url: path, position: items.length + i });
        if (error) throw error;
      }
      qc.invalidateQueries({ queryKey: ["my-esthetician"] });
      qc.invalidateQueries({ queryKey: ["esthetician", pro.id] });
      toast.success("Photos ajoutées");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: any) {
    const { error } = await supabase.from("portfolio_items").delete().eq("id", item.id);
    if (error) return toast.error(error.message);
    await removeProMedia(item.image_url);
    qc.invalidateQueries({ queryKey: ["my-esthetician"] });
  }

  return (
    <section className={SECTION}>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Portfolio</h2>
        <button
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Ajouter
        </button>
        <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => add(e.target.files)} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {items.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-xl bg-muted">
            <Media src={p.image_url} alt={p.caption ?? "Réalisation"} className="aspect-square w-full object-cover" />
            <button
              onClick={() => remove(p)}
              aria-label="Supprimer la photo"
              className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-background/90"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">Ajoutez vos plus belles réalisations, elles font la différence.</p>
      )}
    </section>
  );
}

function ServicesSection({ pro }: { pro: any }) {
  const qc = useQueryClient();
  const services = (pro.services ?? []) as any[];
  const empty = { name: "", category: "manucure", description: "", price: "", duration: "60" };
  const [draft, setDraft] = useState(empty);

  async function add() {
    const price = Math.round(parseFloat(draft.price.replace(",", ".")) * 100);
    if (!draft.name || !Number.isFinite(price)) return toast.error("Nom et tarif requis");
    const { error } = await supabase.from("services").insert({
      esthetician_id: pro.id,
      name: draft.name,
      category: draft.category,
      description: draft.description || null,
      price_cents: price,
      duration_min: Number(draft.duration) || 60,
    });
    if (error) return toast.error(error.message);
    setDraft(empty);
    qc.invalidateQueries({ queryKey: ["my-esthetician"] });
    toast.success("Prestation ajoutée");
  }

  async function remove(id: string) {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["my-esthetician"] });
  }

  return (
    <section className={SECTION}>
      <h2 className="font-serif text-xl">Prestations</h2>
      <ul className="mt-3 divide-y divide-border">
        {services.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 py-3">
            <span>
              <span className="block">{s.name}</span>
              <span className="block text-xs text-muted-foreground">
                {s.duration_min} min · {euro(s.price_cents)}
              </span>
            </span>
            <button onClick={() => remove(s.id)} aria-label={`Supprimer ${s.name}`} className="text-muted-foreground">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 rounded-2xl bg-secondary p-4">
        <Input placeholder="Nom de la prestation" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Tarif €" inputMode="decimal" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
          <Input placeholder="Durée min" inputMode="numeric" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} />
        </div>
        <select
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {CATEGORIES.filter((c) => c.id !== "tout").map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <Input placeholder="Description courte" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <button onClick={add} className="h-11 w-full rounded-full bg-primary text-primary-foreground">
          Ajouter la prestation
        </button>
      </div>
    </section>
  );
}

function GoogleReviewsSection({
  pro,
  form,
  setForm,
  save,
}: {
  pro: any;
  form: any;
  setForm: (v: any) => void;
  save: (patch: Record<string, unknown>) => void;
}) {
  const qc = useQueryClient();
  const reviews = ((pro.reviews ?? []) as any[]).filter((r) => r.source === "google");
  const empty = { author_name: "", rating: "5", comment: "" };
  const [draft, setDraft] = useState(empty);

  async function add() {
    if (!form.google_place_url) return toast.error("Ajoutez d'abord le lien de votre fiche Google.");
    if (!draft.author_name) return toast.error("Nom de l'auteur requis");
    const { error } = await supabase.from("reviews").insert({
      esthetician_id: pro.id,
      author_name: draft.author_name,
      rating: Number(draft.rating),
      comment: draft.comment || null,
      source: "google",
      source_url: form.google_place_url,
      user_id: null,
    });
    if (error) return toast.error(error.message);
    setDraft(empty);
    qc.invalidateQueries({ queryKey: ["my-esthetician"] });
    qc.invalidateQueries({ queryKey: ["estheticians"] });
    toast.success("Avis Google importé");
  }

  async function remove(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["my-esthetician"] });
  }

  return (
    <section className={SECTION}>
      <h2 className="font-serif text-xl">Avis Google</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Collez le lien de votre fiche Google, puis reportez vos avis : ils s'affichent avec la mention « Google ».
      </p>
      <div className="mt-4 flex gap-2">
        <Input
          placeholder="https://maps.google.com/…"
          value={form.google_place_url}
          onChange={(e) => setForm({ ...form, google_place_url: e.target.value })}
        />
        <button
          onClick={() => save({ google_place_url: form.google_place_url })}
          className="shrink-0 rounded-full border border-border px-4 text-sm"
        >
          Lier
        </button>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {reviews.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-3 py-3">
            <span>
              <span className="flex items-center gap-2 text-sm font-medium">
                {r.author_name}
                <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star className="size-3 fill-current" />
                  {r.rating}
                </span>
              </span>
              <span className="block text-xs text-muted-foreground">{r.comment}</span>
            </span>
            <button onClick={() => remove(r.id)} aria-label="Supprimer l'avis" className="text-muted-foreground">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 rounded-2xl bg-secondary p-4">
        <Input placeholder="Nom du client" value={draft.author_name} onChange={(e) => setDraft({ ...draft, author_name: e.target.value })} />
        <select
          value={draft.rating}
          onChange={(e) => setDraft({ ...draft, rating: e.target.value })}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} étoile{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <Textarea rows={3} placeholder="Avis" value={draft.comment} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} />
        <button onClick={add} className="h-11 w-full rounded-full bg-primary text-primary-foreground">
          Importer cet avis
        </button>
      </div>
    </section>
  );
}
