// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENROUTER_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: 20000,
  maxRetries: 1,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Club Africain Assistant",
  }
}) : null;

// Free-tier models to try in order
const MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemini-2.0-flash-lite-001',
  'openai/gpt-3.5-turbo',
];

// Club Africain Knowledge Base (100% Accurate & Verified)
const CLUB_KNOWLEDGE = `
CLUB AFRICAIN (النادي الإفريقي) — INFORMATIONS OFFICIELLES & VÉRIFIÉES :

1. FONDATION & IDENTITÉ :
- Date de fondation : 4 octobre 1920 à Bab Souika, Tunis (fondé par Béchir Ben Mustapha et ses compagnons nationalistes tunisiens).
- Couleurs : Rouge et Blanc (Rouge sang et Blanc pur).
- Surnoms : "Al Ifriqi" (الإفريقي), "El Ghalia" (الغاليا), "Le Club de Bab Jedid", "Club Africain".
- Devise / Esprit : Le club du peuple tunisien, symbole de résistance nationale pendant le protectorat.
- Stade principal : Stade Olympique de Radès (Hammadi Agrebi, 60 000 places) et historiquement Stade Chedly Zouiten.
- Centre d'entraînement : Parc Mounir Kebaïli (Parc A).
- Président actuel : Haykel Dkhil (Président du comité directeur) / Dr. Mohsen Trabelsi (Président de la commission médicale & figure emblématique).
- Entraîneur principal : David Bettoni (technicien français, ancien adjoint de Zinedine Zidane au Real Madrid).

2. PALMARÈS HISTORIQUE OFFICIEL :
- Championnat de Tunisie (Ligue 1) : 13 titres (1947, 1948, 1967, 1973, 1974, 1979, 1980, 1990, 1992, 1996, 2008, 2015, 2024/2025).
- Coupe de Tunisie : 13 titres (1965, 1967, 1968, 1969, 1970, 1972, 1973, 1976, 1992, 1998, 2000, 2017, 2018). Record historique de 4 victoires consécutives (1967-1970).
- Supercoupe de Tunisie : 3 titres (1968, 1970, 1979).
- Ligue des Champions de la CAF : 1 titre historique en 1991 (Premier club tunisien de l'histoire à remporter la Coupe d'Afrique des clubs champions en écrasant Villa SC 6-2 et 1-1).
- Coupe Afro-Asiatique des clubs : 1 titre en 1992 (victoire contre Al-Hilal Riyad).
- QUADRUPLÉ HISTORIQUE EN 1991/1992 : Championnat, Coupe de Tunisie, Ligue des Champions CAF, et Coupe Afro-Asiatique !
- Coupe Arabe des clubs vainqueurs de coupe : 1 titre (1995).
- Ligue des Champions Arabes : 1 titre (1997).
- Coupe du Maghreb des clubs champions : 3 titres (1973, 1974, 1975).
- Coupe du Maghreb des vainqueurs de coupe : 1 titre (1971).
- Coupe de l'UNAF (Nord-Africaine) : 2 titres (2008, 2010).

3. LÉGENDES & JOUEURS EMBLÉMATIQUES :
- Sadok Sassi "Attouga" : Le plus grand gardien de but de l'histoire du football tunisien et africain, détenteur du record d'apparitions au Club Africain.
- Hédi Bayari : Meilleur buteur historique du Club Africain en championnat avec 110 buts !
- Tahar Chaïbi ("Tahartout") : Légendaire meneur de jeu des années 60-70.
- Faouzi Rouissi : Prodige et buteur du quadruplé 1991/1992.
- Adel Sellimi : Grand attaquant international et buteur prolifique des années 90.
- Samir Sellimi : Capitaine et milieu emblématique.
- Lotfi Mhaissi : Défenseur rugueux et buteur héroïque (doublé en finale africaine 1991).
- Wissem Ben Yahia ("Le Général") : Capitaine emblématique avec plus de 450 matchs sous le maillot rouge et blanc.
- Zouhaier Dhaouadi : Ailier virevoltant, champion en 2008 et 2015.
- Abdelmoumene Djabou : Meneur de jeu magique algérien, héros du titre 2015.
- Dr. Mohsen Trabelsi : Chirurgien émérite, président du comité médical et figure historique de dévouement au club.

4. EFFECTIF ACTUEL 2025/2026 :
- Gardiens : Abdelmouhib Chamakh (#1), Ghaith Yeferni (#16), Malek Saada (#22), Wassim Maghzaoui.
- Défenseurs : Yassine Meriah (#5), Ammar Abdelhak (#6), Houssem Ben Ali (#33), Ghaith Zaalouni (#17), Yassine Bouabid (#4), Wills Tene Nkingne (#15), Ismaïla Simpara (#36), Mamadou Diatta (#3), Ghassen Mahersi.
- Milieux : Osama Elsharimi (#32), Saidou Khan (#28), Bilel Aït Malek (#21), Aymen Harzi (#31), Mootez Zaddem (#30), Alain Kanté (#8), Haykeul Chikhaoui (#20), Charfeddine Ouni (#13), Rayan El Djebali (#21), Houssem Hassen Romdhane (#24).
- Attaquants : Taddeus Nkeng (#34), Phillippe Kinzumbi (#18), Hamza Khadhraoui (#7), Oussama Bouguerra (#11), Sadok Kadida (#40), Bassem Srarfi (#19), Hamza Mnasri.
- Entraîneur : David Bettoni.

5. RIVALITÉ & DERBY :
- Le Grand Derby de Tunis oppose le Club Africain à l'Espérance Sportive de Tunis (EST). C'est l'un des derbys les plus passionnés et historiques du continent africain.
`;

