import { createContext, useContext, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | null;

interface NavContext {
  direction: Direction;
  setDirection: (d: Direction) => void;
}

const NavContext = createContext<NavContext>({ direction: null, setDirection: () => {} });

export function useNavDirection() {
  return useContext(NavContext);
}

export function NavProvider({ children }: { children: ReactNode }) {
  return (
    <NavContext.Provider value={{ direction: null, setDirection: () => {} }}>
      {children}
    </NavContext.Provider>
  );
}
