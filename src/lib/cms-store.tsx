"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { canAccess, initialCmsState, type CmsState, type CmsUser, type NoticeType } from "@/lib/cms";
import { loadSupabaseCmsState } from "@/lib/supabase-cms";

type Notice = { type: NoticeType; message: string } | null;

type CmsStore = {
  state: CmsState;
  setState: React.Dispatch<React.SetStateAction<CmsState>>;
  currentUser: CmsUser | null;
  setCurrentUser: (user: CmsUser | null) => void;
  hasAccess: (area: string) => boolean;
  notice: Notice;
  notify: (type: NoticeType, message: string) => void;
  resetDemo: () => void;
  adminHeaders: () => HeadersInit;
  refreshFromSupabase: () => Promise<void>;
  isLoading: boolean;
  error: string;
};

const STORAGE_KEY = "afakpress-cms-state-v2";
const CmsContext = createContext<CmsStore | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CmsState>(() => {
    if (typeof window === "undefined") {
      return initialCmsState;
    }
    const storedState = window.localStorage.getItem(STORAGE_KEY);
    return storedState ? (JSON.parse(storedState) as CmsState) : initialCmsState;
  });
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const notify = (type: NoticeType, message: string) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 2600);
  };

  const refreshFromSupabase = async () => {
    setIsLoading(true);
    setError("");
    try {
      const supabaseState = await loadSupabaseCmsState();
      if (supabaseState) {
        setState(supabaseState);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load Supabase data.";
      setError(message);
      notify("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshFromSupabase();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("afakpress-cms-updated", { detail: state }));
  }, [state]);

  const resetDemo = () => {
    setState(initialCmsState);
    notify("warning", "CMS demo data restored.");
  };

  const value: CmsStore = {
    state,
    setState,
    currentUser,
    setCurrentUser,
    hasAccess: (area) => (currentUser ? canAccess(currentUser.role, area) : false),
    notice,
    notify,
    resetDemo,
    adminHeaders: () => ({
      "Content-Type": "application/json",
    }),
    refreshFromSupabase,
    isLoading,
    error,
  };

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error("useCms must be used inside CmsProvider");
  }
  return context;
}
