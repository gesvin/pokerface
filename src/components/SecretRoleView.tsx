import { useState } from "react";
import { TRANSLATIONS } from "../data/i18n";
import type { QuestionItem, SupportedLanguage } from "../data/questions";

export type SecretRole = "LIE" | "TRUTH";

interface SecretRoleViewProps {
  language: SupportedLanguage;
  interrogatedNickname: string;
  isCurrentUserInterrogated: boolean;
  isHost: boolean;
  question: QuestionItem | null;
  secretRole: SecretRole | null;
  isBusy?: boolean;
  onStartInterrogation: () => void;
}

export function SecretRoleView({
  language,
  interrogatedNickname,
  isCurrentUserInterrogated,
  isHost,
  question,
  secretRole,
  isBusy = false,
  onStartInterrogation,
}: SecretRoleViewProps) {
  const [isHolding, setIsHolding] = useState(false);
  const dict = TRANSLATIONS[language];

  const categoryLabel =
    question?.category === "gevaarlijk"
      ? dict.categoryDangerous
      : dict.categoryIcebreaker;

  const questionText = question ? question[language] : "";

  const roleText =
    secretRole === "LIE" ? dict.roleLie : dict.roleTruth;

  const canStart = isCurrentUserInterrogated || isHost;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Jugador sorteado y aviso de pasar el móvil */}
      <section
        style={{
          background: "#ffffff",
          border: "3px solid #23184a",
          borderRadius: "18px",
          padding: "16px",
          textAlign: "center",
          boxShadow: "0 4px 0 #23184a",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#ffe599",
            color: "#23184a",
            border: "2px solid #23184a",
            borderRadius: "999px",
            padding: "4px 12px",
            fontSize: "0.78rem",
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {categoryLabel}
        </div>

        <div
          style={{
            fontSize: "1.45rem",
            fontWeight: 900,
            color: "#23184a",
            marginBottom: "6px",
          }}
        >
          {interrogatedNickname}
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "#52487d",
          }}
        >
          {dict.passHostPhone}
        </p>
      </section>

      {/* Pregunta de la ronda */}
      {questionText ? (
        <section
          style={{
            background: "#efeaff",
            border: "3px solid #23184a",
            borderRadius: "18px",
            padding: "16px",
            boxShadow: "0 4px 0 #23184a",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "1.08rem",
              fontWeight: 800,
              lineHeight: 1.4,
              color: "#1e1938",
              textAlign: "center",
            }}
          >
            {questionText}
          </p>
        </section>
      ) : null}

      {/* Botón de mantener pulsado para ver rol secreto */}
      <section
        style={{
          background: "#ffffff",
          border: "3px solid #23184a",
          borderRadius: "18px",
          padding: "16px",
          textAlign: "center",
          boxShadow: "0 4px 0 #23184a",
        }}
      >
        {isHolding && secretRole ? (
          <div
            style={{
              background: secretRole === "LIE" ? "#ffe0e9" : "#c8fff0",
              color: secretRole === "LIE" ? "#8a1134" : "#085943",
              border: "3px solid #23184a",
              borderRadius: "16px",
              padding: "20px 14px",
              fontSize: "1.25rem",
              fontWeight: 900,
              letterSpacing: "0.6px",
              userSelect: "none",
            }}
          >
            {roleText}
          </div>
        ) : (
          <button
            type="button"
            disabled={!secretRole}
            onPointerDown={() => setIsHolding(true)}
            onPointerUp={() => setIsHolding(false)}
            onPointerLeave={() => setIsHolding(false)}
            onPointerCancel={() => setIsHolding(false)}
            style={{
              width: "100%",
              cursor: secretRole ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              fontWeight: 900,
              fontSize: "1rem",
              padding: "18px 14px",
              borderRadius: "16px",
              border: "3px solid #23184a",
              background: "linear-gradient(180deg, #ffd166, #f4a226)",
              color: "#23184a",
              boxShadow: "0 5px 0 #23184a",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "none",
            }}
          >
            {dict.holdToReveal}
          </button>
        )}
      </section>

      {/* Pasar a la fase de interrogatorio */}
      {canStart ? (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            setIsHolding(false);
            onStartInterrogation();
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
          {dict.startInterrogation}
        </button>
      ) : null}
    </div>
  );
}