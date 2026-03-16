import { Clock, Calendar } from 'lucide-react';
import { useState, useEffect, memo } from 'react';

/**
 * WeeklySchedule - Refactored to use CSS animations instead of motion.
 * 
 * Previously used 8+ motion.* elements with infinite animations:
 * - Shimmer effect (continuous x translation)
 * - Clock rotation (continuous 360deg)
 * - HOJE badge pulse (continuous scale)
 * - Green dot pulse (continuous opacity)
 * - Card stagger entrance (7 individual animations)
 * 
 * Now uses CSS @keyframes + Tailwind for all animations,
 * eliminating ~15KB of motion runtime for this component.
 */
export const WeeklySchedule = memo(function WeeklySchedule() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get current day
  const getCurrentDay = () => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[currentTime.getDay()];
  };

  // Format date and time in Brasília timezone
  const getBrasiliaDateTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    
    const formatter = new Intl.DateTimeFormat('pt-BR', options);
    const parts = formatter.formatToParts(currentTime);
    
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const second = parts.find(p => p.type === 'second')?.value;
    
    return {
      date: `${day}/${month}/${year}`,
      time: `${hour}:${minute}:${second}`,
    };
  };

  const currentDay = getCurrentDay();
  const { date, time } = getBrasiliaDateTime();

  const schedule = [
    { day: 'Segunda', hours: '08:00 - 18:00', isOpen: true },
    { day: 'Terça', hours: '08:00 - 18:00', isOpen: true },
    { day: 'Quarta', hours: '08:00 - 18:00', isOpen: true },
    { day: 'Quinta', hours: '08:00 - 18:00', isOpen: true },
    { day: 'Sexta', hours: '08:00 - 18:00', isOpen: true },
    { day: 'Sábado', hours: 'Fechado', isOpen: false },
    { day: 'Domingo', hours: 'Fechado', isOpen: false },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
      {/* Header - CSS shimmer instead of motion */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl overflow-hidden shadow-2xl relative">
        <div
          className="absolute inset-0 animate-[shimmerSweep_3s_linear_infinite]"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
          }}
        />
        <div className="relative z-10 flex items-center justify-center gap-3">
          {/* CSS rotation instead of motion */}
          <div className="animate-[spin_10s_linear_infinite]">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Horário de Atendimento</h3>
          </div>
        </div>
      </div>

      {/* Calendar Grid - CSS stagger via animation-delay */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
          {schedule.map((item, index) => {
            const isToday = item.day === currentDay;
            const isOpen = item.isOpen;

            return (
              <div
                key={index}
                className={`relative rounded-lg p-2 md:p-3 text-center transition-all hover:-translate-y-[3px] hover:scale-105 animate-[fadeInUp_0.4s_ease-out_both] ${
                  isToday
                    ? 'bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-600/50'
                    : isOpen
                    ? 'bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-600/30'
                    : 'bg-gradient-to-br from-gray-700/20 to-gray-800/20 border border-gray-600/30'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isToday && (
                  <div
                    className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-xs font-black px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] animate-pulse"
                  >
                    HOJE
                  </div>
                )}

                <div className="mb-1">
                  <Calendar className={`w-3 h-3 md:w-4 md:h-4 mx-auto ${isToday ? 'text-white' : isOpen ? 'text-green-400' : 'text-gray-500'}`} />
                </div>

                <div className={`font-black text-[10px] md:text-xs mb-1 ${isToday ? 'text-white' : isOpen ? 'text-white' : 'text-gray-400'}`}>
                  {item.day}
                </div>

                <div className={`text-[9px] md:text-[10px] font-semibold leading-tight ${isToday ? 'text-red-100' : isOpen ? 'text-green-300' : 'text-red-400'}`}>
                  {item.hours === 'Fechado' ? 'Fechado' : item.hours}
                </div>

                {isOpen && (
                  <div
                    className={`mt-1 w-1.5 h-1.5 rounded-full mx-auto animate-pulse ${isToday ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-green-400'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Aberto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span className="text-xs text-gray-400">Hoje</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-400">Fechado</span>
          </div>
        </div>

        {/* Current Date and Time - Brasília */}
        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-700 animate-[fadeIn_0.5s_ease-out_0.5s_both]">
          <div className="flex items-center justify-center gap-3 md:gap-6">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              <span className="font-bold text-white text-sm md:text-base">{date}</span>
            </div>
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-600"></div>
            
            {/* Time */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              <span className="font-bold text-white tabular-nums text-sm md:text-base">{time}</span>
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-gray-500 mt-2 text-center">Horário de Brasília (GMT-3)</p>
        </div>
      </div>
    </div>
  );
});