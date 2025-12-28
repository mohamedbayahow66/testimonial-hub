"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const presetColors = [
  { name: "Purple", value: "#7c3aed" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Slate", value: "#64748b" },
  { name: "Gray", value: "#6b7280" },
];

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      onChange(color);
    }
  };

  const isPresetSelected = presetColors.some((c) => c.value === value);

  return (
    <div className="space-y-4">
      {label && <Label>{label}</Label>}
      
      {/* Preset colors */}
      <div className="grid grid-cols-6 gap-3">
        {presetColors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              "w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 relative",
              value === color.value
                ? "border-foreground ring-2 ring-offset-2 ring-primary"
                : "border-transparent"
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {value === color.value && (
              <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>

      {/* Custom color input */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg border-2 shrink-0",
            !isPresetSelected && value === customColor
              ? "border-foreground ring-2 ring-offset-2 ring-primary"
              : "border-muted"
          )}
          style={{ backgroundColor: customColor }}
        />
        <div className="flex-1">
          <Label htmlFor="custom-color" className="text-xs text-muted-foreground">
            Custom color (hex)
          </Label>
          <Input
            id="custom-color"
            type="text"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            placeholder="#7c3aed"
            className="font-mono"
            maxLength={7}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-lg border bg-card">
        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-md text-white text-sm font-medium"
            style={{ backgroundColor: value }}
          >
            Primary Button
          </div>
          <div
            className="px-4 py-2 rounded-md border text-sm font-medium"
            style={{ borderColor: value, color: value }}
          >
            Outline Button
          </div>
        </div>
      </div>
    </div>
  );
}


