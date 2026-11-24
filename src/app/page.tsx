"use client"; // Refactored page
import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import NextImage from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Skiper58, { TextRoll } from "@/components/Skiper58";
import {
  Trophy,
  Calendar,
  MapPin,
  ChevronDown,
  Clock,
  Menu,
  X,
  Star,
  Award,
  Play,
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Moon,
  Sun,
  Search,
  User,
  Users,
  Heart,
  LogIn,
  LogOut,
  Lock,
  Mail,
  Gamepad2,
  Send,
  RefreshCw,
  ShoppingBag,
  Check,
  CheckCircle2,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { SiTiktok, SiX } from "react-icons/si";
import { db, auth as fAuth, getGoogleProvider, getFacebookProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc, increment, onSnapshot, getDoc } from "firebase/firestore";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { VariableProximityText } from "@/components/ui/variable-proximity-text";
import { ClientOnly } from "@/components/ui/client-only";
import { DraggableCardContainer, DraggableCardBody } from "@/components/ui/draggable-card";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

// Scroll-triggered animation variants
const scrollVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeUpSmall: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
};
const scrollViewport = { once: true, amount: 0.1 };
const scrollTransition = { duration: 1, ease: [0.22, 1, 0.36, 1] as const };
const scrollTransitionFast = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
const scrollSpring = { type: "spring" as const, stiffness: 100, damping: 20 };

function hexToRgba(hex: string, alpha = 1) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  const int = parseInt(h, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface ElectricBorderProps {
  children: React.ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

function ElectricBorder({
  children,
  color = '#ff0000',
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  style
}: ElectricBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

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
    (
      x: number,
      octaves: number,
      lacunarity: number,
      gain: number,
      baseAmplitude: number,
      baseFrequency: number,
      time: number,
      seed: number,
      baseFlatness: number
    ) => {
      let y = 0;
      let amplitude = baseAmplitude;
      let frequency = baseFrequency;

      for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = amplitude;
        if (i === 0) {
          octaveAmplitude *= baseFlatness;
        }
        y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
        frequency *= lacunarity;
        amplitude *= gain;
      }

      return y;
    },
    [noise2D]
  );

  const getCornerPoint = useCallback(
    (centerX: number, centerY: number, radius: number, startAngle: number, arcLength: number, progress: number) => {
      const angle = startAngle + progress * arcLength;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    },
    []
  );

  const getRoundedRectPoint = useCallback(
    (
      t: number,
      left: number,
      top: number,
      width: number,
      height: number,
      radius: number
    ) => {
      const straightWidth = width - 2 * radius;
      const straightHeight = height - 2 * radius;
      const cornerArc = (Math.PI * radius) / 2;
      const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
      const distance = t * totalPerimeter;

      let accumulated = 0;

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + radius + progress * straightWidth, y: top };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left + width, y: top + radius + progress * straightHeight };
      }
      accumulated += straightHeight;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + width - radius - progress * straightWidth, y: top + height };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left, y: top + height - radius - progress * straightHeight };
      }

      const progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
    },
    [getCornerPoint]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const octaves = 10;
    const lacunarity = 1.6;
    const gain = 0.7;
    const amplitude = chaos;
    const frequency = 10;
    const baseFlatness = 0;
    const displacement = 60;
    const borderOffset = 60;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width + borderOffset * 2;
      const height = rect.height + borderOffset * 2;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      return { width, height };
    };

    let { width, height } = updateSize();

    const drawElectricBorder = (currentTime: number) => {
      if (!canvas || !ctx) return;

      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      timeRef.current += deltaTime * speed;
      lastFrameTimeRef.current = currentTime;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const scale = displacement;
      const left = borderOffset;
      const top = borderOffset;
      const borderWidth = width - 2 * borderOffset;
      const borderHeight = height - 2 * borderOffset;
      const maxRadius = Math.min(borderWidth, borderHeight) / 2;
      const radius = Math.min(borderRadius, maxRadius);

      const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
      const sampleCount = Math.floor(approximatePerimeter / 4);

      ctx.beginPath();

      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;

        const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);

        const xNoise = octavedNoise(
          progress * 8,
          octaves,
          lacunarity,
          gain,
          amplitude,
          frequency,
          timeRef.current,
          0,
          baseFlatness
        );
        const yNoise = octavedNoise(
          progress * 8,
          octaves,
          lacunarity,
          gain,
          amplitude,
          frequency,
          timeRef.current,
          1,
          baseFlatness
        );

        const displacedX = point.x + xNoise * scale;
        const displacedY = point.y + yNoise * scale;

        if (i === 0) {
          ctx.moveTo(displacedX, displacedY);
        } else {
          ctx.lineTo(displacedX, displacedY);
        }
      }

      ctx.closePath();
      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawElectricBorder);
    };

    const resizeObserver = new ResizeObserver(() => {
      const newSize = updateSize();
      width = newSize.width;
      height = newSize.height;
    });
    resizeObserver.observe(container);

    animationRef.current = requestAnimationFrame(drawElectricBorder);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [color, speed, chaos, borderRadius, octavedNoise, getRoundedRectPoint]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible isolate"
      style={{ borderRadius, ...style }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2]">
        <canvas ref={canvasRef} className="block" />
      </div>
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none z-0">
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ border: `2px solid ${hexToRgba(color, 0.6)}`, filter: 'blur(1px)' }}
        />
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ border: `2px solid ${color}`, filter: 'blur(4px)' }}
        />
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none -z-[1] scale-110 opacity-30"
          style={{
            filter: 'blur(32px)',
            background: `linear-gradient(-30deg, ${color}, transparent, ${color})`
          }}
        />
      </div>
      <div className="relative rounded-[inherit] z-[1]">{children}</div>
    </div>
  );
}




// ============================================================================
// AI CHAT COMPONENT - FIXED VERSION WITH REAL AI AND LANGUAGE SUPPORT
// ============================================================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Add language detection utility
const getCurrentLanguage = (): string => {
  // Detect from HTML lang attribute or localStorage
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.lang || 'fr';
    const storedLang = localStorage.getItem('preferred_language');

    if (storedLang && ['fr', 'en', 'ar'].includes(storedLang)) {
      return storedLang;
    }

    // Default to French if html lang is not set or not recognized
    return htmlLang === 'en' ? 'en' : htmlLang === 'ar' ? 'ar' : 'fr';
  }
  return 'fr';
};

// Language-specific error messages
const errorMessages = {
  fr: 'Désolé, une erreur est survenue. Veuillez réessayer.',
  en: 'Sorry, an error occurred. Please try again.',
  ar: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
};

// Language-specific welcome messages
const welcomeMessages = {
  fr: {
    title: 'Bonjour, Lefri9i ! 👋',
    subtitle: 'Posez-moi vos questions sur Club Africain — historique, joueurs, matchs...',
    placeholder: 'Votre message...',
    online: 'En ligne • répond en quelques secondes'
  },
  en: {
    title: 'Hello, Lefri9i! 👋',
    subtitle: 'Ask me anything about Club Africain — history, players, matches...',
    placeholder: 'Your message...',
    online: 'Online • responds in seconds'
  },
  ar: {
    title: 'مرحباً، لفريقي! 👋',
    subtitle: 'اسألني أي شيء عن النادي الإفريقي — التاريخ، اللاعبون، المباريات...',
    placeholder: 'رسالتك...',
    online: 'متصل • يجيب في ثوانٍ'
  }
};

function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [currentLang, setCurrentLang] = useState<string>('fr');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync theme and language from document
  useEffect(() => {
    const checkTheme = () => setIsDark(!document.documentElement.classList.contains('light'));
    const updateLanguage = () => setCurrentLang(getCurrentLanguage());

    checkTheme();
    updateLanguage();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
        if (mutation.attributeName === 'lang') {
          updateLanguage();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'lang']
    });

    // Listen for language change events
    window.addEventListener('languageChange', updateLanguage);

    return () => {
      observer.disconnect();
      window.removeEventListener('languageChange', updateLanguage);
    };
  }, []);

  // Close when clicking outside the widget
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          language: currentLang // Send language preference to backend
        }),
      });

      const data = await res.json();

      // Handle response with language support
      if (!res.ok) {
        // Render the backend-provided error string instead of masking it.
        // The backend correctly identifies API Quota and Invalid Key errors!
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || errorMessages[currentLang as keyof typeof errorMessages] || errorMessages.fr
        }]);
      } else if (data.reply || data.response) {
        const aiResponse = data.reply || data.response;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: aiResponse
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Use language-specific error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessages[currentLang as keyof typeof errorMessages] || errorMessages.fr
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Get current language's welcome messages
  const currentWelcome = welcomeMessages[currentLang as keyof typeof welcomeMessages] || welcomeMessages.fr;

  // Theme-aware style tokens
  const panel = isDark
    ? { background: 'rgba(10,10,10,0.93)', border: '1px solid rgba(200,16,46,0.25)', boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.6), 0 0 40px rgba(200,16,46,0.08)' }
    : { background: '#F5F5DC', border: '1px solid rgba(200,16,46,0.2)', boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 24px 60px rgba(0,0,0,0.12), 0 0 30px rgba(200,16,46,0.06)' };

  const headerBg = isDark ? 'linear-gradient(135deg, rgba(200,16,46,0.2) 0%, transparent 100%)' : 'linear-gradient(135deg, rgba(200,16,46,0.08) 0%, transparent 100%)';
  const headerBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const titleColor = isDark ? '#F5F5DC' : '#111111';
  const subColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const closeBtnCls = isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-black/30 hover:text-black hover:bg-black/8';
  const onlineBorder = isDark ? 'border-[#0a0a0a]' : 'border-white';

  const msgAreaBg = isDark ? 'transparent' : '#F5F5DC';
  const emptyTitle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
  const emptyText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';

  // Dynamic example questions based on language
  const exampleQuestions = {
    fr: ["Prochains matchs ?", "Meilleur buteur ?", "Histoire du CA"],
    en: ["Next matches?", "Top scorer?", "CA History"],
    ar: ["المباريات القادمة؟", "أفضل هداف؟", "تاريخ النادي"]
  };

  const currentQuestions = exampleQuestions[currentLang as keyof typeof exampleQuestions] || exampleQuestions.fr;

  const chipCls = isDark
    ? 'border border-white/10 text-white/50 hover:border-[#C8102E]/50 hover:text-white/80 hover:bg-[#C8102E]/10'
    : 'border border-black/10 text-black/50 hover:border-[#C8102E]/50 hover:text-[#C8102E] hover:bg-[#C8102E]/5';

  const assistantBubbleBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
  const assistantBubbleBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const assistantText = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)';
  const dotColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  const inputBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const inputBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
  const inputBorder2 = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const inputText = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
  const placeholderCls = isDark ? 'placeholder:text-white/25' : 'placeholder:text-black/30';

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3" suppressHydrationWarning={true}>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-[340px] sm:w-[380px] rounded-3xl overflow-hidden shadow-2xl"
            style={{ ...panel, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          >
            {/* Header */}
            <div
              className="relative flex items-center gap-3 px-5 py-4"
              style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}
            >
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#C8102E] rounded-full blur-3xl opacity-15 pointer-events-none" />
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-[#C8102E] flex items-center justify-center shadow-lg shadow-[#C8102E]/30">
                  <NextImage src="/ca.png" alt="CA" width={26} height={26} className="object-contain" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 ${onlineBorder} animate-pulse`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-none" style={{ color: titleColor }}>CA Assistant</p>
                <p className="text-[10px] mt-1 font-medium tracking-wide" style={{ color: subColor }}>
                  {currentWelcome.online}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${closeBtnCls}`}
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="h-72 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 flex flex-col"
              style={{ background: msgAreaBg }}
              data-lenis-prevent="true"
            >
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#C8102E]/10 border border-[#C8102E]/20 flex items-center justify-center">
                    <NextImage src="/ca.png" alt="CA" width={32} height={32} className="object-contain" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: emptyTitle }}>
                      {currentWelcome.title}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed max-w-[200px] mx-auto" style={{ color: emptyText }}>
                      {currentWelcome.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {currentQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className={`text-[11px] px-3 py-1.5 rounded-full transition-all ${chipCls}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-[#C8102E]/15 border border-[#C8102E]/25 flex items-center justify-center mt-0.5">
                      <NextImage src="/ca.png" alt="CA" width={16} height={16} className="object-contain" />
                    </div>
                  )}
                  <div
                    className="max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? { background: '#C8102E', color: '#ffffff', borderRadius: '18px 4px 18px 18px' }
                        : { background: assistantBubbleBg, color: assistantText, borderRadius: '4px 18px 18px 18px', border: `1px solid ${assistantBubbleBorder}` }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 flex-row"
                  dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-[#C8102E]/15 border border-[#C8102E]/25 flex items-center justify-center">
                    <NextImage src="/ca.png" alt="CA" width={16} height={16} className="object-contain" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                    style={{ background: assistantBubbleBg, border: `1px solid ${assistantBubbleBorder}`, borderRadius: '4px 18px 18px 18px' }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full block"
                        style={{ background: dotColor }}
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2" style={{ borderTop: `1px solid ${inputBorder}` }}>
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                style={{ background: inputBg, border: `1px solid ${inputBorder2}` }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                  placeholder={currentWelcome.placeholder}
                  className={`flex-1 bg-transparent text-sm outline-none ${placeholderCls}`}
                  style={{ color: inputText }}
                  dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#C8102E] flex items-center justify-center transition-all hover:bg-[#a00d25] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#C8102E]/30"
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-2xl bg-transparent flex items-center justify-center"
        style={{ border: '1px solid #C8102E' }}
        aria-label="Open AI Assistant"
      >
        {/* Pulsing ring */}


        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-7 h-7 relative"
              suppressHydrationWarning={true}
            >
              <NextImage src="/bot.png" alt="AI Bot" fill className="object-contain" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI badge */}
        {!isOpen && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#C8102E] text-[9px] font-black flex items-center justify-center shadow-sm">
            AI
          </span>
        )}
      </motion.button>
    </div>
  );
}

const clubLogoMap: Record<string, string> = {
  "Espérance de Tunis": "/clubs/est.png",
  "Espérance Tunis": "/clubs/est.png",
  "EST": "/clubs/est.png",
  "Club Africain": "/ca.png",
  "CA": "/ca.png",
  "Stade Tunisien": "/clubs/st.png",
  "ST": "/clubs/st.png",
  "CS Sfaxien": "/clubs/css.png",
  "CSS": "/clubs/css.png",
  "US Monastir": "/clubs/usm.png",
  "USM": "/clubs/usm.png",
  "Etoile du Sahel": "/clubs/ess.png",
  "Etoile Sportive Du Sahel": "/clubs/ess.png",
  "ES Sahel": "/clubs/ess.png",
  "ESS": "/clubs/ess.png",
  "JS Omrane": "/clubs/jso.png",
  "JSO": "/clubs/jso.png",
  "CA Bizertin": "/clubs/cab.png",
  "CAB": "/clubs/cab.png",
  "ES Zarzis": "/clubs/esz.png",
  "ESZ": "/clubs/esz.png",
  "PS Sakiet Eddaïer": "/clubs/psse.png",
  "PSSE": "/clubs/psse.png",
  "ES Hammam-Sousse": "/clubs/eshs.png",
  "ESHS": "/clubs/eshs.png",
  "Avenir Sportif De La Marsa": "/clubs/marsa.png",
  "AS Marsa": "/clubs/marsa.png",
  "ASM": "/clubs/marsa.png",
  "US Ben Guerdane": "/clubs/usb.png",
  "Ben Guerdane": "/clubs/usb.png",
  "USBG": "/clubs/usb.png",
  "Olympique Béja": "/clubs/beja.png",
  "OB": "/clubs/beja.png",
  "ES Métlaoui": "/clubs/esm.png",
  "ES Metlaoui": "/clubs/esm.png",
  "ESM": "/clubs/esm.png",
  "CS Hammam-Lif": "/clubs/cshl.png",
  "CSHL": "/clubs/cshl.png",
  "ES Beni-Khalled": "/clubs/esbk.png",
  "Ariana": "/clubs/asa.png",
  "BS Bouhajla": "/clubs/bsb.png",
  "Djoliba AC": "/clubs/djo.png",

};

function StandingsTable({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const [data, setData] = useState<{ overall: any[]; home: any[]; away: any[] }>({ overall: [], home: [], away: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overall" | "home" | "away">("overall");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    setStartY(e.pageY - (scrollRef.current?.offsetTop || 0));
    setScrollTop(scrollRef.current?.scrollTop || 0);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const y = e.pageY - (scrollRef.current?.offsetTop || 0);
    const walk = (y - startY) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollTop - walk;
    }
  };

  // Real 2025/2026 Tunisian Ligue 1 Pro Standings Table
  const fallback = [
  {
    position: 1,
    team: { name: "Club Africain", shortName: "CA" },
    matches: 2,
    wins: 2,
    draws: 0,
    losses: 0,
    goalsFor: 2,
    goalsAgainst: 0,
    goalDifference: 2,
    points: 6,
  },
  {
    position: 2,
    team: { name: "CA Bizertin", shortName: "CAB" },
    matches: 2,
    wins: 2,
    draws: 0,
    losses: 0,
    goalsFor: 2,
    goalsAgainst: 0,
    goalDifference: 2,
    points: 6,
  },
  {
    position: 3,
    team: { name: "PS Sakiet Eddaïer", shortName: "PSSE" },
    matches: 2,
    wins: 1,
    draws: 1,
    losses: 0,
    goalsFor: 2,
    goalsAgainst: 0,
    goalDifference: 2,
    points: 4,
  },
  {
    position: 4,
    team: { name: "CS Sfaxien", shortName: "CSS" },
    matches: 2,
    wins: 1,
    draws: 1,
    losses: 0,
    goalsFor: 3,
    goalsAgainst: 2,
    goalDifference: 1,
    points: 4,
  },
  {
    position: 5,
    team: { name: "Monastir", shortName: "USM" },
    matches: 2,
    wins: 1,
    draws: 1,
    losses: 0,
    goalsFor: 2,
    goalsAgainst: 1,
    goalDifference: 1,
    points: 4,
  },
  {
    position: 6,
    team: { name: "Ben Guerdane", shortName: "USBG" },
    matches: 1,
    wins: 1,
    draws: 0,
    losses: 0,
    goalsFor: 2,
    goalsAgainst: 1,
    goalDifference: 1,
    points: 3,
  },
  {
    position: 7,
    team: { name: "ES Sahel", shortName: "ESS" },
    matches: 2,
    wins: 1,
    draws: 0,
    losses: 1,
    goalsFor: 4,
    goalsAgainst: 4,
    goalDifference: 0,
    points: 3,
  },
  {
    position: 8,
    team: { name: "Zarzis", shortName: "ESZ" },
    matches: 2,
    wins: 1,
    draws: 0,
    losses: 1,
    goalsFor: 2,
    goalsAgainst: 2,
    goalDifference: 0,
    points: 3,
  },
  {
    position: 9,
    team: { name: "JS Omrane", shortName: "JSO" },
    matches: 2,
    wins: 1,
    draws: 0,
    losses: 1,
    goalsFor: 3,
    goalsAgainst: 3,
    goalDifference: 0,
    points: 3,
  },
  {
    position: 10,
    team: { name: "Esperance Tunis", shortName: "EST" },
    matches: 2,
    wins: 1,
    draws: 0,
    losses: 1,
    goalsFor: 4,
    goalsAgainst: 5,
    goalDifference: -1,
    points: 3,
  },
  {
    position: 11,
    team: { name: "AS Marsa", shortName: "ASM" },
    matches: 2,
    wins: 0,
    draws: 1,
    losses: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 1,
  },
  {
    position: 12,
    team: { name: "ES Hammam-Sousse", shortName: "ESHS" },
    matches: 2,
    wins: 0,
    draws: 1,
    losses: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 1,
  },
  {
    position: 13,
    team: { name: "Stade Tunisien", shortName: "ST" },
    matches: 2,
    wins: 0,
    draws: 1,
    losses: 1,
    goalsFor: 2,
    goalsAgainst: 3,
    goalDifference: -1,
    points: 1,
  },
  {
    position: 14,
    team: { name: "Hammam-Lif", shortName: "CSHL" },
    matches: 1,
    wins: 0,
    draws: 0,
    losses: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 0,
  },
  {
    position: 15,
    team: { name: "Olympique Beja", shortName: "OB" },
    matches: 2,
    wins: 0,
    draws: 0,
    losses: 2,
    goalsFor: 1,
    goalsAgainst: 3,
    goalDifference: -2,
    points: 0,
  },
  {
    position: 16,
    team: { name: "Metlaoui", shortName: "ESM" },
    matches: 2,
    wins: 0,
    draws: 0,
    losses: 2,
    goalsFor: 1,
    goalsAgainst: 3,
    goalDifference: -2,
    points: 0,
  },
];



  useEffect(() => {
    const fetchStandings = () => {
      fetch('/api/standings')
        .then(res => res.json())
        .then(json => {
          const standings = json.standings || (Array.isArray(json) ? [{ rows: json }] : []);
          const pick = (key: string) => {
            const entry = standings.find((s: any) => String(s.type || '').toLowerCase() === key)
              || standings.find((s: any) => String(s.type || '').toLowerCase().includes(key));
            return entry?.rows || [];
          };
          const overall = pick('total') || pick('overall');
          const home = pick('home');
          const away = pick('away');
          setData({
            overall: Array.isArray(overall) && overall.length > 0 ? overall : (Array.isArray(json) ? json : []),
            home: Array.isArray(home) && home.length > 0 ? home : (Array.isArray(overall) && overall.length > 0 ? overall : []),
            away: Array.isArray(away) && away.length > 0 ? away : (Array.isArray(overall) && overall.length > 0 ? overall : []),
          });
        })
        .catch(() => setData({ overall: fallback, home: fallback, away: fallback }))
        .finally(() => setLoading(false));
    };

    fetchStandings();
    const interval = setInterval(fetchStandings, 120000); // Auto-refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const viewRows = view === "overall" ? data.overall : view === "home" ? data.home : data.away;
  const displayData = viewRows.length > 0 ? viewRows : fallback;

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden animate-pulse">
        <div className="p-6 bg-[var(--foreground)]/5 border-b border-[var(--border)] h-20" />
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4 h-12 bg-[var(--foreground)]/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto bg-[var(--card)] backdrop-blur-xl rounded-3xl border transition-colors duration-300 shadow-[0_0_50px_rgba(0,0,0,0.2)] ${theme === 'light' ? 'border-[#800020]' : 'border-[var(--border)]'} overflow-hidden`}>
      <div className={`p-6 bg-gradient-to-r ${theme === 'light' ? 'from-[#800020]/10' : 'from-[#C8102E]/20'} to-transparent border-b border-[var(--border)] flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Trophy className={theme === 'light' ? 'text-[#800020]' : 'text-[#C8102E]'} size={24} />
          <h3 className="text-[var(--foreground)] font-bold text-xl uppercase tracking-wider">
            {language === 'ar' ? 'ترتيب الرابطة المحترفة الأولى' : language === 'fr' ? 'Ligue 1 Professionnelle' : 'Ligue 1 Professional'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-[var(--foreground)]/40 uppercase font-medium">{language === 'ar' ? 'مباشر' : language === 'fr' ? 'EN DIRECT' : 'LIVE'}</span>
        </div>
      </div>

      {/* Overall / Home / Away toggle */}
      <div className="flex items-center justify-center gap-1.5 px-6 py-3 border-b border-[var(--border)] bg-[var(--foreground)]/[0.02]">
        {([
          { key: 'overall', label: language === 'ar' ? 'عام' : language === 'fr' ? 'Général' : 'Overall' },
          { key: 'home', label: language === 'ar' ? 'على أرضه' : language === 'fr' ? 'Domicile' : 'Home' },
          { key: 'away', label: language === 'ar' ? 'خارجه' : language === 'fr' ? 'Extérieur' : 'Away' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${
              view === tab.key
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/30'
                : 'bg-[var(--foreground)]/5 text-[var(--foreground)]/60 border-[var(--foreground)]/10 hover:border-[var(--primary)]/50 hover:text-[var(--primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar cursor-grab active:cursor-grabbing select-none"
      >
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--background)] text-[var(--foreground)]/40 text-[10px] uppercase font-bold tracking-widest">
              <th className="py-4 px-6 text-center">#</th>
              <th className="py-4 px-6">{language === 'ar' ? 'الفريق' : language === 'fr' ? 'Équipe' : 'Team'}</th>
              <th className="py-4 px-3 text-center">P</th>
              <th className="py-4 px-3 text-center">W</th>
              <th className="py-4 px-3 text-center">D</th>
              <th className="py-4 px-3 text-center">L</th>
              <th className="py-4 px-3 text-center" title={language === 'ar' ? 'سجل (Goals For)' : language === 'fr' ? 'Buts marqués (Goals For)' : 'GF (Goals For)'}>GF</th>
              <th className="py-4 px-3 text-center" title={language === 'ar' ? 'Goals Against (المستقبلة)' : language === 'fr' ? 'Buts encaissés (Goals Against)' : 'GA (Goals Against)'}>GA</th>
              <th className="py-4 px-3 text-center" title={language === 'ar' ? 'Net (الفرق)' : language === 'fr' ? 'Différence de buts (GD)' : 'GD (Goal Difference)'}>GD</th>
              <th className="py-4 px-4 text-right">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayData.map((row: any, idx) => {
              const teamName = row.team?.name || row.team?.shortName || "Unknown";
              const teamShortName = row.team?.shortName || "";
              const isCA = teamName.toLowerCase().includes('africain');
              const logo = clubLogoMap[teamName] || clubLogoMap[teamShortName] || null;

              // Qualification logic
              const pos = row.position;
              const getQualification = (position: number) => {
                if (position <= 2) return { label: '', color: 'bg-green-500', text: 'green-500' };
                if (position === 3) return { label: '', color: 'bg-yellow-500', text: 'yellow-500' };
                if (position >= 15) return { label: '', color: 'bg-red-600', text: 'red-500' };
                return null;
              };
              const qual = getQualification(pos);

              return (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 10) * 0.05 }}
                  className={`${isCA ? 'bg-[#C8102E]/10' : 'hover:bg-[var(--foreground)]/5'} transition-colors group`}
                >
                  <td className="py-4 px-6 text-center font-bold text-[var(--foreground)]/70 group-hover:text-[var(--foreground)]">
                    <div className="flex items-center justify-center gap-1">
                      <span>{row.position}</span>
                      {qual && (
                        <span className={`text-[8px] px-1 py-1 rounded ${qual.color} text-white font-bold`} title={pos <= 2 ? 'CAF Champions League' : pos === 3 ? 'CAF Confederation Cup' : 'Relegation to Division 2'}>
                          {qual.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center p-1.5 overflow-hidden">
                        {logo ? (
                          <NextImage
                            src={logo}
                            alt={teamName}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-[8px] font-bold text-white/50">{teamName.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className={`font-bold tracking-tight ${isCA ? 'text-[#C8102E]' : 'text-[var(--foreground)]/90'}`}>{teamName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center text-[var(--foreground)]/60">{row.matches}</td>
                  <td className="py-4 px-3 text-center text-[var(--foreground)]/60">{row.wins}</td>
                  <td className="py-4 px-3 text-center text-[var(--foreground)]/60">{row.draws}</td>
                  <td className="py-4 px-3 text-center text-[var(--foreground)]/60">{row.losses}</td>
                  <td className="py-4 px-3 text-center text-[var(--foreground)]/60">{row.goalsFor ?? 0}</td>
                  <td className="py-4 px-3 text-center text-[var(--foreground)]/60">{row.goalsAgainst ?? 0}</td>
                  <td className={`py-4 px-3 text-center font-black ${(row.goalDifference ?? 0) > 0 ? 'text-green-500' : (row.goalDifference ?? 0) < 0 ? 'text-red-500' : 'text-[var(--foreground)]/60'}`}>
                    {row.goalDifference ?? 0}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-[var(--foreground)]">{row.points}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-white/[0.02] text-center">
        <p className="text-[10px] text-[var(--foreground)]/20 uppercase font-medium tracking-widest italic">
          {language === 'ar' ? 'تحديث تلقائي بعد كل مباراة' : language === 'fr' ? 'Mis à jour après chaque match' : 'Updated automatically after each match'}
        </p>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(150, 150, 150, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(150, 150, 150, 0.5);
        }
      `}</style>
    </div>
  );
}
// Add this after imports (line ~1030)
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Top Scorers & Top Assists mini-tables (2026/27 Ligue 1 Pro)
const TOP_SCORERS: TopStatRow[] = [
  { name: "Taddeus Nkeng", team: "Club Africain", short: "CA", stat: 2, isCA: true, image: "/players/nkeng.png" },
  { name: "Bassem Srarfi", team: "Club Africain", short: "CA", stat: 1, isCA: true, image: "/players/srarfi.png" },
  { name: "Phillippe Kinzumbi", team: "Club Africain", short: "CA", stat: 1, isCA: true, image: "/players/kinzumbi.webp" },
  { name: "Aymen Harzi", team: "Club Africain", short: "CA", stat: 1, isCA: true, image: "/players/harzi.png" },
  { name: "Saidou Khan", team: "Club Africain", short: "CA", stat: 1, isCA: true, image: "/players/khan.png" },
];

