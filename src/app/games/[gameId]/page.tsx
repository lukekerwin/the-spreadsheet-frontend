'use client';

/**
 * Game detail page — scoreboard, Team Stats + Box Score, then a team-toggled
 * skater table with OVR / OFF / DEF rating badges.
 */

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TeamLogo from '@/components/shared/logo/TeamLogo';
import ErrorState from '@/components/shared/error-state/ErrorState';
import { useGameDetail } from '@/hooks/queries/getGameDetail';
import type { TeamBreakdown, SkaterLine, GoalieLine } from '@/types/api/games';
import './gamedetail.css';

// roster sort order
const POS_ORDER: Record<string, number> = { LW: 0, C: 1, RW: 2, LD: 3, RD: 4 };
const posRank = (p: string | null) => (p && p in POS_ORDER ? POS_ORDER[p] : 99);

const n = (v: number | null | undefined) => (v == null ? '–' : String(v));
const f1 = (v: number | null | undefined) => (v == null ? '–' : Number(v).toFixed(1));
const f2 = (v: number | null | undefined) => (v == null ? '–' : Number(v).toFixed(2));
const pct = (a: number | null | undefined, b: number | null | undefined) =>
    a == null || !b ? null : (Number(a) / Number(b)) * 100;
const pctFmt = (v: number | null) => (v == null ? '–' : `${v.toFixed(1)}%`);
const toiFmt = (s: number | null | undefined) => {
    if (s == null) return '–';
    const m = Math.floor(s / 60); return `${m}:${String(Math.round(s % 60)).padStart(2, '0')}`;
};
const dateFmt = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

function ratingTier(v: number): string {
    if (v >= 80) return 't-exc';
    if (v >= 60) return 't-good';
    if (v >= 40) return 't-avg';
    if (v >= 20) return 't-below';
    return 't-poor';
}

function Badge({ v }: { v: number | null | undefined }) {
    if (v == null) return <span className="gd-rt t-na">–</span>;
    return <span className={`gd-rt ${ratingTier(v)}`}>{Math.round(v)}</span>;
}

// team-stats columns; get(team, opp) -> value, plus formatting + which side wins
type TCol = { key: string; get: (t: TeamBreakdown, o: TeamBreakdown) => number | null; fmt?: (v: number | null) => string; lowerBetter?: boolean };
const TEAM_COLS: TCol[] = [
    { key: 'SOG', get: (t) => t.shots },
    { key: 'SA', get: (_t, o) => o.shots },
    { key: 'SH%', get: (t) => pct(t.goals, t.shots), fmt: pctFmt },
    { key: 'PASS%', get: (t) => pct(t.passes, t.passesAtt), fmt: pctFmt },
    { key: 'HIT', get: (t) => t.hits },
    { key: 'BLK', get: (t) => t.blocks },
    { key: 'TK', get: (t) => t.takeaways },
    { key: 'GV', get: (t) => t.giveaways, lowerBetter: true },
    { key: 'INT', get: (t) => t.interceptions },
    { key: 'DEF', get: (t) => t.pkClears },
    { key: 'FO%', get: (t) => pct(t.fow, (t.fow ?? 0) + (t.fol ?? 0)), fmt: pctFmt },
    { key: 'PP%', get: (t) => pct(t.ppg, t.ppa), fmt: pctFmt },
    { key: 'SHG', get: (t) => t.shg },
];

function TeamStatsTable({ away, home }: { away: TeamBreakdown; home: TeamBreakdown }) {
    const cell = (t: TeamBreakdown, o: TeamBreakdown, c: TCol) => {
        const v = c.get(t, o);
        const ov = c.get(o, t);
        const fmt = c.fmt ?? ((x: number | null) => n(x as number));
        let win = false;
        if (v != null && ov != null && v !== ov) win = c.lowerBetter ? v < ov : v > ov;
        return <td key={c.key} className={win ? 'b' : ''}>{fmt(v)}</td>;
    };
    const row = (t: TeamBreakdown, o: TeamBreakdown) => (
        <tr>
            <td className="ts-team"><TeamLogo url={t.logoPath || ''} width={22} height={22} /></td>
            {TEAM_COLS.map((c) => cell(t, o, c))}
        </tr>
    );
    return (
        <div className="gd-panel">
            <div className="gd-panel__head">Team Stats</div>
            <div className="gd-scroll">
                <table className="ts-table">
                    <thead>
                        <tr><th></th>{TEAM_COLS.map((c) => <th key={c.key}>{c.key}</th>)}</tr>
                    </thead>
                    <tbody>{row(away, home)}{row(home, away)}</tbody>
                </table>
            </div>
        </div>
    );
}

