import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { euro } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/reserver/$serviceId")({
  head: () => ({
    meta: [
      { title: "Réserver une prestation — Edito" },
      { name: "description", content: "Choisissez votre créneau, votre moyen de paiement et confirmez votre rendez-vous." },
      { property: "og:title", content: "Réserver une prestation — Edito" },
      { property: "og:description", content: "Créneau, paiement, confirmation : trois étapes et c'est réservé." },
    ],
  }),
  component: BookingPage,
});

const PAYMENTS = [
  { id: "stripe", label: "Carte bancaire (Stripe)" },
  { id: "mastercard", label: "Mastercard enregistrée" },
  { id: "paypal", label: "PayPal" },
  { id: "apple_pay", label: "Apple Pay" },
];

function nextSlots() {
  const slots: { iso: string; day: string; hour: string }[] = [];
  const base = new Date();
  base.setMinutes(0, 0, 0);
  for (let d = 1; d <= 4; d++) {
    for (const h of [9, 11, 14, 17]) {
      const date = new Date(base);
      date.setDate(base.getDate() + d);
      date.setHours(h);
      slots.push({
        iso: date.toISOString(),
        day: new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(date),
        hour: `${h}:00`,
      });
    }
  }
  return slots;
}

function BookingPage() {
  const { serviceId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [slots] = useState(nextSlots);
  const [slot, setSlot] = useState<string | null>(null);
  const [payment, setPayment] = useState<string>("stripe");

  const { data: service } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, estheticians(id,name,city)")
        .eq("id", serviceId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const book = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      if (!slot) throw new Error("Choisissez un créneau.");
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          esthetician_id: service.estheticians.id,
          service_id: service.id,
          service_name: service.name,
          esthetician_name: service.estheticians.name,
          scheduled_at: slot,
          price_cents: service.price_cents,
          status: "confirmee",
          payment_status: "paye",
          payment_method: payment,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Rendez-vous confirmé et payé.");
      navigate({ to: "/reservations" });
    },
    onError: (e: Error) => {
      if (e.message === "auth") {
        toast.error("Connectez-vous pour réserver.");
        navigate({ to: "/auth" });
      } else toast.error(e.message);
    },
  });

  if (!service) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 p-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md bg-background pb-32">
      <header className="flex items-center gap-3 px-6 pt-8">
        <button
          onClick={() => navigate({ to: "/estheticienne/$id", params: { id: service.estheticians.id } })}
          aria-label="Retour"
          className="grid size-10 place-items-center rounded-full border border-border"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <p className="eyebrow">Réservation</p>
          <h1 className="font-serif text-2xl">{service.name}</h1>
        </div>
      </header>

      <p className="mt-2 px-6 text-sm text-muted-foreground">
        avec {service.estheticians.name} · {service.duration_min} min · {euro(service.price_cents)}
      </p>

      <section className="mt-8 px-6">
        <h2 className="eyebrow">Créneau</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {slots.map((s) => (
            <button
              key={s.iso}
              onClick={() => setSlot(s.iso)}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                slot === s.iso ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              <span className="block capitalize">{s.day}</span>
              <span className="block opacity-70">{s.hour}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 px-6">
        <h2 className="eyebrow">Paiement</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
          {PAYMENTS.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setPayment(p.id)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-sm"
              >
                {p.label}
                {payment === p.id && <Check className="size-4 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-border bg-background/95 px-6 pb-6 pt-4 backdrop-blur">
        <button
          disabled={!slot || book.isPending || loading}
          onClick={() => book.mutate()}
          className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
        >
          {book.isPending ? "Confirmation…" : `Payer ${euro(service.price_cents)} et confirmer`}
        </button>
      </div>
    </div>
  );
}
