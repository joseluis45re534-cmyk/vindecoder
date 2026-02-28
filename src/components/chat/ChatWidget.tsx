"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, CheckCircle } from "lucide-react";

interface Message {
    id: number;
    sender: "visitor" | "admin";
    message: string;
    created_at: string;
}

interface Session {
    id: string;
    status: "open" | "closed";
    visitor_name: string;
}

const STORAGE_KEY = "chat_session_id";
const VISITOR_NAME_KEY = "chat_visitor_name";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [phase, setPhase] = useState<"form" | "chat">("form");
    const [visitorName, setVisitorName] = useState("");
    const [visitorEmail, setVisitorEmail] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [startError, setStartError] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastSeenCount = useRef(0);
    const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Restore existing session from localStorage
    useEffect(() => {
        const storedSession = localStorage.getItem(STORAGE_KEY);
        const storedName = localStorage.getItem(VISITOR_NAME_KEY);
        if (storedSession && storedName) {
            setSessionId(storedSession);
            setVisitorName(storedName);
            setPhase("chat");
        }
    }, []);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/chat/messages?session_id=${id}`);
            if (!res.ok) return;
            const data = await res.json() as { messages: Message[]; session: Session };
            setMessages(data.messages || []);
            setSession(data.session);

            // Count unread admin messages when widget is closed
            if (!isOpen) {
                const adminMsgs = (data.messages || []).filter(m => m.sender === "admin");
                const newCount = Math.max(0, adminMsgs.length - lastSeenCount.current);
                setUnreadCount(newCount);
            }
        } catch { /* ignore */ }
    }, [isOpen]);

    // Poll for new messages when session is active
    useEffect(() => {
        if (!sessionId || phase !== "chat") return;

        fetchMessages(sessionId);
        pollInterval.current = setInterval(() => fetchMessages(sessionId), 3000);
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [sessionId, phase, fetchMessages]);

    // Scroll on new messages
    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    // Reset unread count when opening
    useEffect(() => {
        if (isOpen) {
            const adminMsgs = messages.filter(m => m.sender === "admin");
            lastSeenCount.current = adminMsgs.length;
            setUnreadCount(0);
        }
    }, [isOpen, messages]);

    const startChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visitorName.trim()) return;
        setIsStarting(true);
        setStartError("");
        try {
            const res = await fetch("/api/chat/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visitor_name: visitorName, visitor_email: visitorEmail }),
            });
            const data = await res.json() as { session_id: string; error?: string };
            if (data.session_id) {
                localStorage.setItem(STORAGE_KEY, data.session_id);
                localStorage.setItem(VISITOR_NAME_KEY, visitorName);
                setSessionId(data.session_id);
                setPhase("chat");
            } else {
                setStartError(data.error || "Could not start chat. Please try again.");
            }
        } catch {
            setStartError("Network error. Please check your connection.");
        } finally {
            setIsStarting(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !sessionId || isSending) return;
        const msg = input.trim();
        setInput("");
        setIsSending(true);
        try {
            await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, message: msg }),
            });
            await fetchMessages(sessionId);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const isClosed = session?.status === "closed";

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-[340px] sm:w-[380px] rounded-2xl border border-gray-200 dark:border-[#2d3748] bg-white dark:bg-[#1a2230] shadow-2xl flex flex-col overflow-hidden"
                        style={{ height: "480px" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#135bec] text-white">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="font-semibold text-sm">Support Chat</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/20 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Name capture form */}
                        {phase === "form" && (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                                <div className="text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#135bec]/10">
                                        <MessageCircle className="h-6 w-6 text-[#135bec]" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Start a conversation</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We typically reply within a few minutes</p>
                                </div>
                                <form onSubmit={startChat} className="w-full space-y-3">
                                    {startError && (
                                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                                            {startError}
                                        </div>
                                    )}
                                    <input
                                        value={visitorName}
                                        onChange={e => { setVisitorName(e.target.value); setStartError(""); }}
                                        placeholder="Your name *"
                                        required
                                        className="w-full rounded-lg border border-gray-200 dark:border-[#2d3748] bg-gray-50 dark:bg-[#101622] px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                                    />
                                    <input
                                        value={visitorEmail}
                                        onChange={e => setVisitorEmail(e.target.value)}
                                        placeholder="Email (optional)"
                                        type="email"
                                        className="w-full rounded-lg border border-gray-200 dark:border-[#2d3748] bg-gray-50 dark:bg-[#101622] px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isStarting}
                                        className="w-full rounded-lg bg-[#135bec] py-2.5 text-sm font-bold text-white hover:bg-[#0e45b5] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Chat →"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Chat messages */}
                        {phase === "chat" && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {/* Welcome message */}
                                    <div className="flex justify-start">
                                        <div className="max-w-[75%] rounded-2xl rounded-tl-none bg-gray-100 dark:bg-[#101622] px-3 py-2 text-sm text-gray-800 dark:text-gray-200">
                                            Hi {visitorName || session?.visitor_name}! 👋 How can we help you today?
                                        </div>
                                    </div>

                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.sender === "visitor"
                                                ? "bg-[#135bec] text-white rounded-tr-none"
                                                : "bg-gray-100 dark:bg-[#101622] text-gray-800 dark:text-gray-200 rounded-tl-none"
                                                }`}>
                                                {msg.message}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isClosed && (
                                        <div className="flex items-center justify-center gap-2 py-2">
                                            <CheckCircle className="h-4 w-4 text-gray-400" />
                                            <span className="text-xs text-gray-400">This chat has been closed</span>
                                        </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>

                                {/* Input */}
                                {!isClosed ? (
                                    <div className="border-t border-gray-100 dark:border-[#2d3748] p-3 flex gap-2">
                                        <textarea
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type a message..."
                                            rows={1}
                                            className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-[#2d3748] bg-gray-50 dark:bg-[#101622] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!input.trim() || isSending}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#135bec] text-white hover:bg-[#0e45b5] disabled:opacity-40 transition-colors"
                                        >
                                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-100 dark:border-[#2d3748] p-3 text-center">
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem(STORAGE_KEY);
                                                localStorage.removeItem(VISITOR_NAME_KEY);
                                                setSessionId(null);
                                                setSession(null);
                                                setMessages([]);
                                                setVisitorName("");
                                                setVisitorEmail("");
                                                setPhase("form");
                                            }}
                                            className="text-sm text-[#135bec] hover:underline"
                                        >
                                            Start a new chat
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#135bec] text-white shadow-lg shadow-[#135bec]/40 hover:bg-[#0e45b5] transition-colors"
                aria-label="Open chat"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <X className="h-6 w-6" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <MessageCircle className="h-6 w-6" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                    >
                        {unreadCount}
                    </motion.span>
                )}
            </motion.button>
        </div>
    );
}
