"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LogIn, Menu, X, ChevronDown, User, ShoppingBag, Trophy, Home, History, Users, Newspaper, BarChart3, Calendar } from "lucide-react";

// Translations dictionary
const translations = {
    en: {
        nav: ["Home", "History", "Trophies", "Team", "Academy", "News", "Matches", "Shop", "Contact"],
    },
    fr: {
        nav: ["Accueil", "Histoire", "Trophées", "Équipe", "Académie", "Actualités", "Matchs", "Boutique", "Contact"],
    },
    ar: {
        nav: ["الرئيسية", "التاريخ", "الألقاب", "الفريق", "الأكاديمية", "الأخبار", "المباريات", "المغازة", "اتصل بنا"],
    },
};

// Icon mapping
const navIcons: Record<string, React.ReactNode> = {
    Home: <Home size={15} />,
    History: <History size={15} />,
    Trophies: <Trophy size={15} />,
    Team: <Users size={15} />,
    Academy: <Users size={15} />,
    News: <Newspaper size={15} />,
    Standings: <BarChart3 size={15} />,
    Matches: <Calendar size={15} />,
    Shop: <ShoppingBag size={15} />,
    Contact: <User size={15} />,
};

interface NavigationProps {
    theme: string;
    setTheme: (t: string) => void;
    language: "en" | "fr" | "ar";
    setLanguage: (l: "en" | "fr" | "ar") => void;
    setIsSearchOpen: (v: boolean) => void;
    setIsAuthOpen: (v: boolean) => void;
    user: any;
    points: number;
    onLogout?: () => void;
}

