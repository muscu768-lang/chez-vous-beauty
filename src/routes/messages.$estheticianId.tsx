import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/messages/$estheticianId")({
  head: () => ({
    meta: [
      { title: "Messagerie — Edito" },
      { name: "description", content: "Échangez en direct avec votre esthéticienne avant et après le rendez-vous." },
      { property: "og:title", content: "Messagerie — Edito" },
      { property: "og:description", content: "Discussion en temps réel avec votre esthéticienne." },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { estheticianId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: pro } = useQuery({
    queryKey: ["esthetician-name", estheticianId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estheticians")
        .select("id,name,avatar_url")
        .eq("id", estheticianId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", estheticianId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("esthetician_id", estheticianId)
        .order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages-${estheticianId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `esthetician_id=eq.${estheticianId}` },
        () => qc.invalidateQueries({ queryKey: ["messages", estheticianId, user.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [estheticianId, user, qc]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const body = text.trim();
    if (!body) return;
    setText("");
    const { error } = await supabase
      .from("messages")
      .insert({ user_id: user.id, esthetician_id: estheticianId, sender: "client", body });
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["messages", estheticianId, user.id] });
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate({ to: "/reservations" })} aria-label="Retour" className="grid size-10 place-items-center rounded-full border border-border">
          <ArrowLeft className="size-5" />
        </button>
        {pro?.avatar_url && <img src={pro.avatar_url} alt={pro.name} width={80} height={80} className="size-10 rounded-full object-cover" />}
        <span className="font-serif text-lg">{pro?.name ?? "Conversation"}</span>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
        {!loading && !user && (
          <p className="pt-10 text-center text-sm text-muted-foreground">Connectez-vous pour discuter.</p>
        )}
        {(messages ?? []).map((m) => (
          <div
            key={m.id}
            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
              m.sender === "client" ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {m.body}
          </div>
        ))}
        {user && (messages?.length ?? 0) === 0 && (
          <p className="pt-10 text-center text-sm text-muted-foreground">
            Dites bonjour à {pro?.name ?? "votre esthéticienne"}.
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-border px-4 py-4">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Votre message" className="rounded-full" />
        <button type="submit" aria-label="Envoyer" className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
}
