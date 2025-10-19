import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/themeToggle";
import { Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TestUi() {
  return (
    <div className="flex flex-wrap gap-4 p-10">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button variant="link">Link</Button>
      <Button size="icon">⭐</Button>

      <ThemeToggle />
      <Button size="sm" disabled>
      <Loader2Icon className="animate-spin" />
      Please wait
    </Button>
    <Input type="email" placeholder="Email" />  
    <div className="grid w-full max-w-sm items-center gap-3">
      <label htmlFor="picture">Picture</label>
      <Input id="picture" type="file" />
    </div>
    </div>
  );
}
