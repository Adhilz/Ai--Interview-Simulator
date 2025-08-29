import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, User, FileText, Play, Star, Settings, LayoutDashboard } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Resume Upload", href: "/resume-upload", icon: FileText },
  { label: "Interview Setup", href: "/interview-setup", icon: Play },
  { label: "AI Interview", href: "/ai-interview", icon: User },
  { label: "Feedback & Results", href: "/feedback-results", icon: Star },
  { label: "Analytics", href: "/performance-analytics", icon: BarChart3 },
  { label: "History", href: "/feedback-history", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="w-full flex flex-row md:flex-col gap-2 md:gap-4 p-2 md:p-6 bg-background/80 border-b md:border-b-0 md:border-r border-border">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md hover:bg-primary/10 transition-colors text-base font-medium",
            pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
