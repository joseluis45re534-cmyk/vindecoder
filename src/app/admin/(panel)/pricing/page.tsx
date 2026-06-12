import PricingEditor from '@/components/admin/PricingEditor';

export const runtime = 'edge';

export default function AdminPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Pricing</h2>
        <p className="text-slate-500 text-sm mt-1">
          Edit plan names, prices, intervals, and features. Saved changes go live on the public{' '}
          <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">/pricing</code> page and in checkout.
        </p>
      </div>
      <PricingEditor />
    </div>
  );
}
