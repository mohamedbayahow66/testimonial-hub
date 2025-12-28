import { Sparkles } from "lucide-react";

/**
 * Loading skeleton for the public widget display page
 */
export default function WidgetLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header skeleton */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border shadow-sm p-6 space-y-4"
            >
              {/* Quote icon placeholder */}
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
              
              {/* Rating placeholder */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
              
              {/* Text placeholder */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
              
              {/* Author placeholder */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-gray-300" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

