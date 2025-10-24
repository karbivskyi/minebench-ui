'use client';

import { useState, useEffect } from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';
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
  const [sortField, setSortField] = useState<keyof BenchmarkResult>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('benchmarks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // --- Оновлення: залишаємо лише останній запис для кожного device_uid ---
    const latestMap = new Map<string, BenchmarkResult>();
    data.forEach(item => {
      const uid = item.device_uid;
      if (!latestMap.has(uid) || new Date(item.created_at) > new Date(latestMap.get(uid)!.created_at)) {
        latestMap.set(uid, {
          id: item.id,
          device_type: item.device_type,
          device_name: item.device_name,
          avg_temp: item.avg_temp ? Number(item.avg_temp) : null,
          avg_hashrate: Number(item.avg_hashrate),
          max_hashrate: Number(item.max_hashrate),
          duration_seconds: item.duration_seconds,
          algorithm: item.algorithm,
          coin_name: item.coin_name,
          created_at: item.created_at,
          device_uid: item.device_uid,
        });
      }
    });

    setLocalResults(Array.from(latestMap.values()));
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

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
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  const handleSort = (field: keyof BenchmarkResult) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getUniqueValues = (field: keyof BenchmarkResult) => {
    return Array.from(new Set(results.map(r => r[field] as string))).sort();
  };

  const exportToCSV = () => {
    const headers = [
      'Created At', 'Algorithm', 'Device Name', 'Device Type', 'Avg Temp', 'Avg Hashrate', 'Max Hashrate', 'Duration (s)', 'Coin Name', 'Device UID'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredResults.map(r => [
        r.created_at,
        r.algorithm,
        r.device_name,
        r.device_type,
        r.avg_temp != null ? r.avg_temp.toFixed(1) : 'N/A',
        r.avg_hashrate != null ? r.avg_hashrate.toFixed(2) : 'N/A',
        r.max_hashrate != null ? r.max_hashrate.toFixed(2) : 'N/A',
        r.duration_seconds,
        r.coin_name,
        r.device_uid
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmarks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-mining-600 to-mining-700 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Benchmark Results</h2>
        <div className="flex items-center space-x-4">
          <button onClick={fetchResults} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /><span>Refresh</span>
          </button>
          {/* <button onClick={exportToCSV} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" /><span>Export CSV</span>
          </button> */}
        </div>
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

        <select value={filters.algorithm || ''} onChange={e => setFilters({ ...filters, algorithm: e.target.value || undefined })} className="px-4 py-2 border rounded-lg">
          <option value="">All Algorithms</option>
          {getUniqueValues('algorithm').map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select value={filters.device_name || ''} onChange={e => setFilters({ ...filters, device_name: e.target.value || undefined })} className="px-4 py-2 border rounded-lg">
          <option value="">All Devices</option>
          {getUniqueValues('device_name').map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={filters.device_type || ''} onChange={e => setFilters({ ...filters, device_type: e.target.value || undefined })} className="px-4 py-2 border rounded-lg">
          <option value="">All Types</option>
          {getUniqueValues('device_type').map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {['created_at', 'algorithm', 'device_name', 'device_type', 'avg_temp', 'avg_hashrate', 'max_hashrate', 'duration_seconds', 'coin_name', 'device_uid'].map(field => (
                <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200" onClick={() => handleSort(field as keyof BenchmarkResult)}>
                  {field.replace(/_/g, ' ').toUpperCase()} {sortField === field && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}
                </td>

                <td className="px-6 py-4"><span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>{r.algorithm}</span></td>
                <td className="px-6 py-4">{r.device_name}</td>
                <td className="px-6 py-4">{r.device_type}</td>
                <td className="px-6 py-4">
                  {r.avg_temp != null ? r.avg_temp.toFixed(1) : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {r.avg_hashrate != null ? r.avg_hashrate.toFixed(2) : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {r.max_hashrate != null ? r.max_hashrate.toFixed(2) : 'N/A'}
                </td>
                <td className="px-6 py-4">{r.duration_seconds}</td>
                <td className="px-6 py-4">{r.coin_name}</td>
                <td className="px-6 py-4">{r.device_uid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t flex justify-between text-sm text-gray-700">
        <span>Showing {filteredResults.length} of {localResults.length} results</span>
        <span>Last updated: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}
