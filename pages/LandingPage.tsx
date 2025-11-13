import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md transition-transform hover:scale-105 hover:shadow-indigo-500/10">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            {icon}
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400">{children}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; company: string; }> = ({ quote, author, company }) => (
    <figure className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md">
        <blockquote className="text-slate-600 dark:text-slate-300">
            <p>“{quote}”</p>
        </blockquote>
        <figcaption className="mt-4 flex items-center gap-x-4">
            <img className="h-10 w-10 rounded-full bg-slate-200" src={`https://i.pravatar.cc/100?u=${author}`} alt="" />
            <div>
                <div className="font-semibold text-slate-900 dark:text-white">{author}</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">{company}</div>
            </div>
        </figcaption>
    </figure>
);

const LandingPage: React.FC = () => {
    const Icon: React.FC<{ path: string }> = ({ path }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="text-center py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                        The All-in-One POS to Run &amp; <span className="text-indigo-600 dark:text-indigo-400">Grow Your Business</span>
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-500 dark:text-slate-400">
                        Go beyond transactions. TranscendPOS combines fast, reliable checkout with powerful inventory management, customer tracking, and AI-driven insights to help you make smarter decisions and increase profits.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link
                            to="/demo"
                            className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Explore Live Demo
                        </Link>
                        <Link
                            to="/login"
                            className="inline-block rounded-md px-6 py-3 text-lg font-semibold leading-6 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Sign In &rarr;
                        </Link>
                    </div>
                    <div className="mt-16 -mb-32">
                        <svg viewBox="0 0 1200 400" className="w-full max-w-5xl mx-auto drop-shadow-2xl">
                          <defs>
                            <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#4f46e5" />
                              <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                            <clipPath id="hero-clip">
                                <rect x="0" y="0" width="1200" height="400" rx="20" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#hero-clip)">
                            <rect x="0" y="0" width="1200" height="400" fill="url(#hero-gradient)" fillOpacity="0.1" />
                            <rect x="0" y="0" width="300" height="400" fill="white" className="dark:fill-slate-800" />
                            <rect x="20" y="20" width="260" height="40" rx="8" fill="rgba(199, 210, 254, 0.5)" className="dark:fill-indigo-900/50" />
                            <rect x="340" y="20" width="840" height="40" rx="8" fill="white" className="dark:fill-slate-800" />
                            <rect x="20" y="80" width="120" height="20" rx="5" fill="rgba(224, 231, 255, 1)" className="dark:fill-slate-700" />
                            <rect x="20" y="120" width="260" height="260" rx="8" fill="rgba(224, 231, 255, 1)" className="dark:fill-slate-700" />
                            <rect x="340" y="80" width="410" height="150" rx="8" fill="white" className="dark:fill-slate-800" />
                            <rect x="770" y="80" width="410" height="150" rx="8" fill="white" className="dark:fill-slate-800" />
                            <polyline points="360,200 450,150 540,180 630,120" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
                            <rect x="340" y="250" width="840" height="130" rx="8" fill="white" className="dark:fill-slate-800" />
                            <circle cx="800" cy="155" r="30" fill="rgba(167, 139, 250, 0.2)" />
                            <circle cx="800" cy="155" r="20" fill="rgba(167, 139, 250, 0.4)" />
                            <circle cx="800" cy="155" r="10" fill="rgba(167, 139, 250, 1)" />
                          </g>
                        </svg>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900 pt-48">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">A Smarter Way to Run Your Business</h2>
                        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">TranscendPOS is packed with powerful tools to save you time and boost your bottom line.</p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard title="Intuitive POS" icon={<Icon path="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />}>
                            A fast, user-friendly point of sale that works online and offline. Never miss a sale, even when the internet is down.
                        </FeatureCard>
                        <FeatureCard title="Inventory Control" icon={<Icon path="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />}>
                           Manage stock across locations, handle purchase orders, and get automatic low-stock alerts.
                        </FeatureCard>
                        <FeatureCard title="AI Business Analyst" icon={<Icon path="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}>
                            Turn your sales data into actionable advice. Get AI-powered suggestions on pricing, promotions, and inventory.
                        </FeatureCard>
                         <FeatureCard title="Customer Management" icon={<Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}>
                            Build customer loyalty by tracking purchase history and creating customer groups for targeted discounts.
                        </FeatureCard>
                    </div>
                </div>
            </section>
            
             {/* Testimonials Section */}
            <section className="py-20 md:py-28">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Loved by Businesses Like Yours</h2>
                        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Don't just take our word for it. Here's what our customers say.</p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TestimonialCard author="Sarah L." company="Owner, The Cozy Cafe" quote="The AI insights are a game-changer. It suggested a 'coffee & pastry' combo that increased our average order value by 15%." />
                        <TestimonialCard author="Mike R." company="Manager, Urban Bloom Boutique" quote="Managing inventory across our two locations used to be a nightmare. TranscendPOS made it simple and saved us hours every week." />
                        <TestimonialCard author="Fatima A." company="Founder, Artisan Gifts" quote="As a small business, I need tools that are powerful but easy to use. TranscendPOS is exactly that. The offline mode is a lifesaver during busy market days." />
                    </div>
                </div>
            </section>
            
            {/* Final CTA */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Ready to Transform Your Business?</h2>
                    <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                        Explore the full power of TranscendPOS with our live demo. No signup required.
                    </p>
                    <div className="mt-8">
                        <Link
                            to="/demo"
                            className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigo-500"
                        >
                            Explore Live Demo
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
