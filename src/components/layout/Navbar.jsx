import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import NotificationBell from "../notifications/NotificationBell";
import Avatar from "../common/Avatar";
import {
  Menu, X, Home, Bot, PenSquare, User, Bell, LogOut, Settings,
} from "lucide-react";

export { Avatar };

const NAV_LINKS = [
  { to: "/dashboard", label: "Home",   icon: Home },
  { to: "/ai/models", label: "AI Hub", icon: Bot,       match: "/ai/" },
  { to: "/create",    label: "Create", icon: PenSquare },
];

export default function Navbar() {
  const user         = useAuthStore((s) => s.user);
  const accessToken  = useAuthStore((s) => s.accessToken);
  const logoutMutation = useLogout();
  const { pathname } = useLocation();
  const navigate      = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const dropdownRef = useRef(null);
  const navRef      = useRef(null);

  // Close everything on route change
  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close desktop profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target))
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    logoutMutation.mutate();
  };

  const isActive = (to, match) =>
    match ? pathname.startsWith(match) : pathname === to;

  return (
    <nav ref={navRef} className="relative z-40 border-b border-gray-200 bg-white">
      <div className="w-full px-3 sm:px-6">
        <div className="flex justify-between h-14 items-center">

          {/* ── Logo ── */}
          <Link
            to={accessToken ? "/dashboard" : "/"}
            className="text-xl font-semibold text-gray-900"
          >
            Coduex
          </Link>

          {/* ── Desktop right side (nav links + actions) ── */}
          <div className="hidden md:flex items-center gap-6">
            {accessToken && NAV_LINKS.map(({ to, label, match }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm transition-colors ${
                  isActive(to, match)
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            ))}
            {accessToken && <NotificationBell />}

            {accessToken ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="cursor-pointer flex items-center justify-center"
                  aria-label="Open user menu"
                >
                  <Avatar user={user} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 border border-gray-200 rounded-xl bg-white shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                      >
                        <User size={14} /> Profile
                      </button>
                      <button
                        onClick={() => navigate("/notification-preferences")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                      >
                        <Bell size={14} /> Notifications
                      </button>
                      <button
                        onClick={() => navigate("/settings/privacy")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                      >
                        <Settings size={14} /> Privacy
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        {logoutMutation.isPending ? "Logging out…" : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm px-4 py-2 border rounded-lg ${
                    pathname === "/login"
                      ? "border-gray-900 text-gray-900 font-medium"
                      : "border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`text-sm px-4 py-2 border rounded-lg ${
                    pathname === "/signup"
                      ? "border-gray-900 text-gray-900 font-medium"
                      : "border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900"
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile right: bell + hamburger ── */}
          <div className="flex md:hidden items-center gap-2">
            {accessToken && <NotificationBell />}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile slide-down menu ── */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50">

          {/* User info */}
          {accessToken && user && (
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-3">
              <Avatar user={user} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
              </div>
            </div>
          )}

          {/* Nav links */}
          <div className="px-3 pt-2 pb-1 space-y-0.5">
            {accessToken &&
              NAV_LINKS.map(({ to, label, icon: Icon, match }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(to, match)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={17} className="shrink-0" />
                  {label}
                </Link>
              ))}
          </div>

          {/* Account actions */}
          {accessToken ? (
            <>
              <div className="mx-4 h-px bg-gray-100 my-1" />
              <div className="px-3 pb-1 space-y-0.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  <User size={17} className="shrink-0" /> Profile
                </Link>
                <Link
                  to="/notification-preferences"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  <Bell size={17} className="shrink-0" /> Notification Preferences
                </Link>
                <Link
                  to="/settings/privacy"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  <Settings size={17} className="shrink-0" /> Privacy & Settings
                </Link>
              </div>
              <div className="mx-4 h-px bg-gray-100 my-1" />
              <div className="px-3 pb-3">
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50 font-medium"
                >
                  <LogOut size={17} className="shrink-0" />
                  {logoutMutation.isPending ? "Logging out…" : "Logout"}
                </button>
              </div>
            </>
          ) : (
            <div className="px-3 pb-3 space-y-1.5">
              <Link
                to="/login"
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm border border-gray-300 text-gray-700 hover:border-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm bg-gray-900 text-white hover:bg-gray-700 font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
