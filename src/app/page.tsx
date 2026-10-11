"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sun,
  Moon,
  Trash2,
  Edit3,
  Plus,
  X,
  Filter,
  StickyNote,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
  CloudCheck,
} from "lucide-react";

type CategoryType = "할 일" | "아이디어" | "기타";
type FilterCategory = "전체" | CategoryType;
type ColorTone = "yellow" | "pink" | "green" | "blue";

interface NoteItem {
  id: string; // timestamp 값
  timestamp: string;
  datetime: string;
  category: CategoryType;
  content: string;
  color: ColorTone;
  state: CategoryType;
  order: number;
  rotation: number;
}

const COLOR_STYLES: Record<
  ColorTone,
  {
    bgLight: string;
    borderLight: string;
    badgeBg: string;
    badgeText: string;
    bgDark: string;
    borderDark: string;
    badgeBgDark: string;
    badgeTextDark: string;
  }
> = {
  yellow: {
    bgLight: "bg-[#FEF9C3]",
    borderLight: "border-amber-200/80",
    badgeBg: "bg-amber-900/10",
    badgeText: "text-amber-900",
    bgDark: "dark:bg-[#342D11]",
    borderDark: "dark:border-amber-500/30",
    badgeBgDark: "dark:bg-amber-400/20",
    badgeTextDark: "dark:text-amber-200",
  },
  pink: {
    bgLight: "bg-[#FCE7F3]",
    borderLight: "border-pink-200/80",
    badgeBg: "bg-pink-900/10",
    badgeText: "text-pink-900",
    bgDark: "dark:bg-[#3B1724]",
    borderDark: "dark:border-pink-500/30",
    badgeBgDark: "dark:bg-pink-400/20",
    badgeTextDark: "dark:text-pink-200",
  },
  green: {
    bgLight: "bg-[#DCFCE7]",
    borderLight: "border-emerald-200/80",
    badgeBg: "bg-emerald-900/10",
    badgeText: "text-emerald-900",
    bgDark: "dark:bg-[#12311E]",
    borderDark: "dark:border-emerald-500/30",
    badgeBgDark: "dark:bg-emerald-400/20",
    badgeTextDark: "dark:text-emerald-200",
  },
  blue: {
    bgLight: "bg-[#E0F2FE]",
    borderLight: "border-sky-200/80",
    badgeBg: "bg-sky-900/10",
    badgeText: "text-sky-900",
    bgDark: "dark:bg-[#132A3E]",
    borderDark: "dark:border-sky-500/30",
    badgeBgDark: "dark:bg-sky-400/20",
    badgeTextDark: "dark:text-sky-200",
  },
};

const COLOR_KEYS: ColorTone[] = ["yellow", "pink", "green", "blue"];
const CATEGORIES: CategoryType[] = ["할 일", "아이디어", "기타"];

