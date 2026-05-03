import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';

const plans = [
  {
    name: 'City Starter',
    price: 'Rs. 99',
    unit: '/ride onward',
    description: 'Ideal for short daily city commutes.',
    features: ['Quick city pickup', 'Transparent meter fare', 'No surge surprises'],
    ctaPath: '/cityride',
    featured: false,
  },
  {
    name: 'Airport Comfort',
    price: 'Rs. 499',
    unit: '/trip onward',
    description: 'Reliable airport transfers with schedule tracking.',
    features: ['Flight-time friendly pickup', 'Luggage assistance', '24x7 availability'],
    ctaPath: '/airport',
    featured: true,
  },
  {
    name: 'Intercity Plus',
    price: 'Rs. 12',
    unit: '/km onward',
    description: 'Comfort-focused rides for long routes.',
    features: ['Experienced drivers', 'Route optimization', 'Flexible stoppage support'],
    ctaPath: '/intercityride',
    featured: false,
  },
];

export default function PublicPricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <SEO 
        title="Pricing & Packages" 
        description="Transparent and affordable pricing for electric cab rides. Check our local, airport and intercity fare details with no hidden charges."
        url="/pricing"
      />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <p className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/90 text-emerald-700 border border-emerald-200">
            <Sparkles size={14} /> Simple and fair pricing
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
            Pricing built for every travel need
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Choose city rides, airport transfers, or intercity travel with transparent cost and no hidden fees.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl border p-6 sm:p-7 shadow-md transition-transform hover:-translate-y-1 ${
                plan.featured
                  ? 'bg-gradient-to-b from-emerald-500 to-cyan-500 text-white border-emerald-300'
                  : 'bg-white/90 dark:bg-gray-900 dark:border-white/10 border-slate-200 text-slate-900 dark:text-white'
              }`}
            >
              {plan.featured && (
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide">
                  MOST POPULAR
                </span>
              )}

              <h2 className="mt-4 text-xl font-bold">{plan.name}</h2>
              <p className={`mt-2 text-sm ${plan.featured ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>
                {plan.description}
              </p>

              <div className="mt-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className={`ml-1 text-sm ${plan.featured ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                  {plan.unit}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check size={16} className={plan.featured ? 'text-white' : 'text-emerald-600'} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => navigate(plan.ctaPath)}
                className={`mt-7 w-full rounded-xl py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
                }`}
              >
                Book this plan
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
