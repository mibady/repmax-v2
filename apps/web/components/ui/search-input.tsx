'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  type: 'athlete';
  position: string | null;
  classYear: string | null;
  state: string | null;
}

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  iconClassName?: string;
}

export function SearchInput({ className, placeholder = 'Search athletes...', iconClassName }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch {
      // Silently fail — search is non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(value.trim());
    }, 300);
  };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const showDropdown = isFocused && query.length >= 2 && (results.length > 0 || isLoading);
  const showEmptyState = isFocused && query.length >= 2 && !isLoading && results.length === 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Icon */}
      <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none ${iconClassName || 'text-gray-500'}`}>
        search
      </span>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        className={className || 'block w-64 pl-10 pr-3 py-2 border border-white/5 rounded-lg leading-5 bg-[#141414] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#1c1c1c] focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-colors'}
      />

      {/* Dropdown */}
      {(showDropdown || showEmptyState) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#1F1F22] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden max-h-[320px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">No results found</p>
            </div>
          ) : (
            results.map((result) => (
              <Link
                key={result.id}
                href={`/card/${result.id}`}
                onClick={() => {
                  setIsFocused(false);
                  setQuery('');
                  setResults([]);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
              >
                <div className="flex-shrink-0 size-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{result.name}</p>
                  <p className="text-slate-500 text-xs">
                    {[result.position, result.classYear, result.state].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="material-symbols-outlined text-white/20 text-[18px]">arrow_forward</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
