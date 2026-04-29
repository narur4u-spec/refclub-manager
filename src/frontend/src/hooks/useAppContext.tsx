import { type ReactNode, createContext, useContext, useState } from "react";
import type { ChapterId } from "../types";

interface AppContextValue {
  selectedChapter: ChapterId | "all";
  setSelectedChapter: (c: ChapterId | "all") => void;
}

const AppContext = createContext<AppContextValue>({
  selectedChapter: "all",
  setSelectedChapter: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | "all">(
    "all",
  );
  return (
    <AppContext.Provider value={{ selectedChapter, setSelectedChapter }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
