import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ListItem } from '@/types'

interface CalendarViewProps {
  items: ListItem[]
  onDateSelect: (date: Date) => void
  selectedDate: Date | null
}

export function CalendarView({ items, onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const getItemsForDate = (date: Date) => {
    return items.filter(item => {
      if (!item.due_date) return false
      const dueDate = new Date(item.due_date)
      return isSameDay(dueDate, date)
    })
  }

  const getItemStatusColor = (item: ListItem) => {
    if (item.is_completed) return 'bg-green-500'
    if (item.due_date && new Date(item.due_date) < new Date() && !item.is_completed) return 'bg-red-500'
    return 'bg-blue-500'
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <GlassCard className="w-full">
      <GlassCardContent className="p-4">
        {/* Header with month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="glass" size="icon" onClick={previousMonth} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          <Button variant="glass" size="icon" onClick={nextMonth} className="rounded-xl">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const isCurrentMonth = isSameMonth(date, currentMonth)
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
            const isTodayDate = isToday(date)
            const dayItems = getItemsForDate(date)

            return (
              <button
                key={date.toISOString()}
                onClick={() => onDateSelect(date)}
                className={`
                  relative aspect-square rounded-xl p-1 transition-all duration-200
                  ${isCurrentMonth ? 'hover:bg-accent' : 'opacity-30'}
                  ${isSelected ? 'bg-purple-500 text-white hover:bg-purple-600' : ''}
                  ${isTodayDate && !isSelected ? 'border-2 border-purple-500' : ''}
                `}
              >
                <span className={`text-sm font-medium ${isCurrentMonth ? '' : 'text-muted-foreground'}`}>
                  {format(date, 'd')}
                </span>

                {/* Item indicators */}
                <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                  {dayItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className={`w-1.5 h-1.5 rounded-full ${getItemStatusColor(item)}`}
                      title={item.content}
                    />
                  ))}
                  {dayItems.length > 4 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>À venir</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>En retard</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Complété</span>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
