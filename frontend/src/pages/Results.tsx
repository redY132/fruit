import React, { useEffect, useState } from "react";
import { Trophy, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const FONT_TITLE = "'Irish Grover', cursive";
const FONT_BODY = "'Baloo Bhaijaan 2', sans-serif";
const BROWN = "#564A4A";
const SHADOW = "0 4px 14px rgba(86,74,74,0.35)";

interface PlayerRow {
  id: string;
  rank: number;
  name: string;
  score: number;
  fruitsSliced: number;
  maxCombo: number;
  avatarUrl: string | null;
}

export function Results() {
  const navigate = useNavigate();
  const { playerId } = useAuth();
  const [searchParams] = useSearchParams();

  const lobbyId = searchParams.get("lobbyId") ?? "";
  const myScore = parseInt(searchParams.get("score") ?? "0", 10);
  const myMaxCombo = parseInt(searchParams.get("maxCombo") ?? "0", 10);
  const myFruits = parseInt(searchParams.get("fruits") ?? "0", 10);

  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [lobbyCode, setLobbyCode] = useState("");

  useEffect(() => {
    if (!lobbyId) return;
    async function load() {
      const [{ data: lps }, { data: lobby }] = await Promise.all([
        supabase
          .from("lobby_players")
          .select("player_id, score, fruits_sliced, max_combo")
          .eq("lobby_id", lobbyId)
          .order("score", { ascending: false }),
        supabase.from("lobbies").select("code").eq("id", lobbyId).single(),
      ]);
      if (lobby?.code) setLobbyCode(lobby.code);
      if (!lps?.length) return;

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in(
          "id",
          lps.map((p) => p.player_id)
        );

      const nameMap = Object.fromEntries(
        profs?.map((p) => [p.id, p.display_name]) ?? []
      );
      const avatarMap = Object.fromEntries(
        profs?.map((p) => [p.id, p.avatar_url]) ?? []
      );

      setPlayers(
        lps.map((lp, i) => ({
          id: lp.player_id,
          rank: i + 1,
          name: nameMap[lp.player_id] ?? "Player",
          score: lp.score,
          fruitsSliced: lp.fruits_sliced,
          maxCombo: lp.max_combo,
          avatarUrl: avatarMap[lp.player_id] ?? null,
        }))
      );
    }
    load();
  }, [lobbyId]);

  const winner = players[0];
  const topComboPlayer = [...players].sort(
    (a, b) => b.maxCombo - a.maxCombo
  )[0];

  return (
    <div
      className="w-screen min-h-screen bg-white flex flex-col items-center py-12 px-6 overflow-y-auto relative"
      style={{ fontFamily: FONT_BODY }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate("/lobby")}
        className="absolute top-6 left-6 flex items-center gap-2 hover:opacity-70 transition-opacity"
        style={{ color: BROWN }}
      >
        <ArrowLeft size={20} />
        <span className="font-semibold text-sm">Lobby</span>
      </button>

      <h1
        className="text-7xl leading-none mb-8"
        style={{ fontFamily: FONT_TITLE, color: BROWN }}
      >
        Round Over
      </h1>

      {/* Winner Banner */}
      {winner && (
        <div
          className="flex items-center gap-4 px-8 py-4 rounded-full mb-10"
          style={{
            backgroundColor: `${BROWN}12`,
            border: `1.5px solid ${BROWN}40`,
          }}
        >
          <Trophy style={{ color: BROWN }} size={26} />
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
            style={{ backgroundColor: BROWN }}
          >
            {winner.avatarUrl ? (
              <img
                src={winner.avatarUrl}
                alt={winner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              winner.name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="text-2xl font-bold" style={{ color: BROWN }}>
            {winner.name} <span className="font-normal opacity-60">wins!</span>
          </div>
        </div>
      )}

      {/* Grade Panel */}
      <div
        className="flex items-center gap-12 bg-white rounded-2xl p-8 mb-10 w-full max-w-2xl relative overflow-hidden"
        style={{
          border: `1.5px solid ${BROWN}25`,
          boxShadow: "0 2px 20px rgba(86,74,74,0.08)",
        }}
      >
        <div
          className="text-[110px] font-black italic leading-none pr-10"
          style={{
            fontFamily: FONT_TITLE,
            color: BROWN,
            borderRight: `1.5px solid ${BROWN}20`,
          }}
        >
          S
        </div>
        <div className="flex-1 grid grid-cols-3 gap-y-5 gap-x-10">
          <Stat label="Total Score" value={myScore.toLocaleString()} />
          <Stat label="Max Combo" value={`×${myMaxCombo}`} highlight />
          <Stat label="Fruits Sliced" value={myFruits.toLocaleString()} />
        </div>
      </div>

      {/* Leaderboard */}
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden mb-10"
        style={{ border: `1.5px solid ${BROWN}20` }}
      >
        <div
          className="grid grid-cols-[50px_1fr_110px_90px_90px] gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider"
          style={{ color: `${BROWN}70`, borderBottom: `1px solid ${BROWN}15` }}
        >
          <div className="text-center">Rank</div>
          <div>Player</div>
          <div className="text-right">Score</div>
          <div className="text-right">Fruits</div>
          <div className="text-right">Combo</div>
        </div>
        <div className="flex flex-col">
          {players.map((p) => (
            <LeaderboardRow
              key={p.id}
              rank={p.rank}
              name={p.name}
              score={p.score}
              fruits={p.fruitsSliced}
              combo={p.maxCombo}
              avatarUrl={p.avatarUrl}
              isWinner={p.rank === 1}
              isYou={p.id === playerId}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-24">
        <button
          onClick={() => navigate(`/room?lobbyId=${lobbyId}&code=${lobbyCode}`)}
          className="px-10 py-4 rounded-full font-bold text-lg text-white transition-colors active:scale-95"
          style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
        >
          Play again
        </button>
        <button
          onClick={() => navigate("/lobby")}
          className="px-10 py-4 rounded-full font-bold text-lg transition-colors active:scale-95"
          style={{
            backgroundColor: "#EDE8E8",
            border: `2px solid ${BROWN}`,
            color: BROWN,
            boxShadow: SHADOW,
          }}
        >
          Back to lobby
        </button>
      </div>
      <img
        src="/assets/backdrop.png"
        alt=""
        className="-mt-27 pointer-events-none select-none"
        width={800}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div
        className="text-xs font-bold uppercase tracking-wider mb-1"
        style={{ color: `${BROWN}70` }}
      >
        {label}
      </div>
      <div
        className="text-3xl font-mono font-bold"
        style={{ color: highlight ? BROWN : `${BROWN}CC` }}
      >
        {value}
      </div>
    </div>
  );
}

function LeaderboardRow({
  rank,
  name,
  score,
  fruits,
  combo,
  avatarUrl,
  isWinner,
  isYou,
}: {
  rank: number;
  name: string;
  score: number;
  fruits: number;
  combo: number;
  avatarUrl: string | null;
  isWinner?: boolean;
  isYou?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-[50px_1fr_110px_90px_90px] gap-3 px-4 py-3 items-center transition-colors hover:bg-black/[0.02]"
      style={{
        borderBottom: `1px solid ${BROWN}10`,
        borderLeft: isWinner
          ? `3px solid ${BROWN}`
          : isYou
          ? `3px solid ${BROWN}80`
          : "3px solid transparent",
        backgroundColor: isWinner
          ? `${BROWN}06`
          : isYou
          ? `${BROWN}04`
          : undefined,
      }}
    >
      <div
        className="text-center font-bold text-sm"
        style={{ color: isWinner ? BROWN : `${BROWN}50` }}
      >
        #{rank}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
          style={{ backgroundColor: BROWN }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            name.substring(0, 2).toUpperCase()
          )}
        </div>
        <span className="font-semibold text-sm" style={{ color: BROWN }}>
          {name} {isYou && <span className="text-xs opacity-60">(YOU)</span>}
        </span>
      </div>
      <div
        className="text-right font-mono font-bold text-sm"
        style={{ color: isWinner ? BROWN : `${BROWN}BB` }}
      >
        {score.toLocaleString()}
      </div>
      <div
        className="text-right font-mono text-sm"
        style={{ color: `${BROWN}99` }}
      >
        {fruits.toLocaleString()}
      </div>
      <div
        className="text-right font-mono text-sm"
        style={{ color: `${BROWN}99` }}
      >
        ×{combo}
      </div>
    </div>
  );
}
