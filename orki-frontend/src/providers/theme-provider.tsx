"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "pink" | "blue" | "purple";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

// ─── Inline script injected before first paint ────────────────────────────
// Prevents flash by applying the stored theme synchronously.
const THEME_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('orki-theme');
    if (t === 'dark' || t === 'pink' || t === 'light' || t === 'blue' || t === 'purple') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch(e){}
})();
`.trim();

// ─── Provider ─────────────────────────────────────────────────────────────────

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("orki-theme") as Theme | null;
    if (stored === "dark" || stored === "pink" || stored === "light" || stored === "blue" || stored === "purple") return stored;
  } catch {
    // localStorage unavailable
  }
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem("orki-theme", next);
    } catch {
      // localStorage unavailable
    }
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  // On first mount, ensure data-theme attribute is in sync
  // (handles the case where ThemeScript could not run)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Script tag for flash prevention ──────────────────────────────────────────

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
      suppressHydrationWarning
    />
  );
}
