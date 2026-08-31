"use client";

import { useState, useEffect, useRef } from "react";

export interface UserSearchResult {
  id: string;
  email: string;
  name: string | null;
}

// Debounced "search a registered user by name/email, then pick one" flow,
// shared by every "invite a person" form (nutritionist↔patient, family shares).
export function useUserSearch(endpoint: string) {
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<UserSearchResult | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clearing the query is a direct consequence of the caller's own event, so
  // it resets synchronously here rather than as a side effect of the query change.
  function setQuery(value: string) {
    setQueryState(value);
    if (value.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
    }
  }

  useEffect(() => {
    if (selected || query.trim().length < 2) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${endpoint}?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data: UserSearchResult[] = await res.json();
          setResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timeoutRef.current);
  }, [query, selected, endpoint]);

  function select(user: UserSearchResult) {
    setSelected(user);
    setQuery(user.name ? `${user.name} (${user.email})` : user.email);
    setShowDropdown(false);
  }

  function reset() {
    setQuery("");
    setResults([]);
    setSelected(null);
    setShowDropdown(false);
  }

  return { query, setQuery, results, showDropdown, setShowDropdown, selected, select, reset };
}
