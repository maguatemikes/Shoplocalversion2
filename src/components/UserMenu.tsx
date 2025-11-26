import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Home,
} from "lucide-react";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [listingsCount, setListingsCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch claimed listings count on mount (for badge)
  useEffect(() => {
    if (user && (user.role === "vendor" || user.role === "pending_vendor")) {
      fetchClaimedListingsCount();
    }
  }, [user]);

  const fetchClaimedListingsCount = async () => {
    if (!user) return;

    try {
      // Fetch from GeoDirectory API - filter by user's email or ID
      const response = await fetch(
        `https://shoplocal.kinsta.cloud/wp-json/geodir/v2/places?author=${user.id}&claimed=1&per_page=50`
      );

      if (response.ok) {
        const data = await response.json();

        // TEMPORARY DEMO: If no claimed listings, set count to 2 for demo
        if (data.length === 0 && user.role === "vendor") {
          setListingsCount(3); // Demo count
        } else {
          setListingsCount(data.length);
        }
      }
    } catch (error) {
      console.error("Failed to fetch claimed listings count:", error);
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  // Show dashboard link for vendors
  const isVendor = user.role === "vendor" || user.role === "pending_vendor";

  const menuItems = [
    {
      label: "My Dashboard",
      icon: Home,
      onClick: () => {
        navigate("/dashboard");
        setIsOpen(false);
      },
      show: true,
      isPrimary: true,
    },
    {
      label: "Vendor Dashboard",
      icon: LayoutDashboard,
      onClick: () => {
        navigate("/vendor-dashboard");
        setIsOpen(false);
      },
      show: isVendor,
      badge: listingsCount > 0 ? listingsCount : undefined,
      isPrimary: false,
    },
    {
      label: "Account Settings",
      icon: Settings,
      onClick: () => {
        navigate("/account-settings");
        setIsOpen(false);
      },
      show: true,
      isPrimary: false,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors relative"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center relative">
          <User className="w-5 h-5 text-white" />
          {isVendor && listingsCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-xs text-white">{listingsCount}</span>
            </div>
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm text-gray-900">{user.displayName}</div>
          <div className="text-xs text-gray-500 capitalize">
            {user.role.replace("_", " ")}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm text-gray-900 mb-1">{user.displayName}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mt-2 ${
                user.role === "vendor"
                  ? "bg-green-100 text-green-700"
                  : user.role === "pending_vendor"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <span className="capitalize">{user.role.replace("_", " ")}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems
              .filter((item) => item.show)
              .map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-sky-500 transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 hover:bg-red-50 transition-colors flex items-center gap-3 text-left"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
