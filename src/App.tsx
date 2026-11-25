import { useCallback, useEffect, useMemo, useState } from "react";
import { ChibyLayout } from "./components/ChibyLayout";
import { InterrogationView } from "./components/InterrogationView";
import {
  LobbyView,
  type LobbyPlayer,
  type RoomCategoryFilter,
} from "./components/LobbyView";
import { RevealView } from "./components/RevealView";
import { SecretRoleView, type SecretRole } from "./components/SecretRoleView";
import {
  QUESTIONS,
  type QuestionItem,
  type SupportedLanguage,
} from "./data/questions";
import { supabase } from "./lib/supabase";

type GamePhase = "LOBBY" | "DRAW_AND_SECRET" | "INTERROGATION" | "REVEAL";

interface RoomRow {
  code: string;
  host_id: string;
  phase: GamePhase;
  category: RoomCategoryFilter;
  language: SupportedLanguage;
  interrogated_player_id: string | null;
  secret_role: SecretRole | null;
  question_id: string | null;
  peak_tension: number;
  used_question_ids: string[];
}

interface VoteRow {
  id: string;
  room_code: string;
  voter_id: string;
  choice: SecretRole;
}

const STORAGE_ROOM_KEY = "pf_polslag_room_code";
const STORAGE_NICK_KEY = "pf_polslag_nickname";
const STORAGE_LANG_KEY = "pf_polslag_language";

function getRoomPlayerStorageKey(roomCode: string): string {
  return `pf_polslag_player_${roomCode.trim().toUpperCase()}`;
}

