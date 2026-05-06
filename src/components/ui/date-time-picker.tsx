"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, Check, ChevronUp, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  label?: string;
  showTime?: boolean;
}

export function DateTimePicker({ date, setDate, label = "Seleccionar fecha", showTime = true }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(date);

  // Sincronizar con el estado externo
  React.useEffect(() => {
    if (date) setInternalDate(date);
  }, [date]);

  const updateTime = (type: 'hour' | 'minute' | 'ampm', value: string | number) => {
    const newDate = internalDate ? new Date(internalDate) : new Date();
    let h = newDate.getHours();
    let m = newDate.getMinutes();

    if (type === 'hour') {
      const isPM = h >= 12;
      let val = value as number;
      if (isPM && val < 12) val += 12;
      if (!isPM && val === 12) val = 0;
      newDate.setHours(val);
    } else if (type === 'minute') {
      newDate.setMinutes(value as number);
    } else if (type === 'ampm') {
      const currentH = newDate.getHours();
      if (value === 'PM' && currentH < 12) newDate.setHours(currentH + 12);
      if (value === 'AM' && currentH >= 12) newDate.setHours(currentH - 12);
    }

    setInternalDate(newDate);
    setDate(newDate);
  };

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      const newDate = new Date(d);
      if (internalDate) {
        newDate.setHours(internalDate.getHours());
        newDate.setMinutes(internalDate.getMinutes());
      }
      setInternalDate(newDate);
      setDate(newDate);
    }
  };

  const currentHour = internalDate ? (internalDate.getHours() % 12 || 12) : 12;
  const currentMinute = internalDate ? internalDate.getMinutes() : 0;
  const currentAMPM = internalDate && internalDate.getHours() >= 12 ? 'PM' : 'AM';

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 rounded-2xl transition-all duration-300 shadow-xl",
              !internalDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
            <span className="truncate">
              {internalDate ? (
                format(internalDate, showTime ? "PPP p" : "PPP", { locale: es })
              ) : (
                label
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-zinc-900/95 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden z-[100]" 
          align="start"
          sideOffset={8}
        >
          <div className="flex flex-col md:flex-row">
            <div className="p-4 bg-zinc-950/30">
              <Calendar
                mode="single"
                selected={internalDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={es}
                className="rounded-2xl"
              />
            </div>
            
            {showTime && (
              <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/10 p-6 bg-zinc-900/50 min-w-[160px] justify-between gap-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Clock className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ajustar Hora</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3">
                        {/* Hour */}
                        <div className="flex flex-col items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => updateTime('hour', (currentHour % 12) + 1)}>
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <span className="text-xl font-bold tabular-nums w-8 text-center">{currentHour.toString().padStart(2, '0')}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => updateTime('hour', currentHour - 1 || 12)}>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <span className="text-xl font-bold animate-pulse text-white/30">:</span>

                        {/* Minute */}
                        <div className="flex flex-col items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => updateTime('minute', (currentMinute + 15) % 60)}>
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <span className="text-xl font-bold tabular-nums w-8 text-center">{currentMinute.toString().padStart(2, '0')}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => updateTime('minute', (currentMinute - 15 + 60) % 60)}>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* AM/PM */}
                        <div className="flex flex-col gap-1 ml-1">
                            <Button 
                                variant={currentAMPM === 'AM' ? 'default' : 'ghost'} 
                                className={cn("h-7 px-2 text-[10px] font-bold rounded-lg", currentAMPM === 'AM' ? "bg-primary" : "text-white/40")}
                                onClick={() => updateTime('ampm', 'AM')}
                            >AM</Button>
                            <Button 
                                variant={currentAMPM === 'PM' ? 'default' : 'ghost'} 
                                className={cn("h-7 px-2 text-[10px] font-bold rounded-lg", currentAMPM === 'PM' ? "bg-primary" : "text-white/40")}
                                onClick={() => updateTime('ampm', 'PM')}
                            >PM</Button>
                        </div>
                    </div>
                </div>

                <Button 
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-11 rounded-2xl shadow-lg shadow-primary/20 font-bold"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
