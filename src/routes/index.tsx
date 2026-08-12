import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES, euro } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Découvrir — Edito, beauté à domicile" },
      {
        name: "description",
        content:
          "Trouvez une esthéticienne, manucure ou spécialiste de l'épilation près de chez vous et réservez en quelques secondes.",
      },
      { property: "og:title", content: "Découvrir — Edito" },
      {
        property: "og:description",
        content: "Manucure, pédicure, gel et épilation : réservez la bonne experte au bon moment.",
      },
    ],
  }),
  component: Discover,
});

type Esthetician = {
  id: string;
  name: string;
  city: string;
  headline: string | null;
  cover_url: string | null;
  avatar_url: string | null;
  categories: string[];
  rating: number;
  reviews_count: number;
  services: { price_cents: number; category: string }[];
};

function Discover() {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>("tout");

  const { data, isLoading } = useQuery({
    queryKey: ["estheticians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estheticians")
        .select("id,name,city,headline,cover_url,avatar_url,categories,rating,reviews_count,services(price_cents,category)")
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as unknown as Esthetician[];
    },
  });

  const list = (data ?? []).filter((e) => category === "tout" || e.categories.includes(category));
  const firstName = (user?.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0] ?? user?.email?.split("@")[0];

  return (
    <AppShell>
      <header className="px-6 pt-10">
        <p className="eyebrow">{firstName ? `Bonjour, ${firstName}` : "Bienvenue"}</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="max-w-[14ch] text-[2rem] leading-[1.1] font-normal">Trouvez votre esthéticienne.</h1>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-blush px-3 py-1.5 text-xs text-blush-foreground">
            <MapPin className="size-3.5" /> France
          </span>
        </div>
      </header>

      <div className="mt-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
              category === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <section className="mt-6 space-y-8 px-6">
        {isLoading &&
          [0, 1].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}

        {!isLoading && list.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Aucune esthéticienne pour cette prestation.
          </p>
        )}

        {list.map((e) => {
          const prices = e.services.map((s) => s.price_cents);
          const from = prices.length ? Math.min(...prices) : null;
          return (
            <Link key={e.id} to="/estheticienne/$id" params={{ id: e.id }} className="block">
              <div className="relative overflow-hidden rounded-2xl bg-muted">
                <img
                  src={e.cover_url ?? ""}
                  alt={`Travail de ${e.name}`}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium">
                  <Star className="size-3.5 fill-current" /> {e.rating.toFixed(1)}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-xl">{e.name}</h2>
                {from !== null && <span className="text-sm text-muted-foreground">dès {euro(from)}</span>}
              </div>
              <p className="text-sm text-muted-foreground">
                {e.headline} · {e.city}
              </p>
            </Link>
          );
        })}
      </section>
    </AppShell>
  );
}
