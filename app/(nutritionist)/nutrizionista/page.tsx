"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { useToast } from "@/components/toast";
import type { NutritionistPatient } from "@/types";

interface SearchResult {
  id: string;
  email: string;
  name: string | null;
}

const PAGE_SIZE = 15;

export default function NutrizionistaPazientiPage() {
  const [patients, setPatients] = useState<NutritionistPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NutritionistPatient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // Filter / pagination
  const [filterQuery, setFilterQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/nutritionist/patients");
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Filtered + paginated patients
  const filteredPatients = useMemo(() => {
    if (!filterQuery.trim()) return patients;
    const q = filterQuery.toLowerCase();
    return patients.filter(
      (p) =>
        (p.patientName?.toLowerCase().includes(q)) ||
        p.patientEmail.toLowerCase().includes(q)
    );
  }, [patients, filterQuery]);

  const visiblePatients = filteredPatients.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPatients.length;

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterQuery]);

  // ── Add modal: debounced search ──
  useEffect(() => {
    if (selectedUser) return;
    clearTimeout(searchTimeout.current);
    if (addQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/nutritionist/patients/search?q=${encodeURIComponent(addQuery.trim())}`);
        if (res.ok) {
          const data: SearchResult[] = await res.json();
          setSearchResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [addQuery, selectedUser]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openAddModal() {
    setShowAddModal(true);
    setAddQuery("");
    setSelectedUser(null);
    setSearchResults([]);
    setAddError(null);
  }

  function closeAddModal() {
    setShowAddModal(false);
    setSelectedUser(null);
    setAddQuery("");
    setSearchResults([]);
    setAddError(null);
  }

  function handleSelectUser(user: SearchResult) {
    setSelectedUser(user);
    setAddQuery(user.name ? `${user.name} (${user.email})` : user.email);
    setShowDropdown(false);
  }

  function handleClearSelection() {
    setSelectedUser(null);
    setAddQuery("");
    setSearchResults([]);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) {
      toast("Seleziona un paziente dalla ricerca", "error");
      return;
    }

    setAdding(true);
    setAddError(null);

    try {
      const res = await fetch("/api/nutritionist/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser.email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore sconosciuto");
      }

      closeAddModal();
      toast("Richiesta inviata! In attesa di conferma dal paziente.", "success");
      loadPatients();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto.";
      setAddError(msg);
      toast(msg, "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/nutritionist/patients/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast("Paziente rimosso", "success");
        setDeleteTarget(null);
      } else {
        toast("Errore nella rimozione", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setDeleting(false);
    }
    loadPatients();
  }

  function getInitial(patient: NutritionistPatient) {
    return (patient.patientName || patient.patientEmail)[0].toUpperCase();
  }

  return (
    <div className="space-y-5">
      {/* Header + add button */}
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl text-foreground"
        >
          I tuoi pazienti
        </motion.h1>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/15 hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Aggiungi
        </motion.button>
      </div>

      {/* Search patients in list */}
      {patients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted/40">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filtra pazienti..."
              className="w-full rounded-xl glass-input pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted/60 hover:text-foreground-muted transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {filterQuery && (
            <p className="text-xs text-foreground-muted mt-1.5 ml-1">
              {filteredPatients.length} {filteredPatients.length === 1 ? "risultato" : "risultati"}
            </p>
          )}
        </motion.div>
      )}

      {/* Patient list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl py-14 text-center"
        >
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/12">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-foreground-muted font-medium mb-0.5">
            Nessun paziente
          </p>
          <p className="text-foreground-muted/60 text-sm mb-4">
            Aggiungi il tuo primo paziente per iniziare.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/15 hover:bg-primary-light transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Aggiungi paziente
          </button>
        </motion.div>
      ) : filteredPatients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl py-10 text-center"
        >
          <p className="text-foreground-muted font-medium">
            Nessun risultato per &ldquo;{filterQuery}&rdquo;
          </p>
        </motion.div>
      ) : (
        <>
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {visiblePatients.map((patient, i) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass rounded-2xl p-4 hover:shadow-md hover:shadow-primary/6 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary shrink-0 group-hover:bg-primary/18 transition-colors">
                      {getInitial(patient)}
                    </div>
                    <Link
                      href={`/nutrizionista/${patient.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {patient.patientName || patient.patientEmail}
                        </p>
                        {!patient.confirmed && (
                          <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                            In attesa
                          </span>
                        )}
                      </div>
                      {patient.patientName && (
                        <p className="text-xs text-foreground-muted truncate">
                          {patient.patientEmail}
                        </p>
                      )}
                      <p className="text-[10px] text-foreground-muted/60 mt-0.5">
                        Aggiunto il{" "}
                        {new Date(patient.addedAt).toLocaleDateString("it-IT")}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDeleteTarget(patient)}
                        className="rounded-xl bg-danger/8 px-3 py-1.5 text-[11px] font-semibold text-danger hover:bg-danger/15 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Rimuovi
                      </button>
                      <Link
                        href={`/nutrizionista/${patient.id}`}
                        className="text-foreground-muted/30 group-hover:text-primary transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load more */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center pt-1"
            >
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="inline-flex items-center gap-1.5 rounded-xl glass px-5 py-2.5 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
              >
                Mostra altri ({filteredPatients.length - visibleCount} rimanenti)
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </motion.div>
          )}

          {/* Counter */}
          {!filterQuery && patients.length > 0 && (
            <p className="text-center text-xs text-foreground-muted/50">
              {patients.length} {patients.length === 1 ? "paziente" : "pazienti"} totali
            </p>
          )}
        </>
      )}

      {/* ── Add Patient Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeAddModal();
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              className="relative z-10 w-full max-w-md glass-strong rounded-3xl p-6 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={closeAddModal}
                className="absolute top-4 right-4 text-foreground-muted/60 hover:text-foreground transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <h2 className="font-display text-xl text-foreground mb-1">
                Aggiungi paziente
              </h2>
              <p className="text-sm text-foreground-muted mb-5">
                Cerca per nome o email un utente registrato su Feedy.
              </p>

              <form onSubmit={handleAdd} className="space-y-4">
                <div ref={dropdownRef} className="relative">
                  <div className="relative">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted/40">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={addQuery}
                      onChange={(e) => {
                        setAddQuery(e.target.value);
                        if (selectedUser) setSelectedUser(null);
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0 && !selectedUser) setShowDropdown(true);
                      }}
                      placeholder="Cerca per nome o email..."
                      autoFocus
                      className="w-full rounded-xl glass-input pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                    />
                    {selectedUser && (
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted/60 hover:text-foreground-muted transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showDropdown && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 left-0 right-0 mt-1.5 rounded-xl shadow-xl overflow-hidden border border-white/20 max-h-48 overflow-y-auto"
                        style={{ background: "var(--background)" }}
                      >
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-primary/8 transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary shrink-0">
                              {(user.name || user.email)[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              {user.name && (
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {user.name}
                                </p>
                              )}
                              <p className="text-xs text-foreground-muted truncate">
                                {user.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected user preview */}
                <AnimatePresence>
                  {selectedUser && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      className="glass-subtle rounded-xl p-3.5 flex items-center gap-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary shrink-0">
                        {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {selectedUser.name || selectedUser.email}
                        </p>
                        <p className="text-xs text-foreground-muted truncate">
                          {selectedUser.email}
                        </p>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {addError && <p className="text-sm font-medium text-danger">{addError}</p>}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 rounded-xl glass py-3 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={adding || !selectedUser}
                    className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all bg-primary hover:bg-primary-light shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 disabled:bg-white/30 disabled:text-foreground-muted disabled:shadow-none disabled:cursor-not-allowed disabled:backdrop-blur-sm"
                  >
                    {adding ? "Aggiunta..." : "Aggiungi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Rimuovere questo paziente?"
        description={
          deleteTarget
            ? `Stai per rimuovere "${deleteTarget.patientName || deleteTarget.patientEmail}" dalla tua lista pazienti. Le diete già caricate non verranno eliminate.`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