const getSystemPrompt = (language: string) => {
  const prompts: Record<string, string> = {
    fr: `Tu es le CA Assistant officiel du Club Africain (Tunisie), expert absolu de l'histoire, des trophées, des légendes et de l'actualité du club.
${CLUB_KNOWLEDGE}

CONSIGNES STRICTES :
- Réponds TOUJOURS en français avec précision et fierté rouge et blanc 🔴⚪.
- Fournis UNIQUEMENT des faits vérifiés (ex: 13 championnats, 13 coupes, Coupe CAF 1991, Quadruplé 1992, Hédi Bayari meilleur buteur avec 110 buts, Sadok Sassi Attouga gardien légendaire, David Bettoni entraîneur).
- Ne jamais inventer des titres ou des résultats inexistants.
- Reste enthousiaste, courtois et passionné.`,

    ar: `أنت المساعد الذكي الرسمي للنادي الإفريقي التونسي (CA Assistant)، الخبير الأول في تاريخ، ألقاب، أساطير وواقع نادي باب الجديد العريق.
${CLUB_KNOWLEDGE}

تعليمات هامة:
- أجب دائماً بالعربية الفصحى أو بلهجة تونسية محترمة تفيض بعشق الأحمر والأبيض 🔴⚪.
- قدم حقائق تاريخية دقيقة 100% (تأسيس النادي 4 أكتوبر 1920، 13 بطولة، 13 كأس تونس، دوري أبطال إفريقيا 1991 والرباعية التاريخية 1992، الهداف التاريخي الهادي البياري 110 هدف، الحارس الأسطوري عتوقة الصادق ساسي، المدرب دافيد بيتوني).
- لا تخترع بطولات أو معلومات غير صحيحة.
- كن فخوراً وحماسياً بروح الإفريقي "شعب الإفريقي العظيم".`,

    en: `You are the official Club Africain Assistant, an expert in the history, trophies, legends, and current team of Club Africain (Tunisia).
${CLUB_KNOWLEDGE}

RULES:
- Respond in English with accurate, verified facts.
- Club Africain founded Oct 4, 1920, 13 league titles, 13 cups, 1991 CAF Champions League & 1992 Historic Quadruple, all-time top scorer Hedi Bayari (110 goals), legendary GK Sadok Sassi Attouga, coach David Bettoni.
- Be passionate and authentic 🔴⚪.`
  };

  return prompts[language] || prompts.fr;
};

