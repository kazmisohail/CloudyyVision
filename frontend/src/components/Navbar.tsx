"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Cloud, Menu } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleGetStarted = () => {
        if (pathname !== '/') {
            router.push('/#analysis-console');
        } else {
            const element = document.getElementById('analysis-console');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const isActive = (path: string) => pathname === path ? "text-cyan-400" : "text-gray-300 hover:text-cyan-400";

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-900/50 backdrop-blur-lg">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Cloud className="h-8 w-8 text-cyan-400" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                        CloudyyVision
                    </span>
                </Link>
                <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    <button
                        type="button"
                        onClick={handleGetStarted}
                        className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:outline-none focus:ring-cyan-800 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors"
                    >
                        Get Started
                    </button>
                    <button
                        data-collapse-toggle="navbar-sticky"
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                        aria-controls="navbar-sticky"
                        aria-expanded="false"
                    >
                        <span className="sr-only">Open main menu</span>
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
                <div
                    className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
                    id="navbar-sticky"
                >
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-700 rounded-lg bg-gray-800 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                        <li>
                            <Link
                                href="/"
                                className={`block py-2 px-3 rounded md:p-0 transition-colors ${isActive('/')}`}
                                aria-current={pathname === '/' ? "page" : undefined}
                            >
                                Analyzer
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/tech"
                                className={`block py-2 px-3 rounded md:p-0 transition-colors ${isActive('/tech')}`}
                            >
                                Technical Overview
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/team"
                                className={`block py-2 px-3 rounded md:p-0 transition-colors ${isActive('/team')}`}
                            >
                                Our Team
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
