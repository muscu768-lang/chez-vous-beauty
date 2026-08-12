import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Edito" },
      { name: "description", content: "Connectez-vous ou créez votre compte Edito pour réserver vos soins beauté." },
      { property: "og:title", content: "Connexion — Edito" },
      { property: "og:description", content: "Créez votre compte Edito et réservez vos soins beauté." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifiez votre boîte mail pour confirmer.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Connexion Google impossible pour le moment.");
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center bg-background px-6">
      <p className="eyebrow">Edito</p>
      <h1 className="mt-2 text-[2rem] leading-tight">
        {mode === "signin" ? "Ravis de vous revoir." : "Créez votre compte."}
      </h1>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "signup" && (
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom complet" autoComplete="name" />
        )}
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
        />
        <Input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
        />
        <button
          type="submit"
          disabled={busy}
          className="h-14 w-full rounded-full bg-primary text-primary-foreground disabled:opacity-50"
        >
          {mode === "signin" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      <button onClick={google} className="mt-3 h-14 w-full rounded-full border border-border">
        Continuer avec Google
      </button>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 text-sm text-muted-foreground underline underline-offset-4"
      >
        {mode === "signin" ? "Pas encore de compte ? S'inscrire" : "J'ai déjà un compte"}
      </button>
    </div>
  );
}