const TOP_ASSISTS: TopStatRow[] = [
  { name: "Bilel Aït Malek", team: "Club Africain", short: "CA", stat: 2, isCA: true, image: "/players/aitmalek.png" },
  { name: "Ghaith Zaalouni", team: "Club Africain", short: "CA", stat: 1, isCA: true, image: "/players/zaalouni.webp" },
  { name: "Osama Elsharimi", team: "Club Africain", short: "CA", stat: 1, isCA: true, image: "/players/sherimi.png" },
  { name: "Houssem Ben Ali", team: "Club Africain", short: "CA", stat: 1, isCA: true, image: "/cards/ben ali.png" },
  { name: "Mootez Zaddem", team: "Club Africain", short: "CA", stat: 1, isCA: true, image: null },
];

type TopStatRow = { name: string; team: string; short: string; stat: number; isCA: boolean; image: string | null };

function TopStatsCard({ title, icon, rows, accent, language }: { title: string; icon: React.ReactNode; rows: TopStatRow[]; accent: string; language: "en" | "fr" | "ar" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ ...scrollTransitionFast }}
      className="relative rounded-3xl bg-[var(--card)] border border-[var(--foreground)]/10 overflow-hidden shadow-xl"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" />
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--foreground)]/10">
        <div className="flex items-center gap-2.5">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>{icon}</span>
          <h4 className="font-black uppercase tracking-wider text-[var(--foreground)] text-sm">{title}</h4>
        </div>
        <span className="text-[10px] text-[var(--foreground)]/40 uppercase font-bold tracking-widest">
          {language === 'ar' ? 'موسم 2026/27' : language === 'fr' ? 'Saison 2026/27' : 'Season 2026/27'}
        </span>
      </div>
      <div className="p-3 space-y-1.5">
        {rows.map((row, index) => (
          <div key={index} className={`flex items-center justify-between rounded-xl px-3 py-2 ${row.isCA ? 'bg-[#C8102E]/10 ring-1 ring-[#C8102E]/20' : 'bg-[var(--foreground)]/[0.03]'} transition-colors`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[11px] font-black ${
                index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                index === 1 ? 'bg-gray-400/20 text-gray-300' :
                index === 2 ? 'bg-amber-700/25 text-amber-500' :
                'bg-[var(--foreground)]/10 text-[var(--foreground)]/50'
              }`}>
                {index + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--foreground)]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {row.image ? (
                  <NextImage src={row.image} alt={row.name} width={26} height={26} className="object-cover rounded-full" />
                ) : (
                  <span className="text-[10px] font-black text-[var(--primary)]">{row.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[var(--foreground)] font-bold text-sm truncate">{row.name}</p>
                <p className={`text-[10px] ${row.isCA ? 'text-[#C8102E]' : 'text-[var(--foreground)]/40'} font-bold uppercase tracking-wider`}>{row.team}</p>
              </div>
            </div>
            <span className="text-lg font-black text-[var(--primary)] shrink-0">{row.stat}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TopStatsCards({ language }: { language: "en" | "fr" | "ar" }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mt-6 px-4 sm:px-6">
      <TopStatsCard
        title={language === 'ar' ? 'أفضل الهدافين' : language === 'fr' ? 'Meilleurs Buteurs' : 'Top Scorers'}
        icon={<Trophy size={16} className="text-[#D4AF37]" />}
        accent="bg-amber-500/15"
        rows={TOP_SCORERS}
        language={language}
      />
      <TopStatsCard
        title={language === 'ar' ? 'أفضل صانعي الأهداف' : language === 'fr' ? 'Meilleurs Passeurs' : 'Top Assists'}
        icon={<Users size={16} className="text-[var(--primary)]" />}
        accent="bg-[var(--primary)]/15"
        rows={TOP_ASSISTS}
        language={language}
      />
    </div>
  );
}

function HeroScrollDemo({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const standingsRef = useRef<HTMLDivElement>(null);
  const standingsTitle = language === "ar" ? "ترتيب الرابطة المحترفة الأولى" : language === "fr" ? "Classement Ligue 1 Pro" : "Ligue 1 Pro Standings";
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section id="standings" ref={ref} className="relative pt-12 pb-0 overflow-hidden mt-10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={scrollTransition}
          className="text-center mb-6"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={scrollSpring}
            className={`inline-block px-6 py-2 rounded-full border text-sm font-semibold mb-4 transition-colors duration-300 ${theme === 'light' ? 'bg-[#800020]/10 border-[#800020]/30 text-[#800020]' : 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'}`}
          >
            {translations[language].history.standings}
          </motion.span>
          <br />
          <div ref={standingsRef} className="inline-block">
            <p
              className={`text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter italic ${theme === 'light' ? 'text-[#800020]' : 'text-[#C8102E]'}`}
              style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}
            >
              <VariableProximityText
                label={standingsTitle}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={standingsRef}
                radius={150}
                falloff="gaussian"
              />
            </p>
          </div>
          <p className="text-[var(--foreground)] opacity-60 max-w-2xl mx-auto text-lg mt-4 border-[var(--foreground)]/10 pb-4">
            {language === 'ar' ? 'متابعة حية لترتيب البطولة التونسية' : language === 'fr' ? 'Suivi en direct du classement du championnat tunisien' : 'Live tracking of the Tunisian league standings'}
          </p>
        </motion.div>

        <ContainerScroll titleComponent={<div className="h-4" />}>
          <StandingsTable language={language} theme={theme} />
          <TopStatsCards language={language} />
        </ContainerScroll>
      </div>
    </section>
  );
}

// Translations dictionary
const translations = {
  en: {
    nav: ["Home", "History", "Trophies", "Team", "Academy", "News", "Standings", "Matches", "Shop", "Contact"],
    hero: {
      title: "CLUB AFRICAIN",
      tagline: "A Legacy of Glory, Passion, and Red-White Pride",
      stats: ["Founded", "Titles", "Fans"],
      watch: "Watch Highlights",
      explore: "Explore More"
    },
    history: {
      header: "SINCE 1920",
      title: "OUR HISTORY",
      subtitle: "Over a century of passion, glory, and unwavering dedication to excellence.",
      milestones: [
        { title: "Foundation", desc: "Official foundation of Club Africain on October 4, 1920 in Tunis." },
        { title: "First Division", desc: "Promoted to the Tunisian First Division for the first time." },
        { title: "First League Title", desc: "Won the first Tunisian league title in the club’s history." },
        { title: "Post-Independence Elite", desc: "Confirmed elite status after Tunisian independence." },
        { title: "Domestic Double", desc: "Won both the League and the Tunisian Cup in the same season." },
        { title: "African Debut", desc: "First participation in African continental competitions." },
        { title: "International Trophy", desc: "Won the Maghreb Cup Winners Cup, first international title." },
        { title: "CAF Champions", desc: "Won the CAF Champions League, first Tunisian club to do so." },
        { title: "Afro-Asian Cup", desc: "Won the first leg of the Afro-Asian Cup." },
        { title: "Arab Cup Winners", desc: "Won the Arab Cup Winners' Cup." },
        { title: "Arab Champions", desc: "Crowned Arab Champions League winners." },
        { title: "North African Champions", desc: "Won the North African Cup of Champions." },
        { title: "League Comeback", desc: "Won the league title after a long wait." },
        { title: "Centenary", desc: "Celebrated 100 years of Club Africain history." },
        { title: "New Era", desc: "Entering a new era while honoring the club’s historic legacy." }
      ],
      standings: "Ligue 1 Standings",
    },
    trophies: {
      title: "Trophy Cabinet",
      subtitle: "A collection of silverware that tells our story.",
      items: ["Tunisian League", "Tunisian Cup", "Super Cup", "North African Champ", "Arab Cup", "Arab Champ", "Maghreb Cup Winners' Cup", "Maghreb Cup Champions Clubs", "CAF Champions", "Afro-Asian Cup"],
      total: "Total Trophies"
    },
    academy: {
      title: "The Academy",
      subtitle: "Monitor the next generation of superstars. Track U19 & U21 prospects as they rise through the ranks to the first team.",
      futureStar: "FUTURE STAR",
      potm: "PLAYER OF THE MONTH",
      voteText: "Vote for your favorite talent",
      voteBtn: "VOTE NOW",
      yo: "yo",
      striker: "Striker",
      midfielder: "Midfielder",
      defender: "Defender",
      enterPlayer: "Enter player name",
      topPlayers: "Top Voted Players",
      votes: "votes",
      thankYou: "Thank you for voting!",
      alreadyVoted: "You've already voted for"
    },
    team: {
      header: "THE SQUAD",
      title: "Team Roster",
      bench: "Bench",
      fanTab: "",
      realTab: "",
      formationLabel: "Formation",
      dragHint: "Drag to swap",
      resetBtn: "Reset",
      loading: "Loading live squad data...",
      error: "Live squad unavailable. Using fallback."
    },
    matches: {
      title: "Fixtures & Results",
      upcoming: "Upcoming",
      results: "Results",
      stats: "Top Scorer : M. Zaddem"
    },
    news: {
      header: "LATEST",
      title: "Club News",
      subtitle: "Latest Club Africain news, updated daily",
      more: "Read More",
      showLess: "Show Less",
      readMore: "Read More"
    },
    tickets: {
      header: "TICKETS",
      title: "Match Tickets",
      buy: "Buy Now",
      pointsBuy: "Buy with Points",
      types: ["Pelouse", "Upper", "Lower"],
      states: ["Available", "Limited", "Selling Fast"],
      details: [
        ["Category", "GA"], ["Access", "Stand"], ["View", "Pitch"], ["Best For", "Ultras"],
        ["Category", "Upper"], ["Access", "Seat"], ["View", "High"], ["Best For", "Family"],
        ["Category", "Lower"], ["Access", "VIP"], ["View", "Close"], ["Best For", "Premium"]
      ]
    },
    shop: {
      header: "OFFICIAL SHOP",
      title: "Club Store",
      subtitle: "Get the 2025/26 collection.",
      buy: "ADD TO CART",
      pointsBuy: "Buy with Points",
      more: "SEE ALL",
      less: "SHOW LESS",
      products: [
        { name: "Home Jersey 24/25", category: "Jersey" },
        { name: "Lion Sweatshirt", category: "Casual" },
        { name: "Basketball Jersey", category: "Sports" },
        { name: "Home Jersey (Promo)", category: "Jersey" },
        { name: "Croco Bombers", category: "Casual" },
        { name: "Circle Polo", category: "Casual" },
        { name: "Bicolor Parka", category: "Casual" },
        { name: "Lion Tracksuit", category: "Casual" },
        { name: "Demi Zip Lion", category: "Casual" },
        { name: "Grey Hoodie", category: "Casual" },
        { name: "Club Vest", category: "Casual" },
        { name: "Kids Jersey", category: "Jersey" },
        { name: "Third Jersey", category: "Jersey" },
        { name: "Training Kit", category: "Training" },
        { name: "Auth Demi Zip", category: "Casual" },
      ]
    },
    boutique: {
      header: "OFFICIAL STORE",
      title: "Club Africain Boutique",
      subtitle: "Get your official 2025/26 collection and wear the colors with pride.",
      buy: "ADD TO CART",
      more: "SEE ALL PRODUCTS",
      less: "SHOW LESS"
    },
    footer: {
      tagline: "Club Africain has been a true institution in Tunisia since its creation in 1920. It is a renowned football club that has built itself up. You will find all your Lefri9i products at clubafricain.com (match outfits, lifestyle, accessories...).",
      links: "Quick Links",
      contact: "Contact",
      subscribe: "Stay Updated",
      subText: "Subscribe to our newsletter for the latest news.",
      button: "Subscribe",
      rights: "All rights reserved.",
      placeholder: "Your email"
    }
  },
  fr: {
    nav: ["Accueil", "Histoire", "Trophées", "Équipe", "Académie", "Actualités", "Classements", "Matchs", "Boutique", "Contact"],
    hero: {
      title: "CLUB AFRICAIN",
      tagline: "Un héritage de gloire, de passion et de fierté rouge et blanc",
      stats: ["Fondé en", "Titres", "Fans"],
      watch: "Voir les moments forts",
      explore: "Explorer plus"
    },
    history: {
      header: "DEPUIS 1920",
      title: "NOTRE HISTOIRE",
      subtitle: "Plus d'un siècle de passion, de gloire et de dévouement inébranlable à l'excellence.",
      milestones: [
        { title: "Fondation", desc: "Fondation officielle du Club Africain le 4 octobre 1920 à Tunis." },
        { title: "Premiers matchs", desc: "Dispute des premiers matchs officiels dans les compétitions tunisiennes." },
        { title: "Identité nationale", desc: "Affirmation comme club tunisien fort durant la période coloniale." },
        { title: "Première division", desc: "Accession pour la première fois à la Première Division tunisienne." },
        { title: "Premier titre de championnat", desc: "Remporte le premier titre de championnat de son histoire." },
        { title: "Élite post-indépendance", desc: "Confirmation du statut de club d’élite après l’indépendance de la Tunisie." },
        { title: "Doublé national", desc: "Victoire du championnat et de la Coupe de Tunisie lors de la même saison." },
        { title: "Débuts africains", desc: "Première participation aux compétitions africaines." },
        { title: "Premier trophée international", desc: "Vainqueur de la Coupe du Maghreb des vainqueurs de coupe." },
        { title: "Finale africaine", desc: "Atteint la finale de la Coupe d’Afrique des clubs champions." },
        { title: "Champions d’Afrique", desc: "Remporte la Ligue des Champions de la CAF, premier club tunisien à le faire." },
        { title: "Coupe Afro-Asiatique", desc: "Victoire lors du match aller de la Coupe Afro-Asiatique." },
        { title: "Coupe arabe des vainqueurs de coupe", desc: "Remporte la Coupe arabe des vainqueurs de coupe." },
        { title: "Champions arabes", desc: "Sacré champion de la Ligue des Champions arabes." },
        { title: "Champions d’Afrique du Nord", desc: "Remporte la Coupe d’Afrique du Nord des champions." },
        { title: "Retour au titre", desc: "Remporte le championnat après une longue période d’attente." },
        { title: "Centenaire", desc: "Célébration des 100 ans d’histoire du Club Africain." },
        { title: "Nouvelle ère", desc: "Entrée dans une nouvelle ère tout en respectant l’héritage historique du club." }
      ],
      standings: "Classement Ligue 1",
    },
    trophies: {
      title: "Galerie des Trophées",
      subtitle: "Une collection qui raconte notre histoire.",
      items: ["Ligue Tunisienne", "Coupe de Tunisie", "Super Coupe", "Champ Nord-Africain", "Coupe Arabe", "Champ Arabe", "Coupe du Maghreb des vainqueurs de coupe", "Coupe du Maghreb des clubs champions", "Ligue CAF", "Coupe Afro-Asiatique"],
      total: "Total des trophées"
    },
    academy: {
      title: "L'Académie",
      subtitle: "Surveillez la prochaine génération de superstars. Suivez les espoirs U19 et U21 alors qu'ils montent dans l'équipe première.",
      futureStar: "FUTURE STAR",
      potm: "JOUEUR DU MOIS",
      voteText: "Votez pour votre talent préféré",
      voteBtn: "VOTER MAINTENANT",
      yo: "ans",
      striker: "Attaquant",
      midfielder: "Milieu",
      defender: "Défenseur",
      enterPlayer: "Entrez le nom du joueur",
      topPlayers: "Joueurs les plus votés",
      votes: "votes",
      thankYou: "Merci pour votre vote!",
      alreadyVoted: "Vous avez déjà voted pour"
    },
    team: {
      header: "L'EFFECTIF",
      title: "Effectif de l'équipe",
      bench: "Banc",
      fanTab: "XI du Fan",
      realTab: "XI Officiel",
      formationLabel: "Formation",
      dragHint: "Glissez pour échanger",
      resetBtn: "Reset",
      loading: "Chargement de l'effectif...",
      error: "Effectif live indisponible. Utilisation du secours."
    },
    matches: {
      title: "Calendrier & Résultats",
      upcoming: "À venir",
      results: "Résultats",
      stats: "1er en Ligue 1 • Buteur: M. Zaddem"
    },
    news: {
      header: "ACTU",
      title: "Actualités du Club",
      subtitle: "Dernières actualités du Club Africain, mises à jour quotidiennement",
      more: "Lire plus",
      showLess: "Voir moins",
      readMore: "Lire plus"
    },
    stadium: {
      header: "NOTRE MAISON",
      title: "Stade de Radès",
      subtitle: "La forteresse où les rêves prennent vie.",
      stats: ["Capacité", "Lieu", "Construit", "Atmosphère"],
      values: ["60 000", "Tunis", "1967", "Électrique"],
      hint: "Explorer"
    },
    tickets: {
      header: "BILLETS",
      title: "Billets de Match",
      buy: "Acheter",
      pointsBuy: "Acheter avec Points",
      types: ["Pelouse", "Supérieure", "Inférieure"],
      states: ["Disponible", "Limité", "Vente Rapide"],
      details: [
        ["Catégorie", "GA"], ["Accès", "Debout"], ["Vue", "Terrain"], ["Idéal Pour", "Ultras"],
        ["Catégorie", "Supérieure"], ["Accès", "Assis"], ["Vue", "Haute"], ["Idéal Pour", "Famille"],
        ["Catégorie", "Inférieure"], ["Accès", "VIP"], ["Vue", "Proche"], ["Idéal Pour", "Premium"]
      ]
    },
    shop: {
      header: "BOUTIQUE",
      title: "Shop Officiel",
      subtitle: "Collection 2025/26.",
      buy: "AJOUTER",
      pointsBuy: "Acheter avec Points",
      more: "VOIR TOUT",
      less: "MOINS",
      products: [
        { name: "Maillot Home 24/25", category: "Maillot" },
        { name: "Sweat Lion 25/26", category: "Casual" },
        { name: "Maillot Basket 24/25", category: "Basket" },
        { name: "Maillot Home (Promo)", category: "Maillot" },
        { name: "Bombers Croco 25/26", category: "Casual" },
        { name: "Polo Sangle Cercle", category: "Casual" },
        { name: "Parka Bicolore 25/26", category: "Casual" },
        { name: "Survêtement Lion 25/26", category: "Casual" },
        { name: "Demi Zip Lion 25/26", category: "Casual" },
        { name: "Capuche Lion Gris 25/26", category: "Casual" },
        { name: "Gilet Club 25/26", category: "Casual" },
        { name: "Maillot Kids 25/26", category: "Maillot" },
        { name: "Maillot Third 25/26", category: "Maillot" },
        { name: "Maillot Training Lion 25/26", category: "Training" },
        { name: "Demi Zip Authentique 25/26", category: "Casual" },
      ]
    },
    boutique: {
      header: "BOUTIQUE OFFICIELLE",
      title: "Boutique Club Africain",
      subtitle: "Découvrez la collection officielle 2025/26 et portez fièrement les couleurs.",
      buy: "AJOUTER AU PANIER",
      more: "VOIR TOUS LES PRODUITS",
      less: "VOIR MOINS"
    },
    footer: {
      tagline: "Le Club Africain est une véritable institution en Tunisie depuis sa création en 1920. Il s'agit d'un club de football de renom qui a su se forger.Vous trouverez chez clubafricain.com tous vos produits Lefri9i (tenues de match, lifestyle , accessoires...)",
      links: "Liens rapides",
      contact: "Contact",
      subscribe: "Restez à jour",
      subText: "Abonnez-vous à notre newsletter pour les dernières nouvelles.",
      button: "S'abonner",
      rights: "Tous droits réservés.",
      placeholder: "Votre email"
    }
  },
  ar: {
    nav: ["الرئيسية", "التاريخ", "الألقاب", "الفريق", "الأكاديمية", "الأخبار", "الترتيب", "المباريات", "المغازة", "اتصل بنا"],
    hero: {
      title: "النادي الإفريقي",
      tagline: "إرث من المجد والعاطفة والفخر باللونين الأحمر والأبيض",
      stats: ["تأسست", "ألقاب", "مشجعين"],
      watch: "شاهد الأهداف",
      explore: "اكتشف المزيد"
    },
    history: {
      header: "منذ 1920",
      title: "تاريخنا",
      subtitle: "أكثر من قرن من العاطفة والمجد والتفاني الذي لا يتزعزع من أجل التميز.",
      milestones: [
        { title: "التأسيس", desc: "التأسيس الرسمي للنادي الإفريقي يوم 4 أكتوبر 1920 في تونس." },
        { title: "أول المباريات", desc: "خوض أول المباريات الرسمية في المسابقات التونسية." },
        { title: "الهوية الوطنية", desc: "ترسّخ النادي كقوة تونسية خالصة خلال فترة الاستعمار." },
        { title: "الصعود للقسم الأول", desc: "الصعود إلى الرابطة الأولى التونسية لأول مرة." },
        { title: "أول لقب بطولة", desc: "التتويج بأول بطولة دوري في تاريخ النادي." },
        { title: "نخبة ما بعد الاستقلال", desc: "تأكيد مكانة النادي ضمن نخبة كرة القدم التونسية بعد الاستقلال." },
        { title: "الثنائية المحلية", desc: "التتويج بالبطولة والكأس في نفس الموسم." },
        { title: "الظهور الإفريقي الأول", desc: "أول مشاركة في المسابقات الإفريقية القارية." },
        { title: "أول لقب دولي", desc: "التتويج بكأس المغرب العربي للأندية الفائزة بالكؤوس." },
        { title: "نهائي إفريقيا", desc: "الوصول إلى نهائي كأس إفريقيا للأندية البطلة." },
        { title: "أبطال إفريقيا", desc: "التتويج بدوري أبطال إفريقيا كأول نادٍ تونسي يحقق اللقب." },
        { title: "كأس الأفرو-آسيوية", desc: "الفوز بمباراة الذهاب في كأس الأفرو-آسيوية." },
        { title: "كأس العرب للأندية الفائزة بالكؤوس", desc: "التتويج بكأس العرب للأندية الفائزة بالكؤوس." },
        { title: "أبطال العرب", desc: "التتويج بدوري أبطال العرب." },
        { title: "أبطال شمال إفريقيا", desc: "التتويج بكأس شمال إفريقيا للأبطال." },
        { title: "عودة التتويج", desc: "الفوز بلقب الدوري بعد انتظار طويل." },
        { title: "المئوية", desc: "الاحتفال بمرور 100 سنة على تأسيس النادي الإفريقي." },
        { title: "الحقبة الجديدة", desc: "الدخول في مرحلة جديدة مع الحفاظ على الإرث التاريخي للنادي." }
      ],
      standings: "ترتيب الرابطة الأولى",
    },
    trophies: {
      title: "خزانة الألقاب",
      subtitle: "مجموعة من الألقاب التي تحكي قصة مجدنا.",
      items: ["البطولة التونسية", "كأس تونس", "السوبر التونسي", "بطل شمال إفريقيا", "الكأس العربية", "البطل العربي","كأس الفائزين بكأس المغرب","الكأس المغاربيةأندية أبطال كأس المغرب ", "أبطال إفريقيا", "الكأس الأفروآسيوية"],
      total: "إجمالي الألقاب"
    },
    academy: {
      title: "أكاديمية النادي",
      subtitle: "راقب الجيل القادم من النجوم. تتبع مواهب تحت 19 وتحت 21 عاماً وهم يصعدون إلى الفريق الأول.",
      futureStar: "نجم المستقبل",
      potm: "لاعب الشهر",
      voteText: "صوّت لموهبتك المفضلة",
      voteBtn: "صوّت الآن",
      yo: "سنة",
      striker: "مهاجم",
      midfielder: "وسط ميدان",
      defender: "مدافع",
      enterPlayer: "أدخل اسم اللاعب",
      topPlayers: "اللاعبون الأكثر تصويتاً",
      votes: "تصويت",
      thankYou: "شكراً لتصويتك!",
      alreadyVoted: "لقد صوّتتم بالفعل لـ"
    },
    team: {
      header: "التشكيلة",
      title: "قائمة الفريق",
      bench: "الاحتياط",
      fanTab: "تشكيلة المشجع",
      realTab: "التشكيلة الرسمية",
      formationLabel: "التشكيلة",
      dragHint: "اسحب للتبديل",
      resetBtn: "إعادة",
      loading: "جاري تحميل قائمة اللاعبين المباشرة...",
      error: "قائمة اللاعبين المباشرة غير متوفرة. يتم استخدام البيانات المخزنة."
    },
    matches: {
      title: "المباريات والنتائج",
      upcoming: "القادمة",
      results: "النتائج",
      stats: "متصدر الدوري • الهداف: ف. شواط (11)"
    },
    news: {
      header: "الأخبار",
      title: "أخبار النادي",
      subtitle: "أحدث أخبار النادي الإفريقي، متجددة يومياً",
      more: "المزيد",
      showLess: "عرض أقل",
      readMore: "اقرأ المزيد"
    },
    stadium: {
      header: "بيتنا",
      title: "ملعب رادس",
      subtitle: "الحصن الذي تتحقق فيه الأحلام.",
      stats: ["السعة", "الموقع", "بني في", "الأجواء"],
      values: ["60,000", "تونس", "1967", "كهربائية"],
      hint: "استكشف"
    },
    tickets: {
      header: "التذاكر",
      title: "تذاكر المباراة",
      buy: "احجز الآن",
      pointsBuy: "شراء بالنقاط",
      types: ["فيراج", "مدارج علوية", "مدارج سفلية"],
      states: ["متوفر", "محدود", "بيع سريع"],
      details: [
        ["الفئة", "دخول عام"], ["الدخول", "وقوف"], ["الرؤية", "ملعب"], ["الأفضل لـ", "الألتراس"],
        ["الفئة", "علوية"], ["الدخول", "جلوس"], ["الرؤية", "عالية"], ["الأفضل لـ", "العائلات"],
        ["الفئة", "سفلية"], ["الدخول", "VIP"], ["الرؤية", "قريبة"], ["الأفضل لـ", "متميز"]
      ]
    },
    shop: {
      header: "المغازة",
      title: "المغازة الرسمية",
      subtitle: "مجموعة 2025/26.",
      buy: "أضف",
      pointsBuy: "شراء بالنقاط",
      more: "الكل",
      less: "أقل",
      buyPoints: "شراء بالنقاط",
      products: [
        { name: "قميص الأساسي 24/25", category: "قميص" },
        { name: "سويت شيرت الأسد 25/26", category: "ملابس" },
        { name: "قميص كرة السلة 24/25", category: "رياضة" },
        { name: "قميص الأساسي (عرض)", category: "قميص" },
        { name: "بومبرز كروكو 25/26", category: "ملابس" },
        { name: "بولو سيرانغل 25/26", category: "ملابس" },
        { name: "باركا بلونين 25/26", category: "ملابس" },
        { name: "ترينينغ الأسد 25/26", category: "ملابس" },
        { name: "ديمي زيب الأسد 25/26", category: "ملابس" },
        { name: "هودي رمادي 25/26", category: "ملابس" },
        { name: "جيليه النادي 25/26", category: "ملابس" },
        { name: "قميص للأطفال 25/26", category: "قميص" },
        { name: "القميص الثالث 25/26", category: "قميص" },
        { name: "قميص التدريب 25/26", category: "تدريب" },
        { name: "ديمي زيب أصلي 25/26", category: "ملابس" },
      ]
    },
    boutique: {
      header: "المغازة الرسمية",
      title: "مغازة النادي الإفريقي",
      subtitle: "احصل على المجموعة الرسمية 2025/26 وارتدِ الألوان بفخر.",
      buy: "أضف للسلة",
      more: "عرض جميع المنتجات",
      less: "عرض أقل"
    },
    footer: {
      tagline: "لقد كان النادي الإفريقي مؤسسة حقيقية في تونس منذ إنشائه عام 1920. إنه نادي كرة قدم مشهور قام ببناء نفسه. ستجد جميع منتجات Lefri9i الخاصة بك على موقع clubafricain.com (الأزياء المتطابقة ونمط الحياة والإكسسوارات وما إلى ذلك...)",
      links: "روابط سريعة",
      contact: "اتصل بنا",
      subscribe: "ابق على اطلاع",
      subText: "اشترك في نشرتنا الإخبارية للحصول على آخر الأخبار.",
      button: "اشترك",
      rights: "جميع الحقوق محفوظة.",
      placeholder: "بريدك الإلكتروني"
    }
  }
};
// Floating particles component
function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(() => Array.from({ length: 20 }), []);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#C8102E] rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          whileInView={{
            y: [-20, -100, -20],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          viewport={{ once: false }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}


// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Search Modal Component
function SearchModal({ isOpen, onClose, language }: { isOpen: boolean; onClose: () => void; language: string }) {
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus();
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    // Simple mock search across site data
    const pool = [
      { type: "News", title: "Club Africain celebrates its 100th anniversary with pride", href: "#news" },
      { type: "News", title: "New high-tech training center project at the Park Mounir Kebaili", href: "#news" },
      { type: "News", title: "Mercato: Official signing of a new striker", href: "#news" },
      { type: "Team", title: "Mouez Hassen - Goalkeeper", href: "#team" },
      { type: "Team", title: "Rami Bedoui - Defender", href: "#team" },
      { type: "Team", title: "Bassem Srarfi - Forward", href: "#team" },
      { type: "Team", title: "Kingsley Eduwo - Striker", href: "#team" },
      { type: "History", title: "The Legend of the 1991 Quadruple", href: "#history" },
      { type: "Trophy", title: "CAF Champions League 1991", href: "#trophies" },
      { type: "Shop", title: "Official Home Jersey 2025/26", href: "#shop" },
      { type: "Shop", title: "Club Africain Scarf - Ultra Style", href: "#shop" },
      { type: "Tickets", title: "Next Match vs US Monastir", href: "#tickets" },
      { type: "Tickets", title: "Derby Tickets: CA vs EST", href: "#tickets" },
    ];
    return pool.filter(item => item.title.toLowerCase().includes(lowerQuery));
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-6"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            className="w-full max-w-2xl bg-[var(--card)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--primary)]/30 relative z-10"
          >
            <div className="p-6">
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-[var(--primary)]" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={language === "ar" ? "ابحث عن أخبار، لاعبين، أو منتجات..." : language === "fr" ? "Rechercher des actualités, joueurs, produits..." : "Search news, players, products..."}
                  className="w-full bg-[var(--background)] border-2 border-[var(--primary)]/10 focus:border-[var(--primary)] rounded-2xl py-4 pl-12 pr-12 text-[var(--foreground)] text-lg transition-all outline-none"
                />
                <button onClick={onClose} className="absolute right-4 text-[var(--foreground)] opacity-40 hover:opacity-100">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {results.length > 0 ? (
                  <div className="space-y-2">
                    {results.map((res, i) => (
                      <motion.a
                        key={i}
                        href={res.href}
                        onClick={onClose}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)] hover:bg-[var(--primary)]/5 border border-transparent hover:border-[var(--primary)]/20 transition-all group"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full mb-1 inline-block">
                            {res.type}
                          </span>
                          <h4 className="text-[var(--foreground)] font-semibold group-hover:text-[var(--primary)] transition-colors">
                            {res.title}
                          </h4>
                        </div>
                        <ArrowRight size={16} className="text-[var(--primary)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </motion.a>
                    ))}
                  </div>
                ) : query ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--foreground)] opacity-40">
                      {language === "ar" ? "لم يتم العثور على نتائج" : "No results found for your search."}
                    </p>
                  </div>
                ) : (
                  <div className="py-6">
                    <h5 className="text-[var(--foreground)] opacity-40 text-xs font-bold uppercase tracking-widest mb-4">
                      {language === "ar" ? "عمليات البحث الشائعة" : "Frequent Searches"}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {["Tickets", "Jersey", "Derby", "History"].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="px-4 py-2 rounded-full bg-[var(--primary)]/5 hover:bg-[var(--primary)] text-[var(--foreground)] hover:text-white text-sm transition-all border border-[var(--primary)]/10"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Authentication Modal Component
function AuthModal({ isOpen, onClose, language, onLogin }: { isOpen: boolean; onClose: () => void; language: string; onLogin: (user: any) => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!fAuth) {
      setError("Auth service unavailable");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (isSignUp) {
        res = await createUserWithEmailAndPassword(fAuth, email, password);
        if (fAuth.currentUser) {
          await updateProfile(fAuth.currentUser, { displayName: name || email.split("@")[0] });
        }
      } else {
        res = await signInWithEmailAndPassword(fAuth, email, password);
      }

      const u = res.user;
      const userData = {
        uid: u.uid,
        name: u.displayName || name || u.email?.split("@")[0] || "User",
        email: u.email,
        points: 0,
        avatar: u.photoURL || "/anas.jpeg"
      };

      onLogin(userData);
      localStorage.setItem("ca_user", JSON.stringify(userData));
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: any) => {
    setError("");
    setLoading(true);

    if (!fAuth || !provider) {
      setError("Provider unavailable");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithPopup(fAuth, provider);
      const u = result.user;
      const userData = {
        uid: u.uid,
        name: u.displayName || "User",
        email: u.email,
        points: 0,
        avatar: u.photoURL || "/anas.jpeg"
      };
      onLogin(userData);
      localStorage.setItem("ca_user", JSON.stringify(userData));
      onClose();
    } catch (err: any) {
      setError(err.message || "Provider login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-md bg-[var(--card)] text-[var(--foreground)] rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-[var(--border)] relative z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-[var(--foreground)]/60 hover:text-[var(--primary)] hover:bg-[var(--foreground)]/5 transition-all"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Logo Badge */}
            <div className="relative w-16 h-16 mb-4 p-2 bg-[var(--foreground)]/5 rounded-2xl border border-[var(--foreground)]/10 flex items-center justify-center shadow-lg">
              <NextImage src="/ca.png" alt="Club Africain" fill className="object-contain p-2" />
            </div>

            {/* Title */}
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[var(--foreground)] mb-1">
              {isSignUp
                ? (language === "ar" ? "إنشاء حساب جديد" : language === "fr" ? "Créer un compte" : "Create Account")
                : (language === "ar" ? "تسجيل الدخول" : language === "fr" ? "Connexion" : "Welcome Back")}
            </h3>
            <p className="text-xs text-[var(--foreground)]/60 mb-6 text-center">
              {isSignUp
                ? (language === "ar" ? "انضم إلى عائلة الإفريقي واستمتع بالميزات الحصرية" : "Rejoignez la famille clubiste et gagnez des points")
                : (language === "ar" ? "أدخل بياناتك للمتابعة" : "Accédez à votre espace supporter Club Africain")}
            </p>

            {/* Tabs */}
            <div className="w-full flex p-1 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/10 mb-6">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(""); }}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  !isSignUp
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
                }`}
              >
                {language === "ar" ? "تسجيل الدخول" : language === "fr" ? "Connexion" : "Log In"}
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(""); }}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  isSignUp
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
                }`}
              >
                {language === "ar" ? "حساب جديد" : language === "fr" ? "Inscription" : "Sign Up"}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="w-full flex flex-col gap-3.5">
              {isSignUp && (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    placeholder={language === "ar" ? "الاسم واللقب" : "Nom complet"}
                    type="text"
                    required={isSignUp}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 bg-[var(--background)] text-[var(--foreground)] text-sm transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  placeholder={language === "ar" ? "البريد الإلكتروني" : "Adresse email"}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 bg-[var(--background)] text-[var(--foreground)] text-sm transition-all"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  placeholder={language === "ar" ? "كلمة المرور" : "Mot de passe"}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 bg-[var(--background)] text-[var(--foreground)] text-sm transition-all"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:opacity-95 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[var(--primary)]/30 transition-all uppercase tracking-wide text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isSignUp ? (
                  language === "ar" ? "إنشاء الحساب" : "Créer mon compte"
                ) : (
                  language === "ar" ? "دخول" : "Se connecter"
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="flex items-center w-full my-5">
              <div className="flex-grow border-t border-[var(--border)]"></div>
              <span className="mx-3 text-[10px] text-[var(--foreground)]/40 uppercase tracking-widest whitespace-nowrap font-mono">
                {language === "ar" ? "أو عبر" : "Ou continuer avec"}
              </span>
              <div className="flex-grow border-t border-[var(--border)]"></div>
            </div>

            {/* Social Buttons */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => handleProviderLogin(getGoogleProvider())}
                className="flex items-center justify-center py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--foreground)]/5 transition-all grow group"
                title="Google"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                />
              </button>
              <button
                type="button"
                onClick={() => handleProviderLogin(getFacebookProvider())}
                className="flex items-center justify-center py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--foreground)]/5 transition-all grow group"
                title="Facebook"
              >
                <img
                  src="https://www.svgrepo.com/show/448224/facebook.svg"
                  alt="Facebook"
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                />
              </button>
              <button
                type="button"
                className="flex items-center justify-center py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--foreground)]/5 transition-all grow group"
                title="Apple"
              >
                <img
                  src="https://www.svgrepo.com/show/511330/apple-173.svg"
                  alt="Apple"
                  className="w-5 h-5 dark:invert group-hover:scale-110 transition-transform"
                />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AnimatedThemeTogglerDemo() {
  return <AnimatedThemeToggler />;
}

// Navigation component
function Navigation({
  theme,
  setTheme,
  language,
  setLanguage,
  setIsSearchOpen,
  setIsAuthOpen,
  user,
  points,
  onLogout
}: {
  theme: string;
  setTheme: (t: string) => void;
  language: "en" | "fr" | "ar";
  setLanguage: (l: "en" | "fr" | "ar") => void;
  setIsSearchOpen: (v: boolean) => void;
  setIsAuthOpen: (v: boolean) => void;
  user: any;
  points: number;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const langMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Memoized values
  const isRTL = useMemo(() => language === "ar", [language]);
  const navItems = useMemo(() => translations[language].nav, [language]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (langMenuTimeoutRef.current) {
        clearTimeout(langMenuTimeoutRef.current);
      }
    };
  }, []);

  // Language menu handlers
  const handleLangMenuMouseEnter = useCallback(() => {
    if (langMenuTimeoutRef.current) clearTimeout(langMenuTimeoutRef.current);
    setShowLangMenu(true);
  }, []);

  const handleLangMenuMouseLeave = useCallback(() => {
    langMenuTimeoutRef.current = setTimeout(() => {
      setShowLangMenu(false);
    }, 300);
  }, []);

  // Navigation handlers
  const handleNavClick = useCallback((href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleLanguageChange = useCallback((lang: "en" | "fr" | "ar") => {
    setLanguage(lang);
    setShowLangMenu(false);
  }, [setLanguage]);

  const handleLogout = useCallback(() => {
    onLogout();
    setShowUserMenu(false);
  }, [onLogout]);

  const languages = [
    { code: "en", name: "English", flag: "uk", displayName: "English" },
    { code: "fr", name: "Français", flag: "fr", displayName: "Français" },
    { code: "ar", name: "العربية", flag: "tn", displayName: "العربية" },
  ] as const;

  // Navigation items configuration
  const navItemsConfig = [
    { key: "home", href: "#home" },
    { key: "history", href: "#history" },
    { key: "trophies", href: "#trophies" },
    { key: "team", href: "#team" },
    { key: "academy", href: "#academy" },
    { key: "news", href: "#news" },
    { key: "standings", href: "#standings" },
    { key: "matches", href: "#matches" },
    { key: "shop", href: "#shop" },
    { key: "contact", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-[var(--background)]/95 backdrop-blur-lg shadow-lg shadow-[var(--primary)]/10 border-b border-[var(--primary)]/10"
        : "bg-transparent"
        }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavClick("#home")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-14 h-14">
              <NextImage
                src="/ca.png"
                alt="Club Africain Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-7 min-w-[680px] justify-center py-2">
            {/* First half: Home to Academy */}
            {navItemsConfig.slice(0, 5).map((item, index) => {
              const navItem = navItems[index];
              if (!navItem) return null;
              return (
                <motion.a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="inline-block text-[var(--foreground)] opacity-80 hover:text-[var(--primary)] font-bold text-sm transition-all whitespace-nowrap relative overflow-visible uppercase tracking-[-0.05em]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {language === "ar" ? (
                    <span className="text-sm font-bold uppercase font-arabic nav-label">
                      {navItem}
                    </span>
                  ) : (
                    <TextRoll center className="text-sm font-bold uppercase tracking-[-0.05em]">
                      {navItem}
                    </TextRoll>
                  )}
                </motion.a>
              );
            })}

            {/* Search Button (Between Academy and Standings) */}
            <div key="search" className="inline-flex">
              <motion.button
                onClick={() => setIsSearchOpen(true)}
                className="w-auto h-auto flex items-center justify-center text-[var(--foreground)] opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all"
                aria-label="Search"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ width: 'auto', height: 'auto' }}
              >
                <Search size={18} />
              </motion.button>
            </div>

            {/* Second half: Standings to Contact */}
            {navItemsConfig.slice(5).map((item, index) => {
              const navItem = navItems[index + 5]; // Note the index shift
              if (!navItem) return null;
              return (
                <motion.a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="inline-block text-[var(--foreground)] opacity-80 hover:text-[var(--primary)] font-bold text-sm transition-all whitespace-nowrap relative overflow-visible uppercase tracking-[-0.05em]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 6) * 0.05 }}
                >
                  {language === "ar" ? (
                    <span className="text-sm font-bold uppercase font-arabic nav-label">
                      {navItem}
                    </span>
                  ) : (
                    <TextRoll center className="text-sm font-bold uppercase tracking-[-0.05em]">
                      {navItem}
                    </TextRoll>
                  )}
                </motion.a>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <AnimatedThemeToggler theme={theme} setTheme={setTheme} />

            {/* Language Switcher */}
            <div
              ref={langMenuRef}
              className="relative"
              onMouseEnter={handleLangMenuMouseEnter}
              onMouseLeave={handleLangMenuMouseLeave}
            >
              <motion.button
                className="flex items-center justify-center w-9 h-9 bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 rounded-full overflow-hidden transition-all border border-[var(--foreground)]/10 hover:scale-105"
                aria-label="Change language"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-5 h-5">
                  <NextImage
                    src={`/${languages.find(l => l.code === language)?.flag || "uk"}.png`}
                    alt={languages.find(l => l.code === language)?.displayName || "Language"}
                    fill
                    className="object-cover rounded-sm"
                  />
                </div>
              </motion.button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-44 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-lg"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[var(--foreground)]/10 transition-all ${language === lang.code
                          ? "text-[var(--primary)] bg-[var(--foreground)]/5 font-semibold"
                          : "text-[var(--foreground)]/80"
                          }`}
                      >
                        <span>{lang.displayName}</span>
                        <div className="relative w-6 h-6 rounded-sm overflow-hidden">
                          <NextImage
                            src={`/${lang.flag}.png`}
                            alt={lang.displayName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile / Auth */}
            <div className="flex items-center relative" ref={userMenuRef}>
              {user ? (
                <>
                  <motion.div
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="relative cursor-pointer group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white/10 transition-all group-hover:shadow-xl">
                      {user.avatar && !user.avatar.includes("anas.jpeg") ? (
                        <NextImage
                          src={user.avatar}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    {points > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center border-2 border-[var(--background)] shadow-sm animate-pulse">
                        <span className="text-[8px] font-black text-white">{points}</span>
                      </div>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-3 w-56 bg-[var(--background)]/95 backdrop-blur-lg border border-[var(--foreground)]/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-[var(--foreground)]/10 bg-[var(--foreground)]/5">
                          <p className="text-sm font-bold text-[var(--foreground)] truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-[var(--foreground)]/60 truncate mt-0.5">
                            {user.email}
                          </p>
                          {points > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[var(--foreground)]/10">
                              <Star size={12} className="text-yellow-500" />
                              <span className="text-xs font-semibold text-[var(--foreground)]/80">
                                {points} {language === "ar" ? "نقطة" : "points"}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-all group"
                        >
                          <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                          <span className="font-medium">
                            {language === "ar" ? "تسجيل الخروج" : "Logout"}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-9 h-9 rounded-full border-2 border-[var(--primary)]/30 text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                  aria-label="Sign In"
                >
                  <LogIn size={16} />
                </motion.button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="flex lg:hidden items-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="text-[var(--foreground)] p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-[var(--background)]/98 backdrop-blur-lg border-t border-[var(--foreground)]/10 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
                {/* Mobile: First half (Home to Academy) */}
                {navItemsConfig.slice(0, 5).map((item, index) => {
                  const navItem = navItems[index];
                  if (!navItem) return null;
                  return (
                    <motion.a
                      key={item.key}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`block text-[var(--foreground)] opacity-80 hover:text-[var(--primary)] text-lg py-3 px-2 transition-colors font-bold uppercase tracking-[-0.05em] hover:bg-[var(--foreground)]/5 rounded-xl ${isRTL ? "text-right" : "text-left"
                        }`}
                    >
                      {language === "ar" ? (
                        <span className="text-lg font-bold uppercase font-arabic nav-label">
                          {navItem}
                        </span>
                      ) : (
                        <TextRoll center className="text-lg font-bold uppercase tracking-[-0.05em]">
                          {navItem}
                        </TextRoll>
                      )}
                    </motion.a>
                  );
                })}

                {/* Search Button (Between Academy and Standings) */}
                <motion.button
                  key="search-mobile"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 text-[var(--foreground)] opacity-80 hover:text-[var(--primary)] text-lg py-3 px-2 transition-colors font-bold uppercase tracking-[-0.05em] hover:bg-[var(--foreground)]/5 rounded-xl ${isRTL ? "justify-end" : "justify-start"
                    }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Search size={20} />
                  {language === "ar" ? (
                    <span className="text-lg font-bold uppercase font-arabic nav-label">
                      بحث
                    </span>
                  ) : (
                    <TextRoll center className="text-lg font-bold uppercase tracking-[-0.05em]">
                      Search
                    </TextRoll>
                  )}
                </motion.button>

                {/* Mobile: Second half (Standings to Contact) */}
                {navItemsConfig.slice(5).map((item, index) => {
                  const navItem = navItems[index + 5]; // Offset by 5
                  if (!navItem) return null;

                  return (
                    <motion.a
                      key={item.key}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + 6) * 0.05 }}
                      className={`block text-[var(--foreground)] opacity-80 hover:text-[var(--primary)] text-lg py-3 px-2 transition-colors font-bold uppercase tracking-[-0.05em] hover:bg-[var(--foreground)]/5 rounded-xl ${isRTL ? "text-right" : "text-left"
                        }`}
                    >
                      {language === "ar" ? (
                        <span className="text-lg font-bold uppercase font-arabic nav-label">
                          {navItem}
                        </span>
                      ) : (
                        <TextRoll center className="text-lg font-bold uppercase tracking-[-0.05em]">
                          {navItem}
                        </TextRoll>
                      )}
                    </motion.a>
                  );
                })}

                {/* Mobile auth button */}
                {!user && (
                  <motion.button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white font-bold hover:opacity-90 transition-all uppercase tracking-[-0.05em] shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn size={18} />
                    <TextRoll center className="text-sm font-bold uppercase tracking-[-0.05em]">
                      {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                    </TextRoll>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}




function HeroSection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  // Mock translations (replace with your actual object)
  const translations = {
    en: { hero: { tagline: "Club Africain's official website", stats: ["Since", "Trophies", "Fans"] } },
    fr: { hero: { tagline: "Site officiel du Club Africain", stats: ["Depuis", "Trophées", "Fans"] } },
    ar: { hero: { tagline: "الموقع الرسمي للنادي الإفريقي", stats: ["منذ", "ألقاب", "مشجع"] } }
  };
  const t = translations[language].hero;

  // Framer Motion Variants for clean, staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 60, damping: 15 } },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--background)]">

      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className={`w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 ${theme === 'light' ? 'bg-blue-500' : 'bg-red-600'}`} />
      </div>

      {/* Lion watermark — left side of the background */}
      <div className="absolute right-[-6%] bottom-[-35%] -translate-y-1/2 w-1/3 max-w-[420px] min-h-[60vh] pointer-events-none opacity-15 hidden md:block">
        <NextImage
          src="/icon/lion-red.png"
          alt=""
          fill
          priority
          className="object-contain object-left drop-shadow-[0_0_40px_rgba(239,68,68,0.35)]"
        />
      </div>
      <div className="absolute left-[-6%] bottom-[-35%] -translate-y-1/2 w-1/3 max-w-[420px] min-h-[60vh] pointer-events-none opacity-5 hidden md:block">
        <NextImage
          src="/icon/omar.png"
          alt=""
          fill
          priority
          className="object-contain object-left drop-shadow-[0_0_40px_rgba(239,68,68,0.35)]"
        />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full px-4"
      >
        {/* Center Logo - Above the Title */}
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 40, damping: 10, delay: 0.4 }}
          className="relative w-40 h-40 sm:w-40 sm:h-40 lg:w-40 lg:h-40 mb-4 mx-auto"
        >
          <NextImage
            src="/clubs/caaa.png"
            alt="Club Africain Logo"
            fill
            className="object-contain drop-shadow-[0_10px_30px_rgba(239,68,68,0.4)]"
            priority
          />
        </motion.div>

        {/* Title & Logo Header */}
        <motion.div
          variants={itemVariants}
          // Flips layout for Arabic to read RTL correctly
          className={`flex items-center justify-center gap-3 sm:gap-6 md:gap-8 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* First Word (Left in LTR, Right in RTL) */}
          <span
            className={`font-black tracking-tighter text-6xl md:text-8xl lg:text-[9rem] leading-none transition-colors duration-500 ${theme === "light"
              ? "text-slate-800 drop-shadow-xl"
              : "text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              }`}
          >
            {language === "ar" ? "النادي" : "CLUB"}
          </span>

          {/* Second Word (Right in LTR, Left in RTL) */}
          <span className="font-black tracking-tighter text-6xl md:text-8xl lg:text-[9rem] leading-none text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]">
            {language === "ar" ? "الإفريقي" : "AFRICAIN"}
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl text-[#808080] opacity-80 mt-2 max-w-2xl mx-auto text-center font-medium"
        >
          {t.tagline}
        </motion.p>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-12"
        >
          {[
            { label: t.stats[0], value: 1920, suffix: "" },
            { label: t.stats[1], value: 32, suffix: "+" },
            { label: t.stats[2], value: 10, suffix: "M+" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center group"
            >
              <p className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-700 drop-shadow-sm transition-transform">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[var(--foreground)] opacity-60 text-sm font-bold uppercase tracking-[0.2em] mt-2 group-hover:opacity-100 transition-opacity">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-14"
        >
          <motion.a
            href="https://all4one.clubafricain.com/fr"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden px-8 py-4 text-white font-bold text-lg rounded-xl flex items-center justify-center min-w-[200px] border border-red-500 transition-all"
          >
            {/* Hover Glare Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <div className="relative w-28 h-7">
              <NextImage src="/All4one.png" alt="All4one Logo" fill className="object-contain" />
            </div>
          </motion.a>

          <motion.a
            href="/matchday"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-4 font-bold text-lg rounded-xl flex items-center justify-center gap-3 border-2 min-w-[200px] transition-all backdrop-blur-md ${theme === 'light'
              ? 'border-slate-800 text-slate-800 hover:text-red-600 hover:border-red-600'
              : 'border-white/20 text-white hover:border-white'
              }`}
          >
            <span>{language === "ar" ? "استكشف" : language === "fr" ? "Explorer" : "Explore"}</span>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </motion.svg>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Floating Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-[var(--foreground)] opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            {language === "ar" ? "اكتشف المزيد" : language === "fr" ? "Découvrir" : "Scroll Down"}
          </span>
          <ChevronDown size={24} className="text-red-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Trophies section
function TrophiesSection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const t = translations[language].trophies;
  const trophyRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const trophyWikiMap: Record<number, string> = {
    0: "https://fr.wikipedia.org/wiki/Championnat_de_Tunisie_de_football",
    1: "https://fr.wikipedia.org/wiki/Coupe_de_Tunisie_de_football",
    2: "https://fr.wikipedia.org/wiki/Supercoupe_de_Tunisie_de_football",
    3: "https://fr.wikipedia.org/wiki/Coupe_nord-africaine_des_clubs_champions",
    4: "https://fr.wikipedia.org/wiki/Coupe_arabe_des_vainqueurs_de_coupe_de_football",
    5: "https://fr.wikipedia.org/wiki/Ligue_des_champions_arabes",
    6: "https://fr.wikipedia.org/wiki/Coupe_du_Maghreb_des_vainqueurs_de_coupe",
    7: "https://fr.wikipedia.org/wiki/Coupe_du_Maghreb_des_clubs_champions",
    8: "https://fr.wikipedia.org/wiki/Ligue_des_champions_de_la_CAF",
    9: "https://fr.wikipedia.org/wiki/Coupe_afro-asiatique_des_clubs_de_football",
  };

  const trophies = [
    { image: "/cups/Championnat de Tunisie.png", title: t.items[0], count: 14, color: "#D4AF37", scale: 1.3, wiki: trophyWikiMap[0] },
    { image: "/cups/Coupe de Tunisie.png", title: t.items[1], count: 13, color: "#D4AF37", scale: 1.2, wiki: trophyWikiMap[1] },
    { image: "/cups/Supercoupe de Tunisie.png", title: t.items[2], count: 4, color: "#D4AF37", scale: 1.2, wiki: trophyWikiMap[2] },
    { image: "/cups/Coupe nord-africaine des clubs champions.png", title: t.items[3], count: 2, color: "#ffffff", scale: 1.1, wiki: trophyWikiMap[3] },
    { image: "/cups/Coupe arabe des vainqueurs de coupe.png", title: t.items[4], count: 1, color: "#ff0000", scale: 1.1, wiki: trophyWikiMap[4] },
    { image: "/cups/Arab Champ.png", title: t.items[5], count: 1, color: "#ffffff", scale: 0.9, wiki: trophyWikiMap[5] },
    { image: "/cups/Maghreb Cup.png", title: t.items[6], count: 1, color: "#ff0000", scale: 2, wiki: trophyWikiMap[6] },
    { image: "/cups/Coupe du Maghreb des clubs champions.png", title: t.items[7], count: 3, color: "#ffffff", wiki: trophyWikiMap[7] },
    { image: "/cups/caf.png", title: t.items[8], count: 1, color: "#D4AF37", scale: 1.2, wiki: trophyWikiMap[8] },
    { image: "/cups/Coupe afro-asiatique des clubs.png", title: t.items[9], count: 1, color: "#D4AF37", scale: 0.9, wiki: trophyWikiMap[9] },
  ];

  return (
    <section id="trophies" ref={ref} className="relative pt-30 pb-32 overflow-hidden">
      {/* Background from former home section */}
      <div className="absolute inset-0 bg-[var(--background)]">
        {/* Red glow effect - static for performance */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full filter blur-[150px] opacity-10"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--primary)] rounded-full filter blur-[120px] opacity-5"
        />
      </div>

      {/* Diagonal stripes */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #ffffff,
            #ffffff 1px,
            transparent 1px,
            transparent 20px
          )`
        }} />
      </div>

      <FloatingParticles />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={scrollTransition}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={scrollSpring}
            className="inline-block px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-sm font-semibold mb-3"
          >
            THE TROPHY
          </motion.span>
          <br />
          <div ref={trophyRef} className="inline-block">
            <p
              className="text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter italic text-[#D4AF37]"
              style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}
            >
              <VariableProximityText
                label={t.title}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={trophyRef}
                radius={150}
                falloff="gaussian"
              />
            </p>
          </div>
          <p className="text-[var(--foreground)] opacity-80 max-w-2xl mx-auto text-lg mt-4">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Trophy grid – first 9 items */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {trophies.slice(0, 9).map(({ image, title, count, color, icon: Icon, scale = 1, wiki }: any, index) => (
            <ElectricBorder
              key={title}
              color="#D4AF37"
              speed={1.2}
              chaos={0.08}
              borderRadius={24}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88, rotateY: -20 }}
                animate={inView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
                transition={{ delay: index * 0.1, ...scrollTransition }}
                onClick={() => {
                  if (wiki) window.open(wiki, '_blank');
                }}
                whileHover={{
                  rotateY: 10,
                  boxShadow: "0 30px 60px rgba(0,0,0,0.3)"
                }}
                className="glass bg-white/10 p-8 rounded-3xl text-center cursor-pointer group hover:scale-[1.02] transition-transform"
                style={{ transformStyle: "preserve-3d" }}
                title={title}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="w-32 h-32 mx-auto mb-6 flex items-center justify-center p-2"
                >
                  {image ? (
                    <NextImage
                      src={image}
                      alt={title}
                      width={112}
                      height={112}
                      className="object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)]"
                      style={{ transform: `scale(${scale})` }}
                    />
                  ) : (
                    Icon && (
                      <Icon
                        size={96}
                        className="mx-auto transition-all duration-300 group-hover:scale-110"
                        style={{ color: color }}
                      />
                    )
                  )}
                </motion.div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: index * 0.1 + 0.25, ...scrollSpring }}
                  className="text-5xl font-black text-[var(--foreground)] mb-2"
                >
                  <AnimatedCounter end={count} />
                </motion.p>
                <p className="text-[var(--foreground)] opacity-80 font-semibold">{title}</p>
              </motion.div>
            </ElectricBorder>
          ))}
        </div>

        {/* Afro-Asian Cup – centered alone */}
        {trophies[9] && (() => {
          const { image, title, count, color, scale = 1, wiki } = trophies[9] as any;
          return (
            <div className="flex justify-center mt-6">
              <div className="w-full max-w-xs sm:max-w-sm">
                <ElectricBorder
                  color="#D4AF37"
                  speed={1.2}
                  chaos={0.08}
                  borderRadius={24}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88, rotateY: -20 }}
                    animate={inView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
                    transition={{ delay: 0.9, ...scrollTransition }}
                    onClick={() => {
                      if (wiki) window.open(wiki, '_blank');
                    }}
                    whileHover={{ rotateY: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}
                    className="glass bg-white/10 p-8 rounded-3xl text-center cursor-pointer group hover:scale-[1.02] transition-transform"
                    style={{ transformStyle: "preserve-3d" }}
                    title={title}
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.8 }}
                      className="w-32 h-32 mx-auto mb-6 flex items-center justify-center p-2"
                    >
                      <NextImage src={image} alt={title} width={112} height={112}
                        className="object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)]"
                        style={{ transform: `scale(${scale})` }}
                      />
                    </motion.div>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ delay: 1.15, ...scrollSpring }}
                      className="text-5xl font-black text-[var(--foreground)] mb-2"
                    >
                      <AnimatedCounter end={count} />
                    </motion.p>
                    <p className="text-[var(--foreground)] opacity-80 font-semibold">{title}</p>
                  </motion.div>
                </ElectricBorder>
              </div>
            </div>
          );
        })()}

        {/* Total count */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...scrollTransition, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-6xl sm:text-8xl font-black text-[var(--foreground)]">
            <AnimatedCounter end={40} />+
          </p>
          <p className="text-[var(--foreground)] opacity-80 text-xl mt-2">{t.total}</p>
        </motion.div>
      </div>
    </section>
  );
}

// Helper to get flag emoji
const getFlagEmoji = (country: string) => {
  const codePoints = country
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const getCountryFlag = (nationality: string) => {
  const map: { [key: string]: string } = {
    "Tunisia": "/clubs/tunisia.png",
    "Algeria": "/clubs/algerie.png",
    "Libya": "/clubs/libya.png",
    "Cameroon": "/clubs/cameroun.png",
    "France": "/clubs/france.png",
    "Belgium": "/clubs/belgium.png",
    "Gambia": "/clubs/gambia.webp",
    "England": "/clubs/england.png",
    "DR Congo": "/clubs/congo.png",
  };
  // Handle compound nationalities
  const primary = nationality.split('/')[0];
  // Fallback to Tunisia if not found (or generic earth icon if you had one in images, but keeping safe fallback)
  return map[primary] || "/clubs/tunisia.png";
}

// FC26-style card image map (filename without extension => /cards/<name>.png)
const playerCardImages: Record<string, string> = {
  "Abdelmouhib Chamakh": "/cards/chamakh.png",
  "Yassine Meriah": "/cards/meriah.png",
  "Ghaith Zaalouni": "/cards/zaalouni.png",
  "Mohamed Sadok Mahmoud": "/cards/sadok.png",
  "Osama Elsharimi": "/cards/sherimi.png",
  "Aymen Harzi": "/cards/harzi.png",
  "Phillippe Kinzumbi": "/cards/kinzumbi.png",
  "Hamza Khadhraoui": "/cards/khadhraoui.png",
  "Ghaith Yeferni": "/cards/yeferni.png",
  "Malek Saada": "/cards/saada.png",
  "Houssem Ben Ali": "/cards/benali.png",
  "Wills Tene Nkingne": "/cards/Nkingne.png",
  "Yassine Bouabid": "/cards/bouabid.png",
  "Houssem Hassen Romdhane": "/cards/romdhane.png",
  "Charfeddine Ouni": "/cards/ouni.png",
  "Bilel Aït Malek": "/cards/aitmalek.png",
  "Saidou Khan": "/cards/khan.png",
  "Oussema Bouguerra": "/cards/bouguerra.png",
  "Bassem Srarfi": "/cards/srarfi.png",
  "Sadok Kadida": "/cards/kadida.png",
} as Record<string, string>;

const playerTransfermarktMap: Record<string, string> = {
  "Mouhib Chamakh": "https://www.transfermarkt.fr/abdelmouhib-chamakh/profil/spieler/584250",
  "Abdelmouhib Chamakh": "https://www.transfermarkt.fr/abdelmouhib-chamakh/profil/spieler/584250",
  "Ghaith Zaalouni": "https://www.transfermarkt.fr/ghaith-zaalouni/profil/spieler/842998",
  "Yassine Meriah": "https://www.transfermarkt.fr/yassine-meriah/profil/spieler/306330",
  "Ammar Abdelhak": "https://www.transfermarkt.fr/ammar-abdelhak/profil/spieler/1258262",
  "Houssem Ben Ali": "https://www.transfermarkt.fr/houssem-ben-ali/profil/spieler/415510",
  "Osama Elsharimi": "https://www.transfermarkt.fr/osama-al-sharimi/profil/spieler/987163",
  "Saidou Khan": "https://www.transfermarkt.fr/saidou-khan/profil/spieler/623126",
  "Bilel Aït Malek": "https://www.transfermarkt.fr/bilel-ait-malek/profil/spieler/340986",
  "Aymen Harzi": "https://www.transfermarkt.fr/aymen-harzi/profil/spieler/266205",
  "Taddeus Nkeng": "https://www.transfermarkt.fr/taddeus-nkeng/profil/spieler/624831",
  "Phillippe Kinzumbi": "https://www.transfermarkt.fr/philippe-kinzumbi/profil/spieler/824364",
  "Philippe Kinzumbi": "https://www.transfermarkt.fr/philippe-kinzumbi/profil/spieler/824364",
  "Ghaith Yeferni": "https://www.transfermarkt.fr/ghaith-yeferni/profil/spieler/392942",
  "Malek Saada": "https://www.transfermarkt.fr/malek-saada/profil/spieler/1166901",
  "Yassine Bouabid": "https://www.transfermarkt.fr/yassine-bouabid/profil/spieler/624639",
  "Ismaïla Simpara": "https://www.transfermarkt.fr/ismaila-simpara/profil/spieler/568734",
  "Mamadou Diatta": "https://www.transfermarkt.fr/mamadou-diatta/profil/spieler/1464909",
  "Wills Tene Nkingne": "https://www.transfermarkt.fr/wills-tene-nkingne/profil/spieler/1286950",
  "Mootez Zaddem": "https://www.transfermarkt.fr/mootez-zaddem/profil/spieler/750487",
  "Alain Kanté": "https://www.transfermarkt.fr/alain-kante/profil/spieler/1317589",
  "Haykeul Chikhaoui": "https://www.transfermarkt.fr/haykeul-chikhaoui/profil/spieler/290603",
  "Charfeddine Ouni": "https://www.transfermarkt.fr/charfeddine-ouni/profil/spieler/747683",
  "Rayan El Djebali": "https://www.transfermarkt.fr/rayan-el-djebali/profil/spieler/1166902",
  "Houssem Hassen Romdhane": "https://www.transfermarkt.fr/houssem-hassen-romdhane/profil/spieler/584249",
  "Hamza Khadhraoui": "https://www.transfermarkt.fr/hamza-khadhraoui/profil/spieler/641551",
  "Oussama Bouguerra": "https://www.transfermarkt.fr/oussema-bouguerra/profil/spieler/627402",
  "Sadok Kadida": "https://www.transfermarkt.fr/sadok-kadida/profil/spieler/1118128",
  "Bassem Srarfi": "https://www.transfermarkt.fr/bassem-srarfi/profil/spieler/415537",
  "Hamza Mnasri": "https://www.transfermarkt.fr/hamza-mnasri/profil/spieler/966141",
  "Ghassen Mahersi": "https://www.transfermarkt.fr/ghassen-mahersi/profil/spieler/1008452",
  "Wassim Maghzaoui": "https://www.transfermarkt.fr/wassim-maghzaoui/profil/spieler/1192867",
};

function FC26PlayerCard({ player, cardImg, isDraggable, onDragStart, onDragOver, onDragLeave, onDrop, dropTargetName, isBench, source, index = 0, total = 7 }: any) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateXValue = ((y / rect.height) - 0.5) * -25;
    const rotateYValue = ((x / rect.width) - 0.5) * 25;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setGlarePosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition({ x: 50, y: 50 });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Open player's Transfermarkt profile
    const directUrl = player.transfermarktUrl || playerTransfermarktMap[player.name];
    if (directUrl && !directUrl.includes('12345') && !directUrl.includes('12346') && !directUrl.includes('12347') && !directUrl.includes('12348')) {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
    } else if (playerTransfermarktMap[player.name]) {
      window.open(playerTransfermarktMap[player.name], '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://www.transfermarkt.fr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const isDropTarget = dropTargetName === player.name;
  const rating = player.position === "Goalkeeper" ? 82 : player.position.includes("Striker") ? 87 : player.position.includes("Winger") ? 85 : 83;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={isBench ? {
        y: 0,
        opacity: 1,
        rotate: 0,
      } : { opacity: 1, scale: 1 }}
      whileHover={isBench ? {
        y: -30,
        scale: 1.05,
        transition: { type: 'spring', stiffness: 450, damping: 20 }
      } : { scale: 1.08, zIndex: 100 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title={`${player.name} - Cliquez pour ouvrir le profil Transfermarkt`}
      className={`relative w-44 h-64 flex-shrink-0 cursor-pointer ${isBench ? '' : ''}`}
      draggable={isDraggable}
      onDragStart={isDraggable ? () => onDragStart(player, source) : undefined}
      onDragOver={isDraggable ? (e: any) => { e.preventDefault(); onDragOver(player.name); } : undefined}
      onDragLeave={isDraggable ? () => onDragLeave() : undefined}
      onDrop={isDraggable ? () => onDrop(player) : undefined}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <div
        className="relative w-full h-full flex flex-col items-center"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Player Image */}
        <div className="mt-8 w-full h-[65%] relative z-10 flex justify-center items-end">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-full h-full" title={player.name}>
            <NextImage
              src={cardImg || player.image || '/fallback.jpg'}
              alt={player.name}
              title={player.name}
              fill
              className="object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.7)]"
              sizes="200px"
              priority={!isBench}
              onError={(e: any) => {
                e.currentTarget.src = '/fallback.jpg';
              }}
            />
          </div>
        </div>

        {/* Dynamic Glare Overlay */}
        <div />
      </div>
    </motion.div>
  );
}


function MohsenCard() {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateXValue = ((y / rect.height) - 0.5) * -25;
    const rotateYValue = ((x / rect.width) - 0.5) * 25;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.08, zIndex: 100 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => window.open('https://fr.wikipedia.org/wiki/Mohsen_Trabelsi', '_blank', 'noopener,noreferrer')}
      title="Dr. Mohsen Trabelsi - Cliquez pour voir la page Wikipédia"
      className="relative w-40 h-60 flex-shrink-0 cursor-pointer group"
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >

        {/* Card Image */}
        <div className="relative w-full h-full z-10 flex items-center justify-center">
          <NextImage
            src="/cards/mohsen.png"
            alt="Dr. Mohsen Trabelsi"
            fill
            className="object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.7)]"
            sizes="200px"
            priority
          />
        </div>
      </div>
    </motion.div>
  );
}

// Mohsen card is anchored from the TOP after measuring its exact current offset,
// so it never shifts when the transfers table below changes height (arrivals vs departures tabs).
function FloatingMohsenCard() {
  const [topPx, setTopPx] = useState<number | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const offsetTop = el.offsetTop;
      if (offsetTop > 0) setTopPx(offsetTop);
    };
    measure();
    const timer = setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`hidden xl:block absolute left-8 z-10 bench-player-wrapper pointer-events-none ${topPx !== undefined ? '' : 'bottom-210'}`}
      style={topPx !== undefined ? { top: `${topPx}px` } : undefined}
    >
      <div className="pointer-events-auto">
        <MohsenCard />
      </div>
    </div>
  );
}

// Team section
function TeamSection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const t = translations[language].team;
  const squadRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Latest played game (auto-updates each fixture)
  const [latestResult, setLatestResult] = useState<any>(null);
  useEffect(() => {
    fetch('/api/fixtures')
      .then(res => res.json())
      .then(data => {
        if (data.recent && Array.isArray(data.recent) && data.recent.length > 0) {
          setLatestResult(data.recent[0]);
        } else if (ALL_RESULTS.length > 0) {
          setLatestResult(ALL_RESULTS[ALL_RESULTS.length - 1]);
        }
      })
      .catch(() => {
        if (ALL_RESULTS.length > 0) setLatestResult(ALL_RESULTS[ALL_RESULTS.length - 1]);
      });
  }, []);

  const latestTeamLogos: { [key: string]: string } = {
    "ES Metlaoui": "/clubs/esm.png",
    "ES Métlaoui": "/clubs/esm.png",
    "US Ben Guerdane": "/clubs/usb.png",
    "CS Hammam-Lif": "/clubs/cshl.png",
    "US Monastir": "/clubs/usm.png",
    "ES Hammam-Sousse": "/clubs/eshs.png",
    "PS Sakiet Eddaïer": "/clubs/psse.png",
    "Stade Tunisien": "/clubs/st.png",
    "Esperance Tunis": "/clubs/est.png",
    "Espérance de Tunis": "/clubs/est.png",
    "Olympique Béja": "/clubs/beja.png",
    "JS Omrane": "/clubs/jso.png",
    "CS Sfaxien": "/clubs/css.png",
    "CA Bizertin": "/clubs/cab.png",
    "ES Zarzis": "/clubs/esz.png",
    "ES Sahel": "/clubs/ess.png",
    "AS Marsa": "/clubs/marsa.png",
    "Djoliba AC": "/clubs/djo.png",
  };
  const latestOpponentLogo = latestResult ? latestTeamLogos[latestResult.opponent] : null;

  // 11 Starters from Transfermarkt last match (4-3-3 Offensif vs Hammam Sousse 1-0) + Bench
  const fallbackPlayers = useMemo(() => [
    // 11 Starters (Formation 4-3-3 Offensif)
    { name: "Mouhib Chamakh", position: "Goalkeeper", number: 1, birthDate: "25/08/2001", nationality: "Tunisia", marketValue: "€450k", previousClub: "ES Métlaoui", image: "/cards/chamakh.png", transfermarktUrl: "https://www.transfermarkt.com/abdelmouhib-chamakh/profil/spieler/584250" },
    { name: "Houssem Ben Ali", position: "Left Back", number: 33, birthDate: "10/06/1996", nationality: "Tunisia", marketValue: "€400k", image: "/cards/ben ali.png", transfermarktUrl: "https://www.transfermarkt.com/houssem-ben-ali/profil/spieler/123471" },
    { name: "Yassine Meriah", position: "Center Defender", number: 5, birthDate: "14/03/1995", nationality: "Tunisia", marketValue: "€700k", image: "/cards/meriah.png", transfermarktUrl: "https://www.transfermarkt.com/yassine-meriah/profil/spieler/123458" },
    { name: "Ammar Abdelhak", position: "Center Defender", number: 6, birthDate: "19/10/2001", nationality: "Tunisia", marketValue: "€150k", image: "/cards/abdelhak.png", transfermarktUrl: "https://www.transfermarkt.com/ammare-abdelhak/profil/spieler/123459" },
    { name: "Ghaith Zaalouni", position: "Right Back", number: 17, birthDate: "06/05/2002", nationality: "Tunisia", marketValue: "€650k", previousClub: "ES Zarzis", image: "/cards/Zaalouni.png", transfermarktUrl: "https://www.transfermarkt.com/ghaith-zaalouni/profil/spieler/123460" },
    { name: "Osama Elsharimi", position: "Central Midfielder", number: 32, birthDate: "20/02/2001", nationality: "Libya", marketValue: "€300k", previousClub: "Al-Ahli Tripoli", image: "/cards/sherimi.png", transfermarktUrl: "https://www.transfermarkt.com/osama-elsharimi/profil/spieler/123480" },
    { name: "Saidou Khan", position: "Central Midfielder", number: 28, birthDate: "05/12/1995", nationality: "Gambia/England", marketValue: "€150k", image: "/cards/khan.png", transfermarktUrl: "https://www.transfermarkt.com/saidou-khan/profil/spieler/123461" },
    { name: "Bilel Aït Malek", position: "Attacking Midfielder", number: 21, birthDate: "19/08/1996", nationality: "Tunisia/France", marketValue: "€800k", previousClub: "US Monastir", image: "/cards/ait malek.png", transfermarktUrl: "https://www.transfermarkt.com/bilel-ait-malek/profil/spieler/123479" },
    { name: "Aymen Harzi", position: "Attacking Midfielder", number: 31, birthDate: "01/03/1995", nationality: "Tunisia", marketValue: "€700k", previousClub: "Al-Khaldiya", image: "/cards/harzi.png", transfermarktUrl: "https://www.transfermarkt.com/aymen-harzi/profil/spieler/123462" },
    { name: "Taddeus Nkeng", position: "Striker", number: 34, birthDate: "08/05/1996", nationality: "Cameroon", marketValue: "€850k", previousClub: "Buducnost Podgorica", image: "/cards/nkeng.png", transfermarktUrl: "https://www.transfermarkt.com/Taddeus-Nkeng/profil/spieler/123465" },
    { name: "Phillippe Kinzumbi", position: "Right Winger", number: 18, birthDate: "26/01/1999", nationality: "DR Congo", marketValue: "€550k", image: "/cards/kinzumbi.png", transfermarktUrl: "https://www.transfermarkt.com/phillippe-kinzumbi/profil/spieler/123481" },
    
    // Bench (9 Players from Transfermarkt)
    { name: "Ghaith Yeferni", position: "Goalkeeper", number: 16, birthDate: "20/05/1998", nationality: "Tunisia", marketValue: "€300k", image: "/cards/yeferni.png", transfermarktUrl: "https://www.transfermarkt.com/ghaith-yeferni/profil/spieler/123467" },
    { name: "Malek Saada", position: "Goalkeeper", number: 22, birthDate: "07/07/2005", nationality: "Tunisia", marketValue: "-", image: "/cards/saada.png", transfermarktUrl: "https://www.transfermarkt.com/malek-saada/profil/spieler/123469" },
    { name: "Yassine Bouabid", position: "Center Defender", number: 4, birthDate: "08/05/1999", nationality: "Tunisia", marketValue: "€400k", image: "/cards/bouabid.png", transfermarktUrl: "https://www.transfermarkt.com/yassine-bouabid/profil/spieler/123473" },
    { name: "Ismaïla Simpara", position: "Center Defender", number: 36, birthDate: "10/06/2004", nationality: "Mali", marketValue: "€175k", image: "/cards/simpara.png", transfermarktUrl: "https://www.transfermarkt.com/Ismaïla-Simpara/profil/spieler/123482" },
    { name: "Mamadou Diatta", position: "Center Defender", number: 3, birthDate: "01/06/1995", nationality: "Senegal", marketValue: "€450k", image: "/cards/diatta.png", transfermarktUrl: "https://www.transfermarkt.com/Mamadou-Diatta/profil/spieler/123478" },
    { name: "Wills Tene Nkingne", position: "Left Back", number: 15, birthDate: "20/02/2003", nationality: "Cameroon/France", marketValue: "€100k", image: "/cards/Nkingne.png", transfermarktUrl: "https://www.transfermarkt.com/wills-tene-nkingne/profil/spieler/123472" },
    { name: "Houssem Hassen Romdhane", position: "Right Back", number: 24, birthDate: "21/02/2000", nationality: "Tunisia", marketValue: "€400k", image: "/cards/ramadhan.png", transfermarktUrl: "https://www.transfermarkt.com/houssem-hassen-romdhane/profil/spieler/123474" },    
    { name: "Charfeddine Ouni", position: "Defensive Midfielder", number: 13, birthDate: "09/09/2000", nationality: "Tunisia", marketValue: "€350k", image: "/cards/ouni.png", transfermarktUrl: "https://www.transfermarkt.com/charfeddine-ouni/profil/spieler/123476" },    
    { name: "Mohamed Sadok Mahmoud", position: "Defensive Midfielder", number: 10, birthDate: "10/11/2005", nationality: "Tunisia", marketValue: "€200k", image: "/cards/sadok.png", transfermarktUrl: "https://www.transfermarkt.com/mohamed-sadok-mahmoud/profil/spieler/123477" },    
    { name: "Mootez Zaddem", position: "Central Midfielder", number: 30, birthDate: "23/11/2004", nationality: "Tunisia", marketValue: "€350k", image: "/cards/zaddem.png", transfermarktUrl: "https://www.transfermarkt.com/mootaz-zaddem/profil/spieler/123470" },
    { name: "Alain Kanté", position: "Attacking Midfielder", number: 8, birthDate: "23/11/2004", nationality: "Burkina Faso", marketValue: "€250k", image: "/cards/kanté.png", transfermarktUrl: "https://www.transfermarkt.com/Alain-Kanté/profil/spieler/123470" },
    { name: "Rayan El Djebali", position: "Attacking Midfielder", number: 21, birthDate: "19/08/1996", nationality: "Tunisia/France", marketValue: "€800k", previousClub: "US Monastir", image: "/cards/djebali.png", transfermarktUrl: "https://www.transfermarkt.com/rayan-el-djebali/profil/spieler/123479" },        
    { name: "Haykeul Chikhaoui", position: "Attacking Midfielder", number: 20, birthDate: "06/01/2003", nationality: "Tunisia", marketValue: "€75k", previousClub: "Olympique Béja", image: "/cards/chikhaoui.png", transfermarktUrl: "https://www.transfermarkt.com/haykeul-chikhaoui/profil/spieler/123475" },
    { name: "Oussema Bouguerra", position: "Left Winger", number: 11, birthDate: "17/10/1998", nationality: "Tunisia", marketValue: "€500k", image: "/cards/bouguerra.png", transfermarktUrl: "https://www.transfermarkt.com/oussama-bouguerra/profil/spieler/123464" },
    { name: "Hamza Khadhraoui", position: "Right Winger", number: 7, birthDate: "16/01/1999", nationality: "Tunisia", marketValue: "€800k", image: "/cards/khadhraoui.png", transfermarktUrl: "https://www.transfermarkt.com/hamza-khadhraoui/profil/spieler/123466" },
    { name: "Bassem Srarfi", position: "Right Winger", number: 19, birthDate: "25/06/1997", nationality: "Tunisia", marketValue: "€450k", previousClub: "ES Sahel", image: "/cards/srarfi.png", transfermarktUrl: "https://www.transfermarkt.com/bassem-srarfi/profil/spieler/123483" },
    { name: "Sadok Kadida", position: "Striker", number: 40, birthDate: "02/12/2003", nationality: "Tunisia", marketValue: "€300k", image: "/cards/kadida.png", transfermarktUrl: "https://www.transfermarkt.com/sadok-kadida/profil/spieler/123484" },
    { name: "Hamza Mnasri", position: "Striker", number: 40, birthDate: "02/12/2003", nationality: "Tunisia", marketValue: "€300k", image: "/cards/mnasri.png", transfermarktUrl: "https://www.transfermarkt.com/hamza-mnasri/profil/spieler/123484" },    
  ], []); // No language dependency here - player names don't change

  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add effect to refetch when language changes (if needed)
  useEffect(() => {
    setLoading(true);
    fetch('/app/api/players/route.ts')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid data');
        setPlayers(data);
        setError(null);
      })
      .catch(err => {
        // Silently handle API failures - fallback data will be used
        setError(null);
      })
      .finally(() => setLoading(false));
  }, []); // Remove language dependency if the API doesn't need it

  const allPlayers = useMemo(() => {
    if (players.length > 0) return players;
    return fallbackPlayers;
  }, [players, fallbackPlayers]);

  type Player = typeof fallbackPlayers[0];

  const [activeTab, setActiveTab] = useState<'fan' | 'real'>('real');
  const [fanFormation, setFanFormation] = useState('4-3-3');
  const [fanStarters, setFanStarters] = useState<Player[]>([]);
  const [fanBench, setFanBench] = useState<Player[]>([]);

  const formations: Record<string, number[]> = {
    '4-3-3': [1, 4, 3, 3],
    '4-3-3 (Attack)': [1, 4, 3, 3],
    '4-3-3 (Defend)': [1, 4, 3, 3],
    '4-4-2': [1, 4, 4, 2],
    '4-4-2 (Flat)': [1, 4, 4, 2],
    '4-4-2 (Diamond)': [1, 4, 1, 2, 1, 2],
    '4-4-1-1': [1, 4, 4, 1, 1],
    '4-2-3-1': [1, 4, 2, 3, 1],
    '4-2-2-2': [1, 4, 2, 2, 2],
    '4-1-2-1-2': [1, 4, 1, 2, 1, 2],
    '4-1-4-1': [1, 4, 1, 4, 1],
    '4-5-1': [1, 4, 5, 1],
    '3-5-2': [1, 3, 5, 2],
    '3-4-3': [1, 3, 4, 3],
    '3-4-2-1': [1, 3, 4, 2, 1],
    '3-4-1-2': [1, 3, 4, 1, 2],
    '3-3-4': [1, 3, 3, 4],
    '5-3-2': [1, 5, 3, 2],
    '5-4-1': [1, 5, 4, 1],
    '5-2-3': [1, 5, 2, 3],
    '5-2-1-2': [1, 5, 2, 1, 2],
  };


  useEffect(() => {
    if (allPlayers.length > 0) {
      setFanStarters(allPlayers.slice(0, 11));
      setFanBench(allPlayers.slice(11));
    }
  }, [allPlayers]);

  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragSource, setDragSource] = useState<'pitch' | 'bench' | null>(null);
  const [dropTargetName, setDropTargetName] = useState<string | null>(null);
  const [isFormationOpen, setIsFormationOpen] = useState(false);

  const realStarters = allPlayers.slice(0, 11);
  const realBench = allPlayers.slice(11);
  const realFormation = [1, 4, 3, 3];

  const buildRows = (playerList: Player[], formationArr: number[]) => {
    let c = 0;
    return formationArr.map((count) => {
      const slice = playerList.slice(c, c + count);
      c += count;
      return slice;
    });
  };

  const handleFormationChange = (newF: string) => {
    setFanFormation(newF);
    setIsFormationOpen(false);
  };

  const handleDragStart = (p: Player, s: 'pitch' | 'bench') => {
    setDraggedPlayer(p);
    setDragSource(s);
  };

  const handleDropOnPitch = (target: Player) => {
    if (!draggedPlayer) return;
    setDropTargetName(null);
    if (dragSource === 'pitch') {
      setFanStarters(prev => prev.map(p => {
        if (p.name === draggedPlayer.name) return target;
        if (p.name === target.name) return draggedPlayer;
        return p;
      }));
    } else {
      setFanStarters(prev => prev.map(p => p.name === target.name ? draggedPlayer : p));
      setFanBench(prev => prev.map(p => p.name === draggedPlayer.name ? target : p));
    }
    setDraggedPlayer(null);
    setDragSource(null);
  };

  const handleDropOnBench = (target: Player) => {
    if (!draggedPlayer) return;
    setDropTargetName(null);
    if (dragSource === 'bench') {
      setFanBench(prev => prev.map(p => {
        if (p.name === draggedPlayer.name) return target;
        if (p.name === target.name) return draggedPlayer;
        return p;
      }));
    } else {
      setFanStarters(prev => prev.map(p => p.name === draggedPlayer.name ? target : p));
      setFanBench(prev => prev.map(p => p.name === target.name ? draggedPlayer : p));
    }
    setDraggedPlayer(null);
    setDragSource(null);
  };

  const handleReset = () => {
    setFanStarters(allPlayers.slice(0, 11));
    setFanBench(allPlayers.slice(11));
    setFanFormation('4-3-3');
  };

  const renderPlayerCard = (player: Player, rIdx: number, pIdx: number, isDraggable: boolean, s: 'pitch' | 'bench', idx: number = 0, tot: number = 7) => (
    <FC26PlayerCard
      key={player.name}
      player={player}
      cardImg={playerCardImages[player.name]}
      isDraggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={(name: string) => setDropTargetName(name)}
      onDragLeave={() => setDropTargetName(null)}
      onDrop={s === 'pitch' ? handleDropOnPitch : handleDropOnBench}
      dropTargetName={dropTargetName}
      isBench={s === 'bench'}
      source={s}
      index={idx}
      total={tot}
    />
  );

  const renderPitch = (rows: Player[][], isDraggable: boolean) => (
    <div className="flex-1 bg-[#1a3c1a] relative overflow-hidden border border-white/10 shadow-2xl">
      <div className="min-h-[70vh] relative overflow-hidden" style={{ perspective: '1000px' }}>
        {/* Grass Pattern: Alternating Green Stripes */}
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              to bottom,
              #2d5a27 0%,
              #2d5a27 10%,
              #356a2e 10%,
              #356a2e 20%
            )`,
            opacity: 0.95
          }}
        />

        {/* Subtle Grass Texture Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/grass.png")' }} />

        {/* Stadium Lighting Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
        </div>

        {/* Field markings with glow effect */}
        <div className="absolute inset-0 pointer-events-none p-4">
          <div className={`relative w-full h-full border-2 ${theme === 'light' ? 'border-white/60' : 'border-white/60'}`}>
            {/* Center line */}
            <div className={`absolute top-1/2 left-0 w-full h-px ${theme === 'light' ? 'bg-white/10' : 'bg-white/10'}`} />

            {/* Center circle & spot */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border ${theme === 'light' ? 'border-white/40' : 'border-white/40'} rounded-full flex items-center justify-center`}>
              <div className={`w-1.5 h-1.5 ${theme === 'light' ? 'bg-white/60' : 'bg-white/60'} rounded-full shadow-[0_0_5px_white]`} />
            </div>

            {/* Penalty areas */}
            {/* Top */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 border ${theme === 'light' ? 'border-t-0 border-white/40' : 'border-t-0 border-white/40'}`}>
              {/* Goal area */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-36 h-14 border ${theme === 'light' ? 'border-t-0 border-white/30' : 'border-t-0 border-white/30'}`} />
              {/* Penalty spot */}
              <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 ${theme === 'light' ? 'bg-white/50' : 'bg-white/50'} rounded-full`} />
              {/* Penalty Arc (D-arc) */}
              <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 w-32 h-24 border ${theme === 'light' ? 'border-white/30' : 'border-white/30'} rounded-full`} style={{ clipPath: 'inset(50% 0 0 0)' }} />
            </div>

            {/* Bottom */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-36 border ${theme === 'light' ? 'border-b-0 border-white/40' : 'border-b-0 border-white/40'}`}>
              {/* Goal area */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-14 border ${theme === 'light' ? 'border-b-0 border-white/30' : 'border-b-0 border-white/30'}`} />
              {/* Penalty spot */}
              <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 ${theme === 'light' ? 'bg-white/50' : 'bg-white/50'} rounded-full`} />
              {/* Penalty Arc (D-arc) */}
              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-24 border ${theme === 'light' ? 'border-white/30' : 'border-white/30'} rounded-full`} style={{ clipPath: 'inset(0 0 50% 0)' }} />
            </div>

            {/* Corner Arcs */}
            <div className={`absolute top-0 left-0 w-8 h-8 border-r border-b ${theme === 'light' ? 'border-white/30' : 'border-white/30'} rounded-br-full`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-l border-b ${theme === 'light' ? 'border-white/30' : 'border-white/30'} rounded-bl-full`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-r border-t ${theme === 'light' ? 'border-white/30' : 'border-white/30'} rounded-tr-full`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-l border-t ${theme === 'light' ? 'border-white/30' : 'border-white/30'} rounded-tl-full`} />
          </div>
        </div>

        {/* Player positions flat (no slant) */}
        <div className="relative h-full w-full flex flex-col justify-between py-6 px-5" style={{ minHeight: '60vh' }}>
          <div className="flex justify-around items-center h-1/5">
            {rows[3]?.map((p, i) => renderPlayerCard(p, 3, i, isDraggable, 'pitch'))}
          </div>
          <div className="flex justify-center gap-20 items-center h-1/5">
            {rows[2]?.map((p, i) => renderPlayerCard(p, 2, i, isDraggable, 'pitch'))}
          </div>
          <div className="flex justify-center h-1/5"></div>
          <div className="flex justify-around items-center h-1/5">
            {rows[1]?.map((p, i) => renderPlayerCard(p, 1, i, isDraggable, 'pitch'))}
          </div>
          <div className="flex justify-center items-center h-1/5">
            {rows[0]?.map((p, i) => renderPlayerCard(p, 0, i, isDraggable, 'pitch'))}
          </div>
        </div>
      </div>
    </div >
  );
  const CoachCard = () => {
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateXValue = ((y / rect.height) - 0.5) * -25;
      const rotateYValue = ((x / rect.width) - 0.5) * 25;

      setRotateX(rotateXValue);
      setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
    };

    return (
      <div className="hidden lg:block absolute right-8 bottom-8 z-10 bench-player-wrapper">
        <motion.div
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-40 h-60 flex-shrink-0 cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            perspective: 1000,
          }}
        >
          <div
            className="relative w-full h-full flex flex-col items-center"
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="mt-13 w-full h-[70%] relative z-10 flex justify-center items-end">
              <div className="relative w-full h-full">
                <NextImage
                  src="/cards/kanzari.png"
                  alt="Coach Kanzari"
                  fill
                  className="object-contain drop-shadow-2xl group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderBench = (benchPlayers: Player[], isDraggable: boolean) => (
    <div className="relative w-full border-t border-[var(--border)] pt-6 pb-8 bg-[var(--background)]">
      <div className="flex items-center justify-between mb-12 px-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-7 bg-[#d4af37] rounded-sm" />
          <h2 className="font-display font-black text-3xl uppercase italic text-foreground" style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}>{t.bench}</h2>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-[#d4af37] uppercase">{benchPlayers.length} / {allPlayers.length - 11}</span>
        </div>
      </div>
      <div className="flex justify-center items-end h-[300px] overflow-visible relative px-20">
        <CoachCard />
        {benchPlayers.map((player, idx) => (
          <motion.div
            key={player.name}
            initial={{ marginLeft: idx === 0 ? 0 : -148 }}
            whileHover={{
              y: -30,
              scale: 1.05,
              zIndex: 100,
              transition: { type: "spring", stiffness: 600, damping: 25 }
            }}
            className="relative perspective-1000"
            style={{ zIndex: idx, originY: 1 }}
          >
            {renderPlayerCard(player, 0, 0, isDraggable, 'bench', idx, benchPlayers.length)}
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <section id="team" className="relative py-48 bg-[var(--background)] flex flex-col items-center justify-center min-h-[60vh] overflow-hidden text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <RefreshCw className="w-16 h-16 text-[var(--primary)] opacity-40" />
        </motion.div>
        <p className="mt-12 text-[var(--foreground)]/60 font-display font-black text-2xl uppercase tracking-[0.3em] animate-pulse italic">
          {t.loading}
        </p>
        {error && <p className="mt-4 text-red-500/60 text-[10px] font-mono uppercase tracking-[0.5em]">{error}</p>}
      </section>
    );
  }

  const fanRows = buildRows(fanStarters, formations[fanFormation]);
  const realRows = buildRows(realStarters, realFormation);

  return (
    <section id="team" ref={ref} className="relative py-32 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={scrollSpring}
            className="inline-block px-4 py-2 bg-[#F54927]/10 border border-[#F54927]/30 rounded-full text-[#F54927] text-sm font-semibold mb-3"
          >
            THE SQUAD
          </motion.span>
          <br />
          <div ref={squadRef} className="inline-block">
            <p
              className={`text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter italic ${theme === 'light' ? 'text-[#003366]' : 'text-[#C8102E]'}`}
              style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}
            >
              <VariableProximityText
                label={language === 'ar' ? 'تشكيلة الفريق' : 'The Lineup'}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={squadRef}
                radius={150}
                falloff="gaussian"
              />
            </p>
          </div>
          <br />

          {/* Latest match: CA logo vs latest opponent, auto-updates each fixture */}
          {latestResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...scrollTransition, delay: 0.2 }}
              className="inline-flex items-center gap-4 sm:gap-6 mt-7 px-6 sm:px-8 py-4 rounded-3xl bg-[var(--card)] border border-[var(--foreground)]/10 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--background)] border-2 border-[var(--primary)]/40 flex items-center justify-center overflow-hidden">
                  <NextImage src="/clubs/ca.png" alt="Club Africain" width={40} height={40} className="object-contain" />
                </div>
                <span className="mt-1.5 text-[var(--foreground)] font-black uppercase tracking-wide text-xs sm:text-sm">Club Africain</span>
              </div>

              <div className="flex flex-col items-center px-2 sm:px-4">
                {latestResult.result === "Win" ? (
                  <span className="text-green-400 font-black text-2xl sm:text-3xl tracking-tight">{latestResult.score || "W"}</span>
                ) : latestResult.result === "Draw" ? (
                  <span className="text-yellow-400 font-black text-2xl sm:text-3xl tracking-tight">{latestResult.score || "D"}</span>
                ) : latestResult.result === "Loss" ? (
                  <span className="text-red-400 font-black text-2xl sm:text-3xl tracking-tight">{latestResult.score || "L"}</span>
                ) : (
                  <span className="text-[var(--primary)] font-black text-[10px] uppercase tracking-wider">{language === "ar" ? "آخر مباراة" : language === "fr" ? "Dernier match" : "Latest"}</span>
                )}
                <span className="mt-1 text-[var(--foreground)]/50 text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={10} /> {latestResult.date}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--background)] border-2 border-[var(--foreground)]/15 flex items-center justify-center overflow-hidden">
                  {latestOpponentLogo ? (
                    <NextImage src={latestOpponentLogo} alt={latestResult.opponent} width={40} height={40} className="object-contain p-1" />
                  ) : (
                    <span className="text-[var(--foreground)]/40 font-black text-lg">{latestResult.opponent?.slice(0, 1)}</span>
                  )}
                </div>
                <span className="mt-1.5 text-[var(--foreground)] font-black uppercase tracking-wide text-xs sm:text-sm">{latestResult.opponent}</span>
              </div>
            </motion.div>
          )}
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.div key="real" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="relative pt-4 rounded-[1rem] border border-[var(--border)] shadow-[0_40px_80px_rgba(0,0,0,0.4)] overflow-hidden bg-[var(--card)]">
              {/* Mohsen Trabelsi card — pinned on the left side, mirroring the coach card on the right */}
              <FloatingMohsenCard />
              {renderPitch(realRows, false)}
              {renderBench(realBench, false)}
              <TransfersTable language={language} theme={theme} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// Transfers Table Component (Transfermarkt Data)
function TransfersTable({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const [tab, setTab] = useState<'arrivals' | 'departures'>('arrivals');

  const arrivals = [
    {
      id: 1,
      name: "Yassine Meriah",
      pos: "Défenseur central",
      posAr: "مدافع محوري",
      age: 33,
      nat: "Tunisie",
      natAr: "تونس",
      club: "ES Tunis",
      league: "Ligue 1",
      mv: "800 K €",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/yassine-meriah/profil/spieler/306330",
      flag: "/icon/yass.png"
    },
    {
      id: 2,
      name: "Mootez Zaddem",
      pos: "Milieu central",
      posAr: "وسط ميدان",
      age: 25,
      nat: "Tunisie",
      natAr: "تونس",
      club: "Al-Shorta",
      league: "Iraq Stars League",
      mv: "500 K €",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/mootez-zaddem/profil/spieler/750487",
      flag: "/icon/zadd.png"
    },
    {
      id: 3,
      name: "Mamadou Diatta",
      pos: "Défenseur central",
      posAr: "مدافع محوري",
      age: 20,
      nat: "Sénégal",
      natAr: "السنغال",
      club: "ASC Jaraaf",
      league: "Ligue 1",
      mv: "25 K €",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/mamadou-diatta/profil/spieler/1464909",
      flag: "/icon/dal.png"
    },
    {
      id: 4,
      name: "Ismaïla Simpara",
      pos: "Défenseur central",
      posAr: "مدافع محوري",
      age: 28,
      nat: "Mali",
      natAr: "مالي",
      club: "Stade Malien",
      league: "Mali",
      mv: "-",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/ismaila-simpara/profil/spieler/568734",
      flag: "/icon/sim.png"
    },
    {
      id: 5,
      name: "Haykeul Chikhaoui",
      pos: "Milieu offensif",
      posAr: "وسط هجومي",
      age: 29,
      nat: "Tunisie",
      natAr: "تونس",
      club: "Al-Nasr SC",
      league: "Koweït",
      mv: "-",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/haykeul-chikhaoui/profil/spieler/290603",
      flag: "/icon/chikh.png"
    },
    {
      id: 6,
      name: "Rayan El Djebali",
      pos: "Milieu offensif",
      posAr: "وسط هجومي",
      age: 20,
      nat: "Tunisie",
      natAr: "تونس",
      club: "Le Havre B",
      league: "France",
      mv: "-",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/rayan-el-djebali/profil/spieler/1166902",
      flag: "/icon/ray.png"
    },
    {
      id: 7,
      name: "Ghassen Mahersi",
      pos: "Arrière gauche",
      posAr: "ظهير أيسر",
      age: 25,
      nat: "Tunisie",
      natAr: "تونس",
      club: "ES Zarzis",
      league: "Ligue 1",
      mv: "400 K €",
      fee: "?",
      feeAr: "غير معلن",
      url: "https://www.transfermarkt.fr/ghassen-mahersi/profil/spieler/1008452",
      flag: "/icon/mah.png"
    },
    {
      id: 8,
      name: "Taddeus Nkeng",
      pos: "Ailier gauche",
      posAr: "جناح أيسر",
      age: 26,
      nat: "Cameroun",
      natAr: "الكاميرون",
      club: "Stade Malien",
      league: "Mali",
      mv: "-",
      fee: "?",
      feeAr: "غير معلن",
      url: "https://www.transfermarkt.fr/taddeus-nkeng/profil/spieler/624831",
      flag: "/icon/nken.png"
    },
    {
      id: 9,
      name: "Ammar Abdelhak",
      pos: "Arrière gauche",
      posAr: "ظهير أيسر",
      age: 19,
      nat: "Tunisie",
      natAr: "تونس",
      club: "C. Africain U19",
      league: "Tunisie",
      mv: "-",
      fee: "-",
      feeAr: "ترقية",
      url: "https://www.transfermarkt.fr/ammar-abdelhak/profil/spieler/1258262",
      flag: "/icon/ghi.png"
    }
  ];

  const departures = [
    {
      id: 1,
      name: "Firas Chaouat",
      pos: "Avant-centre",
      posAr: "مهاجم صريح",
      age: 30,
      nat: "Tunisie",
      natAr: "تونس",
      club: "Al-Ahly Benghazi",
      league: "Libyan Premier League",
      mv: "1,20 mio. €",
      fee: "520 K €",
      feeAr: "520 ألف €",
      url: "https://www.transfermarkt.fr/firas-chaouat/profil/spieler/402087",
      flag: "/icon/cha.png"
    },
    {
      id: 2,
      name: "Hamza Ben Abda",
      pos: "Défenseur central",
      posAr: "مدافع محوري",
      age: 31,
      nat: "Tunisie",
      natAr: "تونس",
      club: "Al-Ittihad Tripoli",
      league: "Libyan Premier League",
      mv: "800 K €",
      fee: "500 K €",
      feeAr: "500 ألف €",
      url: "https://www.transfermarkt.fr/hamza-ben-abda/profil/spieler/454494",
      flag: "/icon/hamz.png"
    },
    {
      id: 3,
      name: "Oussema Shili",
      pos: "Arrière gauche",
      posAr: "ظهير أيسر",
      age: 29,
      nat: "Tunisie",
      natAr: "تونس",
      club: "Al-Khaldiya",
      league: "Bahreïn",
      mv: "650 K €",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/oussema-shili/profil/spieler/842994",
      flag: "/icon/shil.png"
    },
    {
      id: 4,
      name: "Moataz Zemzemi",
      pos: "Milieu central",
      posAr: "وسط ميدان",
      age: 26,
      nat: "Tunisie",
      natAr: "تونس",
      club: "CSKA 1948",
      league: "efbet Liga",
      mv: "650 K €",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/moataz-zemzemi/profil/spieler/422893",
      flag: "/icon/zem.png"
    },
    {
      id: 5,
      name: "Toufik Cherifi",
      pos: "Défenseur central",
      posAr: "مدافع محوري",
      age: 24,
      nat: "Algérie",
      natAr: "الجزائر",
      club: "JS Kabylie",
      league: "Ligue 1",
      mv: "500 K €",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/toufik-cherifi/profil/spieler/927313",
      flag: "/icon/cher.png"
    },
    {
      id: 6,
      name: "Ghaith Sghaier",
      pos: "Milieu offensif",
      posAr: "وسط هجومي",
      age: 31,
      nat: "Tunisie",
      natAr: "تونس",
      club: "CS Sfaxien",
      league: "Ligue 1",
      mv: "400 K €",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/ghaith-sghaier/profil/spieler/464747",
      flag: "/icon/sgh.png"
    },
    {
      id: 7,
      name: "Fahad Al-Mesmari",
      pos: "Ailier gauche",
      posAr: "جناح أيسر",
      age: 22,
      nat: "Libye",
      natAr: "ليبيا",
      club: "Al-Ahly Benghazi",
      league: "Libyan Premier League",
      mv: "175 K €",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/fahad-al-mesmari/profil/spieler/874023",
      flag: "/icon/fah.png"
    },
    {
      id: 8,
      name: "Dries Arfaoui",
      pos: "Gardien de but",
      posAr: "حارس مرمى",
      age: 21,
      nat: "Tunisie",
      natAr: "تونس",
      club: "US Monastir",
      league: "Ligue 1",
      mv: "-",
      fee: "Tr. libre",
      feeAr: "انتقال مجاني",
      url: "https://www.transfermarkt.fr/dries-arfaoui/profil/spieler/1120677",
      flag: "/icon/dri.png"
    },
    {
      id: 9,
      name: "Mohamed Aziz Ghrissi",
      pos: "Arrière droit",
      posAr: "ظهير أيمن",
      age: 23,
      nat: "Tunisie",
      natAr: "تونس",
      club: "ES Metlaoui",
      league: "Ligue 1",
      mv: "50 K €",
      fee: "Prêt",
      feeAr: "إعارة",
      url: "https://www.transfermarkt.fr/mohamed-aziz-ghrissi/profil/spieler/1143691",
      flag: "/icon/ghasz.png"
    },
    {
      id: 10,
      name: "Wassim Maghzaoui",
      pos: "Gardien de but",
      posAr: "حارس مرمى",
      age: 22,
      nat: "Tunisie",
      natAr: "تونس",
      club: "ES Zarzis",
      league: "Ligue 1",
      mv: "-",
      fee: "?",
      feeAr: "غير معلن",
      url: "https://www.transfermarkt.fr/wassim-maghzaoui/profil/spieler/1192867",
      flag: "/icon/maghh.png"
    }
  ];

  const currentList = tab === 'arrivals' ? arrivals : departures;

  return (
    <div className="w-full border-t border-[var(--border)] pt-8 pb-10 px-4 sm:px-8 bg-[var(--background)]/90">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-[var(--border)]/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-8 bg-[var(--primary)] rounded-sm" />
          <div>
            <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[var(--foreground)]">
              {language === 'ar' ? 'انتقالات موسم 2026/2027' : language === 'fr' ? 'Transferts 2026/2027' : 'Transfers 2026/2027'}
            </h3>
            <p className="text-xs text-[var(--foreground)]/50 font-mono">
              Source: Transfermarkt • Club Africain
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/10">
          <button
            onClick={() => setTab('arrivals')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              tab === 'arrivals'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'
            }`}
          >
            {language === 'ar' ? 'أبرز القادمون (Arrivées)' : language === 'fr' ? 'Principales arrivées' : 'Key Arrivals'} ({arrivals.length})
          </button>
          <button
            onClick={() => setTab('departures')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              tab === 'departures'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'
            }`}
          >
            {language === 'ar' ? 'أبرز المغادرون (Départs)' : language === 'fr' ? 'Principaux départs' : 'Key Departures'} ({departures.length})
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[var(--foreground)]/5 border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--foreground)]/60 font-mono">
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-4">{language === 'ar' ? 'اللاعب / المركز' : 'Joueur(s) / Poste'}</th>
              <th className="py-3 px-3 text-center">{language === 'ar' ? 'السن' : 'Âge'}</th>
              <th className="py-3 px-3">{language === 'ar' ? 'الجنسية' : 'Nationalité'}</th>
              <th className="py-3 px-4">{tab === 'arrivals' ? (language === 'ar' ? 'قادم من' : 'Venant de') : (language === 'ar' ? 'منتقل إلى' : 'Allant à')}</th>
              <th className="py-3 px-3">{language === 'ar' ? 'القيمة التسويقية' : 'VM à ce moment'}</th>
              <th className="py-3 px-4">{language === 'ar' ? 'قيمة الصفقة' : 'Montant de transfert'}</th>
              <th className="py-3 px-3 text-center">Transfermarkt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/40">
            {currentList.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer group"
                onClick={() => window.open(item.url, '_blank')}
                title={`${item.name} - Ouvrir sur Transfermarkt`}
              >
                {/* # */}
                <td className="py-3 px-3 text-center font-bold text-[var(--foreground)]/40 font-mono text-xs">
                  {item.id}
                </td>

                {/* Joueur / Position */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                      <NextImage src={item.flag} alt="" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--foreground)] text-sm group-hover:text-[var(--primary)] transition-colors">
                        {item.name}
                      </p>
                      <span className="text-[11px] text-[var(--primary)] font-medium">
                        {language === 'ar' ? item.posAr : item.pos}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Âge */}
                <td className="py-3 px-3 text-center font-mono text-xs text-[var(--foreground)]/80">
                  {item.age}
                </td>

                {/* Nationalité */}
                <td className="py-3 px-3 text-xs text-[var(--foreground)]/80">
                  {language === 'ar' ? item.natAr : item.nat}
                </td>

                {/* Club & League */}
                <td className="py-3 px-4">
                  <p className="font-bold text-[var(--foreground)]/90 text-xs">{item.club}</p>
                  <span className="text-[10px] text-[var(--foreground)]/50 font-mono">{item.league}</span>
                </td>

                {/* VM */}
                <td className="py-3 px-3 text-xs font-mono font-bold text-[var(--foreground)]/80">
                  {item.mv}
                </td>

                {/* Montant de transfert */}
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.fee.includes('Tr. libre') || item.fee.includes('مجاني')
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : item.fee.includes('Prêt') || item.fee.includes('إعارة')
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : item.fee === '-' || item.fee === '?'
                      ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {language === 'ar' ? item.feeAr : item.fee}
                  </span>
                </td>

                {/* Transfermarkt link */}
                <td className="py-3 px-3 text-center">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--primary)] text-[var(--foreground)]/60 hover:text-white transition-all text-xs"
                    title="Voir profil Transfermarkt"
                  >
                    ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const FALLBACK_NEWS_IMAGES = [
  "/fallback.jpg",
];

