'use client';

/**
 * A single game card in the Games grid: stacked away / home rows with scores,
 * plus date/time and result status.
 */

import Link from 'next/link';
import TeamLogo from '@/components/shared/logo/TeamLogo';
import type { GameRowData, GameTeamSide } from '@/types/api/games';
import './games.css';

function formatTime(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

function TeamLine({ side, win, loss, final }: { side: GameTeamSide; win: boolean; loss: boolean; final: boolean }) {
    return (
        <div className={`game-card__team ${win ? 'is-winner' : ''} ${loss ? 'is-loser' : ''}`}>
            <span className="game-card__id" style={{ ['--tc' as string]: side.color || '#64748b' }}>
                <TeamLogo url={side.logoPath || ''} width={26} height={26} className="game-card__logo" />
                <span className="game-card__name">{side.name ?? 'TBD'}</span>
            </span>
            <span className="game-card__score">{final && side.score != null ? side.score : '–'}</span>
            <span className="game-card__caret">{win ? '◂' : ''}</span>
        </div>
    );
}

export default function GameRow({ game }: { game: GameRowData }) {
    const final = game.isFinal;
    const homeWin = final && game.winner === 'home';
    const awayWin = final && game.winner === 'away';

    return (
        <Link href={`/games/${game.gameId}`} className="game-card" data-final={final}>
            <div className="game-card__head">
                <span className="game-card__time">{final ? formatTime(game.gameDatetime) : 'Scheduled'}</span>
                {final ? (
                    <span className={`game-card__badge ${game.isOvertime ? 'is-ot' : ''}`}>
                        {game.isForfeit ? 'FF' : 'FINAL'}{game.isOvertime ? ' · OT' : ''}
                    </span>
                ) : (
                    <span className="game-card__badge is-scheduled">UPCOMING</span>
                )}
            </div>

            <div className="game-card__teams">
                <TeamLine side={game.away} win={awayWin} loss={homeWin} final={final} />
                <TeamLine side={game.home} win={homeWin} loss={awayWin} final={final} />
            </div>
        </Link>
    );
}
