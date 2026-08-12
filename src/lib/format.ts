export const euro = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);

export const dateLong = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export const CATEGORIES = [
  { id: "tout", label: "Tout" },
  { id: "manucure", label: "Manucure" },
  { id: "pedicure", label: "Pédicure" },
  { id: "gel", label: "Gel" },
  { id: "epilation", label: "Épilation" },
] as const;

export const statusLabel: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
  terminee: "Terminée",
};

export const paymentLabel: Record<string, string> = {
  en_attente: "À régler",
  paye: "Payé",
  rembourse: "Remboursé",
};