export default function Navigation({
    theme,
    setTheme,
    language,
    setLanguage,
    setIsSearchOpen,
    setIsAuthOpen,
    user,
    points,
    onLogout,
}: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const langMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = translations[language].nav;

    const languages = [
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "fr", name: "Français", flag: "🇫🇷" },
        { code: "ar", name: "العربية", flag: "🇹🇳" },
    ];

    const handleLangMenuMouseEnter = () => {
        if (langMenuTimeoutRef.current) {
            clearTimeout(langMenuTimeoutRef.current);
        }
        setShowLangMenu(true);
    };

    const handleLangMenuMouseLeave = () => {
        langMenuTimeoutRef.current = setTimeout(() => {
            setShowLangMenu(false);
        }, 800);
    };

    // Nav items — labels derived from navItems array (all 3 languages share the same 9-item structure)
    const navItemsConfig = [
        { id: "home",     label: navItems[0], href: "#home",     icon: "Home" },
        { id: "history",  label: navItems[1], href: "#history",  icon: "History" },
        { id: "trophies", label: navItems[2], href: "#trophies", icon: "Trophies" },
        { id: "team",     label: navItems[3], href: "#team",     icon: "Team" },
        { id: "academy",  label: navItems[4], href: "#academy",  icon: "Academy" },
        { id: "news",     label: navItems[5], href: "#news",     icon: "News" },
        { id: "matches",  label: navItems[6], href: "#matches",  icon: "Matches" },
        { id: "shop",     label: navItems[7], href: "#shop",     icon: "Shop" },
        { id: "contact",  label: navItems[8], href: "#contact",  icon: "Contact" },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-[var(--background)]/95 backdrop-blur-xl shadow-2xl shadow-black/20 py-2"
                : "bg-[var(--background)]/80 backdrop-blur-md py-3"
                }`}
        >
            {/* Decorative gradient line at top */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--primary)] via-red-500 to-[var(--primary)] ${scrolled ? 'opacity-100' : 'opacity-80'}`} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
                    {/* Logo */}
                    <motion.a
                        href="#home"
                        className="flex items-center gap-3 group"
                    >
                        <div className={`relative ${scrolled ? 'w-12 h-12' : 'w-14 h-14'} transition-all duration-300`}>
                            <Image
                                src="/ca.png"
                                alt="Club Africain"
                                fill
                                className="object-contain drop-shadow-lg"
                            />
                        </div>
                        <div className="hidden xl:block">
                            <span className={`${scrolled ? 'text-lg' : 'text-xl'} font-black tracking-wider text-[var(--foreground)] uppercase flex flex-col leading-none`}>
                                <span>Club</span>
                                <span className="text-[var(--primary)]">Africain</span>
                            </span>
                        </div>
                    </motion.a>

                    {/* Desktop Navigation - Bigger, Bolder, Static */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItemsConfig.map((item, index) => (
                            <motion.a
                                key={item.id}
                                href={item.href}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative px-5 py-3 text-base font-bold text-[var(--foreground)] hover:text-white transition-colors rounded-lg"
                            >
                                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                                    <span className="opacity-80">
                                        {navIcons[item.label] || navIcons[Object.keys(navIcons)[index]]}
                                    </span>
                                    <span>{item.label}</span>
                                </span>

                                {/* Static background on hover - no movement */}
                                <div className="absolute inset-0 bg-[var(--primary)] rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200" />

                                {/* Bottom border indicator */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-[var(--primary)] rounded-full hover:w-full transition-all duration-200" />
                            </motion.a>
                        ))}
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-3">
                        {/* Search Button */}
                        <motion.button
                            onClick={() => setIsSearchOpen(true)}
                            className={`${scrolled ? 'w-10 h-10' : 'w-11 h-11'} flex items-center justify-center rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--primary)] text-[var(--foreground)]/70 hover:text-white transition-colors border border-[var(--foreground)]/10 hover:border-[var(--primary)]`}
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </motion.button>

                        {/* Theme Toggle */}
                        <div className="relative">
                            <label className="theme-switch theme-switch--compact inline-block cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="theme-switch__checkbox"
                                    checked={theme === "light"}
                                    onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                                />
                                <div className="theme-switch__container">
                                    <div className="theme-switch__circle-container">
                                        <div className="theme-switch__sun-moon-container">
                                            <div className="theme-switch__moon">
                                                <div className="theme-switch__spot"></div>
                                                <div className="theme-switch__spot"></div>
                                                <div className="theme-switch__spot"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Language Switcher */}
                        <div
                            className="relative"
                            onMouseEnter={handleLangMenuMouseEnter}
                            onMouseLeave={handleLangMenuMouseLeave}
                        >
                            <motion.button
                                className={`flex items-center gap-2 px-3 py-2 bg-[var(--foreground)]/5 hover:bg-[var(--primary)]/10 rounded-lg border border-[var(--foreground)]/10 hover:border-[var(--primary)]/30 transition-colors`}
                            >
                                <div className="relative w-6 h-6">
                                    <Image
                                        src={`/${language === "en" ? "uk" : language === "fr" ? "fr" : "tn"}.png`}
                                        alt={language === "en" ? "English" : language === "fr" ? "Français" : "العربية"}
                                        fill
                                        className="object-cover rounded-sm"
                                    />
                                </div>
                                <span className="text-sm font-semibold text-[var(--foreground)] hidden sm:inline">{language.toUpperCase()}</span>
                                <ChevronDown
                                    size={16}
                                    className={`text-[var(--foreground)]/60 transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`}
                                />
                            </motion.button>

                            <AnimatePresence>
                                {showLangMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 bg-[var(--background)]/95 backdrop-blur-xl border border-[var(--foreground)]/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden z-50"
                                        onMouseEnter={handleLangMenuMouseEnter}
                                        onMouseLeave={handleLangMenuMouseLeave}
                                    >
                                        <div className="p-1">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        setLanguage(lang.code as "en" | "fr" | "ar");
                                                        setShowLangMenu(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${language === lang.code
                                                        ? "bg-[var(--primary)] text-white"
                                                        : "text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
                                                        }`}
                                                >
                                                    <span className="text-xl">{lang.flag}</span>
                                                    <span>{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Profile / Auth */}
                        <div className="flex items-center">
                            {user ? (
                                <div className="relative cursor-pointer">
                                    <div className={`${scrolled ? 'w-10 h-10' : 'w-11 h-11'} rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center text-white font-black shadow-lg`}>
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[var(--background)] shadow-md">
                                        <span className="text-[8px] font-black text-white">{points}</span>
                                    </div>
                                </div>
                            ) : (
                                <motion.button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[var(--primary)] to-red-600 text-white font-bold text-sm shadow-lg shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50 transition-all"
                                >
                                    <LogIn size={18} />
                                    <span>Sign In</span>
                                </motion.button>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsOpen(!isOpen)}
                                className={`${scrolled ? 'w-10 h-10' : 'w-11 h-11'} flex items-center justify-center rounded-lg bg-[var(--foreground)]/5 text-[var(--foreground)]`}
                            >
                                <AnimatePresence mode="wait">
                                    {isOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <X size={24} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Menu size={24} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden overflow-hidden"
                        >
                            <div className="py-6 space-y-2 bg-[var(--background)]/90 backdrop-blur-xl rounded-2xl mt-2 border border-[var(--foreground)]/10">
                                {navItemsConfig.map((item, index) => (
                                    <motion.a
                                        key={item.id}
                                        href={item.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[var(--foreground)]/80 hover:text-white hover:bg-[var(--primary)] rounded-xl transition-all mx-2"
                                    >
                                        <span className="text-[var(--primary)]">
                                            {navIcons[item.label] || navIcons[Object.keys(navIcons)[index]]}
                                        </span>
                                        <span>{item.label}</span>
                                    </motion.a>
                                ))}

                                {!user && (
                                    <div className="pt-4 px-4 border-t border-[var(--foreground)]/10 mx-2">
                                        <button
                                            onClick={() => {
                                                setIsAuthOpen(true);
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-red-600 text-white font-bold shadow-lg"
                                        >
                                            <LogIn size={20} />
                                            Sign In to Club Africain
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom subtle gradient */}
            <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--foreground)]/10 to-transparent`} />
        </motion.nav>
    );
}
