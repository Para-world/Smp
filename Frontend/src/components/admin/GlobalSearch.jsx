import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const token = localStorage.getItem('edusphere_token');
          const response = await fetch(`${API_URL}/admin/search?q=${encodeURIComponent(query)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setResults(data.results || []);
          setIsOpen(true);
        } catch (err) {
          console.error("Global search error", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (url) => {
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  return (
    <div ref={wrapperRef} className="relative hidden md:flex items-center w-64 lg:w-96">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search students, faculty, courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(results.length > 0) setIsOpen(true) }}
          className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-blue-900/5 dark:shadow-none overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.map((item, idx) => (
                <li key={`${item.type}-${item.id}-${idx}`}>
                  <button
                    onClick={() => handleSelect(item.url)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex flex-col"
                  >
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="capitalize text-blue-600 dark:text-blue-400 font-medium">{item.type}</span>
                      &bull;
                      <span>{item.description}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
