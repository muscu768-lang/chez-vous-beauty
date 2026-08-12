import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Heart, MapPin, MessageCircle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { euro } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/estheticienne/$id")({
  head: () => ({
    meta: [
      { title: "Profil esthéticienne — Edito" },
      { name: "description", content: "Portfolio, prestations et avis vérifiés, puis réservation immédiate." },
      { property: "og:title", content: "Profil esthéticienne — Edito" },
      { property: "og:description", content: "Portfolio, prestations et avis vérifiés sur Edito." },
    ],
  }),
  component: EstheticianPage,
});

const TABS = ["Portfolio", "Services", "Avis"] as const;

function EstheticianPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Portfolio");
  const [liked, setLiked] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["esthetician", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estheticians")
        .select(
          "*, services(id,name,category,description,price_cents,duration_min), portfolio_items(id,image_url,caption,position), reviews(id,author_name,rating,comment,created_at)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 p-6">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const pro = data as any;
  const services = (pro.services ?? []) as any[];
  const portfolio = ((pro.portfolio_items ?? []) as any[]).sort((a, b) => a.position - b.position);
  const reviews = (pro.reviews ?? []) as any[];

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md bg-background pb-32">
      <div className="relative">
        <img
          src={pro.cover_url ?? ""}
          alt={`Salon de ${pro.name}`}
          width={1024}
          height={768}
          className="aspect-[4/3] w-full object-cover"
        />
        <button
          onClick={() => navigate({ to: "/" })}
          aria-label="Retour"
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-card shadow-sm"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={() => setLiked((v) => !v)}
          aria-label="Ajouter aux favoris"
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-card shadow-sm"
        >
          <Heart className={`size-5 ${liked ? "fill-accent text-accent" : ""}`} />
        </button>
        <img
          src={pro.avatar_url ?? ""}
          alt={pro.name}
          width={200}
          height={200}
          className="absolute -bottom-10 left-6 size-24 rounded-full border-4 border-background object-cover"
        />
      </div>

      <div className="px-6 pt-14">
        <h1 className="font-serif text-3xl">{pro.name}</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-foreground">
            <Star className="size-4 fill-current" /> {Number(pro.rating).toFixed(1)}
          </span>
          <span>({pro.reviews_count})</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {pro.city}
          </span>
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">{pro.bio}</p>

        <div className="mt-6 flex border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 pb-3 text-sm transition-colors ${
                tab === t ? "border-b-2 border-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Portfolio" && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {portfolio.map((p) => (
              <figure key={p.id} className="overflow-hidden rounded-xl bg-muted">
                <img
                  src={p.image_url}
                  alt={p.caption ?? "Réalisation"}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="aspect-square w-full object-cover"
                />
              </figure>
            ))}
          </div>
        )}

        {tab === "Services" && (
          <ul className="mt-2 divide-y divide-border">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  to="/reserver/$serviceId"
                  params={{ serviceId: s.id }}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <span>
                    <span className="block font-serif text-lg">{s.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {s.duration_min} min · {s.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-base">{euro(s.price_cents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {tab === "Avis" && (
          <ul className="mt-2 divide-y divide-border">
            {reviews.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.author_name}</span>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-current" /> {r.rating}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              </li>
            ))}
            {reviews.length === 0 && <li className="py-6 text-sm text-muted-foreground">Pas encore d'avis.</li>}
          </ul>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-border bg-background/95 px-6 pb-6 pt-4 backdrop-blur">
        <div className="flex gap-3">
          <Link
            to="/messages/$estheticianId"
            params={{ estheticianId: pro.id }}
            aria-label="Envoyer un message"
            className="grid size-14 shrink-0 place-items-center rounded-full border border-border"
          >
            <MessageCircle className="size-5" />
          </Link>
          <Link
            to="/reserver/$serviceId"
            params={{ serviceId: services[0]?.id ?? "" }}
            className="flex h-14 flex-1 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            Réserver un rendez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}
