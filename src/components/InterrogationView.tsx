import { useEffect, useRef, useState } from "react";
import { TRANSLATIONS } from "../data/i18n";
import type { QuestionItem, SupportedLanguage } from "../data/questions";
import {
  PolygrafSensorEngine,
  type PolygrafReading,
} from "../lib/polygrafEngine";
import type { SecretRole } from "./SecretRoleView";

interface InterrogationViewProps {
  language: SupportedLanguage;
  interrogatedNickname: string;
  isCurrentUserInterrogated: boolean;
  isHost: boolean;
  question: QuestionItem | null;
  currentVote: SecretRole | null;
  votesCount: number;
  totalVoters: number;
  syncedPeakTension: number;
  isBusy?: boolean;
  onCastVote: (choice: SecretRole) => void;
  onSyncPeakTension?: (peak: number) => void;
  onCloseRound: (finalPeakTension: number) => void;
}

const HISTORY_LENGTH = 72;

export function InterrogationView({
  language,
  interrogatedNickname,
  isCurrentUserInterrogated,
  isHost,
  question,
  currentVote,
  votesCount,
  totalVoters,
  syncedPeakTension,
  isBusy = false,
  onCastVote,
  onSyncPeakTension,
  onCloseRound,
}: InterrogationViewProps) {
  const dict = TRANSLATIONS[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PolygrafSensorEngine | null>(null);
  const historyRef = useRef<number[]>(new Array(HISTORY_LENGTH).fill(0));
  const lastSyncedPeakRef = useRef<number>(syncedPeakTension);

  const [reading, setReading] = useState<PolygrafReading | null>(null);

  const drawWave = (values: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    const stepX = canvas.width / Math.max(1, values.length - 1);
    values.forEach((val, idx) => {
      const x = idx * stepX;
      const y =
        canvas.height - 12 - (Math.min(100, Math.max(0, val)) / 100) * (canvas.height - 24);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 3.5;
    ctx.stroke();
  };

  useEffect(() => {
    if (!isHost) {
      drawWave(historyRef.current);
      return;
    }

    const engine = new PolygrafSensorEngine(
      (nextReading) => {
        setReading(nextReading);
        historyRef.current = [
          ...historyRef.current.slice(1),
          nextReading.tension,
        ];
        drawWave(historyRef.current);

        if (
          onSyncPeakTension &&
          nextReading.peakTension > lastSyncedPeakRef.current &&
          nextReading.peakTension - lastSyncedPeakRef.current >= 4
        ) {
          lastSyncedPeakRef.current = nextReading.peakTension;
          onSyncPeakTension(nextReading.peakTension);
        }
      },
      { language }
    );

    engineRef.current = engine;
    void engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [isHost, onSyncPeakTension]);

  useEffect(() => {
    engineRef.current?.setLanguage(language);
  }, [language]);

  const currentTension = isHost
    ? reading?.tension ?? 0
    : Math.min(100, syncedPeakTension);
  const currentPeak = isHost
    ? Math.max(syncedPeakTension, reading?.peakTension ?? 0)
    : syncedPeakTension;
  const statusText = isHost ? reading?.statusLabel ?? "" : "";
  const questionText = question ? question[language] : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Interrogado y pregunta activa */}
      <section
        style={{
          background: "#ffffff",
          border: "3px solid #23184a",
          borderRadius: "18px",
          padding: "14px",
          boxShadow: "0 4px 0 #23184a",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "1.35rem",
            fontWeight: 900,
            color: "#23184a",
            marginBottom: questionText ? "6px" : 0,
          }}
        >
          {interrogatedNickname}
        </div>
        {questionText ? (
          <p
            style={{
              margin: 0,
              fontSize: "0.98rem",
              fontWeight: 800,
              color: "#362582",
              lineHeight: 1.35,
            }}
          >
            {questionText}
          </p>
        ) : null}
      </section>

      {/* Medidor de tensión y onda */}
      <section
        style={{
          background: "#23184a",
          border: "3px solid #23184a",
          borderRadius: "18px",
          padding: "14px",
          color: "#ffffff",
          boxShadow: "0 4px 0 #150e2e",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#d8cfff",
            }}
          >
            {dict.tensionIndex}
          </span>
          <span
            style={{
              fontSize: "1.9rem",
              fontWeight: 900,
              color: "#ffd166",
            }}
          >
            {currentTension}%
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "20px",
            background: "#3a2975",
            borderRadius: "999px",
            overflow: "hidden",
            border: "2px solid #130d29",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: `${currentTension}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #06d6a0, #ffd166, #ff9f1c, #ef476f)",
              transition: "width 70ms linear",
            }}
          />
        </div>

        <canvas
          ref={canvasRef}
          width={480}
          height={100}
          style={{
            width: "100%",
            height: "100px",
            display: "block",
            background: "#181036",
            borderRadius: "12px",
            border: "2px solid #3c2c78",
            marginBottom: "10px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            fontSize: "0.8rem",
            fontWeight: 800,
            color: "#ffe599",
          }}
        >
          <span>{statusText}</span>
          <span>
            {dict.peakTension}: {currentPeak}%
          </span>
        </div>
      </section>

      {/* Votación del grupo (excepto quien está siendo interrogado) */}
      {!isCurrentUserInterrogated ? (
        <section
          style={{
            background: "#ffffff",
            border: "3px solid #23184a",
            borderRadius: "18px",
            padding: "14px",
            boxShadow: "0 4px 0 #23184a",
          }}
        >
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
              onClick={() => onCastVote("TRUTH")}
              style={{
                cursor: isBusy ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 900,
                fontSize: "1rem",
                padding: "14px 10px",
                borderRadius: "14px",
                border: "3px solid #23184a",
                background:
                  currentVote === "TRUTH"
                    ? "#06d6a0"
                    : "linear-gradient(180deg, #c8fff0, #7ef2d2)",
                color: "#093d2e",
                boxShadow: "0 4px 0 #23184a",
              }}
            >
              {dict.voteTruth}
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => onCastVote("LIE")}
              style={{
                cursor: isBusy ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 900,
                fontSize: "1rem",
                padding: "14px 10px",
                borderRadius: "14px",
                border: "3px solid #23184a",
                background:
                  currentVote === "LIE"
                    ? "#ef476f"
                    : "linear-gradient(180deg, #ffe0e9, #ffadc4)",
                color: currentVote === "LIE" ? "#ffffff" : "#690b27",
                boxShadow: "0 4px 0 #23184a",
              }}
            >
              {dict.voteLie}
            </button>
          </div>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.82rem",
              fontWeight: 800,
              color: "#362582",
            }}
          >
            <span>{currentVote ? dict.voteSent : ""}</span>
            <span>
              {votesCount}/{totalVoters}
            </span>
          </div>
        </section>
      ) : null}

      {/* Cierre de ronda del anfitrión */}
      {isHost ? (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            engineRef.current?.stop();
            onCloseRound(currentPeak);
          }}
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
          {dict.closeRound}
        </button>
      ) : null}
    </div>
  );
}