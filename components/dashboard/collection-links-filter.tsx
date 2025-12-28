"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface CollectionLinksFilterProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export function CollectionLinksFilter({
  totalCount,
  activeCount,
  inactiveCount,
}: CollectionLinksFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const currentStatus = searchParams.get("status") || "all";

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, pathname, router, searchParams]);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search links by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange("all")}
        >
          All
          <Badge variant="secondary" className="ml-2">
            {totalCount}
          </Badge>
        </Button>
        <Button
          variant={currentStatus === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange("active")}
        >
          Active
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
            {activeCount}
          </Badge>
        </Button>
        <Button
          variant={currentStatus === "inactive" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange("inactive")}
        >
          Inactive
          <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
            {inactiveCount}
          </Badge>
        </Button>
      </div>
    </div>
  );
}

