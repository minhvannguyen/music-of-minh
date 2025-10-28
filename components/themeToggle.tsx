"use client";
import { useTheme } from "@/contexts/themeContext";
import { Switch } from "@/components/ui/switch";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Chế độ tối"
      />
      <span className="text-sm">Chế độ tối</span>
    </label>
  );
}