"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { UserSearchResult } from "@/lib/hooks/use-user-search";

interface UserSearchFieldProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: UserSearchResult[];
  showDropdown: boolean;
  onShowDropdownChange: (show: boolean) => void;
  selected: UserSearchResult | null;
  onSelect: (user: UserSearchResult) => void;
  onClearSelection: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// Presentational half of useUserSearch: the input + result dropdown +
// selected-user clear button. Shared by every "invite a person" form.
export function UserSearchField({
  query,
  onQueryChange,
  results,
  showDropdown,
  onShowDropdownChange,
  selected,
  onSelect,
  onClearSelection,
  placeholder = "Cerca per nome o email...",
  autoFocus = false,
}: UserSearchFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onShowDropdownChange(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onShowDropdownChange]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted/40"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            if (selected) onClearSelection();
          }}
          onFocus={() => {
            if (results.length > 0 && !selected) onShowDropdownChange(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl glass-input pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
        />
        {selected && (
          <button
            type="button"
            onClick={onClearSelection}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-foreground-muted/60 hover:text-foreground-muted transition-colors"
            aria-label="Cancella selezione"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 left-0 right-0 mt-1.5 rounded-xl shadow-xl overflow-hidden border border-white/20 max-h-48 overflow-y-auto"
            style={{ background: "var(--background)" }}
          >
            {results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => onSelect(user)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-primary/8 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary shrink-0">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  {user.name && (
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  )}
                  <p className="text-xs text-foreground-muted truncate">{user.email}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
