"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageCircle, Send, Loader2, CheckCircle2,
    Clock, User, XCircle, ChevronRight
} from "lucide-react";

interface ChatSession {
    id: string;
    visitor_name: string;
    visitor_email: string | null;
    status: "open" | "closed";
    created_at: string;
    last_message_at: string;
    last_message: string | null;
}

interface ChatMessage {
    id: number;
    sender: "visitor" | "admin";
    message: string;
    created_at: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminChatPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [reply, setReply] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/chat/sessions");
            if (res.ok) {
                const data = await res.json() as { sessions: ChatSession[] };
                setSessions(data.sessions || []);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchMessages = useCallback(async (sessionId: string) => {
        try {
            const res = await fetch(`/api/admin/chat/messages?session_id=${sessionId}`);
            if (res.ok) {
                const data = await res.json() as { messages: ChatMessage[] };
                setMessages(data.messages || []);
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            }
        } catch { /* ignore */ }
    }, []);

    // Poll sessions every 5s
    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, [fetchSessions]);

    // Poll messages every 3s when a session is selected
    useEffect(() => {
        if (!selectedId) return;
        fetchMessages(selectedId);
        const interval = setInterval(() => fetchMessages(selectedId), 3000);
        return () => clearInterval(interval);
    }, [selectedId, fetchMessages]);

    const sendReply = async () => {
        if (!reply.trim() || !selectedId || isSending) return;
        const msg = reply.trim();
        setReply("");
        setIsSending(true);
        try {
            await fetch("/api/admin/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: selectedId, message: msg }),
            });
            await fetchMessages(selectedId);
            await fetchSessions();
        } finally {
            setIsSending(false);
        }
    };

    const closeSession = async (id: string) => {
        await fetch(`/api/admin/chat/session/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "closed" }),
        });
        await fetchSessions();
        if (selectedId === id) await fetchMessages(id);
    };

    const reopenSession = async (id: string) => {
        await fetch(`/api/admin/chat/session/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "open" }),
        });
        await fetchSessions();
        if (selectedId === id) await fetchMessages(id);
    };

    const selectedSession = sessions.find(s => s.id === selectedId);
    const openCount = sessions.filter(s => s.status === "open").length;

    return (
        <div className="flex flex-col h-full -m-8">
            {/* Page header */}
            <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Chat</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {openCount} open conversation{openCount !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: session list */}
                <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden shrink-0">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversations</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <MessageCircle className="h-10 w-10 mb-2 opacity-30" />
                                <p className="text-sm">No conversations yet</p>
                            </div>
                        ) : (
                            sessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => setSelectedId(session.id)}
                                    className={`w-full text-left px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-start gap-3 ${selectedId === session.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-[#135bec]" : ""
                                        }`}
                                >
                                    <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${session.status === "open"
                                            ? "bg-[#135bec]/10 text-[#135bec]"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        }`}>
                                        {session.visitor_name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                                {session.visitor_name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                {timeAgo(session.last_message_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {session.last_message || "No messages yet"}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${session.status === "open"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                                }`}>
                                                {session.status === "open" ? "● Open" : "Closed"}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 mt-2 shrink-0" />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main: conversation view */}
                {!selectedSession ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-950">
                        <MessageCircle className="h-16 w-16 opacity-20 mb-4" />
                        <p className="font-medium text-slate-500">Select a conversation</p>
                        <p className="text-sm mt-1">Choose a chat from the left to view messages</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                        {/* Conversation header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-[#135bec]/10 flex items-center justify-center text-[#135bec] font-bold">
                                    {selectedSession.visitor_name[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{selectedSession.visitor_name}</p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Started {timeAgo(selectedSession.created_at)}
                                        {selectedSession.visitor_email && (
                                            <> · <User className="h-3 w-3" /> {selectedSession.visitor_email}</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedSession.status === "open" ? (
                                    <button
                                        onClick={() => closeSession(selectedSession.id)}
                                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white dark:bg-slate-800 dark:border-red-900/50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Close Chat
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => reopenSession(selectedSession.id)}
                                        className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-white dark:bg-slate-800 dark:border-green-900/50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Reopen
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {/* Welcome message */}
                            <div className="flex justify-start">
                                <div className="max-w-[70%] rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                    Hi {selectedSession.visitor_name}! 👋 How can we help you today?
                                </div>
                            </div>

                            <AnimatePresence initial={false}>
                                {messages.map(msg => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === "admin"
                                                ? "bg-[#135bec] text-white rounded-tr-none"
                                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-none"
                                            }`}>
                                            <p>{msg.message}</p>
                                            <p className={`text-[10px] mt-1 ${msg.sender === "admin" ? "text-white/60" : "text-slate-400"}`}>
                                                {msg.sender === "admin" ? "You · " : `${selectedSession.visitor_name} · `}
                                                {timeAgo(msg.created_at)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {selectedSession.status === "closed" && (
                                <div className="flex items-center justify-center gap-2 py-2">
                                    <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                    <span className="text-xs text-slate-400">This conversation was closed</span>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Reply box */}
                        {selectedSession.status === "open" ? (
                            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex gap-3 items-end">
                                <textarea
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendReply();
                                        }
                                    }}
                                    placeholder="Type a reply… (Enter to send)"
                                    rows={2}
                                    className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={!reply.trim() || isSending}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#135bec] text-white hover:bg-[#0e45b5] disabled:opacity-40 transition-colors"
                                >
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </button>
                            </div>
                        ) : (
                            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center text-sm text-slate-400">
                                Conversation is closed. Reopen to reply.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