const FALLBACK_NEWS = (language: "en" | "fr" | "ar") => {
  const now = new Date("2026-03-21"); // Use a stable date for SSR consistency

  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dayOfWeek = now.getDay();

  const allFallbackNews = [
    { title: language === "ar" ? "أخبار Club Africain" : language === "fr" ? "Actualités Club Africain" : "Club Africain News", date: now.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }), source: "Foot24", image: "/fallback.jpg", url: "https://www.foot24.tn/club/club-africain" },
    { title: language === "ar" ? "مباريات Club Africain" : language === "fr" ? "Matchs du Club Africain" : "Club Africain Matches", date: now.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }), source: "FootTN", image: "/fallback.jpg", url: "https://www.foottn.com/club/club-africain" },
    { title: language === "ar" ? "نتائج Club Africain" : language === "fr" ? "Résultats Club Africain" : "Club Africain Results", date: now.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }), source: "Footlink", image: "/fallback.jpg", url: "https://www.footlink.tn/club/club-africain" },
    { title: language === "ar" ? "أخبار رياضية" : language === "fr" ? "Actualités Sportives" : "Sports News", date: now.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }), source: "TunisiaSports", image: "/fallback.jpg", url: "https://www.tunisisports.net/club/club-africain" },
    { title: language === "ar" ? "أخبار Club Africain" : language === "fr" ? "Nessma Sport" : "Nessma Sport", date: now.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }), source: "Nessma", image: "/fallback.jpg", url: "https://www.nessmashort.net/club/club-africain" },
    { title: language === "ar" ? "أخبار Tunisia NewsNow" : language === "fr" ? "Actualités NewsNow" : "NewsNow Updates", date: now.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }), source: "NewsNow", image: "/fallback.jpg", url: "https://www.newsnow.com/search?q=club%20africain" },
  ];

  // Shuffle based on day for variety
  const shuffled = allFallbackNews.sort(() => {
    const seed = (dayOfYear * 7 + dayOfWeek * 3) % 100;
    return 0.5 - (seed / 100);
  });

  return shuffled.slice(0, 6);
};

