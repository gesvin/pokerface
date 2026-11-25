import type { ReactNode } from "react";
import { TRANSLATIONS } from "../data/i18n";
import type { SupportedLanguage } from "../data/questions";

interface ChibyLayoutProps {
  children: ReactNode;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  roomBadge?: string | null;
}

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: "nl", label: "NL" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function ChibyLayout({
  children,
  language,
  onChangeLanguage,
  roomBadge,
}: ChibyLayoutProps) {
  const dict = TRANSLATIONS[language];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "18px 14px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#1e1938",
        backgroundColor: "#4833ad",
        backgroundImage: [
          "radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.14) 0 2px, transparent 3px)",
          "radial-gradient(circle at 82% 28%, rgba(255, 229, 153, 0.14) 0 2.5px, transparent 3.5px)",
          "linear-gradient(180deg, #5b46c7 0%, #3b2796 100%)",
        ].join(", "),
        backgroundSize: "96px 96px, 130px 130px, 100% 100%",
        fontFamily: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: "560px" }}>
        {/* Barra superior: selector de idioma + insignia de sala */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "6px" }} role="group" aria-label="Language">
            {LANGUAGES.map((item) => {
              const active = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onChangeLanguage(item.code)}
                  style={{
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    padding: "5px 11px",
                    borderRadius: "999px",
                    border: "2.5px solid #23184a",
                    background: active
                      ? "linear-gradient(180deg, #ffd166, #f4a226)"
                      : "#efeaff",
                    color: active ? "#23184a" : "#3a2b82",
                    boxShadow: active ? "0 3px 0 #23184a" : "0 2px 0 #23184a",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {roomBadge ? (
            <span
              style={{
                background: "#ffd166",
                color: "#23184a",
                border: "2.5px solid #23184a",
                borderRadius: "999px",
                padding: "4px 12px",
                fontSize: "0.78rem",
                fontWeight: 900,
                boxShadow: "0 3px 0 #23184a",
                letterSpacing: "0.6px",
              }}
            >
              {roomBadge}
            </span>
          ) : null}
        </div>

        {/* Cabecera festiva estilo Chiby */}
        <header
          style={{
            textAlign: "center",
            marginBottom: "14px",
            color: "#ffffff",
            textShadow: "0 4px 0 rgba(24, 14, 68, 0.65)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.75rem, 6vw, 2.35rem)",
              fontWeight: 900,
              letterSpacing: "0.4px",
              lineHeight: 1.1,
            }}
          >
            {dict.appTitle}
          </h1>
          <p
            style={{
              margin: "5px 0 0",
              fontSize: "0.82rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1.1px",
              color: "#ffe599",
            }}
          >
            {dict.appSubtitle}
          </p>
        </header>

        {/* Tarjeta principal con borde marcado y sombra sólida */}
        <main
          style={{
            background: "#f7f5ff",
            border: "4px solid #23184a",
            borderRadius: "24px",
            padding: "20px",
            boxShadow: "0 8px 0 #23184a, 0 18px 32px rgba(13, 7, 41, 0.42)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}