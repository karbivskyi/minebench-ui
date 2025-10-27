'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { BenchmarkTableProps } from '@/types/benchmark';

interface BenchmarkResult {
  id: number;
  device_type: string;
  device_name: string;
  avg_temp: number | null;
  avg_hashrate: number;
  max_hashrate: number;
  duration_seconds: number;
  algorithm: string;
  coin_name: string;
  created_at: string;
  device_uid: string;
}

interface FilterOptions {
  algorithm?: string;
  device_name?: string;
  device_type?: string;
}

export default function BenchmarkTable({ results }: BenchmarkTableProps) {
  const [localResults, setLocalResults] = useState<BenchmarkResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortField, setSortField] = useState<keyof BenchmarkResult>('avg_hashrate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // 🧠 Функція отримання даних і агрегації середніх по пристрою
  const fetchResults = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('benchmarks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching benchmarks:', error);
      setLoading(false);
      return;
    }

    if (!data) {
      setLocalResults([]);
      setLoading(false);
      return;
    }

    // 🔢 Групуємо по device_name
    const grouped = data.reduce<Record<string, BenchmarkResult[]>>((acc, item) => {
      const key = item.device_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    // 📊 Обчислюємо середні
    const averaged = Object.entries(grouped).map(([device_name, group]) => {
      const avg_temp =
        group.filter(g => g.avg_temp != null).reduce((a, b) => a + Number(b.avg_temp), 0) /
        (group.filter(g => g.avg_temp != null).length || 1);
      const avg_hashrate = group.reduce((a, b) => a + Number(b.avg_hashrate), 0) / group.length;
      const max_hashrate = Math.max(...group.map(g => Number(g.max_hashrate)));
      const duration_avg = group.reduce((a, b) => a + Number(b.duration_seconds), 0) / group.length;

      return {
        id: group[0].id,
        device_type: group[0].device_type,
        device_name,
        avg_temp: isNaN(avg_temp) ? null : avg_temp,
        avg_hashrate,
        max_hashrate,
        duration_seconds: duration_avg,
        algorithm: group[0].algorithm,
        coin_name: group[0].coin_name,
        created_at: group[0].created_at,
        device_uid: group[0].device_uid,
      };
    });

    setLocalResults(averaged);
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSort = (field: keyof BenchmarkResult) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getUniqueValues = (field: keyof BenchmarkResult) => {
    return Array.from(new Set(localResults.map(r => r[field] as string))).sort();
  };

  // 🔍 Фільтрація і пошук
  const filteredResults = localResults
    .filter(r => {
      if (filters.algorithm && r.algorithm !== filters.algorithm) return false;
      if (filters.device_name && r.device_name !== filters.device_name) return false;
      if (filters.device_type && r.device_type !== filters.device_type) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          (r.algorithm ?? '').toLowerCase().includes(term) ||
          (r.device_name ?? '').toLowerCase().includes(term) ||
          (r.device_type ?? '').toLowerCase().includes(term) ||
          (r.coin_name ?? '').toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-mining-600 to-mining-700 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Benchmark Results</h2>
        <button
          onClick={fetchResults}
          className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mining-500 focus:border-transparent"
          />
        </div>

        <select
          value={filters.algorithm || ''}
          onChange={e => setFilters({ ...filters, algorithm: e.target.value || undefined })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Algorithms</option>
          {getUniqueValues('algorithm').map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={filters.device_name || ''}
          onChange={e => setFilters({ ...filters, device_name: e.target.value || undefined })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Devices</option>
          {getUniqueValues('device_name').map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={filters.device_type || ''}
          onChange={e => setFilters({ ...filters, device_type: e.target.value || undefined })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Types</option>
          {getUniqueValues('device_type').map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {[
                'device_name',
                'device_type',
                'algorithm',
                'avg_temp',
                'avg_hashrate',
                'max_hashrate',
                'duration_seconds',
                'coin_name',
              ].map(field => (
                <th
                  key={field}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort(field as keyof BenchmarkResult)}
                >
                  {field.replace(/_/g, ' ').toUpperCase()} {sortField === field && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.map(r => (
              <tr key={r.device_name} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{r.device_name}</td>
                <td className="px-6 py-4">{r.device_type}</td>
                <td className="px-6 py-4">{r.algorithm}</td>
                <td className="px-6 py-4">{r.avg_temp != null ? r.avg_temp.toFixed(1) : 'N/A'}</td>
                <td className="px-6 py-4">{r.avg_hashrate.toFixed(2)}</td>
                <td className="px-6 py-4">{r.max_hashrate.toFixed(2)}</td>
                <td className="px-6 py-4">{r.duration_seconds.toFixed(0)}</td>
                <td className="px-6 py-4">{r.coin_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t flex justify-between text-sm text-gray-700">
        <span>Showing {filteredResults.length} of {localResults.length} devices</span>
        <span>Last updated: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}
