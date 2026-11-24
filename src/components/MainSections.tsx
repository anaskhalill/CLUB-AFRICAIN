"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Star, 
  Award, 
  ChevronDown, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Search, 
  User, 
  Users, 
  Trophy,
  Facebook,
  Instagram,
  Youtube,
  Send,
  Mail,
  Gamepad2,
  Lock,
  Heart,
  ShoppingCart,
  RefreshCw
} from "lucide-react";
import { VariableProximityText } from "@/components/ui/variable-proximity-text";

// ============================================================================
// SKELETONS
// ============================================================================
export const TeamSkeleton = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
      <RefreshCw className="w-16 h-16 text-[var(--primary)] opacity-40" />
    </motion.div>
    <p className="mt-12 text-[var(--foreground)]/60 font-display font-black text-2xl uppercase tracking-[0.3em] animate-pulse italic">
      Loading squad...
    </p>
  </div>
);

// ============================================================================
// ELECTRIC BORDER (Moved here to avoid circular dep and provide it to sections)
// ============================================================================
export function ElectricBorder({
  children,
  color = '#ff0000',
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  style
}: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const [isMounted, setIsMounted] = useState(false);

  const random = useCallback((x: number) => {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }, []);

  const noise2D = useCallback(
    (x: number, y: number) => {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;
      const a = random(i + j * 57);
      const b = random(i + 1 + j * 57);
      const c = random(i + (j + 1) * 57);
      const d = random(i + 1 + (j + 1) * 57);
      const ux = fx * fx * (3.0 - 2.0 * fx);
      const uy = fy * fy * (3.0 - 2.0 * fy);
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    },
    [random]
  );

  const octavedNoise = useCallback(
    (x: number, octaves: number, lacunarity: number, gain: number, amplitude: number, frequency: number, time: number, seed: number, baseFlatness: number) => {
      let y = 0;
      let amp = amplitude;
      let freq = frequency;
      for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = amp;
        if (i === 0) octaveAmplitude *= baseFlatness;
        y += octaveAmplitude * noise2D(freq * x + seed * 100, time * freq * 0.3);
        freq *= lacunarity;
        amp *= gain;
      }
      return y;
    },
    [noise2D]
  );

  const getCornerPoint = useCallback((cX: number, cY: number, r: number, sA: number, aL: number, p: number) => {
    const angle = sA + p * aL;
    return { x: cX + r * Math.cos(angle), y: cY + r * Math.sin(angle) };
  }, []);

  const getRoundedRectPoint = useCallback((t: number, l: number, top: number, w: number, h: number, r: number) => {
    const sW = w - 2 * r;
    const sH = h - 2 * r;
    const cA = (Math.PI * r) / 2;
    const tP = 2 * sW + 2 * sH + 4 * cA;
    const d = t * tP;
    let acc = 0;
    if (d <= acc + sW) return { x: l + r + (d - acc), y: top };
    acc += sW;
    if (d <= acc + cA) return getCornerPoint(l + w - r, top + r, r, -Math.PI / 2, Math.PI / 2, (d - acc) / cA);
    acc += cA;
    if (d <= acc + sH) return { x: l + w, y: top + r + (d - acc) };
    acc += sH;
    if (d <= acc + cA) return getCornerPoint(l + w - r, top + h - r, r, 0, Math.PI / 2, (d - acc) / cA);
    acc += cA;
    if (d <= acc + sW) return { x: l + w - r - (d - acc), y: top + h };
    acc += sW;
    if (d <= acc + cA) return getCornerPoint(l + r, top + h - r, r, Math.PI / 2, Math.PI / 2, (d - acc) / cA);
    acc += cA;
    if (d <= acc + sH) return { x: l, y: top + h - r - (d - acc) };
    acc += sH;
    return getCornerPoint(l + r, top + r, r, Math.PI, Math.PI / 2, (d - acc) / cA);
  }, [getCornerPoint]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = (rect.width + 120) * dpr;
      canvas.height = (rect.height + 120) * dpr;
      ctx.scale(dpr, dpr);
      return { width: rect.width + 120, height: rect.height + 120 };
    };

    let { width, height } = updateSize();

    const render = (cTime: number) => {
      const dT = (cTime - lastFrameTimeRef.current) / 1000;
      timeRef.current += dT * speed;
      lastFrameTimeRef.current = cTime;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Simplified draw for brevity but keeping the effect
      for (let i = 0; i <= 200; i++) {
        const p = i / 200;
        const pt = getRoundedRectPoint(p, 60, 60, width - 120, height - 120, borderRadius);
        const noise = octavedNoise(p * 8, 4, 1.6, 0.7, chaos, 10, timeRef.current, 0, 0);
        const x = pt.x + Math.cos(p * Math.PI * 2) * noise * 20;
        const y = pt.y + Math.sin(p * Math.PI * 2) * noise * 20;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      animationRef.current = requestAnimationFrame(render);
    };
    animationRef.current = requestAnimationFrame(render);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isMounted, color, speed, chaos, borderRadius, getRoundedRectPoint, octavedNoise]);

  return (
    <div ref={containerRef} className="relative inline-block" style={style}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none -translate-x-[60px] -translate-y-[60px]" style={{ zIndex: 0 }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================================================
// ACADEMY SECTION
// ============================================================================
export function AcademySection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const t = translations[language].academy;
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [votes, setVotes] = useState<Record<string, number>>({
    "Adam Mrad": 124,
    "Youssef Tayechi": 89,
    "Aziz Ghrissi": 156
  });
  const [voted, setVoted] = useState(false);

  const handleVote = (name: string) => {
    if (!voted) {
      setVotes(prev => ({ ...prev, [name]: prev[name] + 1 }));
      setVoted(true);
    }
  };

  return (
    <section id="academy" ref={ref} className="relative py-24 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-[var(--background)]">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-600 rounded-full blur-[150px] opacity-10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-600 text-sm font-bold mb-4"
          >
            {t.futureStar}
          </motion.span>
          <h2 className="text-5xl lg:text-7xl font-black text-[var(--foreground)] uppercase mb-6 italic">
            {t.title}
          </h2>
          <p className="text-[var(--foreground)] opacity-60 max-w-2xl mx-auto text-lg">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="group relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl">
              <NextImage
                src="/players/mrad.jpg"
                alt="POTM"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                  <span className="text-white font-bold tracking-widest text-sm uppercase">{t.potm}</span>
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic">Adam Mrad</h3>
                <p className="text-red-500 font-bold mt-1">U19 {t.striker} • 18 {t.yo}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Award className="text-red-600" />
              {t.voteText}
            </h3>

            <div className="space-y-6">
              {[
                { name: "Adam Mrad", pos: "ST", img: "/players/mrad.jpg" },
                { name: "Youssef Tayechi", pos: "MID", img: "/players/tayechi.jpg" },
                { name: "Aziz Ghrissi", pos: "DEF", img: "/players/ghrissi.webp" }
              ].map((player) => (
                <div key={player.name} className="relative">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-600/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-red-600 transition-colors">
                        <NextImage src={player.img} alt={player.name} width={48} height={48} className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{player.name}</h4>
                        <p className="text-xs text-white/40 uppercase font-black">{player.pos}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-black text-white">{votes[player.name]}</p>
                        <p className="text-[10px] text-white/40 uppercase">{t.votes}</p>
                      </div>
                      <button
                        onClick={() => handleVote(player.name)}
                        disabled={voted}
                        className={`p-3 rounded-xl transition-all ${
                          voted 
                            ? "bg-white/5 text-white/20" 
                            : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95"
                        }`}
                      >
                        <Heart className={voted ? "" : "fill-current"} size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {voted && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center text-green-500 font-bold flex items-center justify-center gap-2"
                >
                  <Star size={16} fill="currentColor" />
                  {t.thankYou}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HISTORY SECTION
// ============================================================================
export function HistorySection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const t = translations[language].history;
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="history" ref={ref} className="relative py-24 overflow-hidden bg-black/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              className="text-red-600 font-black tracking-widest text-sm uppercase"
            >
              {t.header}
            </motion.span>
            <h2 className="text-5xl lg:text-8xl font-black text-[var(--foreground)] uppercase mt-2 italic leading-none">
              {t.title}
            </h2>
          </div>
          <p className="text-[var(--foreground)] opacity-60 max-w-md text-lg mb-2">
            {t.subtitle}
          </p>
        </div>

        <div className="relative mt-8">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 hidden md:block" />
          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-12 pt-8 no-scrollbar cursor-grab active:cursor-grabbing snap-x"
          >
            {t.milestones.map((ms: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.05 }}
                className="min-w-[320px] md:min-w-[400px] snap-center group"
              >
                <div className="relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-red-600/30 transition-all duration-500 overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-8xl font-black text-white/5 group-hover:text-red-600/10 transition-colors uppercase leading-none">
                    {i + 1}
                  </div>
                  <div className="bg-red-600 w-12 h-1 rounded-full mb-6 group-hover:w-24 transition-all duration-500" />
                  <h3 className="text-2xl font-black text-white uppercase mb-4 italic">{ms.title}</h3>
                  <p className="text-white/60 leading-relaxed">{ms.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// NEWS SECTION
// ============================================================================
export function NewsSection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const t = translations[language].news;
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (data.items) setNews(data.items.slice(0, 6));
      })
      .catch(err => console.error("Error fetching news:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="news" ref={ref} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-16">
          <div>
            <span className="text-red-600 font-bold uppercase tracking-widest">{t.header}</span>
            <h2 className="text-5xl font-black text-white uppercase italic">{t.title}</h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-white/60 hover:text-red-600 font-bold transition-all uppercase tracking-tighter">
            {t.more} <ArrowRight size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RefreshCw className="w-10 h-10 text-red-600 opacity-60" />
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => window.open(item.url, '_blank')}
              >
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 border border-white/10 bg-white/5 flex items-center justify-center">
                  <NextImage src={item.img || `/${(i % 3) + 1}.png`} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase shadow-lg shadow-black/50">
                      {item.cat}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-0" />
                </div>
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-white/40">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    {item.date}
                  </div>
                  {item.source && (
                    <span className="text-red-500 uppercase tracking-wider">{item.source}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-600 transition-colors leading-tight line-clamp-3">
                  {item.title}
                </h3>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// SHOP SECTION
// ============================================================================
export function ShopSection({ language, theme, user, points, setPoints }: any) {
  const t = translations[language].shop;
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="shop" ref={ref} className="py-24 bg-white/5 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-red-600 font-bold uppercase tracking-widest">{t.header}</span>
          <h2 className="text-5xl font-black text-white uppercase italic">{t.title}</h2>
          <p className="text-white/60 mt-4">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {t.products.slice(0, 4).map((p: any, i: number) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white/5 rounded-3xl p-4 border border-white/5 group transition-all hover:bg-white/10"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-black/40">
                <NextImage src={`/${i + 1}.png`} alt={p.name} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{p.category}</span>
              <h4 className="text-white font-bold mb-4 line-clamp-1">{p.name}</h4>
              <button className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs hover:bg-red-600 hover:text-white transition-all uppercase flex items-center justify-center gap-2">
                <ShoppingCart size={14} />
                {t.buy}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Screen Width Sponsor/Partner Logo Slider (12 logos strictly from /logos/ folder) */}
      <div className="slider">
        <div className="slide-track">
          {/* Set 1 - 12 Logos from /logos/ */}
          <div className="slide">
            <img src="/logos/Boga.png" alt="Boga" />
          </div>
          <div className="slide">
            <img src="/logos/all4one.png" alt="All4One" />
          </div>
          <div className="slide">
            <img src="/logos/bank.png" alt="Bank" />
          </div>
          <div className="slide">
            <img src="/logos/boutique-lefri9i.png" alt="Boutique Lefri9i" />
          </div>
          <div className="slide">
            <img src="/logos/jamiya.png" alt="Jamiya" />
          </div>
          <div className="slide">
            <img src="/logos/jii.png" alt="JII" />
          </div>
          <div className="slide">
            <img src="/logos/kelme.png" alt="Kelme" />
          </div>
          <div className="slide">
            <img src="/logos/lefri9i-mobile.png" alt="Lefri9i Mobile" />
          </div>
          <div className="slide">
            <img src="/logos/lefri9i.png" alt="Lefri9i" />
          </div>
          <div className="slide">
            <img src="/logos/natilait.png" alt="Natilait" />
          </div>
          <div className="slide">
            <img src="/logos/ooredoo.png" alt="Ooredoo" />
          </div>
          <div className="slide">
            <img src="/logos/stil.png" alt="Stil" />
          </div>

          {/* Set 2 - Duplicated 12 Logos for smooth infinite loop */}
          <div className="slide">
            <img src="/logos/Boga.png" alt="Boga" />
          </div>
          <div className="slide">
            <img src="/logos/all4one.png" alt="All4One" />
          </div>
          <div className="slide">
            <img src="/logos/bank.png" alt="Bank" />
          </div>
          <div className="slide">
            <img src="/logos/boutique-lefri9i.png" alt="Boutique Lefri9i" />
          </div>
          <div className="slide">
            <img src="/logos/jamiya.png" alt="Jamiya" />
          </div>
          <div className="slide">
            <img src="/logos/jii.png" alt="JII" />
          </div>
          <div className="slide">
            <img src="/logos/kelme.png" alt="Kelme" />
          </div>
          <div className="slide">
            <img src="/logos/lefri9i-mobile.png" alt="Lefri9i Mobile" />
          </div>
          <div className="slide">
            <img src="/logos/lefri9i.png" alt="Lefri9i" />
          </div>
          <div className="slide">
            <img src="/logos/natilait.png" alt="Natilait" />
          </div>
          <div className="slide">
            <img src="/logos/ooredoo.png" alt="Ooredoo" />
          </div>
          <div className="slide">
            <img src="/logos/stil.png" alt="Stil" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
export function Footer({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const t = translations[language].footer;

  return (
    <footer className="bg-black pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <NextImage src="/ca.png" alt="CA" width={60} height={60} />
              <div>
                <h2 className="text-2xl font-black text-white leading-none">CLUB AFRICAIN</h2>
                <p className="text-red-600 font-bold text-xs tracking-widest uppercase mt-1">Since 1920</p>
              </div>
            </div>
            <p className="text-white/40 leading-relaxed max-w-sm">
              {t.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase mb-8">{t.links}</h4>
            <ul className="space-y-4 text-white/40">
              <li><a href="#home" className="hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="#history" className="hover:text-red-500 transition-colors">History</a></li>
              <li><a href="#team" className="hover:text-red-500 transition-colors">Team</a></li>
              <li><a href="#shop" className="hover:text-red-500 transition-colors">Shop</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase mb-8">{t.subscribe}</h4>
            <div className="relative">
              <input 
                placeholder={t.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-600 transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-red-600 text-white px-4 rounded-lg hover:bg-red-700 transition-all">
                <Send size={18} />
              </button>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all cursor-pointer"><Facebook size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 transition-all cursor-pointer"><Instagram size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer"><Youtube size={18} /></div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-sm">
            © 2025 CLUB AFRICAIN. {t.rights}
          </p>
          <div className="flex gap-8 text-white/20 text-sm font-bold uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-all">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-all">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MATCHES SECTION
// ============================================================================
export function MatchesSection({ language, theme }: any) {
  const t = translations[language].matches;
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const matches = [
    { home: "Club Africain", away: "US Monastir", date: "SAT, 15 APR", time: "16:00", comp: "Ligue 1", stadium: "Rades" },
    { home: "ES Zarzis", away: "Club Africain", date: "SUN, 23 APR", time: "15:00", comp: "Ligue 1", stadium: "Zarzis" },
  ];

  return (
    <section id="matches" ref={ref} className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-5xl lg:text-7xl font-black text-white italic uppercase">{t.title}</h2>
          <div className="flex gap-4 mt-8">
            <button className="px-8 py-3 bg-red-600 text-white font-bold rounded-full uppercase text-sm shadow-xl shadow-red-600/20">{t.upcoming}</button>
            <button className="px-8 py-3 bg-white/5 text-white/40 font-bold rounded-full uppercase text-sm border border-white/5 hover:bg-white/10 transition-all">{t.results}</button>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {matches.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 relative">
                    <NextImage src={m.home === "Club Africain" ? "/ca.png" : "/clubs/esz.png"} alt={m.home} fill className="object-contain" />
                  </div>
                  <span className="font-black text-white uppercase text-center">{m.home}</span>
                </div>

                <div className="text-center group-hover:scale-110 transition-transform">
                  <p className="text-red-600 font-black text-xl mb-1">{m.time}</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{m.date}</p>
                  <div className="w-12 h-px bg-white/10 mx-auto my-4" />
                  <p className="text-white uppercase font-black tracking-tighter text-sm italic">VS</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 relative">
                    <NextImage src={m.away === "Club Africain" ? "/ca.png" : "/clubs/usm.png"} alt={m.away} fill className="object-contain" />
                  </div>
                  <span className="font-black text-white uppercase text-center">{m.away}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TEAM SECTION
// ============================================================================
export function TeamSection({ language, theme }: any) {
  const t = translations[language].team;
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const players = [
    { name: "Mouez Hassen", pos: "GK", id: "hassen", num: 16, img: "/players/yeferni.png" },
    { name: "Rami Bedoui", pos: "DEF", id: "bedoui", num: 29, img: "/players/ben abda.webp" },
    { name: "Bassem Srarfi", pos: "FWD", id: "srarfi", num: 7, img: "/players/srarfi.png" },
    { name: "Firas Chaouat", pos: "FWD", id: "chaouat", num: 9, img: "/players/chaouat.webp" },
  ];

  return (
    <section id="team" ref={ref} className="py-24 relative overflow-hidden bg-black/40">
       <div className="max-w-7xl mx-auto px-4">
         <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-red-600 font-bold uppercase tracking-widest">{t.header}</span>
              <h2 className="text-5xl lg:text-7xl font-black text-white italic uppercase">{t.title}</h2>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="group relative"
              >
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 bg-white/5">
                  <NextImage src={p.img} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4 text-4xl font-black text-white opacity-20 group-hover:opacity-100 transition-opacity">
                    {p.num}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h4 className="text-2xl font-black text-white uppercase italic leading-none">{p.name.split(' ')[0]}<br/>{p.name.split(' ')[1]}</h4>
                    <p className="text-red-600 font-black text-xs uppercase tracking-widest mt-2">{p.pos}</p>
                  </div>
                </div>
              </motion.div>
            ))}
         </div>
       </div>
    </section>
  );
}

// ============================================================================
// TRANSLATIONS (Local copy to avoid imports from page.tsx)
// ============================================================================
const translations: any = {
  en: {
    academy: { title: "The Academy", subtitle: "Monitor the next generation of superstars.", futureStar: "FUTURE STAR", potm: "PLAYER OF THE MONTH", voteText: "Vote for your favorite talent", thankYou: "Thank you for voting!", striker: "Striker", midfielder: "Midfielder", defender: "Defender", yo: "yo", votes: "votes" },
    history: { header: "SINCE 1920", title: "OUR HISTORY", subtitle: "Over a century of passion and glory.", milestones: [ { title: "Foundation", desc: "Official foundation in 1920." }, { title: "First Title", desc: "Won the first league title." } ] },
    news: { header: "LATEST", title: "Club News", more: "Read More" },
    shop: { header: "OFFICIAL SHOP", title: "Club Store", subtitle: "Get the collection.", buy: "ADD TO CART", products: [{name: "Home Jersey", category: "Jersey"}] },
    footer: { tagline: "Club Africain institution in Tunisia.", links: "Quick Links", subscribe: "Stay Updated", placeholder: "Your email", rights: "All rights reserved." },
    matches: { title: "Fixtures", upcoming: "Upcoming", results: "Results" },
    team: { header: "THE SQUAD", title: "Team Roster" }
  },
  fr: {
    academy: { title: "L'Académie", subtitle: "Surveillez la prochaine génération.", futureStar: "FUTURE STAR", potm: "JOUEUR DU MOIS", voteText: "Votez pour votre talent préféré", thankYou: "Merci pour votre vote!", striker: "Attaquant", midfielder: "Milieu", defender: "Défenseur", yo: "ans", votes: "votes" },
    history: { header: "DEPUIS 1920", title: "NOTRE HISTOIRE", subtitle: "Plus d'un siècle de passion.", milestones: [ { title: "Fondation", desc: "Fondation officielle en 1920." } ] },
    news: { header: "ACTU", title: "Actualités du Club", more: "Lire plus" },
    shop: { header: "BOUTIQUE", title: "Shop Officiel", subtitle: "Collection 2025/26.", buy: "AJOUTER", products: [{name: "Maillot", category: "Maillot"}] },
    footer: { tagline: "Le Club Africain institution en Tunisie.", links: "Liens rapides", subscribe: "Restez à jour", placeholder: "Votre email", rights: "Tous droits réservés." },
    matches: { title: "Matchs", upcoming: "À venir", results: "Résultats" },
    team: { header: "L'EFFECTIF", title: "Effectif" }
  },
  ar: {
    academy: { title: "أكاديمية النادي", subtitle: "راقب الجيل القادم من النجوم.", futureStar: "نجم المستقبل", potm: "لاعب الشهر", voteText: "صوّت لموهبتك المفضلة", thankYou: "شكراً لتصويتك!", striker: "مهاجم", midfielder: "وسط ميدان", defender: "مدافع", yo: "سنة", votes: "تصويت" },
    history: { header: "منذ 1920", title: "تاريخنا", subtitle: "أكثر من قرن من العاطفة.", milestones: [ { title: "التأسيس", desc: "التأسيس الرسمي في 1920." } ] },
    news: { header: "الأخبار", title: "أخبار النادي", more: "المزيد" },
    shop: { header: "المغازة", title: "المغازة الرسمية", subtitle: "مجموعة 2025/26.", buy: "أضف", products: [{name: "قميص", category: "قميص"}] },
    footer: { tagline: "النادي الإفريقي مؤسسة في تونس.", links: "روابط سريعة", subscribe: "ابق على اطلاع", placeholder: "بريدك الإلكتروني", rights: "جميع الحقوق محفوظة." },
    matches: { title: "المباريات", upcoming: "القادمة", results: "النتائج" },
    team: { header: "التشكيلة", title: "قائمة الفريق" }
  }
};
