"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "amralt:compare";
const MAX_ITEMS = 4;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("amralt:compare-change"));
}

export function useCompareList() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const onChange = () => setIds(read());
    window.addEventListener("amralt:compare-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("amralt:compare-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : current.length < MAX_ITEMS
        ? [...current, id]
        : current;
    write(next);
    setIds(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setIds([]);
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((x) => x !== id);
    write(next);
    setIds(next);
  }, []);

  return { ids, toggle, clear, remove, maxItems: MAX_ITEMS };
}
