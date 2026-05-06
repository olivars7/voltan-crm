"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  label?: string;
  showTime?: boolean;
}

export function DateTimePicker({ date, setDate, label = "Seleccionar fecha", showTime = true }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [hour, setHour] = React.useState(date ? format(date, "hh") : "12");
  const [minute, setMinute] = React.useState(date ? format(date, "mm") : "00");
  const [ampm, setAmpm] = React.useState(date ? format(date, "a") : "AM");

  // Sync internal state with prop
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setHour(format(date, "hh"));
      setMinute(format(date, "mm"));
      setAmpm(format(date, "a"));
    }
  }, [date]);

  const updateDateTime = (newDate?: Date, newHour?: string, newMinute?: string, newAmpm?: string) => {
    const d = newDate || selectedDate;
    if (!d) return;

    const h = parseInt(newHour || hour);
    const m = parseInt(newMinute || minute);
    const ap = newAmpm || ampm;

    let finalHour = h;
    if (ap === "PM" && h < 12) finalHour += 12;
    if (ap === "AM" && h === 12) finalHour = 0;

    const updatedDate = new Date(d);
    updatedDate.setHours(finalHour, m, 0, 0);
    
    setSelectedDate(updatedDate);
    setDate(updatedDate);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-white h-10 rounded-xl",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {selectedDate ? (
              format(selectedDate, showTime ? "PPP p" : "PPP", { locale: es })
            ) : (
              <span>{label}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-zinc-950/90 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              if (d) {
                updateDateTime(d);
              }
            }}
            initialFocus
            locale={es}
            className="rounded-t-2xl border-b border-white/5"
          />
          {showTime && (
            <div className="p-4 flex items-center justify-center gap-2 bg-white/5 rounded-b-2xl">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              <Select value={hour} onValueChange={(v) => { setHour(v); updateDateTime(undefined, v); }}>
                <SelectTrigger className="w-[65px] bg-zinc-900 border-white/10 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-white">:</span>
              <Select value={minute} onValueChange={(v) => { setMinute(v); updateDateTime(undefined, undefined, v); }}>
                <SelectTrigger className="w-[65px] bg-zinc-900 border-white/10 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {["00", "15", "30", "45"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ampm} onValueChange={(v) => { setAmpm(v); updateDateTime(undefined, undefined, undefined, v); }}>
                <SelectTrigger className="w-[70px] bg-zinc-900 border-white/10 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
