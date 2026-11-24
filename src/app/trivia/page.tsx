"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, User, ArrowLeft } from "lucide-react";

function getTodayDate() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

const TRIVIA_STORAGE_KEY = "trivia_played_date";
const POINTS_STORAGE_KEY = "ca_points";
const USER_STORAGE_KEY = "ca_user";

const QUESTIONS = [
  { q: "In which year was Club Africain founded?", qAr: "في أي عام تم تأسيس النادي الإفريقي؟", qFr: "En quelle année le Club Africain a-t-il été fondé ?", options: ["1919", "1920", "1921", "1922"], correct: 1 },
  { q: "Which competition did Club Africain win in 1991?", qAr: "أي بطولة فاز بها النادي الإفريقي عام 1991؟", qFr: "Quelle compétition le Club Africain a-t-il remportée en 1991 ?", options: ["UEFA Cup", "CAF Champions League", "Arab Cup", "Tunisian Cup only"], correct: 1 },
  { q: "What are the club's colours?", qAr: "ما هي ألوان النادي؟", qFr: "Quelles sont les couleurs du club ?", options: ["Green and white", "Red and white", "Blue and white", "Black and red"], correct: 1 },
  { q: "Where is Club Africain based?", qAr: "أين يقع مقر النادي الإفريقي؟", qFr: "Où est basé le Club Africain ?", options: ["Algiers", "Tunis", "Cairo", "Casablanca"], correct: 1 },
  { q: "How many Tunisian League titles has CA won (approx.)?", qAr: "كم مرة فاز النادي الإفريقي بالدوري التونسي تقريباً؟", qFr: "Combien de fois le CA a-t-il remporté le championnat tunisien (env.) ?", options: ["5", "8", "13", "20"], correct: 2 },
];

function getQuestionForDay() {
  const today = getTodayDate();
  const hash = today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return QUESTIONS[hash % QUESTIONS.length];
}

export default function TriviaPage() {
  const [user, setUser] = useState<{ name?: string; email?: string; points?: number } | null>(null);
  const [points, setPoints] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [language, setLanguage] = useState<"en" | "fr" | "ar">("en");
  const [mounted, setMounted] = useState(false);

  const question = getQuestionForDay();
  const questionText = language === "ar" ? question.qAr : language === "fr" ? question.qFr : question.q;

  useEffect(() => {
    setMounted(true);
    if (!document.documentElement.className || document.documentElement.className === "") {
      document.documentElement.className = "dark";
    }
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedPoints = localStorage.getItem(POINTS_STORAGE_KEY);
    const playedDate = localStorage.getItem(TRIVIA_STORAGE_KEY);
    const today = getTodayDate();

    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
      } catch (_) {}
    }
    if (storedPoints !== null) setPoints(parseInt(storedPoints, 10) || 0);
    if (playedDate === today) {
      setPlayedToday(true);
      setHasPlayed(true);
    }
  }, []);

  const handleAnswer = (index: number) => {
    if (hasPlayed || !user) return;
    setSelectedAnswer(index);
    const correct = index === question.correct;
    setIsCorrect(correct);

    const newPoints = correct ? points + 1 : Math.max(0, points - 1);
    setPoints(newPoints);
    localStorage.setItem(POINTS_STORAGE_KEY, String(newPoints));
    const u = user && typeof user === "object" ? { ...user, points: newPoints } : { name: "Fan", points: newPoints };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    setUser(u);

    setHasPlayed(true);
    localStorage.setItem(TRIVIA_STORAGE_KEY, getTodayDate());
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--foreground)] opacity-60">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--foreground)] opacity-70 hover:opacity-100 mb-8"
        >
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-600 rounded-full text-sm font-bold mb-4">
            <Gamepad2 size={18} /> {language === "ar" ? "تحدي اليوم" : "DAILY CHALLENGE"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Test Your <span className="text-red-600">Knowledge</span>
          </h1>
          <p className="text-[var(--foreground)] opacity-60 text-lg">
            {language === "ar"
              ? "مرة واحدة في اليوم: إجابة صحيحة = +1 نقطة، خاطئة = -1 نقطة."
              : language === "fr"
                ? "Une fois par jour : bonne réponse = +1 point, mauvaise = -1 point."
                : "Play once per day: correct = +1 point, wrong = -1 point."}
          </p>
        </motion.div>

        {!user ? (
          <div className="p-12 rounded-3xl bg-[var(--card)] border-2 border-dashed border-red-600/30 text-center">
            <User size={48} className="mx-auto text-red-600/50 mb-4" />
            <h2 className="text-xl font-bold mb-2">Login to Play</h2>
            <p className="opacity-60 mb-6">Sign in on the home page to track your points and play the daily quiz.</p>
            <Link
              href="/"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--card)] border border-[var(--foreground)]/10">
              <span className="font-semibold">Your points</span>
              <span className="text-red-600 font-black text-xl">{points} pts</span>
            </div>

            {playedToday && hasPlayed && (
              <div className="p-6 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-center">
                <p className="font-semibold opacity-80">
                  {language === "ar" ? "لقد لعبت اليوم. عد غداً!" : language === "fr" ? "Vous avez déjà joué aujourd'hui. Revenez demain !" : "You already played today. Come back tomorrow!"}
                </p>
              </div>
            )}

            {user && !playedToday && (
              <div className="p-8 rounded-3xl bg-[var(--card)] border border-red-600/20 shadow-xl">
                <h2 className="text-2xl font-bold mb-8">{questionText}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {question.options.map((option, i) => (
                    <motion.button
                      key={i}
                      whileHover={!hasPlayed ? { scale: 1.02 } : {}}
                      whileTap={!hasPlayed ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(i)}
                      disabled={hasPlayed}
                      className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all ${
                        hasPlayed
                          ? i === question.correct
                            ? "bg-green-500/20 border-green-500 text-green-600"
                            : i === selectedAnswer
                              ? "bg-red-500/20 border-red-500 text-red-600"
                              : "bg-transparent border-[var(--foreground)]/5 opacity-40"
                          : "bg-[var(--background)] border-red-600/20 hover:border-red-600 text-[var(--foreground)]"
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {hasPlayed && selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-8 rounded-3xl border-2 text-center ${isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                    {isCorrect ? "✓" : "✗"}
                  </div>
                  <h3 className={`text-2xl font-black mb-2 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                    {isCorrect ? (language === "ar" ? "صحيح!" : "Correct!") : (language === "ar" ? "خطأ!" : "Wrong!")}
                  </h3>
                  <p className="opacity-80 mb-4">
                    {isCorrect
                      ? (language === "ar" ? "ربحت نقطة واحدة." : language === "fr" ? "Vous gagnez 1 point." : "You earned 1 point.")
                      : (language === "ar" ? "خسرت نقطة واحدة. حاول غداً!" : language === "fr" ? "Vous perdez 1 point. Réessayez demain !" : "You lost 1 point. Try again tomorrow!")}
                  </p>
                  <p className="font-bold">
                    {language === "ar" ? "رصيدك الآن:" : "Balance:"} <span className="text-red-600">{points} pts</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-2">
          {(["en", "fr", "ar"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${language === lang ? "bg-red-600 text-white" : "bg-[var(--card)] border border-[var(--foreground)]/10"}`}
            >
              {lang === "ar" ? "عربي" : lang === "fr" ? "FR" : "EN"}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
