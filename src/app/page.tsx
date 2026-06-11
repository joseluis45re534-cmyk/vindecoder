
import SearchForm from '@/components/SearchForm';
import { ShieldCheck, FileText, Lock, Gauge, AlertTriangle, BadgeDollarSign } from 'lucide-react';

export const runtime = 'edge';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            U.S. Vehicle History Reports
            <span className="block text-blue-600 mt-2">Instantly.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Don&apos;t risk buying a lemon. Get a comprehensive VIN report including title brands, salvage and flood damage, theft records, open liens, and odometer rollback — sourced from NMVTIS, NICB, and DMV records.
          </p>

          <SearchForm />

          <p className="mt-6 text-sm text-gray-400">
            Decode any 17-character VIN or U.S. license plate. Covers all 50 states.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="features-heading" className="sr-only">What your VIN report covers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Official NMVTIS Data</h3>
              <p className="text-gray-500">
                Title and brand history pulled from the National Motor Vehicle Title Information System and state DMVs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <FileText className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Report</h3>
              <p className="text-gray-500">
                Check for salvage and flood titles, theft records, open liens, accident history, and odometer readings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Lock className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure &amp; Instant</h3>
              <p className="text-gray-500">
                Reports are generated instantly and delivered securely to your device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="how-heading" className="text-3xl font-bold text-gray-900 text-center mb-12">
            How a VIN check works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
              <h3 className="font-bold text-gray-900 mb-2">Enter the VIN or plate</h3>
              <p className="text-gray-500 text-sm">Type the 17-character VIN or a U.S. license plate and state.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
              <h3 className="font-bold text-gray-900 mb-2">We pull the records</h3>
              <p className="text-gray-500 text-sm">We query NMVTIS, NICB theft data, and DMV title records in seconds.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
              <h3 className="font-bold text-gray-900 mb-2">Read your report</h3>
              <p className="text-gray-500 text-sm">Get a full vehicle history report you can use before you buy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="py-16 bg-gray-50" aria-labelledby="checks-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="checks-heading" className="text-3xl font-bold text-gray-900 text-center mb-12">
            What we check on every vehicle
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3 bg-white p-5 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-gray-900">Title brands</h3>
                <p className="text-gray-500 text-sm">Salvage, rebuilt, junk, and flood-damage titles across all 50 states.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white p-5 rounded-xl">
              <Gauge className="w-6 h-6 text-blue-500 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-gray-900">Odometer history</h3>
                <p className="text-gray-500 text-sm">Reported mileage readings and rollback or tampering alerts.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white p-5 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-gray-900">Theft records</h3>
                <p className="text-gray-500 text-sm">Active theft records reported to the NICB and law enforcement.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white p-5 rounded-xl">
              <BadgeDollarSign className="w-6 h-6 text-purple-500 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-gray-900">Open liens</h3>
                <p className="text-gray-500 text-sm">Outstanding loans or liens recorded against the vehicle.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — plain content (no FAQ schema; restricted to gov/health per Google) */}
      <section className="py-16 bg-white" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="text-3xl font-bold text-gray-900 text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">What is a VIN?</h3>
              <p className="text-gray-500">
                A Vehicle Identification Number is a unique 17-character code stamped on every car sold in the United States. It encodes the manufacturer, model year, and a serial number used to look up the vehicle&apos;s history.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Where do you get your data?</h3>
              <p className="text-gray-500">
                Reports combine records from the National Motor Vehicle Title Information System (NMVTIS), the National Insurance Crime Bureau (NICB), and state DMV title and registration databases.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I run a report with just a license plate?</h3>
              <p className="text-gray-500">
                Yes. Enter a U.S. license plate and we will resolve it to the VIN, then pull the full vehicle history report.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