// Intelligent Local Knowledge Resolver for instant & accurate answers
function getLocalClubResponse(query: string, lang: string): string | null {
  const q = query.toLowerCase().trim();

  // Arabic queries
  if (lang === 'ar' || /[\u0600-\u06FF]/.test(query)) {
    if (q.includes('تأسس') || q.includes('تاريخ التأسيس') || q.includes('متى تأسس') || q.includes('تاريخ النادي')) {
      return "🔴⚪ تأسس النادي الإفريقي في **4 أكتوبر 1920** في حي باب سويقة بالعاصمة تونس. يُعد الإفريقي من أعرق وأول الأندية الوطنية التونسية التي حملت الهوية الوطنية رمزاً لمقاومة الاستعمار، بألوانه التاريخية الأحمر والأبيض.";
    }
    if (q.includes('هداف') || q.includes('الهداف التاريخي') || q.includes('أفضل هداف')) {
      return "⚽ الهداف التاريخي للنادي الإفريقي في البطولة الوطنية هو الأسطورة **الهادي البياري (Hédi Bayari)** برصيد **110 أهداف**، يليه في قائمة كبار الهدافين كل من عادل السليمي، المنصف الخويني، ومحمد صالح الجديدي.";
    }
    if (q.includes('ألقاب') || q.includes('بطولات') || q.includes('تتويج') || q.includes('كؤوس') || q.includes('كم بطولة') || q.includes('بالاماراس')) {
      return `🏆 **سجل ألقاب وبطولات النادي الإفريقي الرسمي:**
- **البطولة التونسية (13 لقباً):** 1947، 1948، 1967، 1973، 1974، 1979، 1980، 1990، 1992، 1996، 2008، 2015 ولقب 2024/2025.
- **كأس تونس (13 لقباً):** رقم قياسي تاريخي بـ 4 كؤوس متتالية (1967-1970).
- **كأس السوبر التونسي (3 ألقاب):** 1968، 1970، 1979.
- **دوري أبطال إفريقيا (1991):** أول نادٍ تونسي يتوج باللقب الإفريقي للأندية الأبطال.
- **الكأس الأفرو-آسيوية (1992):** تحقيق الرباعية التاريخية الأسطورية 1992!
- **البطولات العربية والمغاربية:** كأس الكؤوس العربية (1995)، دوري أبطال العرب (1997)، 3 كؤوس مغاربية للأندية الأبطال وكأس الكؤوس المغاربية، وبطولتي شمال إفريقيا UNAF.`;
    }
    if (q.includes('مدرب') || q.includes('المدرب') || q.includes('المدرب الحالي')) {
      return "👔 المدرب الحالي للنادي الإفريقي هو التقني الفرنسي **دافيد بيتوني (David Bettoni)**، المساعد التاريخي السابق لزين الدين زيدان في ريال مدريد المتوج بثلاثية دوري أبطال أوروبا.";
    }
    if (q.includes('رئيس') || q.includes('الرئيس') || q.includes('هيكل دخيل') || q.includes('محسن الطرابلسي')) {
      return "🏛️ يقود الهيئة التسييرية للنادي الإفريقي السيد **هيكل دخيل** كرئيس للنادي، مع الدور التاريخي والريادي للدكتور **محسن الطرابلسي** على رأس اللجنة الطبية وشخصيات النادي الداعمة.";
    }
    if (q.includes('عتوقة') || q.includes('حارس') || q.includes('الصادق ساسي')) {
      return "🧤 الأسطورة **الصادق ساسي (عتوقة - Attouga)** هو أعظم حارس مرمى في تاريخ النادي الإفريقي والكرة التونسية والإفريقية، صاحب الرقم القياسي في عدد المشاركات والمباريات الدولية وحارس ملحمة الأرجنتين 1978.";
    }
    if (q.includes('ديربي') || q.includes('الترجي') || q.includes('مواجهات')) {
      return "🔥 **ديربي العاصمة التونسية** يجمع بين النادي الإفريقي والترجي الرياضي التونسي، وهو أقدم وأعرق ديربي في شمال إفريقيا وجماهير 'شعب الإفريقي' تقدم دائماً لوحات ودخلات تشجيعية أسطورية تُبهر العالم.";
    }
  }

  // French & English queries
  if (lang === 'fr' || lang === 'en') {
    if (q.includes('fondation') || q.includes('fondé') || q.includes('creation') || q.includes('créé') || q.includes('founded') || q.includes('when was')) {
      return "🔴⚪ Le **Club Africain** a été fondé le **4 octobre 1920** à Bab Souika (Tunis) par Béchir Ben Mustapha et des patriotes tunisiens. C'est le club du peuple et le pionnier du sport national tunisien.";
    }
    if (q.includes('buteur') || q.includes('top scorer') || q.includes('meilleur buteur') || q.includes('bayari')) {
      return "⚽ Le meilleur buteur de l'histoire du Club Africain en championnat est le légendaire **Hédi Bayari** avec **110 buts** inscrits sous la tunique Rouge et Blanc !";
    }
    if (q.includes('palmares') || q.includes('palmarès') || q.includes('titres') || q.includes('trophées') || q.includes('trophies') || q.includes('championnat')) {
      return `🏆 **Palmarès officiel du Club Africain :**
- **13 Championnats de Tunisie :** 1947, 1948, 1967, 1973, 1974, 1979, 1980, 1990, 1992, 1996, 2008, 2015, 2024/2025.
- **13 Coupes de Tunisie :** dont le record historique de 4 victoires consécutives (1967 à 1970).
- **3 Supercoupes de Tunisie :** 1968, 1970, 1979.
- **1 Ligue des Champions de la CAF (1991) :** Premier club tunisien à remporter la C1 africaine !
- **1 Coupe Afro-Asiatique (1992) :** Consécration du QUADRUPLÉ historique 1991/1992 !
- **Titres Arabes & Maghrébins :** Coupe Arabe (1995), Ligue des Champions Arabe (1997), 3 Coupes du Maghreb des champions, 2 Coupes UNAF (2008, 2010).`;
    }
    if (q.includes('entraineur') || q.includes('entraîneur') || q.includes('coach') || q.includes('bettoni')) {
      return "👔 L'entraîneur principal du Club Africain est le technicien français **David Bettoni**, ancien adjoint emblématique de Zinedine Zidane au Real Madrid (triple vainqueur de la Ligue des Champions UEFA).";
    }
    if (q.includes('president') || q.includes('président') || q.includes('dkhil') || q.includes('trabelsi')) {
      return "🏛️ La présidence du Club Africain est assurée par **Haykel Dkhil**, avec l'appui de figures emblématiques du club comme le **Dr. Mohsen Trabelsi** (président de la commission médicale).";
    }
    if (q.includes('attouga') || q.includes('gardien') || q.includes('sadok sassi')) {
      return "🧤 **Sadok Sassi 'Attouga'** est le monument absolu des gardiens de but du Club Africain et du football africain, détenteur du record d'apparitions et héros de la Tunisie à la Coupe du Monde 1978.";
    }
    if (q.includes('derby') || q.includes('esperance') || q.includes('espérance')) {
      return "🔥 Le **Grand Derby de Tunis** oppose le Club Africain à l'Espérance Sportive de Tunis. C'est l'un des rendez-vous les plus intenses et spectaculaires d'Afrique, marqué par la ferveur inégalée des supporters clubistes !";
    }
  }

  return null;
}

