"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon } from "lucide-react"

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  label?: string;
  showTime?: boolean;
}

export function DateTimePicker({ date, setDate, showTime = true }: DateTimePickerProps) {
  
  // Format Date to YYYY-MM-DDTHH:mm for datetime-local or YYYY-MM-DD for date
  const formatValue = (d?: Date) => {
    if (!d) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    
    if (showTime) {
      const h = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${y}-${m}-${day}T${h}:${min}`;
    }
    return `${y}-${m}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setDate(undefined);
      return;
    }
    setDate(new Date(val));
  };

  return (
    <div className="relative group w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform duration-300 z-10 pointer-events-none">
        <CalendarIcon className="h-4 w-4" />
      </div>
      <Input
        type={showTime ? "datetime-local" : "date"}
        value={formatValue(date)}
        onChange={handleChange}
        className={cn(
          "pl-11 h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:bg-white/10 transition-all invert-calendar-icon w-full relative",
          !date && "text-muted-foreground"
        )}
      />
    </div>
  )
}
