import { NextResponse } from "next/server";

const SOFASCORE_API = "https://www.sofascore.com/api/v1";

// Club Africain
const TEAM_ID = 2811;

// Tunisian Ligue 1
const LIGUE_1_ID = 984;

// CAF Champions League
const CAF_CHAMPIONS_LEAGUE_ID = 7;

export const dynamic = "force-dynamic";
export const revalidate = 0;


// ============================================================
// SOFASCORE FETCH
// ============================================================

async function sofaFetch(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `SofaScore ${response.status}: ${url}`
    );
  }

  return response.json();
}


// ============================================================
// GET EVENTS FROM MULTIPLE PAGES
// ============================================================

async function getTeamEvents() {
  const pages = Array.from({ length: 5 }, (_, i) => i);

  const results = await Promise.allSettled([
    ...pages.map((page) =>
      sofaFetch(
        `${SOFASCORE_API}/team/${TEAM_ID}/events/next/${page}`
      )
    ),

    ...pages.map((page) =>
      sofaFetch(
        `${SOFASCORE_API}/team/${TEAM_ID}/events/last/${page}`
      )
    ),
  ]);

  const events: any[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;

    if (Array.isArray(result.value?.events)) {
      events.push(...result.value.events);
    }
  }

  // Remove duplicates
  const uniqueEvents = new Map<number, any>();

  for (const event of events) {
    if (event?.id) {
      uniqueEvents.set(event.id, event);
    }
  }

  return Array.from(uniqueEvents.values());
}


// ============================================================
// CHECK IF EVENT BELONGS TO CLUB AFRICAIN
// ============================================================

function isClubAfricainEvent(event: any) {
  return (
    event.homeTeam?.id === TEAM_ID ||
    event.awayTeam?.id === TEAM_ID
  );
}


// ============================================================
// GET COMPETITION NAME
// ============================================================

function getCompetition(event: any) {
  const tournament = event.tournament?.uniqueTournament;

  if (!tournament) {
    return event.tournament?.name || "Football";
  }

  return tournament.name || event.tournament?.name || "Football";
}


// ============================================================
// CHECK COMPETITION
// ============================================================

function isRelevantCompetition(event: any) {
  const tournamentId =
    event.tournament?.uniqueTournament?.id;

  const name = getCompetition(event).toLowerCase();

  // Ligue 1 Tunisia
  if (tournamentId === LIGUE_1_ID) {
    return true;
  }

  // CAF Champions League
  if (tournamentId === CAF_CHAMPIONS_LEAGUE_ID) {
    return true;
  }

  // Extra protection in case SofaScore tournament ID changes
  if (
    name.includes("ligue 1") ||
    name.includes("champions league")
  ) {
    return true;
  }

  return false;
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(timestamp?: number) {
  if (!timestamp) {
    return {
      date: "Date à confirmer",
      time: "Heure à confirmer",
    };
  }

  const date = new Date(timestamp * 1000);

  return {
    date: date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Tunis",
    }),

    time: date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Tunis",
    }),
  };
}


// ============================================================
// MAP SOFASCORE EVENT
// ============================================================

function mapSofaScoreEvent(event: any) {
  const isHome = event.homeTeam?.id === TEAM_ID;

  const homeScore =
    event.homeScore?.current ??
    event.homeScore?.display ??
    null;

  const awayScore =
    event.awayScore?.current ??
    event.awayScore?.display ??
    null;

  const isFinished =
    event.status?.type === "finished";

  const isLive =
    event.status?.type === "inprogress" ||
    event.status?.type === "live";

  const caScore = isHome
    ? homeScore
    : awayScore;

  const opponentScore = isHome
    ? awayScore
    : homeScore;

  const opponent = isHome
    ? event.awayTeam
    : event.homeTeam;

  let result: "Win" | "Draw" | "Loss" | null = null;

  if (
    isFinished &&
    caScore !== null &&
    opponentScore !== null
  ) {
    if (caScore > opponentScore) {
      result = "Win";
    } else if (caScore === opponentScore) {
      result = "Draw";
    } else {
      result = "Loss";
    }
  }

  const { date, time } =
    formatDate(event.startTimestamp);

  // Match status
  let status = "upcoming";

  if (isLive) {
    status = "live";
  } else if (isFinished) {
    status = "finished";
  }

  return {
    id: event.id,

    opponent:
      opponent?.name ||
      "Adversaire à confirmer",

    opponentShortName:
      opponent?.shortName ||
      opponent?.nameCode ||
      "",

    opponentId:
      opponent?.id || null,

    score:
      caScore !== null &&
      opponentScore !== null
        ? `${caScore}-${opponentScore}`
        : null,

    homeScore,
    awayScore,

    date,
    time,

    timestamp:
      event.startTimestamp || null,

    competition:
      getCompetition(event),

    competitionId:
      event.tournament?.uniqueTournament?.id ||
      null,

    venue:
      event.venue?.name ||
      "Stade à confirmer",

    city:
      event.venue?.city ||
      null,

    matchday:
      event.roundInfo?.round ||
      event.roundInfo?.name ||
      null,

    isHome,

    result,

    status,

    // Useful for your frontend
    isLive,
    isFinished,

    scorers: [],

    highlightUrl:
      `https://www.youtube.com/results?search_query=` +
      encodeURIComponent(
        `Club Africain ${opponent?.name || ""} highlights`
      ),

    slug: event.slug || null,
  };
}


// ============================================================
// GET
// ============================================================

export async function GET() {
  try {
    const events = await getTeamEvents();

    // Keep only Club Africain matches
    const clubEvents = events
      .filter(isClubAfricainEvent)
      .filter(isRelevantCompetition);

    if (clubEvents.length === 0) {
      throw new Error(
        "No Club Africain fixtures found"
      );
    }

    // Map
    const mapped = clubEvents.map(
      mapSofaScoreEvent
    );

    // Sort oldest -> newest
    mapped.sort(
      (a, b) =>
        (a.timestamp || 0) -
        (b.timestamp || 0)
    );

    // Finished / live / upcoming
    const recent = mapped
      .filter(
        (match) =>
          match.status === "finished"
      )
      .sort(
        (a, b) =>
          (b.timestamp || 0) -
          (a.timestamp || 0)
      )
      .slice(0, 10);

    const live = mapped.filter(
      (match) => match.status === "live"
    );

    const upcoming = mapped
      .filter(
        (match) =>
          match.status === "upcoming"
      )
      .sort(
        (a, b) =>
          (a.timestamp || 0) -
          (b.timestamp || 0)
      )
      .slice(0, 20);

    return NextResponse.json(
      {
        upcoming,
        recent,
        live,

        // Everything is useful if you need a
        // complete fixtures page
        all: mapped,

        lastUpdated:
          new Date().toISOString(),

        isFallback: false,

        source: "SofaScore",
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Club Africain fixtures error:",
      error
    );

    return NextResponse.json(
      getFallbackFixtures(),
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}


// ============================================================
// FALLBACK
// ============================================================

function getFallbackFixtures() {
  return {
    upcoming: [
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
    ],

    recent: [],

    live: [],

    all: [],

    lastUpdated:
      new Date().toISOString(),

    isFallback: true,

    source: "Fallback",
  };
}