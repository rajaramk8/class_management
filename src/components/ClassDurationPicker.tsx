import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ClassDurationPickerProps {
  value: number; // in minutes
  onChange: (minutes: number) => void;
}

const PRESETS = [
  { label: '30 mins', minutes: 30 },
  { label: '45 mins', minutes: 45 },
  { label: '1 hr', minutes: 60 },
  { label: '1.5 hrs', minutes: 90 },
  { label: '2 hrs', minutes: 120 },
];

export const ClassDurationPicker: React.FC<ClassDurationPickerProps> = ({ value, onChange }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('60');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>(value.toString());

  useEffect(() => {
    const matched = PRESETS.find(p => p.minutes === value);
    if (matched) {
      setSelectedPreset(value.toString());
      setIsCustom(false);
    } else {
      setSelectedPreset('custom');
      setIsCustom(true);
      setCustomInput(value.toString());
    }
  }, [value]);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPreset(val);

    if (val === 'custom') {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      const minutes = parseInt(val, 10);
      onChange(minutes);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onChange(num);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Class Duration
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Clock className="w-4 h-4" />
          </div>
          <select
            value={selectedPreset}
            onChange={handleDropdownChange}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors appearance-none"
          >
            {PRESETS.map((p) => (
              <option key={p.minutes} value={p.minutes}>
                {p.label} ({p.minutes} mins)
              </option>
            ))}
            <option value="custom">Custom Duration...</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            ▼
          </div>
        </div>

        {isCustom && (
          <div className="w-36 flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="600"
              value={customInput}
              onChange={handleCustomChange}
              placeholder="e.g. 75"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <span className="text-xs text-slate-500 font-medium">mins</span>
          </div>
        )}
      </div>
    </div>
  );
};
