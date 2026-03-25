import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import NotificationBell from "../notifications/NotificationBell";
import Avatar from "../common/Avatar";

export { Avatar };

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logoutMutation = useLogout();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setOpen(false);
    logoutMutation.mutate();
  };


  return (
    <nav className="border-b border-gray-200">
      <div className="w-full px-6">
        <div className="flex justify-between h-15 items-center">
          <Link
            to={accessToken ? "/dashboard" : "/"}
            className="text-xl font-semibold text-gray-900"
          >
            Coduex
          </Link>

          <div className="flex items-center gap-6">
            {accessToken && (
              <div className="flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className={`text-sm ${pathname === "/dashboard" ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"}`}
                >
                  Home
                </Link>
                <Link
                  to="/create"
                  className={`text-sm ${pathname === "/create" ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"}`}
                >
                  Create
                </Link>
              </div>
            )}
            {accessToken && <NotificationBell />}
            {accessToken ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen((prev) => !prev)}
                  className="cursor-pointer flex items-center justify-center"
                  aria-label="Open user menu"
                >
                  <Avatar user={user} />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 border border-gray-200 rounded-lg bg-white shadow-sm z-50">
                    <div className="py-1">
                      <button
                        onClick={() => { setOpen(false); navigate("/profile"); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => { setOpen(false); navigate("/notification-preferences"); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        Notification Preferences
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          disabled={logoutMutation.isPending}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                        >
                          {logoutMutation.isPending ? "Logging out..." : "Logout"}
                        </button>
                      </div>
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
        </div>
      </div>
    </nav>
  );
}
