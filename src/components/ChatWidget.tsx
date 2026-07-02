'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Headset } from 'lucide-react';

type Role = 'user' | 'assistant' | 'agent' | 'system';
interface Msg {
  id?: string;
  role: Role;
  content: string;
}

const LS_VISITOR = 'cvl_chat_visitor';
const LS_SESSION = 'cvl_chat_session';
const GREETING = "Hi! I'm the CarVinLookup assistant. Ask me about VIN checks, what a report covers, pricing, or your account.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'bot' | 'waiting' | 'live' | 'closed'>('bot');
  const [persisted, setPersisted] = useState(false);
  const [note, setNote] = useState('');
  const visitorId = useRef('');
  const sessionId = useRef('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let v = localStorage.getItem(LS_VISITOR);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(LS_VISITOR, v);
    }
    visitorId.current = v;
    sessionId.current = localStorage.getItem(LS_SESSION) || '';
  }, []);

  // Let any "Chat with us" button on the site open the widget.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('cvl:open-chat', handler);
    return () => window.removeEventListener('cvl:open-chat', handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const persistSession = (sid: string) => {
    sessionId.current = sid;
    localStorage.setItem(LS_SESSION, sid);
  };

  const poll = useCallback(async () => {
    if (!sessionId.current) return;
    try {
      const res = await fetch(
        `/api/chat/poll?sessionId=${encodeURIComponent(sessionId.current)}&visitorId=${encodeURIComponent(visitorId.current)}`,
      );
      const data = (await res.json()) as { persisted?: boolean; status?: typeof status; messages?: Msg[] };
      if (data.persisted) {
        setPersisted(true);
        if (data.status) setStatus(data.status);
        if (Array.isArray(data.messages) && data.messages.length) setMessages(data.messages);
      }
    } catch {
      /* transient — try again next tick */
    }
  }, []);

  // When opened with an existing session, hydrate + poll for agent replies.
  useEffect(() => {
    if (!open) return;
    if (sessionId.current) poll();
  }, [open, poll]);

  useEffect(() => {
    if (!open || !persisted) return;
    const id = setInterval(poll, 4000);
    return () => clearInterval(id);
  }, [open, persisted, poll]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setNote('');
    setSending(true);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: 'user', content: text }]);
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current || undefined, visitorId: visitorId.current, text, history }),
      });
      const data = (await res.json()) as { sessionId?: string; persisted?: boolean; status?: typeof status; reply?: string | null };
      if (data.sessionId) persistSession(data.sessionId);
      if (data.persisted) setPersisted(true);
      if (data.status) setStatus(data.status);
      if (data.reply) setMessages((m) => [...m, { role: 'assistant', content: data.reply as string }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network error — please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const requestHuman = async () => {
    setNote('');
    try {
      const res = await fetch('/api/chat/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current || undefined, visitorId: visitorId.current }),
      });
      if (res.status === 503) {
        setNote("Live agents aren't available right now — please use the contact page and we'll reply by email.");
        return;
      }
      const data = (await res.json()) as { ok?: boolean; sessionId?: string };
      if (data.ok) {
        if (data.sessionId) persistSession(data.sessionId);
        setPersisted(true);
        setStatus('waiting');
        setMessages((m) => [...m, { role: 'system', content: "You're in line for a human agent — someone will reply here shortly." }]);
      } else {
        setNote('Could not reach the team right now.');
      }
    } catch {
      setNote('Could not reach the team right now.');
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const canHandoff = status === 'bot';

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open support chat"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition lg:bottom-6 lg:right-6"
        >
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[370px]">
          <div className="flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden h-[70vh] sm:h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold">CarVinLookup support</p>
                  <p className="text-[11px] text-slate-300">
                    {status === 'waiting' ? 'Connecting you to a human…' : status === 'live' ? 'Chatting with the team' : 'AI assistant · usually instant'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-slate-50">
              <Bubble role="assistant" content={GREETING} />
              {messages.map((m, i) => (
                <Bubble key={m.id || i} role={m.role} content={m.content} />
              ))}
              {sending && (
                <div className="flex items-center gap-1.5 text-slate-400 text-xs px-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> typing…
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-3 bg-white shrink-0">
              {note && <p className="text-[11px] text-slate-500 mb-2">{note}</p>}
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Type your message…"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Message"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !input.trim()}
                  aria-label="Send"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white hover:brightness-110 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              {canHandoff && (
                <button
                  type="button"
                  onClick={requestHuman}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Headset className="w-3.5 h-3.5" aria-hidden="true" /> Talk to a human
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }: { role: Role; content: string }) {
  if (role === 'system') {
    return <p className="text-center text-[11px] text-slate-400 px-4">{content}</p>;
  }
  const isUser = role === 'user';
  const isAgent = role === 'agent';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-primary text-white rounded-br-sm'
            : isAgent
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-bl-sm'
              : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
        }`}
      >
        {isAgent && <span className="block text-[10px] font-bold text-emerald-600 mb-0.5">Support team</span>}
        {content}
      </div>
    </div>
  );
}
