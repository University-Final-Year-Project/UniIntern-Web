import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ApplicationCalendarProps {
  applications: { appliedAt: string }[];
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const ApplicationCalendar = ({ applications }: ApplicationCalendarProps) => {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // How many applications were sent on each day.
  const countByDay = useMemo(() => {
    const counts = new Map<string, number>();
    applications.forEach((app) => {
      const key = dayKey(new Date(app.appliedAt));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [applications]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday first: Sunday (0) becomes 6.
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayKey = dayKey(new Date());

  const monthTotal = Array.from({ length: daysInMonth }, (_, i) =>
    countByDay.get(dayKey(new Date(year, month, i + 1))) ?? 0,
  ).reduce((sum, n) => sum + n, 0);

  const goToMonth = (offset: number) =>
    setViewDate(new Date(year, month + offset, 1));

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-navy">
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="Next month"
            className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {monthTotal === 0
          ? 'No applications this month'
          : `${monthTotal} application${monthTotal > 1 ? 's' : ''} this month`}
      </p>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((name) => (
          <div
            key={name}
            className="text-center text-[10px] font-semibold text-gray-400 uppercase">
            {name.slice(0, 2)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) return <div key={`blank-${index}`} />;

          const date = new Date(year, month, day);
          const key = dayKey(date);
          const count = countByDay.get(key) ?? 0;
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              title={
                count > 0
                  ? `${count} application${count > 1 ? 's' : ''}`
                  : undefined
              }
              className={`relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${
                count > 0
                  ? 'bg-navy text-white'
                  : isToday
                  ? 'bg-gray-100 text-navy'
                  : 'text-gray-600'
              } ${isToday ? 'ring-2 ring-teal' : ''}`}>
              {day}
              {count > 1 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-teal text-white text-[9px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-navy" /> Applied
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm ring-2 ring-teal" /> Today
        </span>
      </div>
    </section>
  );
};

export default ApplicationCalendar;