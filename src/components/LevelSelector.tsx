import React from 'react';
import { 
  ENGLISH_LEVELS_DISPLAY_ORDER, 
  MATH_BTM_LEVELS_DISPLAY_ORDER,
  MATH_CTM_LEVELS_DISPLAY_ORDER
} from '../constants/levels';
import { GraduationCap, Calculator, Brain, Sparkles, Ban } from 'lucide-react';

interface LevelSelectorProps {
  subjectName: string; // 'English' | 'Math'
  englishLevel: string;
  btmLevel: string;
  ctmLevel: string;
  onEnglishLevelChange: (level: string) => void;
  onBtmLevelChange: (level: string) => void;
  onCtmLevelChange: (level: string) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  subjectName,
  englishLevel,
  btmLevel,
  ctmLevel,
  onEnglishLevelChange,
  onBtmLevelChange,
  onCtmLevelChange,
}) => {
  const isMath = subjectName.toLowerCase() === 'math';

  const handleBtmChange = (val: string) => {
    onBtmLevelChange(val);
    if (val === 'Summit') {
      // When BTM is Summit, CTM is 'X'
      onCtmLevelChange('X');
    } else if (val === 'None') {
      // When BTM is None, CTM is 'None'
      onCtmLevelChange('None');
    } else if (ctmLevel === 'X' || ctmLevel === 'None') {
      // If switching back from Summit/None to numeric level, reset CTM to default number
      onCtmLevelChange('10');
    }
  };

  if (isMath) {
    const isSummit = btmLevel === 'Summit';
    const isNone = btmLevel === 'None';

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            Math Categories & Levels
          </label>
          <span className="text-xs text-slate-500 font-normal">
            BTM (Summit / 32 → 1 / None) & CTM (32 → 1 / X / None)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-sky-50/50 p-3.5 rounded-xl border border-sky-100">
          
          {/* BTM: Basic Thinking Math + Summit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-sky-600" />
                <span>BTM (Basic Thinking Math)</span>
              </span>
              {isSummit && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Summit
                </span>
              )}
              {isNone && (
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <Ban className="w-2.5 h-2.5" /> Not Enrolled
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={btmLevel}
                onChange={(e) => handleBtmChange(e.target.value)}
                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-semibold shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                  isSummit 
                    ? 'border-amber-300 text-amber-950 bg-amber-50/50' 
                    : isNone
                    ? 'border-slate-300 text-slate-500 bg-slate-50'
                    : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="">Select BTM Level...</option>
                <option value="None" className="text-slate-500 font-medium">
                  🚫 None (Not Enrolled in Math)
                </option>
                <optgroup label="Special Product">
                  <option value="Summit" className="font-bold text-amber-900">
                    ⭐ Summit (Product)
                  </option>
                </optgroup>
                <optgroup label="BTM Levels (32 down to 1)">
                  {MATH_BTM_LEVELS_DISPLAY_ORDER.filter(l => l !== 'Summit').map((lvl) => (
                    <option key={`btm-${lvl}`} value={lvl}>
                      BTM Level {lvl}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* CTM: Critical Thinking Math */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>CTM (Critical Thinking Math)</span>
              </span>
              {isSummit && (
                <span className="text-[10px] text-slate-500 font-medium">
                  (Set to 'X' for Summit)
                </span>
              )}
              {isNone && (
                <span className="text-[10px] text-slate-500 font-medium">
                  (Not Enrolled)
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={ctmLevel}
                onChange={(e) => onCtmLevelChange(e.target.value)}
                disabled={isSummit || isNone}
                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-semibold shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                  isSummit || isNone
                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                    : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="">Select CTM Level...</option>
                <option value="None">None (Not Enrolled)</option>
                <optgroup label="CTM Levels (32 down to 1)">
                  {MATH_CTM_LEVELS_DISPLAY_ORDER.filter(l => l !== 'X').map((lvl) => (
                    <option key={`ctm-${lvl}`} value={lvl}>
                      CTM Level {lvl}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Special">
                  <option value="X">X (N/A / Summit)</option>
                </optgroup>
              </select>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // English Level Selector
  const isEnglishNone = englishLevel === 'None';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-slate-700">
          English Level
        </label>
        <span className="text-xs text-slate-500 font-normal">
          Higher levels first (8 → Pre-A) or None
        </span>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <GraduationCap className="w-4 h-4" />
        </div>
        <select
          value={englishLevel}
          onChange={(e) => onEnglishLevelChange(e.target.value)}
          className={`w-full pl-9 pr-8 py-2.5 bg-white border rounded-lg text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm ${
            isEnglishNone ? 'border-slate-300 text-slate-500 bg-slate-50 font-normal' : 'border-slate-300 text-slate-800 font-semibold'
          }`}
        >
          <option value="">Select English Level...</option>
          <option value="None" className="text-slate-500 font-medium">
            🚫 None (Not Enrolled in English)
          </option>
          <optgroup label="English Levels (8 down to Pre-A)">
            {ENGLISH_LEVELS_DISPLAY_ORDER.map((lvl) => (
              <option key={`eng-${lvl}`} value={lvl}>
                Level {lvl}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
};
