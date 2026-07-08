"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { canAccess, cmsCredentials, initialCmsState, type CmsState, type CmsUser, type NoticeType } from "@/lib/cms";
import { loadSupabaseCmsState } from "@/lib/supabase-cms";

type Notice = { type: NoticeType; message: string } | null;

type CmsStore = {
  state: CmsState;
  setState: React.Dispatch<React.SetStateAction<CmsState>>;
  currentUser: CmsUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasAccess: (area: string) => boolean;
  notice: Notice;
  notify: (type: NoticeType, message: string) => void;
  resetDemo: () => void;
  adminHeaders: () => HeadersInit;
  refreshFromSupabase: () => Promise<void>;
  isLoading: boolean;
  error: string;
};

const STORAGE_KEY = "afakpress-cms-state-v1";
const SESSION_KEY = "afakpress-cms-user-v1";
const SESSION_PASSWORD_KEY = "afakpress-cms-password-v1";
const CmsContext = createContext<CmsStore | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CmsState>(() => {
    if (typeof window === "undefined") {
      return initialCmsState;
    }
    const storedState = window.localStorage.getItem(STORAGE_KEY);
    return storedState ? (JSON.parse(storedState) as CmsState) : initialCmsState;
  });
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const storedUser = window.sessionStorage.getItem(SESSION_KEY);
    return storedUser ? (JSON.parse(storedUser) as CmsUser) : null;
  });
  const [currentPassword, setCurrentPassword] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.sessionStorage.getItem(SESSION_PASSWORD_KEY) ?? "";
  });
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

  const login = (email: string, password: string) => {
    const account = cmsCredentials[email.toLowerCase()];
    const user = state.users.find((item) => item.id === account?.userId);
    if (!account || account.password !== password || !user) {
      notify("error", "Invalid email or password.");
      return false;
    }
    setCurrentUser(user);
    setCurrentPassword(password);
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.sessionStorage.setItem(SESSION_PASSWORD_KEY, password);
    notify("success", `Welcome, ${user.name}.`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPassword("");
    window.sessionStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_PASSWORD_KEY);
    notify("warning", "Signed out.");
  };

  const resetDemo = () => {
    setState(initialCmsState);
    notify("warning", "CMS demo data restored.");
  };

  const value: CmsStore = {
    state,
    setState,
    currentUser,
    login,
    logout,
    hasAccess: (area) => (currentUser ? canAccess(currentUser.role, area) : false),
    notice,
    notify,
    resetDemo,
    adminHeaders: () => ({
      "Content-Type": "application/json",
      "x-afakpress-admin-email": currentUser?.email ?? "",
      "x-afakpress-admin-password": currentPassword,
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
