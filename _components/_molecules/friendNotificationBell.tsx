"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@/_context/userContext";
import { Friend } from "@/_lib/types/user";
import { api } from "@/_lib/api";

export function FriendNotificationBell() {
  const { user } = useUser();
  const [open, setOpen]         = useState(false);
  const [pending, setPending]   = useState<Friend[]>([]);
  const [loading, setLoading]   = useState(false);
  const [acting, setActing]     = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchPending = async () => {
    if (!user) return;
    try {
      const data = await api.get<Friend[]>(`/api/user/${user.uid}/friends`);
      const list: Friend[] = Array.isArray(data) ? data : [];
      setPending(list.filter(f => f.status === "pending"));
    } catch {}
  };

  useEffect(() => {
    fetchPending();
  }, [user?.uid]);

  // fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAccept = async (targetUid: string) => {
    if (!user) return;
    setActing(targetUid);
    try {
      await api.put(`/api/user/${user.uid}/friends/${targetUid}/accept`, {});
      await fetchPending();
    } finally {
      setActing(null);
    }
  };

  const handleDecline = async (targetUid: string) => {
    if (!user) return;
    setActing(targetUid);
    try {
      await api.delete(`/api/user/${user.uid}/friends/${targetUid}`);
      await fetchPending();
    } finally {
      setActing(null);
    }
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchPending(); }}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notificações de amizade"
      >
        {/* ícone de sino */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {pending.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {pending.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
          {/* header do dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-bold text-foreground">Solicitações de amizade</span>
            {pending.length > 0 && (
              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 font-semibold">
                {pending.length} nova{pending.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p className="text-xs">Nenhuma solicitação pendente</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {pending.map(f => (
                <div key={f.uid} className="px-4 py-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {(f.nick || f.username || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{f.nick || f.username}</p>
                      <p className="text-xs text-muted-foreground">@{f.username} · {(f.xp ?? 0).toLocaleString()} XP</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2.5">
                    Quer ser seu amigo no <span className="text-primary font-semibold">SQL Challenger</span>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(f.uid)}
                      disabled={acting === f.uid}
                      className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {acting === f.uid ? "..." : "Aceitar"}
                    </button>
                    <button
                      onClick={() => handleDecline(f.uid)}
                      disabled={acting === f.uid}
                      className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-2.5 border-t border-border">
            <Link href="/perfil?tab=amigos" className="text-xs text-primary hover:underline font-medium">
              Ver todos os amigos →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
