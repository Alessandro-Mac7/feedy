"use client";

import { usePendingRequests } from "@/lib/hooks/use-pending-requests";
import { RequestBanner } from "@/components/request-banner";
import { useToast } from "@/components/toast";

interface FamilyShareRequest {
  id: string;
  ownerName: string | null;
  ownerEmail: string | null;
  confirmed: boolean;
}

export function FamilyRequestBanner() {
  const { items, respond, respondingId } =
    usePendingRequests<FamilyShareRequest>("/api/family/shared-with-me");
  const { toast } = useToast();

  async function handleRespond(id: string, action: "confirm" | "reject") {
    const ok = await respond(id, action);
    if (ok) {
      toast(
        action === "confirm" ? "Ora vedi la sua dieta nella vista Famiglia!" : "Richiesta rifiutata.",
        action === "confirm" ? "success" : "info"
      );
    } else {
      toast("Errore nella risposta.", "error");
    }
  }

  return (
    <RequestBanner
      items={items
        .filter((r) => !r.confirmed)
        .map((r) => ({
          id: r.id,
          title: `${r.ownerName || r.ownerEmail} vuole condividere la sua dieta con te`,
          subtitle: r.ownerEmail,
        }))}
      accent="accent"
      respondingId={respondingId}
      onRespond={handleRespond}
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      }
    />
  );
}
