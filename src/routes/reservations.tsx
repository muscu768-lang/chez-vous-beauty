import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { dateLong, euro, paymentLabel, statusLabel } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Mes réservations — Edito" },
      { name: "description", content: "Suivez vos rendez-vous beauté : statut, paiement et annulation en un geste." },
      { property: "og:title", content: "Mes réservations — Edito" },
      { property: "og:description", content: "Statut, paiement et annulation de vos rendez-vous beauté." },
    ],
  }),
  component: Bookings,
});

function Bookings() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "annulee", payment_status: "rembourse" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réservation annulée, remboursement en cours.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <header className="px-6 pt-10">
        <p className="eyebrow">Mes</p>
        <h1 className="text-[2rem] leading-tight">Réservations</h1>
      </header>

      <section className="mt-6 space-y-4 px-6">
        {!loading && !user && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Connectez-vous pour retrouver vos rendez-vous.</p>
            <Link
              to="/auth"
              className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-primary-foreground"
            >
              Se connecter
            </Link>
          </div>
        )}

        {user && isLoading && <Skeleton className="h-32 w-full rounded-2xl" />}

        {user && !isLoading && (data?.length ?? 0) === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Aucune réservation pour le moment.</p>
        )}

        {(data ?? []).map((b) => (
          <article key={b.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-xl">{b.service_name}</h2>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                  b.status === "annulee" ? "bg-muted text-muted-foreground" : "bg-blush text-blush-foreground"
                }`}
              >
                {statusLabel[b.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">avec {b.esthetician_name}</p>
            <p className="text-sm text-muted-foreground">{dateLong(b.scheduled_at)}</p>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-lg">{euro(b.price_cents)}</span>
              <span className="text-sm text-accent">{paymentLabel[b.payment_status]}</span>
            </div>
            <div className="mt-3 flex gap-3">
              <Link
                to="/messages/$estheticianId"
                params={{ estheticianId: b.esthetician_id }}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm"
              >
                Message
              </Link>
              {b.status !== "annulee" && (
                <button
                  onClick={() => cancel.mutate(b.id)}
                  disabled={cancel.isPending}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm text-destructive disabled:opacity-50"
                >
                  Annuler
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
