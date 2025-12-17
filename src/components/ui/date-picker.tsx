"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface DatePickerProps {
  label: string
  value: string // Formato esperado "YYYY-MM-DD"
  onChange: (date: string) => void
  minDate?: string
  disabled?: boolean
  isMobileView?: boolean
}

export function DatePicker({
  label,
  value,
  onChange,
  minDate,
  disabled = false,
  isMobileView = false,
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // --- UTILIDADES PARA EVITAR DESFASE HORARIO ---
  
  // Convierte "YYYY-MM-DD" a un objeto Date real en hora local
  const parseISOToLocal = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Estado del mes que se está visualizando
  const [currentMonth, setCurrentMonth] = useState<Date>(() => parseISOToLocal(value));

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const handleDateClick = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    
    const formattedDate = `${year}-${month}-${day}`
    onChange(formattedDate)
    if (!isMobileView) setShowCalendar(false)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const renderCalendarDays = () => {
    const days = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const today = new Date()
    const selectedDate = value ? parseISOToLocal(value) : null
    const limitDate = minDate ? parseISOToLocal(minDate) : null

    // Ajuste: Lunes es el primer día (0=Lun, 6=Dom)
    let startDayOfWeek = firstDayOfMonth.getDay()
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    // 1. Días del mes anterior (relleno)
    for (let i = startDayOfWeek; i > 0; i--) {
      const date = new Date(year, month, 1 - i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isDisabled: limitDate ? date < limitDate : false,
      })
    }

    // 2. Días del mes actual
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isDisabled: limitDate ? date < limitDate : false,
      })
    }

    // 3. Días del mes siguiente (relleno hasta completar cuadrícula de 42 celdas)
    const remainingSlots = 42 - days.length
    for (let i = 1; i <= remainingSlots; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isDisabled: limitDate ? date < limitDate : false,
      })
    }

    return days
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Seleccionar fecha"
    const [year, month, day] = dateString.split("-").map(Number)
    return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`
  }

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  // Contenido compartido del calendario
  const CalendarContent = (
    <div className="bg-white p-3 select-none">
      <div className="flex justify-between items-center mb-4">
        <button type="button" className="p-1 rounded-full hover:bg-gray-100" onClick={goToPreviousMonth}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="font-medium capitalize text-sm">
          {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </div>
        <button type="button" className="p-1 rounded-full hover:bg-gray-100" onClick={goToNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-400 py-1 uppercase">
            {day}
          </div>
        ))}

        {renderCalendarDays().map((day, index) => (
          <button
            key={index}
            type="button"
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
              ${day.isCurrentMonth ? "text-gray-700" : "text-gray-300"}
              ${day.isToday && !day.isSelected ? "border border-emerald-500 text-emerald-600" : ""}
              ${day.isSelected ? "bg-emerald-500 text-white font-bold" : "hover:bg-emerald-50"}
              ${day.isDisabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer"}
            `}
            onClick={() => !day.isDisabled && handleDateClick(day.date)}
            disabled={day.isDisabled}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </div>
  )

  if (isMobileView) return <div className="rounded-xl border shadow-sm overflow-hidden">{CalendarContent}</div>

  return (
    <div className="relative w-full" ref={calendarRef}>
      <div
        className={`rounded-lg border p-2 bg-white transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-emerald-400 cursor-pointer"
        } ${showCalendar ? "border-emerald-500 ring-2 ring-emerald-100" : "border-gray-200"}`}
        onClick={() => !disabled && setShowCalendar(!showCalendar)}
      >
        <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold flex items-center mb-0.5">
          <Calendar className="w-3 h-3 mr-1" />
          {label}
        </div>
        <div className="text-sm font-semibold text-gray-700">
          {formatDisplayDate(value)}
        </div>
      </div>

      {showCalendar && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-150 origin-top-left w-72 overflow-hidden">
          {CalendarContent}
        </div>
      )}
    </div>
  )
}
