"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, Check } from "lucide-react"
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [hour, setHour] = React.useState(date ? format(date, "hh") : "12");
  const [minute, setMinute] = React.useState(date ? format(date, "mm") : "00");
  const [ampm, setAmpm] = React.useState(date ? format(date, "a") : "AM");

  // Sync internal state when the external date prop changes
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

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      updateDateTime(d);
      // We don't close it automatically so the user can pick the time
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-white h-11 rounded-2xl transition-all duration-300",
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
        <PopoverContent 
          className="w-auto p-0 bg-zinc-900 border-white/10 shadow-2xl rounded-3xl overflow-hidden" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col md:flex-row">
            <div className="p-2 bg-zinc-950/20">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={es}
                className="rounded-2xl"
              />
            </div>
            
            {showTime && (
              <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/5 p-4 bg-zinc-950/40 min-w-[120px] justify-center items-center gap-4">
                <div className="flex items-center gap-2 mb-2 text-primary">
                   <Clock className="h-4 w-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Hora</span>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2">
                  <Select value={hour} onValueChange={(v) => { setHour(v); updateDateTime(undefined, v); }}>
                    <SelectTrigger className="w-[70px] bg-zinc-900 border-white/10 text-white h-9 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={minute} onValueChange={(v) => { setMinute(v); updateDateTime(undefined, undefined, v); }}>
                    <SelectTrigger className="w-[70px] bg-zinc-900 border-white/10 text-white h-9 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {["00", "15", "30", "45"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={ampm} onValueChange={(v) => { setAmpm(v); updateDateTime(undefined, undefined, undefined, v); }}>
                    <SelectTrigger className="w-[70px] bg-zinc-900 border-white/10 text-white h-9 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => setIsOpen(false)}
                  className="mt-4 w-full bg-primary hover:bg-primary/90 text-white h-9 rounded-xl shadow-lg shadow-primary/20"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Listo
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
