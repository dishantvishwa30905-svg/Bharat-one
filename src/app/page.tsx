'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import {
  Search, CheckCircle, Shield, Globe, ChevronDown, ChevronUp,
  GraduationCap, Wheat, Heart, Home, Briefcase, Baby,
  Users, Zap, Star, ArrowRight, Menu, X, ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Education', icon: GraduationCap, color: 'bg-purple-100 text-purple-700' },
  { name: 'Agriculture', icon: Wheat, color: 'bg-green-100 text-green-700' },
  { name: 'Healthcare', icon: Heart, color: 'bg-red-100 text-red-700' },
  { name: 'Housing', icon: Home, color: 'bg-orange-100 text-orange-700' },
  { name: 'Employment', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
  { name: 'Women & Child', icon: Baby, color: 'bg-pink-100 text-pink-700' },
  { name: 'Social Security', icon: Shield, color: 'bg-slate-100 text-slate-700' },
  { name: 'Skill Development', icon: Zap, color: 'bg-teal-100 text-teal-700' },
];

const STATS = [
  { label: 'Government Schemes', value: '1,000+' },
  { label: 'States & UTs Covered', value: '28+' },
  { label: 'Scheme Categories', value: '18' },
  { label: 'Always Free', value: '100%' },
];

const FAQS = [
  { q: 'Is Bharat One an official government website?', a: 'No. Bharat One is an independent informational platform. We aggregate scheme information from official government sources, but we are not affiliated with any government body. Always verify details on the official scheme portal before applying.' },
  { q: 'How does eligibility checking work?', a: 'When you complete your profile (age, income, location, etc.), our rule-based eligibility engine compares your profile against each scheme\'s criteria and shows you a match percentage with detailed reasons.' },
  { q: 'Is my personal information safe?', a: 'We take your privacy seriously. Your profile data is stored securely and is only used for scheme matching. We do not share your data with any third party. You can delete your account at any time.' },
  { q: 'Is this service free?', a: 'Yes, Bharat One is completely free for all users. We believe every citizen deserves easy access to government scheme information.' },
  { q: 'Do I need to create an account to search schemes?', a: 'You can browse and search schemes without an account. However, to get personalized eligibility matching and save schemes, you will need to register (for free).' },
  { q: 'How accurate is the eligibility information?', a: 'We verify scheme information from official government sources. However, final eligibility and approval are always determined by the respective government authority. The match score is indicative only.' },
];