export async function POST(request: Request) {
  let language = 'fr';

  try {
    const body = await request.json();
    const message = body.message;
    const messages = body.messages || [];
    if (body.language) {
      language = body.language;
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 1. Check local accurate knowledge resolver first for instant, accurate Club Africain answers
    const localAnswer = getLocalClubResponse(message, language);
    if (localAnswer) {
      return NextResponse.json({ reply: localAnswer, response: localAnswer });
    }

    // 2. If OpenRouter is configured, try calling it with the verified system prompt
    if (openai && process.env.OPENROUTER_API_KEY) {
      const conversationHistory = messages.slice(-8).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: String(msg.content || '')
      }));

      for (const model of MODELS) {
        try {
          const completion = await openai.chat.completions.create({
            model,
            messages: [
              { role: "system", content: getSystemPrompt(language) },
              ...conversationHistory,
              { role: "user", content: message }
            ],
            temperature: 0.6,
            max_tokens: 800,
          });

          const reply = completion.choices[0]?.message?.content;
          if (reply && reply.trim().length > 0) {
            return NextResponse.json({ reply, response: reply });
          }
        } catch (err: any) {
          console.warn(`Model ${model} failed, trying next...`, err?.message || err);
          continue;
        }
      }
    }

    // 3. If OpenRouter was skipped or unavailable, return the verified local answer or a helpful contextual answer
    if (localAnswer) {
      return NextResponse.json({ reply: localAnswer, response: localAnswer });
    }

    // Fallback response tailored to Club Africain
    const defaultFallbacks: Record<string, string> = {
      fr: `🔴⚪ **Club Africain (Al Ifriqi) :**
Fondé le 4 octobre 1920 à Tunis. 13 championnats de Tunisie, 13 coupes de Tunisie, Ligue des Champions CAF 1991 et Quadruplé historique 1992 !
Entraîneur actuel : **David Bettoni** | Légendes : Sadok Sassi (Attouga), Hédi Bayari (110 buts), Tahar Chaïbi, Adel Sellimi, Wissem Ben Yahia.

N'hésitez pas à me poser une question sur le palmarès, l'effectif, les matchs ou l'histoire légendaire du Club Africain !`,

      ar: `🔴⚪ **النادي الإفريقي التونسي (نادي الشعب):**
تأسس في 4 أكتوبر 1920 في باب سويقة. يملك في سجله 13 بطولة تونسية، 13 كأس تونس، دوري أبطال إفريقيا 1991 والرباعية التاريخية 1992!
المدرب الحالي: **دافيد بيتوني** | أساطير النادي: عتوقة الصادق ساسي، الهادي البياري (الهداف التاريخي بـ 110 هدف)، الطاهر الشايبي، عادل السليمي، وسام بن يحيى.

اسألني عن تاريخ النادي، ألقابه، لاعبيه، مبارياته أو متجر النادي وسأجيبك بكل فخر!`,

      en: `🔴⚪ **Club Africain (Tunisia):**
Founded on October 4, 1920 in Tunis. Winners of 13 Tunisian Leagues, 13 Tunisian Cups, 1991 CAF Champions League and the 1992 Historic Quadruple!
Head Coach: **David Bettoni** | Club Legends: Sadok Sassi (Attouga), Hedi Bayari (All-time top scorer with 110 goals), Tahar Chaibi, Adel Sellimi.

Ask me anything about Club Africain's history, squad, fixtures, or trophies!`
    };

    const reply = defaultFallbacks[language] || defaultFallbacks.fr;
    return NextResponse.json({ reply, response: reply });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    const errorFallback = language === 'ar' 
      ? "🔴⚪ مرحباً بك! النادي الإفريقي تأسس في 4 أكتوبر 1920 ويمتلك 13 بطولة و13 كأساً ودوري أبطال إفريقيا 1991. اسألني عن ألقاب النادي، لاعبيه أو تاريخه!"
      : "🔴⚪ Bienvenue ! Le Club Africain (fondé en 1920) compte 13 championnats, 13 coupes et la Ligue des Champions CAF 1991. Posez-moi vos questions sur le club !";

    return NextResponse.json({ reply: errorFallback, response: errorFallback });
  }
}