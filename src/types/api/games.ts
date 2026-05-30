/**
 * Games page API types.
 */

export interface GameTeamSide {
    id: number | null;
    name: string | null;
    fullName: string | null;
    color: string | null;
    logoPath: string | null;
    score: number | null;
}

export type GameWinner = 'home' | 'away' | 'tie' | 'scheduled' | null;

export interface GameRowData {
    gameId: number;
    weekId: number | null;
    gameDatetime: string | null;
    home: GameTeamSide;
    away: GameTeamSide;
    winner: GameWinner;
    isOvertime: boolean;
    isForfeit: boolean;
    isFinal: boolean;
}

export interface GameWeekOption {
    weekId: number;
    played: number;
    scheduled: number;
}

export interface GameDayOption {
    date: string;   // ISO yyyy-mm-dd
    label: string;  // weekday name, e.g. "Tuesday"
    played: number;
}

// ---- game detail ----

export interface TeamBreakdown {
    teamId: number;
    teamName: string | null;
    fullTeamName: string | null;
    teamColor: string | null;
    logoPath: string | null;
    isHome: boolean;
    score: number | null;
    teamWins: number | null; teamLosses: number | null; teamOtl: number | null;
    p1g: number; p2g: number; p3g: number; otg: number;
    isOvertime: boolean;
    win: number | null; loss: number | null; otl: number | null;
    goals: number | null; shots: number | null; shotsAgainst: number | null; hits: number | null; toa: number | null;
    fow: number | null; fol: number | null; pim: number | null; ppg: number | null; ppa: number | null;
    blocks: number | null; takeaways: number | null; giveaways: number | null;
    interceptions: number | null; pkClears: number | null; shg: number | null;
    passes: number | null; passesAtt: number | null; saves: number | null;
    totalGar: number | null; offensiveGar: number | null; defensiveGar: number | null;
    totalXg: number | null; opponentXg: number | null;
}

export interface SkaterLine {
    playerId: number;
    playerName: string | null;
    teamId: number | null;
    position: string | null;
    posGroup: string | null;
    toi: number | null;
    points: number | null; goals: number | null; assists: number | null; plusMinus: number | null;
    shots: number | null; hits: number | null; takeaways: number | null; giveaways: number | null;
    blocks: number | null; interceptions: number | null; pim: number | null;
    ppg: number | null; shg: number | null; gwg: number | null; fow: number | null; fol: number | null;
    totalGar: number | null; offensiveGar: number | null; defensiveGar: number | null;
    xg: number | null; xa: number | null;
    ovr: number | null; offRating: number | null; defRating: number | null;
}

export interface GoalieLine {
    playerId: number;
    playerName: string | null;
    teamId: number | null;
    toi: number | null;
    shotsAgainst: number | null; saves: number | null; goalsAgainst: number | null;
    svPct: number | null; gaa: number | null; shutouts: number | null;
    gsax: number | null; gsaa: number | null;
    ovr: number | null;
}

export interface GameDetailResponse {
    header: GameRowData;
    homeTeam: TeamBreakdown | null;
    awayTeam: TeamBreakdown | null;
    homeSkaters: SkaterLine[];
    awaySkaters: SkaterLine[];
    homeGoalies: GoalieLine[];
    awayGoalies: GoalieLine[];
}

export interface GamesResponse {
    data: GameRowData[];
    seasonId: number;
    leagueId: number;
    gameTypeId: number;
    weekId: number;
    gameDate: string | null;
    seasons: number[];
    weeks: GameWeekOption[];
    days: GameDayOption[];
    total: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    lastUpdated: string;
}
