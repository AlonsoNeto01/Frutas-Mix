'use client';

import { useState } from 'react';
import type { BusinessHours } from '@/lib/types';
import { DAY_LABELS } from '@/lib/types';
import { updateBusinessHours } from '@/lib/actions/business-hours';
import Button from '../ui/Button';

interface BusinessHoursFormProps {
  initialHours: BusinessHours[];
}

export default function BusinessHoursForm({ initialHours }: BusinessHoursFormProps) {
  const [hours, setHours] = useState(initialHours);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (index: number, field: string, value: string | boolean) => {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    const result = await updateBusinessHours(
      hours.map((h) => ({
        id: h.id,
        open_time: h.open_time,
        close_time: h.close_time,
        is_open: h.is_open,
      }))
    );

    if (result.error) {
      setMessage(`Erro: ${result.error}`);
    } else {
      setMessage('Horários salvos com sucesso! ✅');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-5">🕐 Horários de Funcionamento</h3>

      <div className="space-y-3">
        {hours.map((hour, index) => (
          <div
            key={hour.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl transition-colors ${
              hour.is_open ? 'bg-green-50 dark:bg-green-500/5' : 'bg-gray-50 dark:bg-neutral-800/50'
            }`}
          >
            {/* Day name */}
            <div className="w-full sm:w-36">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hour.is_open}
                  onChange={(e) => handleChange(index, 'is_open', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className={`text-sm font-medium ${
                  hour.is_open
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-400 dark:text-gray-500 line-through'
                }`}>
                  {DAY_LABELS[hour.day_of_week]}
                </span>
              </label>
            </div>

            {/* Time inputs */}
            {hour.is_open && (
              <div className="flex items-center gap-2 ml-6 sm:ml-0">
                <input
                  type="time"
                  value={hour.open_time.slice(0, 5)}
                  onChange={(e) => handleChange(index, 'open_time', e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
                <span className="text-gray-400 text-sm">até</span>
                <input
                  type="time"
                  value={hour.close_time.slice(0, 5)}
                  onChange={(e) => handleChange(index, 'close_time', e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {message && (
        <div className={`mt-4 text-sm font-medium ${
          message.includes('Erro') ? 'text-red-500' : 'text-green-600 dark:text-green-400'
        }`}>
          {message}
        </div>
      )}

      <Button onClick={handleSave} disabled={loading} className="mt-5">
        {loading ? 'Salvando...' : 'Salvar Horários'}
      </Button>
    </div>
  );
}
