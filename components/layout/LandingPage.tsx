"use client";

import {
  ShieldCheck, MessageSquare, CreditCard, Truck, Star,
  ArrowRight, Users, Package, TrendingUp, Zap, ChevronRight
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const STATS = [
  { value: "50K+", label: "Active Users" },
  { value: "120K+", label: "Listings Posted" },
  { value: "₦2.5B+", label: "In Transactions" },
  { value: "36", label: "States Covered" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create Your Account", desc: "Sign up free in seconds with your email or Google account. Choose to buy, sell, or both.", Icon: Users },
  { step: "02", title: "Post or Browse Ads", desc: "Sellers upload photos, set prices, and publish. Buyers search, filter, and discover deals.", Icon: Package },
  { step: "03", title: "Chat & Negotiate", desc: "Connect directly through in-app messaging. Agree on price and terms privately.", Icon: MessageSquare },
  { step: "04", title: "Pay & Get Delivered", desc: "Pay securely via Paystack with escrow protection. Arrange meetup or doorstep delivery.", Icon: Truck },
];

const FEATURES = [
  { Icon: ShieldCheck, title: "Verified Sellers", desc: "Trade with confidence. Sellers earn verified badges through successful transactions." },
  { Icon: MessageSquare, title: "In-App Chat", desc: "Message sellers directly. Negotiate prices, ask questions, arrange pickup — all in-app." },
  { Icon: CreditCard, title: "Secure Payments", desc: "Paystack-powered escrow. Your money is held safely until you confirm delivery." },
  { Icon: Truck, title: "Delivery Network", desc: "Can't pick up? Our logistics partners deliver to your doorstep across Nigeria." },
  { Icon: Star, title: "Ratings & Reviews", desc: "Rate every transaction. Build trust and help others find reliable traders." },
  { Icon: TrendingUp, title: "Boost Your Ads", desc: "Want faster sales? Promote your listing to reach thousands more buyers." },
];

const POPULAR_CATEGORIES = [
  { icon: "📱", name: "Phones & Tablets", count: "12,400+" },
  { icon: "🚗", name: "Vehicles", count: "3,200+" },
  { icon: "💻", name: "Computing", count: "5,800+" },
  { icon: "👗", name: "Fashion", count: "18,600+" },
  { icon: "🏠", name: "Property", count: "2,100+" },
  { icon: "📺", name: "Electronics", count: "8,900+" },
  { icon: "🔧", name: "Services", count: "4,300+" },
  { icon: "🚜", name: "Agriculture", count: "1,700+" },
  { icon: "💄", name: "Health & Beauty", count: "6,200+" },
  { icon: "🍔", name: "Food & Drinks", count: "4,100+" },
  { icon: "📚", name: "Books & Education", count: "3,800+" },
  { icon: "🎵", name: "Music & Instruments", count: "1,200+" },
];

const TESTIMONIALS = [
  { name: "Chinedu O.", location: "Lagos", text: "Sold my old MacBook in 3 hours! The chat feature made negotiation so easy. Best marketplace in Nigeria.", avatar: "C" },
  { name: "Amina B.", location: "Abuja", text: "Found a great deal on a Toyota Camry. The verified seller badge and escrow payment gave me peace of mind.", avatar: "A" },
  { name: "Tunde A.", location: "Ibadan", text: "I've made over ₦2M selling electronics here. The platform is smooth and buyers are serious.", avatar: "T" },
];

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ─────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-yellow to-brand-blue rounded-[10px] flex items-center justify-center text-white text-lg font-extrabold font-display">Q</div>
            <span className="font-display font-extrabold text-xl text-gray-900">Quick Sales Hub</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#categories" className="hover:text-gray-900 transition-colors">Categories</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Why Choose Us</a>
            <a href="#stories" className="hover:text-gray-900 transition-colors">Stories</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Log In</button>
            <button onClick={onGetStarted} className="px-5 py-2.5 bg-brand-yellow text-gray-900 rounded-xl font-display font-bold text-sm hover:bg-brand-yellow-dark transition-all hover:-translate-y-0.5 hover:shadow-md">Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute -top-[40%] -right-[10%] w-1/2 h-[180%] bg-brand-yellow rounded-[60px] rotate-[-15deg] opacity-[0.12]" />
        <div className="absolute -bottom-[30%] right-[10%] w-[25%] h-[140%] bg-brand-yellow rounded-[40px] rotate-[-20deg] opacity-[0.06]" />

        <div className="max-w-[1200px] mx-auto px-5 py-20 md:py-28 relative z-10">
          <div className="max-w-[640px]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
              <Zap size={14} /> Nigeria&apos;s #1 Peer-to-Peer Marketplace
            </div>
            <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-white leading-[1.1] mb-5">
              Buy & Sell{" "}
              <span className="text-brand-yellow">Anything</span>
              <br />In Minutes.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-[500px]">
              Post. Sell. Deliver. Join thousands of Nigerians buying and selling everything from phones to cars, fashion to property — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onGetStarted} className="px-8 py-4 bg-brand-yellow text-gray-900 rounded-xl font-display font-bold text-base hover:bg-brand-yellow-dark transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(255,184,0,0.4)] flex items-center justify-center gap-2">
                Start Selling — It&apos;s Free <ArrowRight size={18} />
              </button>
              <button onClick={onLogin} className="px-8 py-4 bg-white/15 text-white rounded-xl font-display font-bold text-base hover:bg-white/25 transition-all backdrop-blur-sm border border-white/20">
                Browse Listings
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-[1200px] mx-auto px-5 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-sm text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────── */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg max-w-[500px] mx-auto">Four simple steps to buy or sell anything on Quick Sales Hub</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.Icon size={28} className="text-white" />
                </div>
                <div className="font-display text-sm font-bold text-brand-yellow mb-2">STEP {item.step}</div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────── */}
      <section id="categories" className="py-20">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Browse Categories</h2>
            <p className="text-gray-500 text-lg max-w-[500px] mx-auto">Find exactly what you&apos;re looking for across dozens of categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {POPULAR_CATEGORIES.map((cat) => (
              <div key={cat.name} onClick={onGetStarted} className="bg-white border border-gray-200 rounded-2xl p-5 text-center cursor-pointer transition-all hover:border-brand-blue hover:shadow-md hover:-translate-y-1 group">
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h4 className="font-display font-bold text-sm text-gray-900 mb-1 group-hover:text-brand-blue transition-colors">{cat.name}</h4>
                <p className="text-xs text-gray-400">{cat.count} ads</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={onGetStarted} className="inline-flex items-center gap-2 text-brand-blue font-display font-bold text-sm hover:underline">
              View All Categories <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────── */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Why Choose Quick Sales Hub?</h2>
            <p className="text-gray-500 text-lg max-w-[500px] mx-auto">Built for the Nigerian market with safety, speed, and simplicity in mind</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-7 border border-gray-200 hover:border-brand-blue/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-brand-blue-bg rounded-xl flex items-center justify-center mb-4">
                  <f.Icon size={24} className="text-brand-blue" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────── */}
      <section id="stories" className="py-20">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">What People Are Saying</h2>
            <p className="text-gray-500 text-lg max-w-[500px] mx-auto">Real stories from real users across Nigeria</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} fill="#FFB800" className="text-brand-yellow" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <div className="font-display font-bold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="hero-gradient rounded-3xl px-8 md:px-16 py-16 text-center relative overflow-hidden">
            <div className="absolute -top-[40%] -right-[15%] w-[40%] h-[200%] bg-brand-yellow rounded-[50px] rotate-[-15deg] opacity-[0.1]" />
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10">Ready to Start Trading?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-[450px] mx-auto relative z-10">Join thousands of Nigerians already buying and selling on Quick Sales Hub. It&apos;s completely free to get started.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <button onClick={onGetStarted} className="px-8 py-4 bg-brand-yellow text-gray-900 rounded-xl font-display font-bold text-base hover:bg-brand-yellow-dark transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Create Free Account <ArrowRight size={18} />
              </button>
              <button onClick={onLogin} className="px-8 py-4 bg-white/15 text-white rounded-xl font-display font-bold text-base hover:bg-white/25 transition-all border border-white/20">
                Log In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────── */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-yellow to-brand-blue rounded-lg flex items-center justify-center text-white text-sm font-extrabold font-display">Q</div>
                <span className="font-display font-bold text-base">Quick Sales Hub</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Nigeria&apos;s fastest growing peer-to-peer marketplace. Post. Sell. Deliver.</p>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm mb-3">Company</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">About Us</a>
                <a href="#" className="hover:text-white transition-colors">Careers</a>
                <a href="#" className="hover:text-white transition-colors">Press</a>
                <a href="#" className="hover:text-white transition-colors">Blog</a>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm mb-3">Support</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Help Center</a>
                <a href="#" className="hover:text-white transition-colors">Safety Tips</a>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="hover:text-white transition-colors">Report a Problem</a>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm mb-3">Legal</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                <a href="#" className="hover:text-white transition-colors">Escrow Policy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; 2026 Quick Sales Hub. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">Instagram</a>
              <a href="#" className="hover:text-white">Facebook</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
