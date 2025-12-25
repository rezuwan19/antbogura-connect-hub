import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Wifi, 
  LayoutDashboard, 
  Cable, 
  MessageSquare, 
  AlertTriangle, 
  LogOut, 
  Menu,
  X,
  Settings 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/connection-requests", label: "Connection Requests", icon: Cable },
  { path: "/admin/contact-messages", label: "Contact Messages", icon: MessageSquare },
  { path: "/admin/problem-reports", label: "Problem Reports", icon: AlertTriangle },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Wifi className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary">ANT Bogura</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r z-40 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b hidden lg:block">
          <div className="flex items-center gap-2">
            <Wifi className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">ANT Bogura</span>
          </div>
        </div>
        
        <div className="p-4 pt-20 lg:pt-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
          <div className="text-sm text-muted-foreground mb-3 truncate">
            {user?.email}
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
