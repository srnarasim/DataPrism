import React from "react";
import { BarChart3, Loader2 } from "lucide-react";

export function LoadingScreen() {
  const [loadingStep, setLoadingStep] = React.useState(0);

  const steps = [
    "Initializing WebAssembly runtime...",
    "Loading DuckDB engine...",
    "Setting up data processing...",
    "Preparing analytics workspace...",
    "Almost ready...",
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <BarChart3 className="h-16 w-16 text-blue-600 animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          DataPrism Analytics Demo
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Experience the power of browser-based data analytics
        </p>

        {/* Loading steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 max-w-md mx-auto">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 ${
                  index === loadingStep
                    ? "text-blue-600 dark:text-blue-400"
                    : index < loadingStep
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <div className="flex-shrink-0">
                  {index < loadingStep ? (
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  ) : index === loadingStep ? (
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Loading info */}
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Loading high-performance WebAssembly engine</p>
          <p>This may take a few seconds on first load</p>
        </div>

        {/* Tech stack indicators */}
        <div className="mt-8 flex justify-center space-x-6">
          <div className="text-center">
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-1">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                WA
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              WebAssembly
            </span>
          </div>

          <div className="text-center">
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-1">
              <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                DB
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              DuckDB
            </span>
          </div>

          <div className="text-center">
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-1">
              <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">
                DP
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              DataPrism
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
