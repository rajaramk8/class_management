import React, { useState, useRef, useEffect } from 'react';
import { Student } from '../types';
import { Search, UserCheck, ChevronDown } from 'lucide-react';

interface StudentSelectProps {
  students: Student[];
  selectedStudentId: string;
  onChange: (studentId: string) => void;
  required?: boolean;
}

export const StudentSelect: React.FC<StudentSelectProps> = ({
  students,
  selectedStudentId,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const filteredStudents = students.filter(
    (s) => s.active && s.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Student Name <span className="text-rose-500">*</span>
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={selectedStudent ? 'text-slate-900 font-medium' : 'text-slate-400'}>
            {selectedStudent ? selectedStudent.name : 'Search or select a student...'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Type to filter students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    onChange(student.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm hover:bg-sky-50 transition-colors flex items-center justify-between ${
                    student.id === selectedStudentId ? 'bg-sky-50/80 text-sky-900 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span>{student.name}</span>
                  {student.id === selectedStudentId && (
                    <span className="text-xs text-sky-600 font-bold">Selected</span>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No active students found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
