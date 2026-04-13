import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import api from '../lib/axios';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="p-8">Loading events...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Club Events</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Upcoming activities, sessions, and important dates.</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-8 text-center text-[var(--color-text-muted)] italic">
          No events available right now.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const date = new Date(event.event_date);
            return (
              <div key={event.id} className="bg-[var(--color-panel)] rounded-xl border border-gray-800 p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-[var(--color-sidebar)] rounded-lg px-3 py-2 text-center min-w-[70px] border border-gray-700">
                    <div className="text-xs text-[var(--color-text-muted)] uppercase">
                      {date.toLocaleString('default', { month: 'short' })}
                    </div>
                    <div className="text-xl font-bold text-white">{date.getDate()}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-400" />
                      <h2 className="text-lg font-semibold text-emerald-400">{event.title}</h2>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{event.description || 'No additional details provided.'}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-3">
                      {date.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
