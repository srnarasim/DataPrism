import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Database,
  LineChart,
  Terminal,
  Puzzle,
  Zap,
  Info,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

import { useTheme } from "../contexts/ThemeContext";
import { useDataPrism } from "../contexts/DataPrismContext";
import { cn } from "../utils/cn";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isInitialized, initializationError } = useDataPrism();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: BarChart3 },
    { name: "Data Explorer", href: "/explorer", icon: Database },
    { name: "Visualizations", href: "/visualizations", icon: LineChart },
    { name: "Query Lab", href: "/query-lab", icon: Terminal },
    { name: "Plugins Demo", href: "/plugins", icon: Puzzle },
    { name: "Performance", href: "/performance", icon: Zap },
    { name: "About", href: "/about", icon: Info },
  ];

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden",
        )}
      >
        <div
          className="fixed inset-0 bg-black/20"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DataPrism
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <MobileNavigation
            navigation={navigation}
            currentPath={location.pathname}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4 shadow-sm">
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DataPrism
              </span>
            </Link>
          </div>
          <DesktopNavigation
            navigation={navigation}
            currentPath={location.pathname}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <StatusIndicator
                isInitialized={isInitialized}
                error={initializationError}
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Theme toggle */}
              <button
                onClick={() => {
                  const themes: Array<typeof theme> = [
                    "light",
                    "dark",
                    "system",
                  ];
                  const currentIndex = themes.indexOf(theme);
                  const nextIndex = (currentIndex + 1) % themes.length;
                  setTheme(themes[nextIndex]);
                }}
                className="flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title={`Current: ${theme} (${resolvedTheme})`}
              >
                <ThemeIcon className="h-5 w-5" />
              </button>

              {/* Version info */}
              <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                v1.0.0
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

interface NavigationProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  currentPath: string;
}

function DesktopNavigation({ navigation, currentPath }: NavigationProps) {
  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      isActive
                        ? "bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium",
                    )}
                  >
                    <Icon
                      className={cn(
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                        "h-6 w-6 shrink-0",
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </nav>
  );
}

function MobileNavigation({ navigation, currentPath }: NavigationProps) {
  return (
    <nav className="mt-5 px-2">
      <ul role="list" className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;

          return (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  isActive
                    ? "bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700",
                  "group flex gap-x-3 rounded-md p-2 text-base font-medium",
                )}
              >
                <Icon
                  className={cn(
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                    "h-6 w-6 shrink-0",
                  )}
                />
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

interface StatusIndicatorProps {
  isInitialized: boolean;
  error: Error | null;
}

function StatusIndicator({ isInitialized, error }: StatusIndicatorProps) {
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-sm font-medium">Engine Error</span>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm font-medium">Initializing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
      <div className="h-2 w-2 rounded-full bg-green-500" />
      <span className="text-sm font-medium">Engine Ready</span>
    </div>
  );
}
