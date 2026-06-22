import InboxClient from '@/components/admin/InboxClient';

export const runtime = 'edge';

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Inbox</h2>
        <p className="text-sm text-slate-500 mt-1">Live visitor chats (AI bot + handoff) and contact-form messages.</p>
      </div>
      <InboxClient />
    </div>
  );
}
