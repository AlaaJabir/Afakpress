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
  hasLoadedFromSupabase: boolean;
  error: string;
};

declare global {
  interface Window {
    __AFAKPRESS_TEST_CMS_STATE__?: CmsState;
  }
}

const LEGACY_STORAGE_KEY = "afakpress-cms-state-v2";
const STORAGE_MIGRATION_KEY = "afakpress-cms-storage-migrated-v1";
const CmsContext = createContext<CmsStore | null>(null);

function safeSetStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Storage persistence skipped:", error);
  }
}

function safeRemoveStorageItem(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Storage persistence skipped:", error);
  }
}

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CmsState>(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production" && window.__AFAKPRESS_TEST_CMS_STATE__) {
      return window.__AFAKPRESS_TEST_CMS_STATE__;
    }
    return initialCmsState;
  });
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedFromSupabase, setHasLoadedFromSupabase] = useState(false);
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
      setHasLoadedFromSupabase(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    safeRemoveStorageItem(LEGACY_STORAGE_KEY);
    safeSetStorageItem(STORAGE_MIGRATION_KEY, "1");

    const timer = window.setTimeout(() => {
      if (process.env.NODE_ENV !== "production" && window.__AFAKPRESS_TEST_CMS_STATE__) {
        setState(window.__AFAKPRESS_TEST_CMS_STATE__);
        setHasLoadedFromSupabase(true);
        return;
      }
      void refreshFromSupabase();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
    hasLoadedFromSupabase,
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
