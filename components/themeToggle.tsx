"use client";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/themeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-md bg-yellow-500 text-white dark:bg-yellow-400 dark:text-white transition"
      variant="default"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
