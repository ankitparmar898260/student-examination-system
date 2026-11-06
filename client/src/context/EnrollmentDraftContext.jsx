import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

/**
 * Context: EnrollmentDraftContext
 * Purpose: Manages persistent draft student selections bound to a specific examId.
 * Persists under a single constant key without guesswork, preventing infinite cross-tab sync loops.
 */

const EnrollmentDraftContext = createContext(null);
const STORAGE_KEY = "enrollment-draft-v1";

const readInitialDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const examId = parsed?.examId ? String(parsed.examId) : null;
      const ids = Array.isArray(parsed?.ids)
        ? new Set(parsed.ids.map(Number))
        : new Set();
      return { examId, ids };
    }
  } catch (err) {
    console.error("Failed to parse enrollment draft from localStorage:", err);
  }
  return { examId: null, ids: new Set() };
};

export function EnrollmentDraftProvider({ children }) {
  const initial = readInitialDraft();
  const [draftExamId, setDraftExamId] = useState(initial.examId);
  const [selectedIds, setSelectedIds] = useState(initial.ids);

  // Sync state to localStorage whenever draftExamId or selectedIds changes
  // Avoids cross-tab infinite loop by omitting variable timestamps and comparing serialized value
  useEffect(() => {
    try {
      if (selectedIds.size === 0) {
        if (localStorage.getItem(STORAGE_KEY) !== null) {
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        const sortedIds = Array.from(selectedIds).sort((a, b) => a - b);
        const serialized = JSON.stringify({
          examId: draftExamId ? String(draftExamId) : null,
          ids: sortedIds,
        });
        const currentRaw = localStorage.getItem(STORAGE_KEY);
        if (currentRaw !== serialized) {
          localStorage.setItem(STORAGE_KEY, serialized);
        }
      }
    } catch (err) {
      console.error("Failed to persist enrollment draft to localStorage:", err);
    }
  }, [draftExamId, selectedIds]);

  // Sync draft across multiple browser tabs via storage event
  useEffect(() => {
    const handleStorageEvent = (event) => {
      if (event.key === STORAGE_KEY) {
        try {
          if (!event.newValue) {
            setDraftExamId(null);
            setSelectedIds(new Set());
          } else {
            const parsed = JSON.parse(event.newValue);
            const newExamId = parsed?.examId ? String(parsed.examId) : null;
            const newIds = Array.isArray(parsed?.ids)
              ? new Set(parsed.ids.map(Number))
              : new Set();

            setDraftExamId(newExamId);
            setSelectedIds(newIds);
          }
        } catch (err) {
          console.error("Failed to sync enrollment draft from storage event:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  const toggle = useCallback((id, examId) => {
    const numericId = Number(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(numericId)) {
        next.delete(numericId);
      } else {
        next.add(numericId);
      }

      if (next.size === 0) {
        setDraftExamId(null);
      } else if (examId) {
        setDraftExamId(String(examId));
      }

      return next;
    });
  }, []);

  const addMany = useCallback((ids, examId) => {
    if (!ids || ids.length === 0) return;
    if (examId) {
      setDraftExamId(String(examId));
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(Number(id)));
      return next;
    });
  }, []);

  const removeMany = useCallback((ids) => {
    if (!ids || ids.length === 0) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(Number(id)));
      if (next.size === 0) {
        setDraftExamId(null);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setDraftExamId(null);
    setSelectedIds(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear enrollment draft from localStorage:", err);
    }
  }, []);

  const value = {
    draftExamId,
    setDraftExamId,
    selectedIds,
    toggle,
    addMany,
    removeMany,
    clear,
  };

  return (
    <EnrollmentDraftContext.Provider value={value}>
      {children}
    </EnrollmentDraftContext.Provider>
  );
}

export function useEnrollmentDraft() {
  const context = useContext(EnrollmentDraftContext);
  if (!context) {
    throw new Error("useEnrollmentDraft must be used within an EnrollmentDraftProvider");
  }
  return context;
}
