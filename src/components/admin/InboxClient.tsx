'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send, Headset, Mail, Database } from 'lucide-react';

interface ChatItem {
  id: string;
  visitor_id: string;
  status: string;
  created_at: string;
  last_message_at: string;
}
interface ContactItem {
  id: string;
  name: string | null;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}
interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  bot: 'bg-slate-100 text-slate-600',
  waiting: 'bg-amber-100 text-amber-700',
  live: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-400',
};

export default function InboxClient() {
  const [live, setLive] = useState(true);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [waiting, setWaiting] = useState(0);
  const [tab, setTab] = useState<'chats' | 'contacts'>('chats');
  const [selId, setSelId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionStatus, setSessionStatus] = useState('bot');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/chat');
      if (!res.ok) return;
      const d = (await res.json()) as { live: boolean; chats: ChatItem[]; contacts: ContactItem[]; waiting: number };
      setLive(d.live);
      setChats(d.chats || []);
      setContacts(d.contacts || []);
      setWaiting(d.waiting || 0);
    } catch {
      /* transient */
    }
  }, []);

  const loadThread = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/chat/${id}`);
      if (!res.ok) return;
      const d = (await res.json()) as { session: { status: string }; messages: Message[] };
      setMessages(d.messages || []);
      setSessionStatus(d.session?.status || 'bot');
    } catch {
      /* transient */
    }
  }, []);

  useEffect(() => {
    loadList();
    const i = setInterval(loadList, 5000);
    return () => clearInterval(i);
  }, [loadList]);

  useEffect(() => {
    if (!selId) return;
    loadThread(selId);
    const i = setInterval(() => loadThread(selId), 4000);
    return () => clearInterval(i);
  }, [selId, loadThread]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const sendReply = async () => {
    const content = reply.trim();
    if (!content || !selId || sending) return;
    setSending(true);
    setReply('');
    try {
      await fetch(`/api/admin/chat/${selId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      await loadThread(selId);
      await loadList();
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    if (!selId) return;
    await fetch(`/api/admin/chat/${selId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    await loadThread(selId);
    await loadList();
  };

  if (!live) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <span className="inline-flex w-12 h-12 rounded-xl bg-amber-50 text-amber-600 items-center justify-center mb-3">
          <Database className="w-6 h-6" aria-hidden="true" />
        </span>
        <h3 className="font-bold text-slate-900">Connect the database to use the inbox</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Live chat and contact messages are stored in D1. Provision and bind the <code>carvinlookup-db</code> database,
          run the migrations, then this inbox goes live.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab('chats')}
          className={`text-sm font-semibold px-3 py-1.5 rounded-full ${tab === 'chats' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Chats
          {waiting > 0 && <span className="ml-1.5 inline-flex items-center justify-center text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full px-1.5 py-0.5">{waiting} waiting</span>}
        </button>
        <button
          type="button"
          onClick={() => setTab('contacts')}
          className={`text-sm font-semibold px-3 py-1.5 rounded-full ${tab === 'contacts' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Contact messages
        </button>
      </div>

      {tab === 'contacts' ? (
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {contacts.length === 0 && <p className="p-6 text-sm text-slate-400">No contact messages yet.</p>}
          {contacts.map((c) => (
            <div key={c.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-slate-900 text-sm">{c.subject || '(no subject)'}</p>
                <a
                  href={`mailto:${c.email}?subject=${encodeURIComponent('Re: ' + (c.subject || 'your message'))}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" /> Reply by email
                </a>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{c.name ? `${c.name} · ` : ''}{c.email} · {c.created_at}</p>
              <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{c.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
          {/* Conversation list */}
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
            {chats.length === 0 && <p className="p-6 text-sm text-slate-400">No conversations yet.</p>}
            {chats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelId(c.id)}
                className={`w-full text-left p-4 hover:bg-slate-50 ${selId === c.id ? 'bg-slate-50' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-500 truncate">{c.visitor_id.slice(0, 10)}…</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[c.status] || 'bg-slate-100'}`}>{c.status}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{c.last_message_at}</p>
              </button>
            ))}
          </div>

          {/* Thread */}
          <div className="bg-white rounded-2xl border border-slate-100 flex flex-col min-h-[60vh] max-h-[70vh]">
            {!selId ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400">Select a conversation</div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[sessionStatus] || 'bg-slate-100'}`}>{sessionStatus}</span>
                  <button type="button" onClick={closeChat} className="text-xs text-slate-400 hover:text-slate-700">Close conversation</button>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {messages.map((m) => (
                    <Bubble key={m.id} role={m.role} content={m.content} />
                  ))}
                </div>
                <div className="border-t border-slate-100 p-3 flex items-center gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendReply(); } }}
                    placeholder="Type a reply to the visitor…"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white hover:brightness-110 disabled:opacity-50"
                    aria-label="Send reply"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ role, content }: { role: string; content: string }) {
  if (role === 'system') return <p className="text-center text-[11px] text-slate-400">{content}</p>;
  const isVisitor = role === 'user';
  const label = role === 'user' ? 'Visitor' : role === 'assistant' ? 'AI bot' : 'You';
  return (
    <div className={`flex ${isVisitor ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${isVisitor ? 'bg-white border border-slate-200 text-slate-700' : role === 'assistant' ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-primary text-white'}`}>
        <span className="block text-[10px] font-bold opacity-70 mb-0.5">{label}</span>
        {content}
      </div>
    </div>
  );
}