export default function HomePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/schemes?limit=3')
      .then(r => r.json())
      .then(d => setSchemes(d.schemes || []));
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo variant="full" />

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-navy transition-colors">Home</Link>
              <Link href="/schemes" className="hover:text-navy transition-colors">Schemes</Link>
              <Link href="/dashboard" className="hover:text-navy transition-colors">Check Eligibility</Link>
              <Link href="#how-it-works" className="hover:text-navy transition-colors">How It Works</Link>
              <Link href="#about" className="hover:text-navy transition-colors">About</Link>
              <Link href="/help" className="hover:text-navy transition-colors">Help</Link>
            </nav>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language */}
              <select
                value={lang}
                onChange={e => { setLang(e.target.value); }}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-saffron/30"
              >
                <option value="en">🇮🇳 English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>

              {user ? (
                <Link href="/dashboard" className="btn-primary text-sm px-5 py-2">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-navy font-semibold text-sm hover:text-saffron transition-colors">Login</Link>
                  <Link href="/register" className="btn-primary text-sm px-5 py-2">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="lg:hidden p-2 text-gray-500" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {navOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
            {['/', '/schemes', '/dashboard', '/help'].map((href, i) => (
              <Link key={href} href={href} onClick={() => setNavOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-navy">
                {['Home', 'Schemes', 'Check Eligibility', 'Help'][i]}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <Link href="/login" className="flex-1 text-center text-sm font-medium py-2 border border-navy rounded-lg text-navy">Login</Link>
              <Link href="/register" className="flex-1 text-center text-sm font-semibold py-2 bg-saffron rounded-lg text-white">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Tricolor stripe */}
      <div className="tricolor-stripe" />

      {/* ── HERO ── */}
      <section className="bg-navy relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 border-2 border-white rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
                🇮🇳 Serving 140 Crore Indians
              </div>
              <h1 className="font-jakarta text-4xl lg:text-5xl font-900 text-white leading-tight mb-6" style={{ fontWeight: 900 }}>
                Find Government Schemes{' '}
                <span className="text-saffron">You May Be Eligible For</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
                Discover benefits, check indicative eligibility and find official application information — all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={user ? '/dashboard' : '/register'} className="btn-primary text-base px-8 py-3.5">
                  Check My Eligibility <ArrowRight size={18} />
                </Link>
                <Link href="/schemes" className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white hover:text-navy transition-all duration-200 inline-flex items-center gap-2">
                  Explore Schemes
                </Link>
              </div>
              <p className="text-gray-400 text-xs mt-6 flex items-center gap-1.5">
                <Shield size={12} />
                Bharat One is an independent platform, not an official government website.
              </p>
            </div>

            {/* Stats / Dashboard Preview */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {STATS.map(({ label, value }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-jakarta font-900 text-saffron mb-1" style={{ fontWeight: 900 }}>{value}</div>
                  <div className="text-gray-300 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-jakarta text-3xl font-bold text-navy mb-4">How Bharat One Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Three simple steps to discover and track all schemes you may qualify for.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Complete Your Profile', desc: 'Fill in your basic demographic and economic details — age, income, state, occupation and more.', icon: Users, color: 'bg-saffron-50 text-saffron' },
              { step: '02', title: 'Match Schemes Instantly', desc: 'Our rule-based eligibility engine evaluates thousands of criteria and shows you your top matches with detailed reasons.', icon: CheckCircle, color: 'bg-indiaGreen-50 text-indiaGreen' },
              { step: '03', title: 'Apply Securely', desc: 'Use our document checklist and direct links to apply on the official government portals safely.', icon: ExternalLink, color: 'bg-blue-50 text-blue-600' },
            ].map(({ step, title, desc, icon: Icon, color }) => (
              <div key={step} className="card text-center">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={24} />
                </div>
                <div className="text-4xl font-jakarta font-900 text-gray-100 mb-3 -mt-1" style={{ fontWeight: 900 }}>{step}</div>
                <h3 className="font-jakarta font-bold text-navy text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-jakarta text-3xl font-bold text-navy mb-4">Popular Categories</h2>
            <p className="text-gray-500">Browse schemes across all major categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ name, icon: Icon, color }) => (
              <Link
                key={name}
                href={`/schemes?category=${encodeURIComponent(name)}`}
                className="card card-hover flex flex-col items-center gap-3 py-6 text-center cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon size={22} />
                </div>
                <span className="text-sm font-semibold text-navy">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR SCHEMES ── */}
      {schemes.length > 0 && (
        <section className="py-20 bg-[#F4F6F8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-jakarta text-3xl font-bold text-navy mb-2">Popular Schemes</h2>
                <p className="text-gray-500">Widely accessed government programmes</p>
              </div>
              <Link href="/schemes" className="text-saffron font-semibold text-sm hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {schemes.map((scheme: any) => (
                <div key={scheme.id} className="card card-hover">
                  <span className="badge bg-indiaGreen-50 text-indiaGreen mb-3">{scheme.category}</span>
                  <h3 className="font-jakarta font-bold text-navy text-base leading-snug mb-2">{scheme.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{scheme.description}</p>
                  <div className="flex gap-2">
                    <Link href={`/schemes/${scheme.id}`} className="flex-1 text-center text-sm font-medium py-2 border border-navy/20 rounded-xl text-navy hover:bg-navy hover:text-white transition-all">Details</Link>
                    <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-sm font-semibold py-2 bg-saffron text-white rounded-xl hover:bg-saffron-600 transition-all">Apply</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STATS BAR ── */}
      <section className="py-16 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map(({ label, value }) => (
              <div key={label}>
                <div className="text-4xl font-jakarta font-900 text-saffron mb-2" style={{ fontWeight: 900 }}>{value}</div>
                <div className="text-gray-300 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-indiaGreen-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-indiaGreen" />
          </div>
          <h2 className="font-jakarta text-3xl font-bold text-navy mb-4">Independent, Transparent & Reliable</h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-6">
            Bharat One aggregates scheme information from official government sources and verifies them regularly.
            We are not affiliated with any government body. Our goal is to make scheme discovery simple and accessible for every Indian citizen.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left max-w-2xl mx-auto">
            <p className="text-amber-800 text-sm leading-relaxed">
              ⚠️ <strong>Important Disclaimer:</strong> Bharat One is an independent informational platform and is not an official government website.
              Final eligibility and approval are determined by the respective government authority.
              Always verify information on official portals before applying.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-jakarta text-3xl font-bold text-navy mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card">
                <button
                  className="w-full flex items-center justify-between gap-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-navy text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-saffron flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <p className="mt-4 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-jakarta text-3xl font-bold text-white mb-4">Ready to Find Your Benefits?</h2>
          <p className="text-gray-300 mb-8">Create a free account, complete your profile, and discover schemes you may be eligible for.</p>
          <Link href="/register" className="btn-primary text-base px-10 py-4">
            Get Started for Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0A1628] text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo variant="white" className="mb-4" />
              <p className="text-xs leading-relaxed">An independent platform helping Indian citizens discover government schemes and their benefits.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/schemes" className="hover:text-white transition-colors">Browse Schemes</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Check Eligibility</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Categories</h4>
              <ul className="space-y-2 text-xs">
                {['Education', 'Healthcare', 'Agriculture', 'Housing', 'Employment'].map(c => (
                  <li key={c}><Link href={`/schemes?category=${c}`} className="hover:text-white transition-colors">{c}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><span className="hover:text-white cursor-default">Privacy Policy</span></li>
                <li><span className="hover:text-white cursor-default">Terms of Use</span></li>
                <li><span className="hover:text-white cursor-default">Disclaimer</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-xs">
            <p className="mb-2">Bharat One is an independent informational platform and is NOT an official government website.</p>
            <p>© 2026 Bharat One. All rights reserved. | Made with ❤️ for 🇮🇳 Bharat</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
