"use client";

import { useState, useEffect, useCallback } from "react";

export interface Confirmable {
  id: string;
  confirmed: boolean;
}

// Shared confirm/reject flow for any "association" endpoint that follows the
// { GET → list, PATCH ?id=&action=confirm|reject } contract (nutritionist↔patient,
// family shares, ...). Keeps the fetch/optimistic-update logic in one place.
export function usePendingRequests<T extends Confirmable>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(endpoint);
      if (res.ok) setItems(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(id: string, action: "confirm" | "reject"): Promise<boolean> {
    setRespondingId(id);
    try {
      const res = await fetch(`${endpoint}?id=${id}&action=${action}`, { method: "PATCH" });
      if (res.ok) {
        setItems((prev) =>
          action === "reject"
            ? prev.filter((item) => item.id !== id)
            : prev.map((item) => (item.id === id ? { ...item, confirmed: true } : item))
        );
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setRespondingId(null);
    }
  }

  return { items, loading, respond, respondingId, reload: load };
}
