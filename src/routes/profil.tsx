import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bell, ChevronRight, CreditCard, HelpCircle, LogOut, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — Edito" },
      { name: "description", content: "Vos informations, moyens de paiement, adresses et préférences de notification." },
      { property: "og:title", content: "Mon profil — Edito" },
      { property: "og:description", content: "Informations, paiements, adresses et notifications." },
    ],
  }),
  component: Profile,
});

type Panel = "infos" | "paiement" | "adresses" | "notifications" | "aide" | null;

function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [panel, setPanel] = useState<Panel>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const { data: cards } = useQuery({
    queryKey: ["payment_methods", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_methods").select("*").order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: addresses } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });

  const [form, setForm] = useState({ full_name: "", phone: "", city: "" });
  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? "", phone: profile.phone ?? "", city: profile.city ?? "" });
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(form).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Informations enregistrées.");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [card, setCard] = useState({ provider: "mastercard", label: "Mastercard", last4: "", expires_at: "" });
  const addCard = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payment_methods").insert({ ...card, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      setCard({ provider: "mastercard", label: "Mastercard", last4: "", expires_at: "" });
      qc.invalidateQueries({ queryKey: ["payment_methods"] });
      toast.success("Moyen de paiement ajouté.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [addr, setAddr] = useState({ label: "Domicile", line1: "", postal_code: "", city: "" });
  const addAddress = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("addresses").insert({ ...addr, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      setAddr({ label: "Domicile", line1: "", postal_code: "", city: "" });
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Adresse ajoutée.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!loading && !user) {
    return (
      <AppShell>
        <div className="px-6 pt-24 text-center">
          <h1 className="font-serif text-3xl">Votre compte</h1>
          <p className="mt-2 text-sm text-muted-foreground">Connectez-vous pour gérer votre profil Edito.</p>
          <Link
            to="/auth"
            className="mt-6 inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-primary-foreground"
          >
            Se connecter
          </Link>
        </div>
      </AppShell>
    );
  }

  const rows = [
    { id: "infos" as const, label: "Mes informations", icon: User },
    { id: "paiement" as const, label: "Moyens de paiement", icon: CreditCard },
    { id: "adresses" as const, label: "Adresses", icon: MapPin },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "aide" as const, label: "Aide & support", icon: HelpCircle },
  ];

  const initial = (profile?.full_name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <AppShell>
      <div className="px-6 pt-8">
        <div className="flex items-center gap-4 rounded-2xl bg-blush p-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-clay font-serif text-2xl text-accent-foreground">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-serif text-xl text-blush-foreground">{profile?.full_name ?? "Mon compte"}</span>
            <span className="block truncate text-sm text-blush-foreground/70">{user?.email}</span>
          </span>
        </div>

        <ul className="mt-6 divide-y divide-border">
          {rows.map((r) => {
            const Icon = r.icon;
            const open = panel === r.id;
            return (
              <li key={r.id}>
                <button
                  onClick={() => setPanel(open ? null : r.id)}
                  className="flex w-full items-center gap-4 py-4 text-left"
                >
                  <Icon className="size-5" strokeWidth={1.5} />
                  <span className="flex-1">{r.label}</span>
                  <ChevronRight className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
                </button>

                {open && r.id === "infos" && (
                  <div className="space-y-3 pb-5">
                    <Input
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Nom complet"
                    />
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Téléphone"
                    />
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ville" />
                    <button
                      onClick={() => saveProfile.mutate()}
                      className="h-12 w-full rounded-full bg-primary text-primary-foreground"
                    >
                      Enregistrer
                    </button>
                  </div>
                )}

                {open && r.id === "paiement" && (
                  <div className="space-y-3 pb-5">
                    {(cards ?? []).map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                        <span>{c.label}</span>
                        <span className="text-muted-foreground">•••• {c.last4}</span>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={card.label} onChange={(e) => setCard({ ...card, label: e.target.value })} placeholder="Libellé" />
                      <Input value={card.last4} onChange={(e) => setCard({ ...card, last4: e.target.value })} placeholder="4 derniers chiffres" />
                    </div>
                    <button onClick={() => addCard.mutate()} className="h-12 w-full rounded-full border border-border">
                      Ajouter un moyen de paiement
                    </button>
                  </div>
                )}

                {open && r.id === "adresses" && (
                  <div className="space-y-3 pb-5">
                    {(addresses ?? []).map((a) => (
                      <div key={a.id} className="rounded-xl border border-border px-4 py-3 text-sm">
                        <span className="block font-medium">{a.label}</span>
                        <span className="block text-muted-foreground">
                          {a.line1}, {a.postal_code} {a.city}
                        </span>
                      </div>
                    ))}
                    <Input value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} placeholder="Libellé" />
                    <Input value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} placeholder="Adresse" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={addr.postal_code} onChange={(e) => setAddr({ ...addr, postal_code: e.target.value })} placeholder="Code postal" />
                      <Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="Ville" />
                    </div>
                    <button onClick={() => addAddress.mutate()} className="h-12 w-full rounded-full border border-border">
                      Ajouter une adresse
                    </button>
                  </div>
                )}

                {open && r.id === "notifications" && (
                  <div className="space-y-4 pb-5 text-sm">
                    {["Rappels de rendez-vous", "Messages des esthéticiennes", "Offres Edito"].map((n) => (
                      <label key={n} className="flex items-center justify-between">
                        {n}
                        <Switch defaultChecked />
                      </label>
                    ))}
                  </div>
                )}

                {open && r.id === "aide" && (
                  <p className="pb-5 text-sm text-muted-foreground">
                    Une question sur une réservation ? Écrivez-nous à bonjour@edito.app, réponse sous 24 h.
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <button onClick={signOut} className="mt-4 flex w-full items-center gap-4 border-t border-border py-5 text-destructive">
          <LogOut className="size-5" strokeWidth={1.5} />
          Se déconnecter
        </button>
      </div>
    </AppShell>
  );
}
