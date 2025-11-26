/**
 * Navigation.tsx - Global Navigation Component
 *
 * Provides the main navigation system for the ShopLocal marketplace.
 * Features a sticky header with three sections:
 * 1. Top bar (white) - Logo, search, and action buttons
 * 2. Main nav (dark) - Primary navigation links
 * 3. Promo banner (blue) - Marketing messages
 *
 * Fully responsive with mobile menu functionality.
 *
 * @module Navigation
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Phone,
  ChevronDown,
  Menu,
  X,
  LogIn,
  LogOut,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../contexts/AuthContext";

const logoImage =
  "https://wholesaleforeveryone.com/wp-content/uploads/2022/12/img_logo.webp";

/**
 * Navigation Component
 *
 * Main navigation bar with three-tier design:
 * - White top bar with logo, search, and user actions
 * - Dark navigation bar with main menu links
 * - Blue promotional banner
 *
 * @returns {JSX.Element} Complete navigation system
 */
export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  /**
   * Main navigation links configuration
   * Each link includes:
   * - label: Display text
   * - path: Route path
   * - hasDropdown: Whether to show dropdown indicator (future enhancement)
   */
  const mainNavLinks = [
    { label: "Shop Local", path: "/products", hasDropdown: true },
    { label: "Vendors", path: "/vendors", hasDropdown: true },
    { label: "Deals", path: "/deals", hasDropdown: false },
    { label: "How It Works", path: "/how-it-works", hasDropdown: false },
    { label: "Become a Seller", path: "/sell", hasDropdown: false },
    { label: "Help", path: "/help", hasDropdown: true },
    { label: "About", path: "/about", hasDropdown: false },
  ];

  return (
    <nav className="sticky top-0 z-50">
      {/* ============================================
          TOP BAR - WHITE SECTION
          Contains logo, search bar, and action buttons
          ============================================ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clickable, navigates to homepage */}
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <img
                src={logoImage}
                alt="Wholesale For Everyone"
                className="h-10"
              />
            </div>

            {/* Search Bar - Center (Desktop only) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                {/* Search Input - Triggers search on Enter key */}
                <input
                  type="text"
                  placeholder="Search products..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate("/search");
                    }
                  }}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                />
                {/* Search Icon Button */}
                <button
                  onClick={() => navigate("/search")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Search className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 ">
              {/* Cart Button with Badge (Desktop only) */}
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="flex flex-col items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {/* Cart Item Count Badge */}
                <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span className="text-xs">Checkout</span>
              </button>

              {/* Contact Us Button (Desktop only) */}
              <button
                onClick={() => navigate("/contact")}
                className="flex flex-col items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs">Contact Us</span>
              </button>
            </div>
            {/* Right Action Icons (Desktop) and Mobile Menu Button */}
            <div className="flex items-center justify-end md:justify-between  ml-8 ">
              {/* Left Group: Checkout and Contact */}

              {/* Right Group: User Menu or Login/Register */}
              <div className="hidden md:flex items-center gap-6">
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate("/login")}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="text-sm">Login</span>
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                className="md:hidden p-2 -mr-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN NAVIGATION - DARK SECTION
          Primary navigation links (Desktop only)
          ============================================ */}
      <div className="bg-gray-900 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12">
            {mainNavLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-1 px-4 py-3 text-white transition-colors text-sm ${
                  location.pathname === link.path
                    ? "bg-gray-800"
                    : "hover:bg-gray-800"
                }`}
              >
                {link.label}
                {/* Show dropdown indicator if configured */}
                {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          PROMOTIONAL BANNER - BLUE SECTION
          Marketing messages and promotions
          ============================================ */}
      <div className="bg-sky-600 text-white text-center py-2">
        <p className="text-sm">
          <span className="font-semibold">Free Shipping</span> on Orders over
          $50 | <span className="font-semibold">Support Local Sellers</span>
        </p>
      </div>

      {/* ============================================
          MOBILE MENU
          Slide-down menu for mobile devices
          ============================================ */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {mainNavLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false); // Close menu after navigation
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-md text-sm ${
                    location.pathname === link.path
                      ? "bg-sky-50 text-sky-900"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Mobile Action Buttons Grid */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
              {/* Account/Login Button */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    navigate("/account-settings");
                    setMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs">Account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="text-xs">Login</span>
                </button>
              )}

              {/* Cart Button with Badge */}
              <button
                onClick={() => {
                  setCartOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center gap-1 p-3 text-gray-700 hover:bg-gray-50 rounded-md relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {/* Cart Item Count Badge */}
                <span className="absolute top-1 right-1 bg-sky-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span className="text-xs">Checkout</span>
              </button>

              {/* Contact Button */}
              <button
                onClick={() => {
                  navigate("/contact");
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center gap-1 p-3 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs">Contact</span>
              </button>
            </div>

            {/* Sign Up Button (Mobile - Only when not authenticated) */}
            {!isAuthenticated && (
              <div className="pt-3">
                <button
                  onClick={() => {
                    navigate("/register");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* User Info & Logout (Mobile - Only when authenticated) */}
            {isAuthenticated && user && (
              <div className="pt-3 border-t border-gray-200 mt-3">
                <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                  <div className="text-sm text-gray-900 mb-1">
                    {user.displayName}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{user.email}</div>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      user.role === "vendor"
                        ? "bg-green-100 text-green-700"
                        : user.role === "pending_vendor"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="capitalize">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* My Dashboard Button (Mobile) - For all authenticated users */}
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
                >
                  <Home className="w-4 h-4" />
                  <span>My Dashboard</span>
                </button>

                {/* Vendor Dashboard Button (Mobile) */}
                {(user.role === "vendor" || user.role === "pending_vendor") && (
                  <button
                    onClick={() => {
                      navigate("/vendor-dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Vendor Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </nav>
  );
}
