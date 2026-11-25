import { QRCodeSVG } from "qrcode.react";
import { TRANSLATIONS } from "../data/i18n";
import type { SupportedLanguage } from "../data/questions";

export type RoomCategoryFilter = "mix" | "ijsbreker" | "gevaarlijk";

export interface LobbyPlayer {
  id: string;
  nickname: string;
  score: number;
  is_host: boolean;
}

interface LobbyViewProps {
  language: SupportedLanguage;
  nickname: string;
  roomCodeInput: string;
  activeRoomCode: string | null;
  isHost: boolean;
  category: RoomCategoryFilter;
  players: LobbyPlayer[];
  isBusy?: boolean;
  errorMessage?: string | null;
  onChangeNickname: (value: string) => void;
  onChangeRoomCodeInput: (value: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onChangeCategory: (category: RoomCategoryFilter) => void;
  onDrawPlayer: () => void;
}

export function LobbyView({
  language,
  nickname,
  roomCodeInput,
  activeRoomCode,
  isHost,
  category,
  players,
  isBusy = false,
  errorMessage = null,
  onChangeNickname,
  onChangeRoomCodeInput,
  onCreateRoom,
  onJoinRoom,
  onChangeCategory,
  onDrawPlayer,
}: LobbyViewProps) {
  const dict = TRANSLATIONS[language];

  const joinUrl =
    activeRoomCode && typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(
          activeRoomCode
        )}`
      : "";

  const categories: { id: RoomCategoryFilter; label: string }[] = [
    { id: "mix", label: dict.categoryMix },
    { id: "ijsbreker", label: dict.categoryIcebreaker },
    { id: "gevaarlijk", label: dict.categoryDangerous },
  ];

  const cardStyle = {
    background: "#ffffff",
    border: "3px solid #23184a",
    borderRadius: "18px",
    padding: "14px",
    boxShadow: "0 4px 0 #23184a",
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: "12px",
    border: "2.5px solid #23184a",
    background: "#f8f6ff",
    color: "#1e1938",
    fontFamily: "inherit",
    fontSize: "0.98rem",
    fontWeight: 700,
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {errorMessage ? (
        <div
          role="alert"
          style={{
            background: "#ffe0e9",
            color: "#7d1031",
            border: "2.5px solid #7d1031",
            borderRadius: "14px",
            padding: "10px 12px",
            fontWeight: 800,
            fontSize: "0.88rem",
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      {/* Apodo y crear/unirse */}
      <section style={cardStyle}>
        <div style={{ marginBottom: "12px" }}>
          <label
            htmlFor="pf-nickname"
            style={{
              display: "block",
              fontSize: "0.82rem",
              fontWeight: 900,
              textTransform: "uppercase",
              marginBottom: "6px",
              color: "#362582",
            }}
          >
            {dict.nicknameLabel}
          </label>
          <input
            id="pf-nickname"
            type="text"
            maxLength={18}
            value={nickname}
            placeholder={dict.nicknamePlaceholder}
            onChange={(e) => onChangeNickname(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label
            htmlFor="pf-room-code"
            style={{
              display: "block",
              fontSize: "0.82rem",
              fontWeight: 900,
              textTransform: "uppercase",
              marginBottom: "6px",
              color: "#362582",
            }}
          >
            {dict.roomCodeLabel}
          </label>
          <input
            id="pf-room-code"
            type="text"
            maxLength={12}
            value={roomCodeInput}
            placeholder={dict.roomCodePlaceholder}
            onChange={(e) =>
              onChangeRoomCodeInput(e.target.value.toUpperCase())
            }
            style={{ ...inputStyle, letterSpacing: "1.2px" }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <button
            type="button"
            disabled={isBusy}
            onClick={onCreateRoom}
            style={{
              cursor: isBusy ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontWeight: 900,
              fontSize: "0.95rem",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "3px solid #23184a",
              background: "linear-gradient(180deg, #ff9f1c, #f77f00)",
              color: "#ffffff",
              textShadow: "0 2px 0 #7a3b00",
              boxShadow: "0 4px 0 #23184a",
              opacity: isBusy ? 0.65 : 1,
            }}
          >
            {dict.createRoom}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={onJoinRoom}
            style={{
              cursor: isBusy ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontWeight: 900,
              fontSize: "0.95rem",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "3px solid #23184a",
              background: "linear-gradient(180deg, #ffd166, #f4a226)",
              color: "#23184a",
              boxShadow: "0 4px 0 #23184a",
              opacity: isBusy ? 0.65 : 1,
            }}
          >
            {dict.joinRoom}
          </button>
        </div>
      </section>

      {/* QR de acceso cuando hay sala activa */}
      {activeRoomCode ? (
        <section
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "10px",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: "0.9rem", color: "#362582" }}>
            {dict.scanOrShare}
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: "10px",
              borderRadius: "14px",
              border: "2.5px solid #23184a",
            }}
          >
            <QRCodeSVG value={joinUrl} size={144} bgColor="#ffffff" fgColor="#23184a" />
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: "1.15rem",
              letterSpacing: "2px",
              color: "#23184a",
            }}
          >
            {activeRoomCode}
          </div>
        </section>
      ) : null}

      {/* Jugadores conectados */}
      <section style={cardStyle}>
        <div
          style={{
            fontSize: "0.82rem",
            fontWeight: 900,
            textTransform: "uppercase",
            color: "#362582",
            marginBottom: "8px",
          }}
        >
          {dict.playersInRoom} ({players.length})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {players.map((p) => (
            <span
              key={p.id}
              style={{
                background: p.is_host ? "#ffe599" : "#ede8ff",
                color: "#23184a",
                border: "2px solid #23184a",
                borderRadius: "999px",
                padding: "5px 12px",
                fontWeight: 800,
                fontSize: "0.86rem",
                boxShadow: "0 2px 0 #23184a",
              }}
            >
              {p.nickname} · {p.score}
            </span>
          ))}
        </div>
      </section>

      {/* Controles del anfitrión: categoría y sorteo */}
      {isHost ? (
        <section style={cardStyle}>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#362582",
              marginBottom: "8px",
            }}
          >
            {dict.categoryLabel}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            {categories.map((cat) => {
              const selected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChangeCategory(cat.id)}
                  style={{
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 800,
                    fontSize: "0.84rem",
                    padding: "9px 8px",
                    borderRadius: "12px",
                    border: "2.5px solid #23184a",
                    background: selected ? "#6c47ff" : "#f1edff",
                    color: selected ? "#ffffff" : "#23184a",
                    boxShadow: "0 3px 0 #23184a",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={isBusy || players.length === 0}
            onClick={onDrawPlayer}
            style={{
              width: "100%",
              cursor: isBusy || players.length === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontWeight: 900,
              fontSize: "1.02rem",
              padding: "13px 16px",
              borderRadius: "14px",
              border: "3px solid #23184a",
              background: "linear-gradient(180deg, #ff9f1c, #f77f00)",
              color: "#ffffff",
              textShadow: "0 2px 0 #7a3b00",
              boxShadow: "0 4px 0 #23184a",
              opacity: isBusy || players.length === 0 ? 0.6 : 1,
            }}
          >
            {dict.drawVictim}
          </button>
        </section>
      ) : null}
    </div>
  );
}