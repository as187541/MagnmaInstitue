// ============================================================
// CompareContext - Shared state for college comparison
// ============================================================

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CompareContextType {
  compareIds: string[];
  toggleCompare: (id: string) => void;
  isSelected: (id: string) => boolean;
  clearCompare: () => void;
  removeCompare: (id: string) => void;
}

const CompareContext = createContext<CompareContextType | null>(null);

const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const isSelected = useCallback((id: string) => compareIds.includes(id), [compareIds]);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const removeCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((i) => i !== id));
  }, []);

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, isSelected, clearCompare, removeCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
