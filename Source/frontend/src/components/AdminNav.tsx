import { Link } from "react-router-dom";
import { BugIcon, LineChartIcon, SettingsIcon, MessageSquareTextIcon } from "lucide-react";

export function AdminNav({ activePage, className = '' }: { activePage: string, className?: string }) {
  // 管理頁面導航的配置
  const navItems = [
    { id: "abuse", label: "惡意行為監測", icon: BugIcon, path: "/abuse-manager" },
    { id: "usage", label: "API使用管理", icon: LineChartIcon, path: "/usage-manager" },
    { id: "config", label: "小安設定", icon: SettingsIcon, path: "/system-config" },
    { id: "keywords", label: "關鍵字回覆", icon: MessageSquareTextIcon, path: "/keyword-manager" },
  ];

  return (
    <div className={`${className}`}>
      <div className="flex space-x-4 overflow-x-auto py-2 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <Link key={item.id} to={item.path}>
              <button
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors ${isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
