"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/toast";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { AssociationRow } from "@/components/association-row";
import { UserSearchField } from "@/components/user-search-field";
import { useUserSearch } from "@/lib/hooks/use-user-search";
import { usePendingRequests } from "@/lib/hooks/use-pending-requests";
import type { FamilyShare } from "@/types";

interface SharedWithMe {
  id: string;
  ownerName: string | null;
  ownerEmail: string | null;
  confirmed: boolean;
}

export function FamilyShareManager() {
  const [members, setMembers] = useState<FamilyShare[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState<FamilyShare | null>(null);
  const [removing, setRemoving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();
  const search = useUserSearch("/api/family/search");

  const {
    items: sharedWithMe,
    loading: sharedLoading,
    respond: respondToShare,
    respondingId,
  } = usePendingRequests<SharedWithMe>("/api/family/shared-with-me");

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/family/members");
      if (res.ok) setMembers(await res.json());
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  function openAdd() {
    setShowAdd(true);
    search.reset();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!search.selected) {
      toast("Seleziona una persona dalla ricerca", "error");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/family/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: search.selected.email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore sconosciuto");
      }
      setShowAdd(false);
      search.reset();
      toast("Invito inviato! In attesa di conferma.", "success");
      loadMembers();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Errore sconosciuto.", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveMember() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/family/members/${removeTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Persona rimossa", "success");
        setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
        setRemoveTarget(null);
      } else {
        toast("Errore nella rimozione", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setRemoving(false);
    }
  }

  async function handleSharedResponse(id: string, action: "confirm" | "reject") {
    const ok = await respondToShare(id, action);
    toast(
      ok ? (action === "confirm" ? "Condivisione accettata!" : "Rimosso.") : "Errore nella risposta.",
      ok ? (action === "confirm" ? "success" : "info") : "error"
    );
  }

  return (
    <>
      {/* People I share my diet with */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.075 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            Condividi la tua dieta
          </h2>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center justify-center rounded-lg p-2 text-primary hover:bg-primary/8 transition-colors"
            aria-label="Aggiungi persona"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {membersLoading ? (
          <div className="h-5 w-40 rounded-lg skeleton-shimmer" />
        ) : members.length === 0 && !showAdd ? (
          <p className="text-sm text-foreground-muted">
            Nessuno può ancora vedere la tua dieta. Aggiungi chi cucina per te.
          </p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {members.map((m) => (
                <AssociationRow
                  key={m.id}
                  title={m.memberName || m.memberEmail}
                  subtitle={m.memberEmail}
                  pending={!m.confirmed}
                  onReject={() => setRemoveTarget(m)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Inline add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleAdd}
              className="overflow-visible mt-4 pt-4 border-t border-border-light"
            >
              <UserSearchField
                query={search.query}
                onQueryChange={search.setQuery}
                results={search.results}
                showDropdown={search.showDropdown}
                onShowDropdownChange={search.setShowDropdown}
                selected={search.selected}
                onSelect={search.select}
                onClearSelection={search.reset}
                autoFocus
              />

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-xl glass py-2.5 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={adding || !search.selected}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all bg-primary hover:bg-primary-light disabled:bg-white/30 disabled:text-foreground-muted disabled:cursor-not-allowed"
                >
                  {adding ? "Invio..." : "Invita"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Diets shared with me */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          Diete condivise con te
        </h2>
        {sharedLoading ? (
          <div className="h-5 w-40 rounded-lg skeleton-shimmer" />
        ) : sharedWithMe.length === 0 ? (
          <p className="text-sm text-foreground-muted">Nessuna dieta condivisa con te.</p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {sharedWithMe.map((s) => (
                <AssociationRow
                  key={s.id}
                  title={s.ownerName || s.ownerEmail || "?"}
                  subtitle={s.ownerName ? s.ownerEmail : null}
                  pending={!s.confirmed}
                  accent="accent"
                  loading={respondingId === s.id}
                  onConfirm={() => handleSharedResponse(s.id, "confirm")}
                  onReject={() => handleSharedResponse(s.id, "reject")}
                  rejectLabel={s.confirmed ? "Rimuovi" : "Rifiuta"}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <DeleteConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveMember}
        loading={removing}
        title="Rimuovere questa persona?"
        description={
          removeTarget
            ? `"${removeTarget.memberName || removeTarget.memberEmail}" non potrà più vedere la tua dieta.`
            : ""
        }
      />
    </>
  );
}