type NewsItemType = { title: string; date: string; source: string; image: string; url: string };

// News section
function NewsSection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const t = translations[language].news;
  const newsRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllNews, setShowAllNews] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/news')
      .then((res) => res.json())
      .then((data: { items?: NewsItemType[] }) => {
        if (cancelled) return;
        const items = data?.items ?? [];
        if (items.length > 0) {
          setNews(items.map((i) => ({ title: i.title, date: i.date, source: i.source, image: i.image, url: i.url })));
        } else {
          setNews(FALLBACK_NEWS(language));
        }
      })
      .catch(() => {
        if (!cancelled) setNews(FALLBACK_NEWS(language));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [language]);

  const allNews = news.length > 0 ? news : FALLBACK_NEWS(language);
  const displayNews = showAllNews ? allNews : allNews.slice(0, 6);
  const hasMore = allNews.length > 6;

  return (
    <section id="news" ref={ref} className="relative py-10 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--background)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={scrollTransition}
          className="text-center mb-6"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={scrollSpring}
            className="inline-block px-4 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-full text-[var(--primary)] text-sm font-semibold mb-3"
          >
            {t.header}
          </motion.span>
          <br />
          <div ref={newsRef} className="inline-block">
            <p
              className={`text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter italic ${theme === 'light' ? 'text-[#003366]' : 'text-[#C8102E]'}`}
              style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}
            >
              <VariableProximityText
                label={t.title}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={newsRef}
                radius={150}
                falloff="gaussian"
              />
            </p>
          </div>
          <p className="text-[var(--foreground)] opacity-60 max-w-xl mx-auto text-sm mt-3">
            {t.subtitle}
          </p>
        </motion.div>

        {/* News grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? [1, 2, 3].map((i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group"
              >
                <div className="aspect-video rounded-2xl bg-[var(--foreground)]/10 animate-pulse" />
                <div className="mt-4 h-4 w-1/3 rounded bg-[var(--foreground)]/10 animate-pulse" />
                <div className="mt-3 h-6 w-full rounded bg-[var(--foreground)]/10 animate-pulse" />
                <div className="mt-2 h-4 w-2/3 rounded bg-[var(--foreground)]/10 animate-pulse" />
              </motion.div>
            ))
            : displayNews.map((item, index) => (
              <motion.article
                key={`${item.url}-${index}`}
                initial={{ opacity: 0, y: 48 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.12, ...scrollTransitionFast }}
                whileHover={{ y: -10, transition: scrollTransitionFast }}
                className="group"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="aspect-video overflow-hidden">
                      <motion.img
                        src="/fallback.jpg"
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <motion.span
                      initial={{ x: -100 }}
                      animate={inView ? { x: 0 } : {}}
                      transition={{ delay: index * 0.12 + 0.25, ...scrollTransitionFast }}
                      className="absolute top-4 left-4 bg-[var(--primary)] text-white px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {item.source}
                    </motion.span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[var(--foreground)] opacity-50 text-sm flex items-center gap-2">
                      <Calendar size={14} />
                      {item.date}
                    </p>
                    <h3 className="text-[var(--foreground)] font-bold text-xl mt-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[var(--primary)] mt-3 font-semibold">
                      {t.more} <ArrowRight size={16} />
                    </span>
                  </div>
                </a>
              </motion.article>
            ))}
        </div>

        {hasMore && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-center mt-12"
          >
            <button
              onClick={() => setShowAllNews(!showAllNews)}
              className="px-8 py-3 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/30 rounded-xl text-[var(--primary)] font-bold transition-all"
            >
              {showAllNews ? "Show Less" : "Show All News"}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// CLUB AFRICAIN — 2026/27 SEASON
// Ligue 1 + CAF Champions League
// ============================================================

const ALL_RESULTS = [
  // =========================
  // LIGUE 1
  // =========================

  {
    opponent: "ES Métlaoui",
    score: "0-1",
    date: "23 Août 2026",
    time: "16:30",
    competition: "Ligue 1",
    result: "Win",
    venue: "Stade Municipal de Métlaoui",
    matchday: 1,
    scorers: ["S. Kadida 87'"],
    highlightUrl:
      "https://www.youtube.com/results?search_query=Metlaoui+0-1+Club+Africain+Kadida+2026",
  },

  {
    opponent: "ES Hammam-Sousse",
    score: "1-0",
    date: "29 Août 2026",
    time: "16:30",
    competition: "Ligue 1",
    result: "Win",
    venue: "Stade Olympique Hammadi Agrebi",
    matchday: 2,
    scorers: ["M. Zaddem 88'"],
    highlightUrl:
      "https://www.youtube.com/results?search_query=Club+Africain+1-0+Hammam-Sousse+Zaddem+2026",
  },
];


// ============================================================
// UPCOMING MATCHES
// ============================================================

const DEFAULT_UPCOMING_MATCHES = [

  // =========================
  // CAF CHAMPIONS LEAGUE
  // =========================

  {
    opponent: "Djoliba AC",
    date: "05 Septembre 2026",
    time: "15:00",
    competition: "CAF Champions League",
    venue: "Stade Olympique de Radès",
    matchday: "1er tour - Aller",
  },

  // =========================
  // LIGUE 1
  // =========================

  {
    opponent: "Stade Tunisien",
    date: "05 Septembre 2026",
    time: "15:30",
    competition: "Ligue 1",
    venue: "Stade du Bardo",
    matchday: "J3",
  },

  // =========================
  // CAF CHAMPIONS LEAGUE
  // =========================

  {
    opponent: "Djoliba AC",
    date: "12 Septembre 2026",
    time: "15:00",
    competition: "CAF Champions League",
    venue: "Stade de Djoliba",
    matchday: "1er tour - Retour",
  },

  // =========================
  // LIGUE 1
  // =========================

  {
    opponent: "ES Zarzis",
    date: "12 Septembre 2026",
    time: "15:30",
    competition: "Ligue 1",
    venue: "Stade Olympique de Radès",
    matchday: "J4",
  },

  {
    opponent: "US Ben Guerdane",
    date: "10 Octobre 2026",
    time: "15:30",
    competition: "Ligue 1",
    venue: "Stade du 7 Mars",
    matchday: "J5",
  },

  {
    opponent: "CA Bizertin",
    date: "17 Octobre 2026",
    time: "15:30",
    competition: "Ligue 1",
    venue: "Stade Olympique de Radès",
    matchday: "J6",
  },

  {
    opponent: "PS Sakiet Eddaïer",
    date: "24 Octobre 2026",
    time: "15:30",
    competition: "Ligue 1",
    venue: "Stade de Sakiet Eddaïer",
    matchday: "J7",
  },

  {
    opponent: "Espérance de Tunis",
    date: "21 Novembre 2026",
    time: "16:30",
    competition: "Ligue 1",
    venue: "Stade Olympique de Radès",
    matchday: "J8",
  },

  {
    opponent: "ES Sahel",
    date: "28 Novembre 2026",
    time: "16:30",
    competition: "Ligue 1",
    venue: "Stade Olympique de Sousse",
    matchday: "J9",
  },

  {
    opponent: "JS Omrane",
    date: "05 Décembre 2026",
    time: "16:30",
    competition: "Ligue 1",
    venue: "Stade Olympique de Radès",
    matchday: "J10",
  },

  {
    opponent: "AS Marsa",
    date: "12 Décembre 2026",
    time: "16:30",
    competition: "Ligue 1",
    venue: "Stade Chedly Zouiten",
    matchday: "J11",
  },

  {
    opponent: "CS Hammam-Lif",
    date: "19 Décembre 2026",
    time: "16:30",
    competition: "Ligue 1",
    venue: "Stade Olympique de Radès",
    matchday: "J12",
  },

  {
    opponent: "Olympique Béja",
    date: "26 Décembre 2026",
    time: "16:30",
    competition: "Ligue 1",
    venue: "Stade de Béja",
    matchday: "J13",
  },

  {
    opponent: "CS Sfaxien",
    date: "30 Décembre 2026",
    time: "16:30",
    competition: "Ligue 1",
    venue: "Stade Olympique de Radès",
    matchday: "J14",
  },

  {
    opponent: "US Monastir",
    date: "02 Janvier 2027",
    time: "16:30",
    competition: "Ligue 1",
    venue: "Stade Mustapha Ben Jannet",
    matchday: "J15",
  },


  // ============================================================
  // CAF — SECOND PRELIMINARY ROUND
  // Only if Club Africain qualifies against Djoliba
  // ============================================================

  {
    opponent: "Medeama SC / TP Mazembe",
    date: "16 Octobre 2026",
    time: "TBD",
    competition: "CAF Champions League",
    venue: "TBD",
    matchday: "2e tour - Aller",
    conditional: true,
  },

  {
    opponent: "Medeama SC / TP Mazembe",
    date: "23 Octobre 2026",
    time: "TBD",
    competition: "CAF Champions League",
    venue: "TBD",
    matchday: "2e tour - Retour",
    conditional: true,
  },
];

// Matches section (Results and Next Matches)
function MatchesSection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const t = translations[language].matches;
  const matchdayRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [activeTab, setActiveTab] = useState<"upcoming" | "results">("upcoming");
  const [activeCompetition, setActiveCompetition] = useState("All");
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [allUpcomingMatches, setAllUpcomingMatches] = useState(DEFAULT_UPCOMING_MATCHES);
  const [allResults, setAllResults] = useState(ALL_RESULTS);

  // Fetch real fixtures from API
  useEffect(() => {
    fetch('/api/fixtures')
      .then(res => res.json())
      .then(data => {
        if (data.upcoming && Array.isArray(data.upcoming) && data.upcoming.length > 0) {
          setAllUpcomingMatches(data.upcoming);
        }
        if (data.recent && Array.isArray(data.recent) && data.recent.length > 0) {
          setAllResults(data.recent);
        }
      })
      .catch(() => {});
  }, []);

  // Club Logo Mapping
  const clubLogos: { [key: string]: string } = {
    "ES Metlaoui": "/clubs/esm.png",
    "ES Métlaoui": "/clubs/esm.png",
    "US Ben Guerdane": "/clubs/usb.png",
    "CS Hammam-Lif": "/clubs/cshl.png",
    "US Monastir": "/clubs/usm.png",
    "ES Hammam-Sousse": "/clubs/eshs.png",
    "PS Sakiet Eddaïer": "/clubs/psse.png",
    "Stade Tunisien": "/clubs/st.png",
    "Esperance Tunis": "/clubs/est.png",
    "Espérance de Tunis": "/clubs/est.png",
    "Olympique Béja": "/clubs/beja.png",
    "JS Omrane": "/clubs/jso.png",
    "CS Sfaxien": "/clubs/css.png",
    "CA Bizertin": "/clubs/cab.png",
    "ES Zarzis": "/clubs/esz.png",
    "ES Sahel": "/clubs/ess.png",
    "AS Marsa": "/clubs/marsa.png",
    "Djoliba AC": "/clubs/djo.png",
  };

  const getClubLogo = (teamName: string) => clubLogos[teamName] || null;

  // Competition filter options (custom priority order, then alphabetical)
  const competitionOptions = useMemo(() => {
    const priority = ["Ligue 1", "CAF Champions League"];
    const set = new Set<string>();
    [...allUpcomingMatches, ...allResults].forEach(m => {
      if (m.competition) set.add(m.competition);
    });
    const others = [...set].filter(c => !priority.includes(c)).sort();
    return ["All", ...priority.filter(c => set.has(c)), ...others];
  }, [allUpcomingMatches, allResults]);

  const filteredUpcoming =
    activeCompetition === "All"
      ? allUpcomingMatches
      : allUpcomingMatches.filter(m => m.competition === activeCompetition);

  const filteredResults =
    activeCompetition === "All"
      ? allResults
      : allResults.filter(m => m.competition === activeCompetition);

  const visibleUpcoming = showAllUpcoming ? filteredUpcoming : filteredUpcoming.slice(0, 2);
  const visibleResults = showAllResults ? filteredResults : filteredResults.slice(0, 3);

  // Recent form guide (last 5 results)
  const form = allResults.slice(0, 5).map(r => r.result);

  const formColor = (result: string) => {
    if (result === "Win") return "bg-green-500/15 border border-green-500/40 text-green-400";
    if (result === "Draw") return "bg-yellow-500/15 border border-yellow-500/40 text-yellow-400";
    return "bg-red-500/15 border border-red-500/40 text-red-400";
  };

  const resultColor = (result: string) => {
    if (result === "Win") return { chip: formColor(result), label: "✓" };
    if (result === "Draw") return { chip: formColor(result), label: "=" };
    return { chip: formColor(result), label: "✗" };
  };

  const langLabel = (en: string, fr: string, ar: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  return (
    <section id="matches" ref={ref} className="relative py-20 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--primary)] rounded-full blur-[180px] opacity-[0.07] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-[#D4AF37] rounded-full blur-[200px] opacity-[0.05] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={scrollTransition}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
            </span>
            {langLabel("Season 2025/26", "Saison 2025/26", "موسم 2025/26")}
          </span>
          <br />
          <div ref={matchdayRef} className="inline-block mt-4">
            <p
              className={`text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter italic ${theme === 'light' ? 'text-[#003366]' : 'text-[#C8102E]'}`}
              style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}
            >
              <VariableProximityText
                label={t.title}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={matchdayRef}
                radius={150}
                falloff="gaussian"
              />
            </p>
          </div>
          <p className="text-[var(--foreground)] opacity-60 text-sm mt-3 tracking-wide">
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
              {t.stats}
            </span>
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...scrollTransition, delay: 0.05 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-[var(--card)]/80 border border-[var(--foreground)]/10 shadow-xl backdrop-blur-xl">
            {(["upcoming", "results"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowAllUpcoming(false);
                  setShowAllResults(false);
                }}
                className={`relative px-6 sm:px-8 py-2.5 rounded-full text-sm font-black uppercase tracking-wider transition-colors ${
                  activeTab === tab ? "text-white" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
                }`}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="matchesTabPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/85 shadow-lg shadow-[var(--primary)]/30"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === "upcoming" ? <Calendar size={14} /> : <Trophy size={14} />}
                  {tab === "upcoming" ? t.upcoming : t.results}
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 leading-none rounded-full ${
                      activeTab === tab ? "bg-white/20 text-white" : "bg-[var(--primary)]/15 text-[var(--primary)]"
                    }`}
                  >
                    {tab === "upcoming" ? filteredUpcoming.length : filteredResults.length}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Competition filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ ...scrollTransition, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {competitionOptions.map(comp => (
            <button
              key={comp}
              onClick={() => {
                setActiveCompetition(comp);
                setShowAllUpcoming(false);
                setShowAllResults(false);
              }}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all ${
                activeCompetition === comp
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30 scale-105"
                  : "bg-[var(--card)]/70 border-[var(--foreground)]/10 text-[var(--foreground)]/60 hover:border-[var(--primary)]/40 hover:text-[var(--foreground)]"
              }`}
            >
              {comp}
            </button>
          ))}
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "upcoming" ? (
              <motion.div
                key={`upcoming-${activeCompetition}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={scrollTransitionFast}
                className="space-y-5"
              >
                {visibleUpcoming.map((match, index) => (
                  <motion.div key={index} whileHover={{ y: -5 }} className="group relative">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--primary)]/30 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative overflow-hidden rounded-3xl bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--foreground)]/10 hover:border-[var(--primary)]/40 p-5 sm:p-6 shadow-xl transition-all duration-300">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[var(--primary)]/5 blur-2xl pointer-events-none" />

                      {/* Header row */}
                      <div className="relative flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/25 text-[var(--primary)] text-[11px] font-bold uppercase tracking-wider">
                            <Trophy size={11} /> {match.competition}
                          </span>
                          {match.matchday && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/60 text-[10px] font-bold uppercase tracking-wider">
                              {match.matchday}
                            </span>
                          )}
                          {match.conditional && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
                              {langLabel("Conditional", "Sous condition", "مشروط")}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/70 text-[11px] font-bold">
                          <Calendar size={11} /> {match.date}
                          <span className="opacity-30">•</span>
                          <Clock size={11} /> {match.time}
                        </span>
                      </div>

                      {/* Teams row */}
                      <div className="relative flex items-stretch justify-between gap-3 sm:gap-6">
                        {/* Home team */}
                        <div className="flex flex-col items-center justify-center flex-1 min-w-0 py-1.5">
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-2">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/40 opacity-30 blur-md group-hover:opacity-60 transition-opacity" />
                            <div className="relative w-full h-full rounded-full bg-[var(--background)] border-2 border-[var(--primary)]/40 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-[var(--primary)] transition-colors">
                              <NextImage src="/ca.png" alt="Club Africain" width={34} height={34} className="object-contain" />
                            </div>
                          </div>
                          <p className="text-[var(--foreground)] font-black uppercase tracking-wide text-sm sm:text-base truncate">Club Africain</p>
                        </div>

                        {/* Away team */}
                        <div className="flex flex-col items-center justify-center flex-1 min-w-0 py-1.5">
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-2">
                            <div className="absolute inset-0 rounded-full bg-[var(--foreground)]/10 blur-md" />
                            <div className="relative w-full h-full rounded-full bg-[var(--background)] border-2 border-[var(--foreground)]/15 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-[var(--foreground)]/40 transition-colors">
                              {getClubLogo(match.opponent) ? (
                                <NextImage src={getClubLogo(match.opponent)!} alt={match.opponent} width={34} height={34} className="object-contain p-1" />
                              ) : (
                                <span className="text-[var(--foreground)]/40 font-black text-lg">{match.opponent.slice(0, 1)}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-[var(--foreground)] font-black uppercase tracking-wide text-sm sm:text-base truncate text-right">{match.opponent}</p>
                        </div>
                      </div>

                      {/* VS badge — plain colored text */}
                      <div className="relative flex flex-col items-center justify-center my-3">
                        <motion.span
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                          className="text-[var(--primary)] font-black italic text-2xl sm:text-3xl tracking-widest drop-shadow-[0_2px_6px_rgba(200,16,46,0.35)]"
                        >
                          VS
                        </motion.span>
                      </div>

                      {/* Footer row */}
                      <div className="relative mt-5 pt-4 border-t border-[var(--foreground)]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[var(--foreground)]/50 text-sm">
                          <MapPin size={13} /> {match.venue}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/75 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50 transition-all"
                        >
                          {langLabel("Get Tickets", "Billets", "شراء التذاكر")}
                          <ArrowRight size={13} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {visibleUpcoming.length === 0 && (
                  <div className="text-center py-16 text-[var(--foreground)]/40">
                    {langLabel("No fixtures for this competition.", "Aucune rencontre pour cette compétition.", "لا توجد مباريات لهذه المسابقة.")}
                  </div>
                )}

                {filteredUpcoming.length > 2 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    className="w-full mt-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--foreground)]/10 hover:border-[var(--primary)]/50 text-[var(--foreground)] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {showAllUpcoming
                      ? langLabel("Show Less", "Voir moins", "عرض أقل")
                      : langLabel(`Show All ${filteredUpcoming.length} Upcoming`, `Voir les ${filteredUpcoming.length} rencontres`, `عرض كل ${filteredUpcoming.length} مباريات`)}
                    <ChevronDown className={`transform transition-transform ${showAllUpcoming ? "rotate-180" : ""}`} size={18} />
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`results-${activeCompetition}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={scrollTransitionFast}
                className="space-y-5"
              >
                {/* Form guide */}
                <div className="flex items-center justify-center gap-4 py-4 rounded-2xl bg-[var(--card)]/70 border border-[var(--foreground)]/10 backdrop-blur-xl mb-8">
                  <span className="text-[var(--foreground)]/50 text-[10px] font-black uppercase tracking-[0.2em]">
                    {langLabel("Form", "Forme", "النتائج الأخيرة")}
                  </span>
                  <div className="flex gap-1.5">
                    {form.length === 0 && <span className="text-[var(--foreground)]/30 text-xs">—</span>}
                    {form.map((r, i) => (
                      <div key={i} title={r} className={`w-7 h-7 rounded-lg ${formColor(r)} flex items-center justify-center text-[11px] font-black`}>
                        {r === "Win" ? "W" : r === "Draw" ? "D" : "L"}
                      </div>
                    ))}
                  </div>
                </div>

                {visibleResults.map((result, index) => (
                  <motion.div key={index} whileHover={{ y: -4 }} className="group">
                    <a href={result.highlightUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                      <div
                        className={`relative overflow-hidden rounded-3xl bg-[var(--card)]/90 backdrop-blur-xl border p-5 sm:p-6 shadow-xl transition-all duration-300 ${
                          result.result === "Win"
                            ? "border-green-500/20 hover:border-green-500/50"
                            : result.result === "Draw"
                            ? "border-yellow-500/20 hover:border-yellow-500/50"
                            : "border-red-500/20 hover:border-red-500/50"
                        }`}
                      >
                        <div
                          className={`absolute -right-12 -top-12 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                            result.result === "Win"
                              ? "bg-green-500/10"
                              : result.result === "Draw"
                              ? "bg-yellow-500/10"
                              : "bg-red-500/10"
                          }`}
                        />

                        {/* Highlights hint */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10">
                          <span className="bg-[var(--primary)] text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Play size={9} fill="currentColor" /> {langLabel("Highlights", "Résumé", "الملخص")}
                          </span>
                        </div>

                        {/* Header row */}
                        <div className="flex items-center justify-between mb-4 pr-16 gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/25 text-[var(--primary)] text-[11px] font-bold uppercase">
                              <Trophy size={11} />
                              {(() => {
                                const c = String(result.competition || 'Ligue 1 Pro').toLowerCase();
                                if (c === 'amical') return 'Amical';
                                if (c.includes('cup') || c.includes('coupe')) return 'Coupe de Tunisie';
                                return result.matchday ? (String(result.matchday).startsWith('J') || String(result.matchday).startsWith('MD') ? result.matchday : `MD${result.matchday}`) : 'Ligue 1 Pro';
                              })()}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-black text-[10px] uppercase ${resultColor(result.result).chip}`}>
                              {resultColor(result.result).label} {result.result === "Win" ? langLabel("Win", "Victoire", "فوز") : result.result === "Draw" ? langLabel("Draw", "Nul", "تعادل") : result.result === "Loss" ? langLabel("Loss", "Défaite", "خسارة") : result.result || "Terminé"}
                            </span>
                          </div>
                          <span className="hidden sm:inline-flex items-center gap-1.5 text-[var(--foreground)]/50 text-xs">
                            <Calendar size={11} /> {result.date}
                          </span>
                        </div>

                        {/* Teams & score */}
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--background)] border border-[var(--foreground)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <NextImage src="/ca.png" alt="CA" width={24} height={24} className="object-contain" />
                            </div>
                            <p className="text-[var(--foreground)] font-black tracking-wide text-sm sm:text-base truncate">Club Africain</p>
                          </div>

                          <div className={`hidden sm:block font-black text-2xl tracking-widest px-4 py-1.5 rounded-xl ${resultColor(result.result).chip}`}>
                            {result.score}
                          </div>

                          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                            <p className="text-[var(--foreground)] font-black tracking-wide text-sm sm:text-base truncate text-right">{result.opponent}</p>
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--background)] border border-[var(--foreground)]/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                              {getClubLogo(result.opponent) ? (
                                <NextImage src={getClubLogo(result.opponent)!} alt={result.opponent} fill className="object-contain p-1.5" />
                              ) : (
                                <span className="text-[var(--foreground)]/40 font-black text-sm">{result.opponent.slice(0, 1)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mobile score */}
                        <div className="sm:hidden flex items-center justify-center my-3">
                          <div className={`font-black text-xl tracking-widest px-4 py-1 rounded-lg ${resultColor(result.result).chip}`}>{result.score}</div>
                        </div>

                        {/* Scorers & date */}
                        <div className="mt-5 pt-4 border-t border-[var(--foreground)]/10 flex items-center justify-between gap-3 text-xs">
                          <div className="text-[var(--foreground)]/60 flex items-center gap-2 min-w-0">
                            {Array.isArray(result.scorers) && result.scorers.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-sm leading-none">⚽</span>
                                {result.scorers.map((scorerItem: any, idx: number) => {
                                  const scorer = typeof scorerItem === 'string' ? scorerItem : scorerItem?.name ? `${scorerItem.name} ${scorerItem.minute ? `${scorerItem.minute}'` : ''}` : '';
                                  if (!scorer) return null;
                                  const playerName = scorer.split(" ")[0].toLowerCase();
                                  const playerImage = playerName === "kinzumbi" ? "/players/kinzumbi.webp" :
                                    playerName === "romdhane" ? "/players/ramadhan.png" :
                                    playerName === "malek" ? "/players/aitmalek.png" :
                                    playerName === "sherimi" ? "/players/sherimi.png" :
                                    playerName === "kadida" ? "/players/kadida.png" :
                                    playerName === "zaalouni" ? "/players/zaalouni.webp" :
                                    playerName === "bouguerra" ? "/players/bouguerra.png" :
                                    playerName === "harzi" ? "/players/harzi.png" :
                                    playerName === "khadhraoui" ? "/players/khadhraoui.png" :
                                    playerName === "srarfi" ? "/players/srarfi.png" :
                                    playerName === "khan" ? "/players/khan.png" :
                                    playerName === "nkeng" ? "/players/nkeng.png" :
                                    playerName === "mahmoud" ? "/players/sadok.png" : null;
                                  return (
                                    <span key={idx} className="inline-flex items-center gap-1">
                                      {playerImage && (
                                        <NextImage src={playerImage} alt={playerName} width={14} height={14} className="rounded-full object-cover" />
                                      )}
                                      <span>{scorer}</span>
                                      {idx < result.scorers.length - 1 && " · "}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-[var(--foreground)]/40 text-xs">{langLabel("No scorers listed", "Aucun buteur", "لا يوجد مسجلين")}</span>
                            )}
                          </div>
                          <span className="sm:hidden inline-flex items-center gap-1 text-[var(--foreground)]/40 text-[10px]">
                            <Calendar size={10} /> {result.date}
                          </span>
                        </div>

                        {/* Venue & time strip */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 -mt-1 text-[11px] text-[var(--foreground)]/45 border-t border-[var(--foreground)]/5">
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <MapPin size={11} /> <span className="truncate">{result.venue || langLabel("Venue TBA", "Stade à définir", "الملعب يحدد لاحقاً")}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={11} /> {result.time || "--:--"}
                            <span className="opacity-40">•</span>
                            <Calendar size={11} /> <span className="sm:hidden">{result.date}</span>
                          </span>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}

                {visibleResults.length === 0 && (
                  <div className="text-center py-16 text-[var(--foreground)]/40">
                    {langLabel("No results for this competition.", "Aucun résultat pour cette compétition.", "لا توجد نتائج لهذه المسابقة.")}
                  </div>
                )}

                {filteredResults.length > 3 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAllResults(!showAllResults)}
                    className="w-full mt-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--foreground)]/10 hover:border-[var(--primary)]/50 text-[var(--foreground)] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {showAllResults
                      ? langLabel("Show Less", "Voir moins", "عرض أقل")
                      : langLabel(`Show All ${filteredResults.length} Results`, `Voir les ${filteredResults.length} résultats`, `عرض كل ${filteredResults.length} نتائج`)}
                    <ChevronDown className={`transform transition-transform ${showAllResults ? "rotate-180" : ""}`} size={18} />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
// Shop section component
const products = [
  { id: 1, name: "Maillot Officiel Adulte 2024/2025 (Home)", price: 110, image: "/1.png", category: "Maillots", rating: 4.9, reviews: 248, inStock: true, sizes: ["S","M","L","XL","XXL"], isNew: false },
  { id: 2, name: "Sweat Lion 25/26", price: 85, image: "/2.png", category: "Casual", rating: 4.8, reviews: 134, inStock: true, sizes: ["S","M","L","XL","XXL"], isNew: true },
  { id: 3, name: "Maillot Officiel Basket Ball 2024-2025", price: 75, image: "/3.png", category: "Maillots", rating: 4.7, reviews: 62, inStock: true, sizes: ["S","M","L","XL"], isNew: false },
  { id: 4, name: "Maillot Officiel Adulte 2024/2025 (Home Promo)", price: 50, originalPrice: 110, discount: "-55%", image: "/4.png", category: "Maillots", rating: 4.9, reviews: 401, inStock: true, sizes: ["S","M","L","XL","XXL"], isNew: false },
  { id: 5, name: "BOMBERS CROCO 25/26", price: 129, image: "/5.png", category: "Casual", rating: 4.8, reviews: 87, inStock: true, sizes: ["S","M","L","XL","XXL"], isNew: true },
  { id: 6, name: "POLO SANGLE CERCLE", price: 80, image: "/6.png", category: "Casual", rating: 4.6, reviews: 53, inStock: true, sizes: ["S","M","L","XL"], isNew: false },
  { id: 7, name: "Parka Bicolore 25/26", price: 199, image: "/7.png", category: "Casual", rating: 4.9, reviews: 178, inStock: false, sizes: ["M","L","XL"], isNew: true },
  { id: 8, name: "Survêtement Lion 25/26 (Rouge/Gris)", price: 179, image: "/8.png", category: "Training", rating: 4.8, reviews: 122, inStock: true, sizes: ["S","M","L","XL","XXL"], isNew: false },
  { id: 9, name: "DEMI ZIP LION 25/26 (Rouge / Marine)", price: 155, image: "/9.png", category: "Training", rating: 4.7, reviews: 95, inStock: true, sizes: ["S","M","L","XL"], isNew: true },
  { id: 10, name: "Capuche Lion Gris 25/26", price: 90, image: "/10.png", category: "Casual", rating: 4.6, reviews: 44, inStock: true, sizes: ["S","M","L","XL","XXL"], isNew: false },
  { id: 11, name: "Gilet Club Africain 25/26", price: 109, image: "/11.png", category: "Training", rating: 4.7, reviews: 68, inStock: true, sizes: ["S","M","L","XL"], isNew: false },
  { id: 12, name: "Maillot Officiel 25/26 (KIDS)", price: 95, image: "/12.png", category: "Maillots", rating: 4.9, reviews: 214, inStock: true, sizes: ["4ans","6ans","8ans","10ans","12ans"], isNew: true },
  { id: 13, name: "Maillot Officiel Third Jersey 25/26", price: 110, image: "/13.png", category: "Maillots", rating: 4.8, reviews: 189, inStock: true, sizes: ["S","M","L","XL","XXL"], isNew: true },
  { id: 14, name: "Maillot Training Lion 25/26", price: 75, image: "/14.png", category: "Training", rating: 4.7, reviews: 56, inStock: true, sizes: ["S","M","L","XL"], isNew: false },
  { id: 15, name: "Demi Zip Authentique 25/26", price: 109, image: "/15.png", category: "Casual", rating: 4.8, reviews: 74, inStock: true, sizes: ["S","M","L","XL","XXL"], isNew: false },
];

type CartItemType = { product: typeof products[number]; size: string; qty: number };

const ShopSection = React.memo(({ language, theme, user, points, setPoints }: { language: "en" | "fr" | "ar"; theme: string, user: any; points: number; setPoints: any }) => {
  const t = translations[language].shop;
  const shopRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [showAll, setShowAll] = useState(false);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [addedToCart, setAddedToCart] = useState<Record<number, boolean>>({});

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'points'>('cod');
  const [customerData, setCustomerData] = useState({
    name: user?.name || user?.displayName || '',
    phone: '',
    city: 'Tunis',
    address: ''
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const categories = language === "ar"
    ? ["الكل", "قمصان", "تدريب", "كاجوال"]
    : ["Tous", "Maillots", "Training", "Casual"];

  const categoryMap: Record<string, string> = {
    "Tous": "Tous", "Maillots": "Maillots", "Training": "Training", "Casual": "Casual",
    "الكل": "Tous", "قمصان": "Maillots", "تدريب": "Training", "كاجوال": "Casual",
  };

  const filteredProducts = products.filter((p) => {
    const mapped = categoryMap[activeCategory];
    return mapped === "Tous" || p.category === activeCategory || p.category === mapped;
  });
  const displayedProducts = showAll ? filteredProducts : filteredProducts.slice(0, 6);

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotalPrice = cart.reduce((sum, item) => sum + (item.product as any).price * item.qty, 0);
  const discountAmount = Math.round(subtotalPrice * (discountPercent / 100));
  const shippingPrice = subtotalPrice >= 150 ? 0 : 7;
  const finalPrice = Math.max(0, subtotalPrice - discountAmount + shippingPrice);

  const addToCart = (product: any, customSize?: string) => {
    const size = customSize || selectedSizes[product.id] || (product.sizes[0] ?? "L");
    setCart((prev: CartItemType[]) => {
      const existing = prev.find(c => (c.product as any).id === product.id && c.size === size);
      if (existing) return prev.map(c => (c.product as any).id === product.id && c.size === size ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, size, qty: 1 }];
    });
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [product.id]: false })), 1500);
    setCartOpen(true);
  };

  const buyNow = (product: any) => {
    addToCart(product);
    setCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const removeFromCart = (productId: number, size: string) => {
    setCart((prev: CartItemType[]) => prev.filter(c => !((c.product as any).id === productId && c.size === size)));
  };

  const changeQty = (productId: number, size: string, delta: number) => {
    setCart((prev: CartItemType[]) => prev.map(c => {
      if ((c.product as any).id === productId && c.size === size) {
        const newQty = c.qty + delta;
        if (newQty <= 0) return null as any;
        return { ...c, qty: newQty };
      }
      return c;
    }).filter(Boolean));
  };

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'CA1920' || code === 'LIFRIQI' || code === 'BABJEDID') {
      setDiscountPercent(15);
      setPromoError('');
    } else if (code === 'CHAMPION') {
      setDiscountPercent(10);
      setPromoError('');
    } else {
      setPromoError(language === 'ar' ? 'رمز غير صالح' : 'Code promo invalide');
      setDiscountPercent(0);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name.trim() || !customerData.phone.trim() || !customerData.address.trim()) {
      alert(language === 'ar' ? 'يرجى ملء جميع بيانات التوصيل' : 'Veuillez remplir toutes les informations de livraison');
      return;
    }

    setIsSubmittingOrder(true);
    setTimeout(() => {
      const orderId = `CA-${Math.floor(100000 + Math.random() * 900000)}`;
      const earnedPoints = Math.floor(finalPrice / 2);
      if (typeof setPoints === 'function') {
        setPoints((prev: number) => (prev || 0) + earnedPoints);
      }
      setOrderSuccess({
        id: orderId,
        items: [...cart],
        total: finalPrice,
        customer: { ...customerData },
        paymentMethod,
        pointsEarned: earnedPoints
      });
      setCart([]);
      setIsSubmittingOrder(false);
    }, 1200);
  };

  const StarRating = ({ rating, reviews }: { rating: number; reviews: number }) => (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={11} className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-500"} />
        ))}
      </div>
      <span className="text-[11px] text-[var(--foreground)]/50 font-medium">{rating} ({reviews})</span>
    </div>
  );

  return (
    <section id="shop" ref={ref} className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--background)]" />

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCheckoutOpen(false); setOrderSuccess(null); }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-[var(--card)] rounded-3xl border border-[var(--primary)]/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[var(--primary)] to-red-800 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">
                      {orderSuccess ? (language === 'ar' ? 'تم تأكيد طلبك بنجاح! 🔴⚪' : 'Commande Confirmée ! 🔴⚪') : (language === 'ar' ? 'إتمام الشراء — مغازة الإفريقي' : 'Finaliser la commande')}
                    </h3>
                    <p className="text-xs text-white/70">
                      {orderSuccess ? (language === 'ar' ? 'شكراً لوفائك للغالية' : 'Merci pour votre fidélité au Club') : (language === 'ar' ? 'توصيل سريع لكافة أنحاء الجمهورية' : 'Livraison express partout en Tunisie')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsCheckoutOpen(false); setOrderSuccess(null); }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {orderSuccess ? (
                  <div className="text-center py-4 space-y-5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/40 shadow-xl"
                    >
                      <CheckCircle2 size={44} />
                    </motion.div>

                    <div>
                      <h4 className="text-2xl font-black text-[var(--foreground)]">
                        {language === 'ar' ? 'مبروك! تم تسجيل طلبك' : 'Félicitations ! Commande enregistrée'}
                      </h4>
                      <p className="text-sm text-[var(--foreground)]/60 mt-1">
                        Numéro de commande : <span className="font-mono font-bold text-[var(--primary)]">{orderSuccess.id}</span>
                      </p>
                    </div>

                    <div className="bg-[var(--foreground)]/5 rounded-2xl p-4 text-left text-sm space-y-2 border border-[var(--foreground)]/10">
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground)]/60">Destinataire :</span>
                        <span className="font-bold text-[var(--foreground)]">{orderSuccess.customer.name} ({orderSuccess.customer.phone})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground)]/60">Adresse :</span>
                        <span className="font-bold text-[var(--foreground)]">{orderSuccess.customer.address}, {orderSuccess.customer.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground)]/60">Mode de paiement :</span>
                        <span className="font-bold text-[var(--primary)]">
                          {orderSuccess.paymentMethod === 'cod' ? 'Paiement à la livraison' : orderSuccess.paymentMethod === 'points' ? 'Points Clubiste' : 'Carte Bancaire'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[var(--foreground)]/10 pt-2 font-black text-base">
                        <span>Total TTC :</span>
                        <span className="text-[var(--primary)]">{orderSuccess.total},000 DT</span>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-center gap-2 text-amber-500 text-xs font-bold">
                      <Award size={16} />
                      <span>+{orderSuccess.pointsEarned} Points Clubistes ajoutés à votre compte !</span>
                    </div>

                    <button
                      onClick={() => { setIsCheckoutOpen(false); setOrderSuccess(null); }}
                      className="w-full bg-[var(--primary)] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:opacity-90 transition-all"
                    >
                      {language === 'ar' ? 'العودة للمغازة' : 'Continuer mes achats'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-5">
                    {/* Order summary mini */}
                    <div className="bg-[var(--foreground)]/5 rounded-2xl p-4 border border-[var(--foreground)]/10 space-y-2">
                      <h4 className="text-xs font-black uppercase text-[var(--foreground)]/60 tracking-wider">
                        {language === 'ar' ? 'ملخص المشتريات' : 'Récapitulatif'} ({totalCartItems} articles)
                      </h4>
                      <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-[var(--foreground)]/80 line-clamp-1 flex-1">
                              {item.qty}x {(item.product as any).name} ({item.size})
                            </span>
                            <span className="font-bold text-[var(--foreground)] ml-2">
                              {(item.product as any).price * item.qty},000 DT
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Promo code */}
                      <div className="pt-2 border-t border-[var(--foreground)]/10 flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder={language === 'ar' ? 'كود الخصم (مثال: CA1920)' : 'Code promo (ex: CA1920)'}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-[var(--card)] border border-[var(--foreground)]/20 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                        />
                        <button
                          type="button"
                          onClick={applyPromo}
                          className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold hover:bg-[var(--primary)]/30 transition-colors"
                        >
                          {language === 'ar' ? 'تطبيق' : 'Appliquer'}
                        </button>
                      </div>
                      {promoError && <p className="text-[10px] text-red-500 font-bold">{promoError}</p>}
                      {discountPercent > 0 && (
                        <p className="text-[10px] text-green-500 font-bold">✓ Remise de {discountPercent}% appliquée !</p>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-[var(--foreground)]/10 font-bold text-sm">
                        <span>Total :</span>
                        <span className="text-[var(--primary)] text-base font-black">{finalPrice},000 DT</span>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-[var(--foreground)]/60 tracking-wider">
                        {language === 'ar' ? 'بيانات التوصيل' : 'Informations de livraison'}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-[var(--foreground)]/70 block mb-1">
                            {language === 'ar' ? 'الاسم الكامل *' : 'Nom & Prénom *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={customerData.name}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Mohamed Ben Ali"
                            className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--foreground)]/5 border border-[var(--foreground)]/15 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[var(--foreground)]/70 block mb-1">
                            {language === 'ar' ? 'رقم الهاتف *' : 'Téléphone *'}
                          </label>
                          <input
                            type="tel"
                            required
                            value={customerData.phone}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+216 98 123 456"
                            className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--foreground)]/5 border border-[var(--foreground)]/15 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-[var(--foreground)]/70 block mb-1">
                            {language === 'ar' ? 'الولاية / المدينة' : 'Gouvernorat / Ville'}
                          </label>
                          <select
                            value={customerData.city}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--card)] border border-[var(--foreground)]/15 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                          >
                            {["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Bizerte", "Nabeul", "Monastir", "Kairouan", "Autre"].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[var(--foreground)]/70 block mb-1">
                            {language === 'ar' ? 'العنوان بالتفصيل *' : 'Adresse complète *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={customerData.address}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Rue, N° maison / étage"
                            className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--foreground)]/5 border border-[var(--foreground)]/15 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment method selector */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-[var(--foreground)]/60 tracking-wider">
                        {language === 'ar' ? 'طريقة الدفع' : 'Mode de paiement'}
                      </h4>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                            paymentMethod === 'cod'
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-md'
                              : 'border-[var(--foreground)]/10 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30'
                          }`}
                        >
                          <Truck size={18} />
                          <span className="text-[10px] leading-tight">À la livraison</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                            paymentMethod === 'card'
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-md'
                              : 'border-[var(--foreground)]/10 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30'
                          }`}
                        >
                          <CreditCard size={18} />
                          <span className="text-[10px] leading-tight">Carte Bancaire</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('points')}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                            paymentMethod === 'points'
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-md'
                              : 'border-[var(--foreground)]/10 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30'
                          }`}
                        >
                          <Award size={18} />
                          <span className="text-[10px] leading-tight">Points Club</span>
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmittingOrder || cart.length === 0}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-[var(--primary)] to-red-800 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-[var(--primary)]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingOrder ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          {language === 'ar' ? `تأكيد الطلب (${finalPrice},000 DT)` : `Confirmer la commande (${finalPrice},000 DT)`}
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[80] backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--card)] z-[81] flex flex-col shadow-2xl border-l border-[var(--primary)]/20"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--foreground)]/10">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-[var(--primary)]" />
                  <h3 className="font-bold text-[var(--foreground)] text-lg">
                    {language === "ar" ? "سلة التسوق" : language === "fr" ? "Mon Panier" : "My Cart"}
                    {totalCartItems > 0 && (
                      <span className="ml-2 bg-[var(--primary)] text-white text-xs font-black px-2 py-0.5 rounded-full">{totalCartItems}</span>
                    )}
                  </h3>
                </div>
                <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-[var(--foreground)]/10 transition-colors">
                  <X size={18} className="text-[var(--foreground)]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                    <ShoppingBag size={48} />
                    <p className="font-semibold text-[var(--foreground)]">
                      {language === "ar" ? "سلتك فارغة" : language === "fr" ? "Votre panier est vide" : "Your cart is empty"}
                    </p>
                  </div>
                ) : cart.map((item) => (
                  <motion.div
                    key={`${(item.product as any).id}-${item.size}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 bg-[var(--background)] rounded-2xl p-3 border border-[var(--foreground)]/8"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--foreground)]/10">
                      <NextImage src={(item.product as any).image} alt={(item.product as any).name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--foreground)] text-sm line-clamp-1">{(item.product as any).name}</p>
                      <p className="text-[var(--primary)] font-black text-sm">{(item.product as any).price},000 DT</p>
                      <p className="text-[10px] text-[var(--foreground)]/40 uppercase font-bold mt-0.5">
                        {language === "ar" ? "المقاس:" : "Taille:"} {item.size}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-1 bg-[var(--foreground)]/5 rounded-lg p-0.5">
                        <button onClick={() => changeQty((item.product as any).id, item.size, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-[var(--primary)]/20 rounded transition-colors">
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => changeQty((item.product as any).id, item.size, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-[var(--primary)]/20 rounded transition-colors">
                          <Plus size={10} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart((item.product as any).id, item.size)} className="text-red-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="px-4 pb-6 pt-4 border-t border-[var(--foreground)]/10 space-y-4">
                  <div className="flex items-center gap-2 text-[var(--foreground)]/60 text-xs">
                    <Truck size={14} className="text-green-500" />
                    <span>{language === "ar" ? "توصيل مجاني فوق 150 DT" : language === "fr" ? "Livraison gratuite dès 150 DT" : "Free delivery over 150 DT"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--foreground)]/60 text-xs">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span>{language === "ar" ? "إرجاع مجاني 30 يوم" : language === "fr" ? "Retour gratuit sous 30 jours" : "Free returns within 30 days"}</span>
                  </div>
                  <div className="flex items-center justify-between font-black text-[var(--foreground)] text-lg border-t border-[var(--foreground)]/10 pt-3">
                    <span>{language === "ar" ? "المجموع" : language === "fr" ? "Total" : "Total"}</span>
                    <span className="text-[var(--primary)]">{subtotalPrice},000 DT</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setCartOpen(false); setIsCheckoutOpen(true); }}
                    className="w-full bg-gradient-to-r from-[var(--primary)] to-red-700 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={18} />
                    {language === "ar" ? "إتمام الشراء" : language === "fr" ? "Passer la commande" : "Checkout"}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalCartItems > 0 && !cartOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-24 right-6 z-[70] bg-[var(--primary)] text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-[var(--primary)]/40"
          >
            <ShoppingBag size={22} />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-[var(--primary)] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--primary)]">
              {totalCartItems}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={scrollTransition}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-full text-[var(--primary)] text-sm font-semibold mb-3 text-center">
            {t.header}
          </span>
          <br />
          <div ref={shopRef} className="inline-block">
            <p
              className={`text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter italic ${theme === 'light' ? 'text-[#003366]' : 'text-[#C8102E]'}`}
              style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}
            >
              <VariableProximityText
                label={language === "ar" ? "مغازة النادي الإفريقي" : language === "fr" ? "Boutique Club Africain" : "Club Africain Shop"}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={shopRef}
                radius={150}
                falloff="gaussian"
              />
            </p>
          </div>
          <p className="text-[var(--foreground)] opacity-60 max-w-2xl mx-auto text-lg mt-3">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...scrollTransition, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setShowAll(false); }}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all border ${
                activeCategory === cat
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/30"
                  : "bg-[var(--foreground)]/5 text-[var(--foreground)]/70 border-[var(--foreground)]/15 hover:border-[var(--primary)]/50 hover:text-[var(--primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {displayedProducts.map((product: any, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 44 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
                transition={{ delay: index * 0.06, ...scrollTransitionFast }}
                className="flex justify-center"
              >
                <div className="w-full">
                  <div className="flex w-full flex-col items-stretch rounded-[20px] border border-[var(--border)] bg-[var(--card)] overflow-hidden group/shop-card shadow-sm hover:shadow-lg transition-shadow duration-300">
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--foreground)]/5">
                      <NextImage
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover/shop-card:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {product.discount && (
                          <span className="bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-black shadow-lg">
                            {product.discount}
                          </span>
                        )}
                        {product.isNew && !product.discount && (
                          <span className="bg-[var(--primary)] text-white px-2.5 py-1 rounded-full text-xs font-black shadow-lg">NEW</span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        {product.inStock ? (
                          <span className="bg-green-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            {language === "ar" ? "متوفر" : language === "fr" ? "En stock" : "In stock"}
                          </span>
                        ) : (
                          <span className="bg-gray-800/90 text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm">
                            {language === "ar" ? "نفد" : language === "fr" ? "Épuisé" : "Out of stock"}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/shop-card:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                          className="bg-white text-[var(--primary)] font-black px-5 py-2.5 rounded-full text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Plus size={14} />
                          {language === "ar" ? "أضف للسلة" : language === "fr" ? "Ajouter" : "Add to cart"}
                        </motion.button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-black/8 text-black/60'}`}>
                          {product.category}
                        </span>
                        <StarRating rating={product.rating} reviews={product.reviews} />
                      </div>
                      <h3 className="font-bold text-[var(--foreground)] text-sm leading-snug line-clamp-2">
                        {translations[language].shop.products[index]?.name || product.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-[var(--primary)]">{product.price},000 DT</span>
                        {product.originalPrice && (
                          <span className="text-sm text-[var(--foreground)]/40 line-through">{product.originalPrice},000 DT</span>
                        )}
                      </div>
                      {product.sizes.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[var(--foreground)]/50 uppercase mb-1.5">
                            {language === "ar" ? "المقاس:" : language === "fr" ? "Taille:" : "Size:"}
                            {selectedSizes[product.id] && <span className="ml-1 text-[var(--primary)]">{selectedSizes[product.id]}</span>}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {product.sizes.map((size: string) => (
                              <button
                                key={size}
                                onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: size }))}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  selectedSizes[product.id] === size
                                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                                    : "border-[var(--foreground)]/15 text-[var(--foreground)]/60 hover:border-[var(--primary)]/50"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                            addedToCart[product.id]
                              ? "bg-green-500 text-white border-green-500 shadow-green-500/30"
                              : "bg-[var(--foreground)]/5 border-[var(--foreground)]/15 text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          }`}
                        >
                          {addedToCart[product.id] ? (
                            <><Check size={14} /> {language === "ar" ? "تمت الإضافة!" : language === "fr" ? "Ajouté !" : "Added!"}</>
                          ) : (
                            <><Plus size={14} /> {language === "ar" ? "أضف للسلة" : language === "fr" ? "Panier" : "Add"}</>
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => buyNow(product)}
                          disabled={!product.inStock}
                          className="flex-1 py-2.5 bg-[var(--primary)] text-white hover:bg-red-700 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingBag size={14} />
                          {language === "ar" ? "شراء الآن" : language === "fr" ? "Commander" : "Buy Now"}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* See All Button */}
        {filteredProducts.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="mt-12 text-center"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-10 py-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/20 opacity-80 hover:opacity-100 hover:border-[var(--primary)] rounded-full text-[var(--foreground)] font-bold transition-all flex items-center justify-center gap-3 mx-auto group shadow-md"
            >
              {showAll ? t.less : t.more}
              <ChevronDown className={`transform transition-transform duration-300 ${showAll ? "rotate-180" : ""}`} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Full Screen Width Sponsor/Partner Logo Slider */}
      <div className="slider mt-16">
        <div className="slide-track">
          {["Boga","all4one","bank","boutique-lefri9i","jamiya","jii","kelme","lefri9i-mobile","lefri9i","natilait","ooredoo","stil",
            "Boga","all4one","bank","boutique-lefri9i","jamiya","jii","kelme","lefri9i-mobile","lefri9i","natilait","ooredoo","stil"
          ].map((logo, i) => (
            <div key={i} className="slide">
              <img src={`/logos/${logo}.png`} alt={logo} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});


// History Section - Draggable Cards version
function HistorySection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const ticketsRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const t = translations[language].history;
  const milestones = t.milestones;

  // Pre-defined random-ish positions to mimic the "scattered" look
  const positions = [
    "top-10 left-[5%] rotate-[-5deg]",
    "top-40 left-[15%] rotate-[-8deg]",
    "top-5 left-[30%] rotate-[10deg]",
    "top-32 left-[45%] rotate-[7deg]",
    "top-20 right-[10%] rotate-[-4deg]",
    "top-48 right-[25%] rotate-[6deg]",
    "top-12 left-[55%] rotate-[-12deg]",
    "top-60 left-[10%] rotate-[5deg]",
    "top-5 right-[40%] rotate-[-7deg]",
    "top-40 right-[45%] rotate-[15deg]",
    "top-70 right-[15%] rotate-[-10deg]",
    "top-15 left-[75%] rotate-[8deg]",
    "bottom-10 left-[20%] rotate-[-6deg]",
    "bottom-32 left-[40%] rotate-[9deg]",
    "bottom-20 right-[30%] rotate-[-11deg]",
    "bottom-40 right-[10%] rotate-[4deg]",
    "bottom-60 left-[60%] rotate-[-8deg]",
  ];

  return (
    <section id="history" ref={ref} className="relative pt-24 pb-8 bg-[var(--background)] min-h-[900px] flex flex-col">
      {/* Header Area */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={scrollTransition}
        >
          <span className="inline-block px-4 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-full text-[var(--primary)] text-sm font-semibold mb-4">
            {t.header}
          </span>
          <br />
          <div ref={ticketsRef} className="inline-block">
            <p
              className={`text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter italic ${theme === 'light' ? 'text-[#003366]' : 'text-[#C8102E]'}`}
              style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}
            >
              <VariableProximityText
                label={t.title}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={ticketsRef}
                radius={150}
                falloff="gaussian"
              />
            </p>
          </div>
          <p className="text-[var(--foreground)] opacity-60 max-w-2xl mx-auto text-lg mt-3">
            {t.subtitle}
          </p>
          <p className="text-[var(--primary)] font-bold text-sm mt-8 opacity-40 animate-pulse">
            (Drag the cards to explore our legacy)
          </p>
        </motion.div>
      </div>

      {/* Visual Separator & Boundary */}
      <div className="relative w-full h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Constraints Area for Draggable Cards */}
      <div className="relative flex-1 w-full overflow-hidden">
        <DraggableCardContainer className="absolute inset-0 z-10">
          {milestones.map((item: any, idx: number) => (
            <DraggableCardBody
              key={idx}
              className={cn(
                "w-72 md:w-75",
                positions[idx % positions.length]
              )}
            >
              <div className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-md p-6 border border-white/5 select-none">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl font-black text-[#C8102E]">{item.year}</span>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                    <Trophy size={14} className="text-white/40" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight uppercase">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed italic">{item.desc}</p>

                {/* Decorative dots */}
                <div className="mt-4 flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-[#C8102E]/40" />
                  ))}
                </div>
              </div>
            </DraggableCardBody>
          ))}
        </DraggableCardContainer>
      </div>
    </section>
  );
}
// 3. The Academy - Youth Development
function AcademySection({ language, theme }: { language: "en" | "fr" | "ar", theme: string }) {
  const academyRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const t = translations[language].academy;

  // State for player of the month voting
  const votingPlayers = [
    "Rayane Oueslati",
    "Nour Rahmouni",
    "Youssef Mrad",
    "Hamza Labidi",
    "Mohamed Naizek Ellili",
    "Fedi Tayechi",
    "Ammar Abdelhak",
    "Mohamed Aziz Hadroug",
    "Youssef Mokhtari"
  ];

  const [playerInput, setPlayerInput] = useState("");
  const [playerVotes, setPlayerVotes] = useState<{ name: string, count: number }[]>(
    votingPlayers.map(name => ({
      name,
      count: name === "Fedi Tayechi" ? 15 : name === "Hamza Labidi" ? 12 : name === "Youssef Mrad" ? 8 : 0
    })).sort((a, b) => b.count - a.count)
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState("");

  const handleVote = () => {
    if (playerInput && !hasVoted) {
      const playerName = playerInput;
      setPlayerVotes(prev => {
        const existing = prev.find(p => p.name === playerName);
        if (existing) {
          return prev.map(p =>
            p.name === playerName
              ? { ...p, count: p.count + 1 }
              : p
          ).sort((a, b) => b.count - a.count);
        }
        return [...prev, { name: playerName, count: 1 }].sort((a, b) => b.count - a.count);
      });
      setVotedFor(playerName);
      setHasVoted(true);
      setPlayerInput("");
    }
  };

  const academyPlayers = [
    {
      id: "a1",
      name: "Fedi Tayechi",
      age: 17,
      position: t.striker,
      image: "/players/tayechi.jpg",
      potential: 92,
      instagram: "https://www.instagram.com/fedy_tayechi/",
    },
    {
      id: "a2",
      name: "Hamza Labidi",
      age: 19,
      position: t.midfielder,
      image: "/players/hamza.jpg",
      potential: 89,
      instagram: "https://www.instagram.com/hamzalabidi6/",
    },
    {
      id: "a3",
      name: "Youssef Mrad",
      age: 18,
      position: t.defender,
      image: "/players/mrad.jpg",
      potential: 87,
      instagram: "https://www.instagram.com/yuusf_mrad/",
    },
  ];

  return (
    <section id="academy" ref={ref} className="py-24 bg-[var(--background)] relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[var(--primary)] rounded-full blur-[180px] opacity-[0.08] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#D4AF37] rounded-full blur-[200px] opacity-[0.06] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={scrollSpring}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-black uppercase tracking-widest"
          >
            <Star size={12} className="fill-current" /> {t.futureStar}
          </motion.span>
          <br />
          <div ref={academyRef} className="inline-block mt-4">
            <p
              className={`text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter italic ${theme === 'light' ? 'text-[#003366]' : 'text-[#C8102E]'}`}
              style={{ WebkitTextStroke: '1px black', textShadow: '0 0 1px #000' }}
            >
              <VariableProximityText
                label={t.title}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={academyRef}
                radius={150}
                falloff="gaussian"
              />
            </p>
          </div>
          <p className="text-[var(--foreground)]/70 text-lg max-w-2xl mx-auto mt-5">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Player prospects — 3 cards */}
          <div className="lg:col-span-3 grid sm:grid-cols-3 gap-6">
            {academyPlayers.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, ...scrollTransitionFast }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--primary)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                <div className="relative rounded-[2rem] bg-[var(--card)] border border-[var(--foreground)]/10 group-hover:border-[var(--primary)]/50 overflow-hidden shadow-xl transition-all duration-300 p-5">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Avatar */}
                  <div className="relative mx-auto w-24 h-24 mb-5">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/40" style={{ padding: 2 }}>
                      <div className="w-full h-full rounded-full bg-[var(--background)] overflow-hidden">
                        <NextImage
                          src={player.image}
                          alt={player.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-center font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                    {player.name}
                  </h4>
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <span className="text-[11px] text-[var(--primary)] uppercase font-bold">{player.position}</span>
                    <span className="text-[10px] opacity-30">•</span>
                    <span className="text-[11px] opacity-50">{player.age} {t.yo}</span>
                  </div>

                  {/* Instagram */}
                  <a
                    href={player.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] border border-[var(--foreground)]/10 text-[11px] font-black uppercase tracking-wider transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                    Instagram
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* POTM Voting Card */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={scrollSpring}
          >
            <div className="relative group">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/60 to-[#D4AF37]/40 opacity-40 blur-lg" />
              <div className="relative rounded-[2rem] bg-gradient-to-br from-[var(--primary)] to-red-950 p-7 text-white overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 -left-10 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-widest">
                    <Trophy size={11} /> {t.potm}
                  </span>
                  <h3 className="text-2xl font-black mt-3 mb-1">
                    {t.voteText}
                  </h3>
                  <p className="opacity-70 text-sm mb-6">
                    {t.topPlayers}
                  </p>

                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={playerInput}
                      onChange={(e) => setPlayerInput(e.target.value)}
                      placeholder={t.enterPlayer}
                      disabled={hasVoted}
                      className="w-full px-4 py-3 rounded-xl bg-white/15 border-2 border-white/30 text-white font-bold text-base placeholder:text-white/50 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all disabled:opacity-50"
                    />
                  </div>

                  {hasVoted ? (
                    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-green-300 font-bold text-center">
                      {t.thankYou} {votedFor}!
                    </motion.p>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleVote}
                      disabled={!playerInput}
                      className="w-full bg-white text-[var(--primary)] py-3 rounded-xl font-black text-base hover:bg-gray-100 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {t.voteBtn}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Top voted list removed per request */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer({ language, theme }: { language: "en" | "fr" | "ar"; theme: string }) {
  const t = translations[language].footer;
  const socials = [
    { icon: Facebook, href: "https://www.facebook.com/clubafricain.com.tn", hoverClass: "hover:bg-[#1877F2]" },
    { icon: SiX, href: "https://x.com/clubafricain", hoverClass: "hover:bg-[#000000]" },
    { icon: Instagram, href: "https://www.instagram.com/clubafricain__officiel/", hoverClass: "hover:bg-[#E1306C]" },
    { icon: SiTiktok, href: "https://www.tiktok.com/@clubafricain__officiel", hoverClass: "hover:bg-[#000000]" },
  ];

  return (
    <footer id="contact" className="relative py-20 overflow-hidden border-t border-[var(--primary)]/20">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--background)]" />
      {/* Red stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo */}
          <div>
            <motion.div
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-15 h-2 flex items-center gap-4">
                <img style={{ width: "43px", height: "43px" }} src="/cao1.png" alt="Partner Logo 1" />
                <img style={{ width: "41px", height: "52px" }} src="/cao.png" alt="Partner Logo 2" />
                <img style={{ width: "33px", height: "41px" }} src="/ca.png" alt="Partner Logo 3" />
              </div>
            </motion.div>
            <p className="text-[var(--foreground)] opacity-60">
              {t.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <Skiper58 />
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[var(--foreground)] font-bold text-lg mb-4">{t.contact}</h4>
            <ul className="space-y-2 text-[var(--foreground)] opacity-60">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-[var(--primary)]" />
                {language === "ar" ? "تونس، تونس" : "Tunis, Tunisia"}
              </li>
              <li>monitoring@clubafricain.com</li>
              <li>+216 29 106 600</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[var(--foreground)] font-bold text-lg mb-4">{t.subscribe}</h4>
            <p className="text-[var(--foreground)] opacity-60 mb-4">{t.subText}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t.placeholder}
                className="flex-1 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-full px-4 py-2 text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:border-[var(--primary)]"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[var(--primary)] text-white px-6 py-2 rounded-full font-semibold"
              >
                {t.button}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 border-t border-white/10" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-sm ${theme === 'light' ? 'text-[#003366]' : 'text-white/40'}`}>
            &copy; 2026 Club Africain. {t.rights}
          </p>

          {/* Socials */}
          <div className="flex items-center gap-4">
            {socials.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 bg-[var(--foreground)]/10 rounded-full flex items-center justify-center text-[var(--foreground)] ${social.hoverClass} hover:text-white transition-all`}
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main page component
export default function Home() {
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState<"en" | "fr" | "ar">("en");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);

  // Loading state for better UX
  const [isLoading, setIsLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  // Refs for VariableProximityText sections
  const standingsRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const squadRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const matchdayRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const ticketsRef = useRef<HTMLDivElement>(null);
  const academyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ca_user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      const pts = localStorage.getItem("ca_points");
      if (pts !== null) setPoints(parseInt(pts, 10) || 0);
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const userDoc = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDoc, (docSnap) => {
      if (docSnap.exists()) {
        const p = docSnap.data().points || 0;
        setPoints(p);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("ca_points", String(points));
  }, [points]);

  // Loading effect - preload critical images and show loading screen
  useEffect(() => {
    // Preload critical images
    const preloadImages = [
      '/ca.png',
      '/fallback.jpg',
    ];

    const imagePromises = preloadImages.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // Don't block on error
      });
    });

    // Wait for images and minimum time
    Promise.all(imagePromises).then(() => {
      setIsLoading(false);
      // Small delay to ensure smooth transition
      setTimeout(() => setContentReady(true), 100);
    });

    // Fallback timeout - show content after 2 seconds max
    setTimeout(() => {
      setIsLoading(false);
      setContentReady(true);
    }, 2000);
  }, []);

  const handleLogout = async () => {
    try {
      if (fAuth) {
        await signOut(fAuth);
      }
      setUser(null);
      setPoints(0);
      localStorage.removeItem("ca_user");
      localStorage.removeItem("ca_points");
      // Optional: force clear session if needed
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  function getTodayDate() {
    const d = new Date()
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
  }



  useEffect(() => {
    // Apply theme
    document.documentElement.className = theme;

    // Check auth
    const storedUser = localStorage.getItem("ca_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [theme]);

  useEffect(() => {
    // Apply language and text direction dynamically
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.dispatchEvent(new Event('languageChange'));
  }, [language]);

  const isRTL = language === "ar";
  const t = translations[language];

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 0.98], [0, 1]);

  // Reveal logic removed or simplified


  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {!contentReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
            suppressHydrationWarning
            style={{
              backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
              suppressHydrationWarning
            >
              <div className="relative w-32 h-32 mx-auto mb-8" suppressHydrationWarning>
                <NextImage
                  src="/ca.png"
                  alt="Club Africain Logo"
                  fill
                  className="object-contain animate-pulse"
                  suppressHydrationWarning
                />
              </div>
              <motion.div
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-1 bg-[#C8102E] rounded-full w-48 mx-auto"
                suppressHydrationWarning
              />
              <p className="mt-4 opacity-60 font-mono text-sm" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }} suppressHydrationWarning>
                CHARGEMENT...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - only render when ready */}
      {contentReady && (
        <motion.main
          initial={{ opacity: 0 }}
          suppressHydrationWarning
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`overflow-x-hidden pt-20 ${isRTL ? "font-arabic" : ""}`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <style jsx global>{`
        html {
          scroll-padding-top: 6rem;
        }
        section {
          scroll-margin-top: 6rem;
        }
      `}</style>
          {/* Scroll progress bar - encourages "scroll more" feel */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-red-600 origin-left z-[100] shadow-[0_0_12px_rgba(220,38,38,0.6)]"
            style={{ scaleX }}
          />
          <Navigation
            theme={theme}
            setTheme={setTheme}
            language={language}
            setLanguage={setLanguage}
            setIsSearchOpen={setIsSearchOpen}
            setIsAuthOpen={setIsAuthOpen}
            user={user}
            points={points}
            onLogout={handleLogout}
          />

          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} language={language} />
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} language={language} onLogin={(u) => { setUser(u); if (typeof u?.points === "number") setPoints(u.points); }} />
          <ErrorBoundary>
            <ClientOnly>
              <HeroSection language={language} theme={theme} />
            </ClientOnly>
          </ErrorBoundary>
          <ErrorBoundary>
            <HistorySection language={language} theme={theme} />
          </ErrorBoundary>
          <ErrorBoundary>
            <ClientOnly>
              <TrophiesSection language={language} theme={theme} />
            </ClientOnly>
          </ErrorBoundary>
          <ErrorBoundary>
            <TeamSection language={language} theme={theme} />
          </ErrorBoundary>
          <ErrorBoundary>
            <AcademySection language={language} theme={theme} />
          </ErrorBoundary>
          <ErrorBoundary>
            <NewsSection language={language} theme={theme} />
          </ErrorBoundary>

          <ErrorBoundary>
            <HeroScrollDemo language={language} theme={theme} />
          </ErrorBoundary>


          <ErrorBoundary>
            <MatchesSection language={language} theme={theme} />
          </ErrorBoundary>
          <ErrorBoundary>
            <ShopSection language={language} theme={theme} user={user} points={points} setPoints={setPoints} />
          </ErrorBoundary>

          <div className="mb-20" /> {/* Spacer replacement */}

          <ErrorBoundary>
            <Footer language={language} theme={theme} />
          </ErrorBoundary>
        </motion.main>
      )}

      {/* AI Chat — always visible floating widget */}
      <ClientOnly>
        <AIChat />
      </ClientOnly>
    </>
  );
}