function createUniquePlayerId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getOrCreatePlayerIdForRoom(roomCode: string): string {
  const cleanCode = roomCode.trim().toUpperCase();
  const key = getRoomPlayerStorageKey(cleanCode);
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const generated = createUniquePlayerId();
    localStorage.setItem(key, generated);
    return generated;
  } catch {
    return createUniquePlayerId();
  }
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function pickRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function App() {
  const [playerId, setPlayerId] = useState<string>(() => {
  try {
    const savedRoom = localStorage.getItem(STORAGE_ROOM_KEY)?.trim().toUpperCase();
    if (savedRoom) {
      return getOrCreatePlayerIdForRoom(savedRoom);
    }
  } catch {
    // Ignorar restricciones de almacenamiento
  }
  return createUniquePlayerId();
});

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as SupportedLanguage | null;
      return saved === "nl" || saved === "en" || saved === "es" ? saved : "nl";
    } catch {
      return "nl";
    }
  });

  const [nickname, setNickname] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_NICK_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const initialRoomFromUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("room")?.trim().toUpperCase();
    if (fromQuery) return fromQuery;
    try {
      return (localStorage.getItem(STORAGE_ROOM_KEY) ?? "").toUpperCase();
    } catch {
      return "";
    }
  }, []);

  const [roomCodeInput, setRoomCodeInput] = useState<string>(initialRoomFromUrl);
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
    } catch {
      // Ignorar restricciones de almacenamiento
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NICK_KEY, nickname);
    } catch {
      // Ignorar restricciones de almacenamiento
    }
  }, [nickname]);

  const refreshRoomState = useCallback(async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    const [roomRes, playersRes, votesRes] = await Promise.all([
      supabase.from("rooms").select("*").eq("code", cleanCode).maybeSingle(),
      supabase
        .from("players")
        .select("id, nickname, score, is_host")
        .eq("room_code", cleanCode),
      supabase.from("votes").select("*").eq("room_code", cleanCode),
    ]);

    if (roomRes.data) {
      const nextRoom = roomRes.data as RoomRow;
      setRoom(nextRoom);
      setLanguage(nextRoom.language);
    }
    if (playersRes.data) {
      setPlayers(playersRes.data as LobbyPlayer[]);
    }
    if (votesRes.data) {
      setVotes(votesRes.data as VoteRow[]);
    }
  }, []);

  useEffect(() => {
    if (!activeRoomCode) return;

    void refreshRoomState(activeRoomCode);

    const channel = supabase
      .channel(`room-sync-${activeRoomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `code=eq.${activeRoomCode}`,
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new as RoomRow;
            setRoom(updated);
            setLanguage(updated.language);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_code=eq.${activeRoomCode}`,
        },
        () => {
          void supabase
            .from("players")
            .select("id, nickname, score, is_host")
            .eq("room_code", activeRoomCode)
            .then(({ data }) => {
              if (data) setPlayers(data as LobbyPlayer[]);
            });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `room_code=eq.${activeRoomCode}`,
        },
        () => {
          void supabase
            .from("votes")
            .select("*")
            .eq("room_code", activeRoomCode)
            .then(({ data }) => {
              if (data) setVotes(data as VoteRow[]);
            });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeRoomCode, refreshRoomState]);

  const handleChangeLanguage = async (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    if (activeRoomCode && room?.host_id === playerId) {
      await supabase
        .from("rooms")
        .update({ language: nextLang, updated_at: new Date().toISOString() })
        .eq("code", activeRoomCode);
    }
  };

  const handleCreateRoom = async () => {
    const cleanNick = nickname.trim();
    if (!cleanNick) return;

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const code = generateRoomCode();
      const roomPlayerId = getOrCreatePlayerIdForRoom(code);
      setPlayerId(roomPlayerId);

      const { error: roomError } = await supabase.from("rooms").insert({
        code,
        host_id: roomPlayerId,
        phase: "LOBBY",
        category: "mix",
        language,
        interrogated_player_id: null,
        secret_role: null,
        question_id: null,
        peak_tension: 0,
        used_question_ids: [],
      });

      if (roomError) {
        setErrorMessage(roomError.message);
        return;
      }

      const { error: playerError } = await supabase.from("players").upsert({
        id: playerId,
        room_code: code,
        nickname: cleanNick,
        language,
        score: 0,
        is_host: true,
      });

      if (playerError) {
        setErrorMessage(playerError.message);
        return;
      }

      try {
        localStorage.setItem(STORAGE_ROOM_KEY, code);
      } catch {
        // Ignorar restricciones de almacenamiento
      }

      setRoomCodeInput(code);
      setActiveRoomCode(code);
      await refreshRoomState(code);
    } finally {
      setIsBusy(false);
    }
  };

  const handleJoinRoom = async () => {
    const cleanNick = nickname.trim();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanNick || !cleanCode) return;

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const { data: existingRoom, error: roomFetchError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", cleanCode)
        .maybeSingle();

      if (roomFetchError || !existingRoom) {
        setErrorMessage(roomFetchError?.message ?? "404");
        return;
      }

      const typedRoom = existingRoom as RoomRow;
      const roomPlayerId = getOrCreatePlayerIdForRoom(cleanCode);
      setPlayerId(roomPlayerId);
      const isHostInRoom = typedRoom.host_id === roomPlayerId;

      const { data: existingPlayer } = await supabase
        .from("players")
        .select("score")
        .eq("id", roomPlayerId)
        .eq("room_code", cleanCode)
        .maybeSingle();

      const { error: joinError } = await supabase.from("players").upsert({
        id: roomPlayerId,
        room_code: cleanCode,
        nickname: cleanNick,
        language: typedRoom.language,
        score: existingPlayer?.score ?? 0,
        is_host: isHostInRoom,
      });

      if (joinError) {
        setErrorMessage(joinError.message);
        return;
      }

      try {
        localStorage.setItem(STORAGE_ROOM_KEY, cleanCode);
      } catch {
        // Ignorar restricciones de almacenamiento
      }

      setActiveRoomCode(cleanCode);
      setLanguage(typedRoom.language);
      await refreshRoomState(cleanCode);
    } finally {
      setIsBusy(false);
    }
  };

  const handleChangeCategory = async (nextCategory: RoomCategoryFilter) => {
    if (!activeRoomCode || room?.host_id !== playerId) return;
    await supabase
      .from("rooms")
      .update({ category: nextCategory, updated_at: new Date().toISOString() })
      .eq("code", activeRoomCode);
  };

  const handleDrawPlayer = async () => {
    if (!activeRoomCode || !room || room.host_id !== playerId || players.length === 0) {
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const chosenPlayer = pickRandomItem(players);
      const chosenRole: SecretRole = Math.random() < 0.5 ? "LIE" : "TRUTH";

      const poolByCategory =
        room.category === "mix"
          ? QUESTIONS
          : QUESTIONS.filter((q) => q.category === room.category);
      const effectivePool = poolByCategory.length > 0 ? poolByCategory : QUESTIONS;

      const usedSet = new Set(room.used_question_ids ?? []);
      const unused = effectivePool.filter((q) => !usedSet.has(q.id));
      const candidatePool = unused.length > 0 ? unused : effectivePool;
      const chosenQuestion = pickRandomItem(candidatePool);

      const nextUsedIds =
        unused.length > 0
          ? [...(room.used_question_ids ?? []), chosenQuestion.id]
          : [chosenQuestion.id];

      await supabase.from("votes").delete().eq("room_code", activeRoomCode);

      const { error } = await supabase
        .from("rooms")
        .update({
          phase: "DRAW_AND_SECRET",
          interrogated_player_id: chosenPlayer.id,
          secret_role: chosenRole,
          question_id: chosenQuestion.id,
          peak_tension: 0,
          used_question_ids: nextUsedIds,
          updated_at: new Date().toISOString(),
        })
        .eq("code", activeRoomCode);

      if (error) {
        setErrorMessage(error.message);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleStartInterrogation = async () => {
    if (!activeRoomCode || !room) return;
    const canStart = room.host_id === playerId || room.interrogated_player_id === playerId;
    if (!canStart) return;

    setIsBusy(true);
    try {
      await supabase
        .from("rooms")
        .update({
          phase: "INTERROGATION",
          peak_tension: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("code", activeRoomCode);
    } finally {
      setIsBusy(false);
    }
  };

  const handleCastVote = async (choice: SecretRole) => {
    if (!activeRoomCode || room?.interrogated_player_id === playerId) return;

    setIsBusy(true);
    try {
      await supabase.from("votes").upsert(
        {
          room_code: activeRoomCode,
          voter_id: playerId,
          choice,
        },
        { onConflict: "room_code,voter_id" }
      );
      await refreshRoomState(activeRoomCode);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSyncPeakTension = useCallback(
    async (peak: number) => {
      if (!activeRoomCode || room?.host_id !== playerId) return;
      await supabase
        .from("rooms")
        .update({
          peak_tension: peak,
          updated_at: new Date().toISOString(),
        })
        .eq("code", activeRoomCode);
    },
    [activeRoomCode, playerId, room?.host_id]
  );

  const handleCloseRound = async (finalPeakTension: number) => {
    if (!activeRoomCode || !room || room.host_id !== playerId) return;

    setIsBusy(true);
    try {
      const actualRole = room.secret_role;
      const interrogatedId = room.interrogated_player_id;

      const { data: latestVotesData } = await supabase
        .from("votes")
        .select("*")
        .eq("room_code", activeRoomCode);

      const roundVotes = (latestVotesData as VoteRow[] | null) ?? votes;

      let wrongVotesCount = 0;
      const correctVoterIds = new Set<string>();

      for (const v of roundVotes) {
        if (actualRole && v.choice === actualRole) {
          correctVoterIds.add(v.voter_id);
        } else {
          wrongVotesCount += 1;
        }
      }

      const majorityFooled =
        roundVotes.length > 0 && wrongVotesCount > roundVotes.length / 2;

      for (const p of players) {
        let delta = 0;
        if (correctVoterIds.has(p.id)) {
          delta += 1;
        }
        if (interrogatedId && p.id === interrogatedId && majorityFooled) {
          delta += 2;
        }
        if (delta > 0) {
          await supabase
            .from("players")
            .update({ score: p.score + delta })
            .eq("id", p.id)
            .eq("room_code", activeRoomCode);
        }
      }

      await supabase
        .from("rooms")
        .update({
          phase: "REVEAL",
          peak_tension: finalPeakTension,
          updated_at: new Date().toISOString(),
        })
        .eq("code", activeRoomCode);

      await refreshRoomState(activeRoomCode);
    } finally {
      setIsBusy(false);
    }
  };

  const handleNextRound = async () => {
    if (!activeRoomCode || !room || room.host_id !== playerId) return;

    setIsBusy(true);
    try {
      await supabase.from("votes").delete().eq("room_code", activeRoomCode);
      await supabase
        .from("rooms")
        .update({
          phase: "LOBBY",
          interrogated_player_id: null,
          secret_role: null,
          question_id: null,
          peak_tension: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("code", activeRoomCode);
    } finally {
      setIsBusy(false);
    }
  };

  const isHost = Boolean(room && room.host_id === playerId);
  const phase: GamePhase = room?.phase ?? "LOBBY";
  const category: RoomCategoryFilter = room?.category ?? "mix";

  const interrogatedPlayer = useMemo(
    () => players.find((p) => p.id === room?.interrogated_player_id) ?? null,
    [players, room?.interrogated_player_id]
  );

  const activeQuestion: QuestionItem | null = useMemo(
    () => QUESTIONS.find((q) => q.id === room?.question_id) ?? null,
    [room?.question_id]
  );

  const isCurrentUserInterrogated =
    Boolean(room?.interrogated_player_id) &&
    room?.interrogated_player_id === playerId;

  const currentVote = useMemo(
    () => votes.find((v) => v.voter_id === playerId)?.choice ?? null,
    [votes, playerId]
  );

  const truthVotesCount = useMemo(
    () => votes.filter((v) => v.choice === "TRUTH").length,
    [votes]
  );

  const lieVotesCount = useMemo(
    () => votes.filter((v) => v.choice === "LIE").length,
    [votes]
  );

  const totalVoters = Math.max(
    0,
    players.filter((p) => p.id !== room?.interrogated_player_id).length
  );

  return (
    <ChibyLayout
      language={language}
      onChangeLanguage={(lang) => void handleChangeLanguage(lang)}
      roomBadge={activeRoomCode}
    >
      {phase === "LOBBY" ? (
        <LobbyView
          language={language}
          nickname={nickname}
          roomCodeInput={roomCodeInput}
          activeRoomCode={activeRoomCode}
          isHost={isHost}
          category={category}
          players={players}
          isBusy={isBusy}
          errorMessage={errorMessage}
          onChangeNickname={setNickname}
          onChangeRoomCodeInput={setRoomCodeInput}
          onCreateRoom={() => void handleCreateRoom()}
          onJoinRoom={() => void handleJoinRoom()}
          onChangeCategory={(cat) => void handleChangeCategory(cat)}
          onDrawPlayer={() => void handleDrawPlayer()}
        />
      ) : null}

      {phase === "DRAW_AND_SECRET" ? (
        <SecretRoleView
          language={language}
          interrogatedNickname={interrogatedPlayer?.nickname ?? ""}
          isCurrentUserInterrogated={isCurrentUserInterrogated}
          isHost={isHost}
          question={activeQuestion}
          secretRole={room?.secret_role ?? null}
          isBusy={isBusy}
          onStartInterrogation={() => void handleStartInterrogation()}
        />
      ) : null}

      {phase === "INTERROGATION" ? (
        <InterrogationView
          language={language}
          interrogatedNickname={interrogatedPlayer?.nickname ?? ""}
          isCurrentUserInterrogated={isCurrentUserInterrogated}
          isHost={isHost}
          question={activeQuestion}
          currentVote={currentVote}
          votesCount={votes.length}
          totalVoters={totalVoters}
          syncedPeakTension={room?.peak_tension ?? 0}
          isBusy={isBusy}
          onCastVote={(choice) => void handleCastVote(choice)}
          onSyncPeakTension={handleSyncPeakTension}
          onCloseRound={(peak) => void handleCloseRound(peak)}
        />
      ) : null}

      {phase === "REVEAL" ? (
        <RevealView
          language={language}
          interrogatedNickname={interrogatedPlayer?.nickname ?? ""}
          isHost={isHost}
          question={activeQuestion}
          secretRole={room?.secret_role ?? null}
          peakTension={room?.peak_tension ?? 0}
          truthVotesCount={truthVotesCount}
          lieVotesCount={lieVotesCount}
          players={players}
          isBusy={isBusy}
          onNextRound={() => void handleNextRound()}
        />
      ) : null}
    </ChibyLayout>
  );
}

export default App;