function BoxScore({ away, home }: { away: TeamBreakdown; home: TeamBreakdown }) {
    const hasOt = !!(away.otg || home.otg);
    const row = (t: TeamBreakdown) => (
        <tr>
            <td className="l">{t.teamName}</td>
            <td>{t.p1g}</td><td>{t.p2g}</td><td>{t.p3g}</td>{hasOt ? <td>{t.otg}</td> : null}
            <td className="b">{t.score}</td>
        </tr>
    );
    return (
        <div className="gd-panel">
            <div className="gd-panel__head">Box Score</div>
            <table className="box-table">
                <thead><tr><th className="l">Team</th><th>1st</th><th>2nd</th><th>3rd</th>{hasOt ? <th>OT</th> : null}<th>F</th></tr></thead>
                <tbody>{row(away)}{row(home)}</tbody>
            </table>
        </div>
    );
}

const SK_COLS = ['G', 'xG', 'A', 'xA', 'P', '+/-', 'TOI', 'S', 'S%', 'HIT', 'BLK', 'INT'];

function SkaterTable({ team, skaters }: { team: TeamBreakdown; skaters: SkaterLine[] }) {
    return (
        <div className="gd-panel">
            <div className="gd-panel__head">{team.teamName}</div>
            <div className="gd-scroll">
                <table className="sk-table">
                    <thead>
                        <tr>
                            <th>OVR</th><th className="l">Player</th>
                            {SK_COLS.map((c) => <th key={c}>{c}</th>)}
                            <th>OFF</th><th>DEF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {skaters.map((s) => (
                            <tr key={s.playerId}>
                                <td><Badge v={s.ovr} /></td>
                                <td className="l">
                                    <div className="sk-name">{s.playerName}</div>
                                    <div className="sk-pos">{s.position}</div>
                                </td>
                                <td className="b">{n(s.goals)}</td>
                                <td className="dim">{f1(s.xg)}</td>
                                <td className="b">{n(s.assists)}</td>
                                <td className="dim">{f1(s.xa)}</td>
                                <td className="b">{n(s.points)}</td>
                                <td className={Number(s.plusMinus) > 0 ? 'pos' : Number(s.plusMinus) < 0 ? 'neg' : ''}>
                                    {s.plusMinus != null && s.plusMinus > 0 ? `+${s.plusMinus}` : n(s.plusMinus)}
                                </td>
                                <td className="dim">{toiFmt(s.toi)}</td>
                                <td>{n(s.shots)}</td>
                                <td className="dim">{pctFmt(pct(s.goals, s.shots))}</td>
                                <td>{n(s.hits)}</td>
                                <td>{n(s.blocks)}</td>
                                <td>{n(s.interceptions)}</td>
                                <td><Badge v={s.offRating} /></td>
                                <td><Badge v={s.defRating} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function GoalieTable({ goalies }: { goalies: GoalieLine[] }) {
    if (!goalies.length) return null;
    return (
        <div className="gd-panel gd-goalie-panel">
            <div className="gd-panel__head">Goaltending</div>
            <div className="gd-scroll">
                <table className="sk-table">
                    <thead>
                        <tr>
                            <th className="l">Goalie</th>
                            <th>TOI</th><th>SA</th><th>SV</th><th>GA</th><th>SV%</th><th>SO</th><th>GSAx</th>
                        </tr>
                    </thead>
                    <tbody>
                        {goalies.map((g) => (
                            <tr key={g.playerId}>
                                <td className="l"><span className="sk-name">{g.playerName}</span></td>
                                <td className="dim">{toiFmt(g.toi)}</td>
                                <td>{n(g.shotsAgainst)}</td>
                                <td className="b">{n(g.saves)}</td>
                                <td>{n(g.goalsAgainst)}</td>
                                <td className="b">{g.svPct != null ? `${(Number(g.svPct) * 100).toFixed(1)}%` : '–'}</td>
                                <td>{n(g.shutouts)}</td>
                                <td className="gar">{f2(g.gsax)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function GameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = use(params);
    const { data, isLoading, error } = useGameDetail(Number(gameId));
    const [tab, setTab] = useState<'away' | 'home'>('home');

    if (error) return <div className="page-container"><div className="content-container"><ErrorState error={error instanceof Error ? error : null} /></div></div>;
    if (isLoading || !data || !data.homeTeam || !data.awayTeam) {
        return <div className="page-container"><div className="content-container"><div className="gd-loading">Loading game…</div></div></div>;
    }

    const { header, homeTeam, awayTeam } = data;
    const rec = (t: TeamBreakdown) => (t.teamWins != null ? `${t.teamWins}-${t.teamLosses}-${t.teamOtl}` : '');
    const activeTeam = tab === 'home' ? homeTeam : awayTeam;
    const activeGoalies = tab === 'home' ? data.homeGoalies : data.awayGoalies;
    // roster order: LW, C, RW, LD, RD (then points as tiebreaker)
    const activeSkaters = [...(tab === 'home' ? data.homeSkaters : data.awaySkaters)].sort(
        (a, b) => posRank(a.position) - posRank(b.position) || (b.points ?? 0) - (a.points ?? 0),
    );

    return (
        <div className="page-container gd">
            <div className="content-container">
                <Link href="/games" className="gd-back"><ArrowLeft size={15} /> Back to Games</Link>

                <div className="gd-card">
                    {/* Scoreboard */}
                    <div className="gd-board">
                        <div className="gd-board__team">
                            <TeamLogo url={header.away.logoPath || ''} width={76} height={76} />
                            <div className="gd-board__name">{header.away.name}</div>
                            <div className="gd-board__rec">{rec(awayTeam)}</div>
                        </div>
                        <div className="gd-board__center">
                            <div className="gd-board__scores">
                                <span className={header.winner === 'away' ? 'win' : ''}>{header.away.score ?? '–'}</span>
                                <span className="gd-board__dash">-</span>
                                <span className={header.winner === 'home' ? 'win' : ''}>{header.home.score ?? '–'}</span>
                            </div>
                            <div className="gd-board__status">{header.isFinal ? `Final${header.isOvertime ? ' / OT' : ''}` : 'Scheduled'}</div>
                            <div className="gd-board__meta">{dateFmt(header.gameDatetime)}</div>
                        </div>
                        <div className="gd-board__team">
                            <TeamLogo url={header.home.logoPath || ''} width={76} height={76} />
                            <div className="gd-board__name">{header.home.name}</div>
                            <div className="gd-board__rec">{rec(homeTeam)}</div>
                        </div>
                    </div>

                    <div className="gd-divider" />

                    {/* Team stats + box score */}
                    <div className="gd-statsrow">
                        <TeamStatsTable away={awayTeam} home={homeTeam} />
                        <BoxScore away={awayTeam} home={homeTeam} />
                    </div>

                    {/* Team toggle */}
                    <div className="gd-tabs">
                        <button className={`gd-tab ${tab === 'away' ? 'active' : ''}`} onClick={() => setTab('away')}>
                            <TeamLogo url={awayTeam.logoPath || ''} width={20} height={20} /> {awayTeam.teamName}
                        </button>
                        <button className={`gd-tab ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
                            <TeamLogo url={homeTeam.logoPath || ''} width={20} height={20} /> {homeTeam.teamName}
                        </button>
                    </div>

                    <SkaterTable team={activeTeam} skaters={activeSkaters} />
                    <GoalieTable goalies={activeGoalies} />
                </div>
            </div>
        </div>
    );
}