function formatCurrentKoreanDateTime() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = dayNames[d.getDay()];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${date} (${dayName}) ${hours}:${minutes}`;
}

function parseDateTimeString(datetimeStr: string) {
  // 예: "2026.10.11 (일) 14:30"
  if (datetimeStr && datetimeStr.includes(" ")) {
    const parts = datetimeStr.split(" ");
    if (parts.length >= 3) {
      return {
        dateStr: `${parts[0]} ${parts[1]}`,
        timeStr: parts[2],
      };
    }
  }
  return { dateStr: datetimeStr, timeStr: "" };
}

export default function PostItTodoApp() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [inputText, setInputText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("할 일");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("전체");

  // 편집 모달 상태
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<CategoryType>("할 일");

  // 드래그 앤 드롭 상태
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeDragNoteId = useRef<string | null>(null);

  // 다크모드 적용
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
  }, [isDark]);

  const getRandomRotation = (): number => {
    return Number(((Math.random() - 0.5) * 3.6).toFixed(1));
  };

  const getRandomColor = (): ColorTone => {
    return COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
  };

  // 1. Google Sheets에서 전체 메모 조회 (Read)
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/notes");
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        const loaded: NoteItem[] = result.data.map((item: any, idx: number) => ({
          id: String(item.timestamp || `tmp-${idx}`),
          timestamp: String(item.timestamp || Date.now()),
          datetime: item.datetime || formatCurrentKoreanDateTime(),
          category: (item.state || "할 일") as CategoryType,
          content: item.content || "",
          color: (COLOR_KEYS.includes(item.color) ? item.color : "yellow") as ColorTone,
          state: (item.state || "할 일") as CategoryType,
          order: typeof item.order === "number" ? item.order : idx,
          rotation: getRandomRotation(),
        }));
        setNotes(loaded);
      } else {
        throw new Error(result.error || "데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "구글 시트와 통신할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 새로고침 시 데이터 불러와 복원
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // 2. 포스트잇 붙이기 (Create)
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSaving) return;

    setIsSaving(true);
    setErrorMsg(null);

    const clientTimestamp = String(Date.now());
    const formattedDatetime = formatCurrentKoreanDateTime();
    const randomColor = getRandomColor();
    const newOrder = notes.length;

    // 즉각적인 UI 반영 (Optimistic UI)
    const tempNote: NoteItem = {
      id: clientTimestamp,
      timestamp: clientTimestamp,
      datetime: formattedDatetime,
      category: selectedCategory,
      content: trimmed,
      color: randomColor,
      state: selectedCategory,
      order: newOrder,
      rotation: getRandomRotation(),
    };

    setNotes((prev) => [tempNote, ...prev]);
    setInputText("");
    setJustAddedId(clientTimestamp);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          data: {
            timestamp: clientTimestamp,
            datetime: formattedDatetime,
            category: selectedCategory,
            content: trimmed,
            color: randomColor,
            state: selectedCategory,
            order: newOrder,
          },
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "메모 저장에 실패했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("구글 시트 저장 실패: " + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setJustAddedId(null), 600);
    }
  };

  // 3. 메모 수정 (Update)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || isSaving) return;
    const trimmed = editContent.trim();
    if (!trimmed) return;

    setIsSaving(true);
    setErrorMsg(null);

    // 즉시 로컬 state 갱신
    setNotes((prev) =>
      prev.map((item) =>
        item.id === editingNote.id
          ? { ...item, content: trimmed, category: editCategory, state: editCategory }
          : item
      )
    );
    const targetTimestamp = editingNote.timestamp;
    setEditingNote(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          data: {
            timestamp: targetTimestamp,
            content: trimmed,
            category: editCategory,
            state: editCategory,
          },
        }),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "메모 수정에 실패했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("구글 시트 수정 실패: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. 메모 삭제 (Delete)
  const handleDeleteNote = async (id: string, timestamp: string) => {
    if (isSaving) return;
    if (!confirm("이 포스트잇을 삭제하시겠습니까?")) return;

    setIsSaving(true);
    setErrorMsg(null);

    // 즉각 로컬 제거
    setNotes((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          data: { timestamp },
        }),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "메모 삭제에 실패했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("구글 시트 삭제 실패: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 5. 드래그 앤 드롭 순서 변경 구글 시트 저장 (Reorder)
  const syncOrderToServer = async (updatedList: NoteItem[]) => {
    try {
      const reorderData = updatedList.map((item, index) => ({
        timestamp: item.timestamp,
        order: index,
      }));

      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          data: reorderData,
        }),
      });
    } catch (err) {
      console.error("순서 동기화 실패:", err);
    }
  };

  // HTML5 Drag and Drop 핸들러
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);

    const target = (e.currentTarget as HTMLElement).closest(".note-card") as HTMLElement;
    if (target) {
      e.dataTransfer.setDragImage(target, target.offsetWidth / 2, 20);
    }
  };

  const handleDragOverCard = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDropOnCard = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    setNotes((prev) => {
      const fromIndex = prev.findIndex((n) => n.id === draggedId);
      const toIndex = prev.findIndex((n) => n.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      syncOrderToServer(updated);
      return updated;
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // 포인터/터치 드래그 앤 드롭
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    activeDragNoteId.current = id;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDraggedId(id);
    setIsPointerDragging(true);
    setDragOffset({ x: 0, y: 0 });

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - dragStartPos.current.x;
      const dy = moveEvent.clientY - dragStartPos.current.y;
      setDragOffset({ x: dx, y: dy });

      const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const hoverCard = el?.closest<HTMLElement>("[data-note-id]");
      if (hoverCard) {
        const hoverId = hoverCard.getAttribute("data-note-id");
        if (hoverId && hoverId !== activeDragNoteId.current) {
          setDragOverId(hoverId);
        }
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      const el = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const dropCard = el?.closest<HTMLElement>("[data-note-id]");
      const targetId = dropCard?.getAttribute("data-note-id");

      if (targetId && activeDragNoteId.current && targetId !== activeDragNoteId.current) {
        setNotes((prev) => {
          const fromIndex = prev.findIndex((n) => n.id === activeDragNoteId.current);
          const toIndex = prev.findIndex((n) => n.id === targetId);
          if (fromIndex === -1 || toIndex === -1) return prev;
          const updated = [...prev];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);
          syncOrderToServer(updated);
          return updated;
        });
      }

      setIsPointerDragging(false);
      setDraggedId(null);
      setDragOverId(null);
      setDragOffset({ x: 0, y: 0 });
      activeDragNoteId.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const filteredNotes = notes.filter((n) => {
    if (filterCategory === "전체") return true;
    return n.category === filterCategory;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 1. 최상단 헤더 */}
      <header className="sticky top-0 z-40 bg-[#F4F4F5]/90 dark:bg-[#121214]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 relative flex items-center justify-between">
          {/* 좌측 로고 아이콘 */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-md shadow-amber-300/40 -rotate-3">
              <StickyNote className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          {/* 최상단 중앙 제목 (Post-It To Do List) */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
              Post-It To Do List
            </h1>
          </div>

          {/* 우측 컨트롤 (새로고침, 상태 인디케이터 & 다크모드) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isSaving && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                저장 중...
              </span>
            )}

            <button
              onClick={fetchNotes}
              disabled={isLoading}
              aria-label="데이터 새로고침"
              title="구글 시트 데이터 새로고침"
              className="p-2.5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-200 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="테마 전환"
              type="button"
              className="p-2.5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-200 shadow-sm transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="w-5 h-5 text-stone-700 transition-transform -rotate-12 hover:rotate-0" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 에러 알림 배너 */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* 2. 메인 페이지 가운데 메모 작성 섹션 */}
        <section aria-label="메모 작성 섹션" className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-stone-200/90 dark:border-zinc-800 relative">
            <form onSubmit={handleAddNote} className="space-y-5">
              {/* 범주 (카테고리 선택) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2.5">
                  범주 (카테고리 선택)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-amber-400 text-stone-900 shadow-sm shadow-amber-300/40 scale-102"
                            : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 포스트잇 쓰는 공간 */}
              <div>
                <label
                  htmlFor="note-input"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2"
                >
                  포스트잇 쓰는 공간
                </label>
                <div className="relative rounded-2xl p-1 bg-stone-50 dark:bg-zinc-800/70 border border-stone-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all">
                  <textarea
                    id="note-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    maxLength={300}
                    rows={4}
                    placeholder="오늘의 생각이나 할 일을 포스트잇에 적어보세요..."
                    className="w-full bg-transparent border-0 resize-none px-3.5 py-3 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 text-sm sm:text-base leading-relaxed focus:outline-none"
                  />
                  <div className="flex items-center justify-end px-3.5 pb-2 pt-1 text-xs text-stone-400 dark:text-zinc-500 font-mono">
                    <span>{inputText.length} / 300자</span>
                  </div>
                </div>
              </div>

              {/* 하단 포스트잇 붙이기 버튼 */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSaving}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-900 font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                  )}
                  <span>포스트잇 붙이기</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 3. 포스트잇 목록 섹션 */}
        <section aria-label="메모 보드 섹션" className="space-y-6">
          {/* 목록 헤더 & 카테고리 필터링 드롭다운 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
                여태껏 쓴 포스트잇 목록
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-mono">
                  {filteredNotes.length}
                </span>
              </h2>
            </div>

            {/* 카테고리 필터 드롭다운 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
                <Filter className="w-4 h-4 text-stone-500 dark:text-zinc-400" />
                <label htmlFor="categoryFilter" className="text-xs font-semibold text-stone-600 dark:text-zinc-400">
                  카테고리 필터:
                </label>
                <select
                  id="categoryFilter"
                  value={filterCategory}
                  onChange={(e) =>
                    setFilterCategory(e.target.value as FilterCategory)
                  }
                  className="bg-transparent text-sm font-semibold text-stone-900 dark:text-zinc-100 border-none focus:outline-none cursor-pointer pr-2"
                >
                  <option value="전체" className="dark:bg-zinc-900 text-stone-900 dark:text-white">
                    전체 보기 ({notes.length})
                  </option>
                  <option value="할 일" className="dark:bg-zinc-900 text-stone-900 dark:text-white">
                    할 일 ({notes.filter((n) => n.category === "할 일").length})
                  </option>
                  <option value="아이디어" className="dark:bg-zinc-900 text-stone-900 dark:text-white">
                    아이디어 ({notes.filter((n) => n.category === "아이디어").length})
                  </option>
                  <option value="기타" className="dark:bg-zinc-900 text-stone-900 dark:text-white">
                    기타 ({notes.filter((n) => n.category === "기타").length})
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* 로딩 인디케이터 */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-400 dark:text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm">구글 시트에서 포스트잇을 불러오는 중...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="py-20 text-center bg-white/50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-stone-300 dark:border-zinc-800">
              <p className="text-stone-500 dark:text-zinc-400 text-base">
                등록된 포스트잇이 없습니다.
              </p>
              <p className="text-stone-400 dark:text-zinc-500 text-xs mt-1">
                위쪽 입력창에서 첫 번째 메모를 붙여보세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 pt-4">
              {filteredNotes.map((note) => {
                const colorConfig = COLOR_STYLES[note.color];
                const isJustAdded = note.id === justAddedId;
                const isBeingDragged = draggedId === note.id;
                const isDragOver = dragOverId === note.id;
                const { dateStr, timeStr } = parseDateTimeString(note.datetime);

                const dynamicTransform =
                  isBeingDragged && isPointerDragging
                    ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.05) rotate(${note.rotation + 2}deg)`
                    : `rotate(${note.rotation}deg)`;

                return (
                  <div
                    key={note.id}
                    data-note-id={note.id}
                    onDragOver={(e) => handleDragOverCard(e, note.id)}
                    onDrop={() => handleDropOnCard(note.id)}
                    style={{
                      transform: dynamicTransform,
                      zIndex: isBeingDragged ? 50 : 1,
                      transition: isBeingDragged && isPointerDragging ? "none" : "transform 0.25s ease, box-shadow 0.25s ease",
                    }}
                    className={`note-card note-texture group relative p-6 pt-7 rounded-3xl transition-all duration-200 flex flex-col justify-between border ${
                      colorConfig.bgLight
                    } ${colorConfig.bgDark} ${colorConfig.borderLight} ${
                      colorConfig.borderDark
                    } ${
                      isJustAdded ? "animate-stick" : ""
                    } ${
                      isDragOver
                        ? "ring-2 ring-amber-500 ring-offset-2 scale-102"
                        : ""
                    } ${
                      isBeingDragged
                        ? "shadow-2xl opacity-95 cursor-grabbing"
                        : "shadow-sm hover:shadow-xl hover:-translate-y-1.5"
                    }`}
                  >
                    {/* 상단 가운데 흰색 드래그 핸들 */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="포스트잇 드래그 핸들"
                      draggable
                      onDragStart={(e) => handleDragStart(e, note.id)}
                      onDragEnd={handleDragEnd}
                      onPointerDown={(e) => handlePointerDown(e, note.id)}
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-7 bg-white/95 dark:bg-zinc-800/95 border border-stone-200/90 dark:border-zinc-700 rounded-md shadow-sm flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-zinc-700 transition-colors z-20 touch-none select-none"
                      title="이 부분을 잡고 드래그하여 순서를 변경하세요"
                    >
                      <div className="grid grid-cols-3 gap-1">
                        <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-zinc-400"></span>
                        <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-zinc-400"></span>
                        <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-zinc-400"></span>
                        <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-zinc-400"></span>
                        <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-zinc-400"></span>
                        <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-zinc-400"></span>
                      </div>
                    </div>

                    {/* 카드 내용 상단 */}
                    <div>
                      {/* 카테고리 태그 */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`font-bold text-xs tracking-wide px-2.5 py-1 rounded-lg ${colorConfig.badgeBg} ${colorConfig.badgeText} ${colorConfig.badgeBgDark} ${colorConfig.badgeTextDark}`}
                        >
                          #{note.category}
                        </span>
                      </div>

                      {/* 메모 본문 내용 */}
                      <p className="text-stone-800 dark:text-zinc-100 text-sm leading-relaxed whitespace-pre-wrap font-medium break-keep">
                        {note.content}
                      </p>
                    </div>

                    {/* 카드 내용 하단 */}
                    <div className="pt-4 mt-5 border-t border-stone-900/10 dark:border-white/10 flex items-end justify-between">
                      {/* 왼쪽 하단: 연월일 시간 요일 */}
                      <div className="flex items-start gap-1.5 text-[11px] text-stone-500/70 dark:text-zinc-400/60 font-mono leading-tight">
                        <Clock className="w-3.5 h-3.5 mt-0.5 opacity-80" />
                        <div>
                          <div>{dateStr}</div>
                          {timeStr && <div>{timeStr}</div>}
                        </div>
                      </div>

                      {/* 오른쪽 버튼 그룹 (편집, 삭제) */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNote(note);
                            setEditContent(note.content);
                            setEditCategory(note.category);
                          }}
                          className="p-1.5 rounded-xl text-stone-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="메모 편집"
                        >
                          <Edit3 className="w-4 h-4 stroke-[2]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id, note.timestamp)}
                          className="p-1.5 rounded-xl text-stone-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="메모 삭제"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 4. 메모 편집 모달 */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 dark:border-zinc-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                포스트잇 메모 편집
              </h3>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2">
                  카테고리 변경
                </label>
                <div className="flex gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        editCategory === cat
                          ? "bg-amber-400 text-stone-900 shadow-xs"
                          : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2">
                  메모 내용
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={300}
                  rows={5}
                  className="w-full rounded-2xl p-3.5 bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-stone-900 shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>수정 완료</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 푸터 영역 */}
      <footer className="mt-20 border-t border-stone-200/90 dark:border-zinc-800/90 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xs py-8 transition-colors text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs text-stone-500 dark:text-zinc-400">
            Copyright Post-It To Do List by KYUNGROK KIM
          </p>
        </div>
      </footer>
    </div>
  );
}
