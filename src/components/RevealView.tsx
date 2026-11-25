import { TRANSLATIONS } from "../data/i18n";
import type { QuestionItem, SupportedLanguage } from "../data/questions";
import type { LobbyPlayer } from "./LobbyView";
import type { SecretRole } from "./SecretRoleView";

interface RevealViewProps {
  language: SupportedLanguage;
  interrogatedNickname: string;
  isHost: boolean;
  question: QuestionItem | null;
  secretRole: SecretRole | null;
  peakTension: number;
  truthVotesCount: number;
  lieVotesCount: number;
  players: LobbyPlayer[];
  isBusy?: boolean;
  onNextRound: () => void;
}

export function RevealView({
  language,
  interrogatedNickname,
  isHost,
  question,
  secretRole,
  peakTension,
  truthVotesCount,
  lieVotesCount,
  players,
  isBusy = false,
  onNextRound,
}: RevealViewProps) {
  const dict = TRANSLATIONS[language];

  const questionText = question ? question[language] : "";
  const roleLabel =
    secretRole === "LIE" ? dict.roleLie : dict.roleTruth;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const cardStyle = {
    background: "#ffffff",
    border: "3px solid #23184a",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 4px 0 #23184a",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Encargo secreto revelado */}
      <section style={{ ...cardStyle, textAlign: "center" }}>
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 900,
            textTransform: "uppercase",
            color: "#362582",
            marginBottom: "6px",
          }}
        >
          {dict.revealTitle} · {interrogatedNickname}
        </div>

        {questionText ? (
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "0.96rem",
              fontWeight: 800,
              color: "#4a4078",
              lineHeight: 1.35,
            }}
          >
            {questionText}
          </p>
        ) : null}

        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 800,
            color: "#52487d",
            marginBottom: "8px",
          }}
        >
          {dict.secretWas}
        </div>

        {secretRole ? (
          <div
            style={{
              display: "inline-block",
              background: secretRole === "LIE" ? "#ffe0e9" : "#c8fff0",
              color: secretRole === "LIE" ? "#8a1134" : "#085943",
              border: "3px solid #23184a",
              borderRadius: "14px",
              padding: "12px 18px",
              fontSize: "1.2rem",
              fontWeight: 900,
              boxShadow: "0 3px 0 #23184a",
            }}
          >
            {roleLabel}
          </div>
        ) : null}
      </section>

      {/* Resumen de tensión y votos */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        <div style={{ ...cardStyle, padding: "12px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#52487d",
            }}
          >
            {dict.peakTension}
          </div>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 900,
              color: "#23184a",
              marginTop: "2px",
            }}
          >
            {peakTension}%
          </div>
        </div>

        <div style={{ ...cardStyle, padding: "12px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#085943",
            }}
          >
            {dict.voteTruth}
          </div>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 900,
              color: "#23184a",
              marginTop: "2px",
            }}
          >
            {truthVotesCount}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: "12px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#8a1134",
            }}
          >
            {dict.voteLie}
          </div>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 900,
              color: "#23184a",
              marginTop: "2px",
            }}
          >
            {lieVotesCount}
          </div>
        </div>
      </section>

      {/* Marcador de jugadores */}
      <section style={cardStyle}>
        <div
          style={{
            fontSize: "0.82rem",
            fontWeight: 900,
            textTransform: "uppercase",
            color: "#362582",
            marginBottom: "10px",
          }}
        >
          {dict.scoreboard}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: index === 0 ? "#ffe599" : "#f5f2ff",
                border: "2.5px solid #23184a",
                borderRadius: "12px",
                padding: "9px 12px",
                fontWeight: 900,
                color: "#23184a",
              }}
            >
              <span>
                #{index + 1} {player.nickname}
              </span>
              <span>{player.score}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Siguiente ronda (anfitrión) */}
      {isHost ? (
        <button
          type="button"
          disabled={isBusy}
          onClick={onNextRound}
          style={{
            width: "100%",
            cursor: isBusy ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            fontWeight: 900,
            fontSize: "1.02rem",
            padding: "14px 16px",
            borderRadius: "16px",
            border: "3px solid #23184a",
            background: "linear-gradient(180deg, #ff9f1c, #f77f00)",
            color: "#ffffff",
            textShadow: "0 2px 0 #7a3b00",
            boxShadow: "0 5px 0 #23184a",
            opacity: isBusy ? 0.65 : 1,
          }}
        >
          {dict.nextRound}
        </button>
      ) : null}
    </div>
  );
}