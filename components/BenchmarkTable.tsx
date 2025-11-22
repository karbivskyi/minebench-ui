'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { BenchmarkTableProps } from '@/types/benchmark';
import { formatHashrate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BenchmarkResult {
  id: number;
  device_type: string;
  device_name: string;
  avg_temp: number | null;
  avg_power: number | null;
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

    const grouped = data.reduce<Record<string, BenchmarkResult[]>>((acc, item) => {
      const key = item.device_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    const averaged = Object.entries(grouped).map(([device_name, group]) => {
      const totalDuration = group.reduce((a, b) => a + Number(b.duration_seconds), 0);

      // Weighted average for hashrate
      const weightedHashrate = group.reduce((a, b) => a + (Number(b.avg_hashrate) * Number(b.duration_seconds)), 0) / totalDuration;

      // Weighted average for temp (filtering out nulls)
      const tempGroup = group.filter(g => g.avg_temp != null);
      const totalTempDuration = tempGroup.reduce((a, b) => a + Number(b.duration_seconds), 0);
      const weightedTemp = tempGroup.length > 0
        ? tempGroup.reduce((a, b) => a + (Number(b.avg_temp) * Number(b.duration_seconds)), 0) / totalTempDuration
        : 0;

      // Weighted average for power (filtering out nulls)
      const powerGroup = group.filter(g => g.avg_power != null);
      const totalPowerDuration = powerGroup.reduce((a, b) => a + Number(b.duration_seconds), 0);
      const weightedPower = powerGroup.length > 0
        ? powerGroup.reduce((a, b) => a + (Number(b.avg_power) * Number(b.duration_seconds)), 0) / totalPowerDuration
        : 0;

      const max_hashrate = Math.max(...group.map(g => Number(g.max_hashrate)));
      const duration_avg = totalDuration / group.length;

      return {
        id: group[0].id,
        device_type: group[0].device_type,
        device_name,
        avg_temp: tempGroup.length > 0 ? weightedTemp : null,
        avg_power: powerGroup.length > 0 ? weightedPower : null,
        avg_hashrate: weightedHashrate,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-900">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
          <Filter className="w-5 h-5 text-yellow-400" />
          Benchmark Results
        </h2>
        <button
          onClick={fetchResults}
          className="btn-secondary flex items-center space-x-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-zinc-900 bg-zinc-950 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={filters.algorithm || ''}
          onChange={e => setFilters({ ...filters, algorithm: e.target.value || undefined })}
          className="bg-zinc-950 border border-zinc-800 text-white px-4 py-2 focus:outline-none focus:border-yellow-400 hover:border-yellow-400 transition-all uppercase tracking-wide text-sm"
        >
          <option value="" className="bg-zinc-950 text-white">All Algorithms</option>
          {getUniqueValues('algorithm').map(a => (
            <option key={a} value={a} className="bg-zinc-950 text-white">{a}</option>
          ))}
        </select>

        <select
          value={filters.device_name || ''}
          onChange={e => setFilters({ ...filters, device_name: e.target.value || undefined })}
          className="bg-zinc-950 border border-zinc-800 text-white px-4 py-2 focus:outline-none focus:border-yellow-400 hover:border-yellow-400 transition-all uppercase tracking-wide text-sm"
        >
          <option value="" className="bg-zinc-950 text-white">All Devices</option>
          {getUniqueValues('device_name').map(d => (
            <option key={d} value={d} className="bg-zinc-950 text-white">{d}</option>
          ))}
        </select>

        <select
          value={filters.device_type || ''}
          onChange={e => setFilters({ ...filters, device_type: e.target.value || undefined })}
          className="bg-zinc-950 border border-zinc-800 text-white px-4 py-2 focus:outline-none focus:border-yellow-400 hover:border-yellow-400 transition-all uppercase tracking-wide text-sm"
        >
          <option value="" className="bg-zinc-950 text-white">All Types</option>
          {getUniqueValues('device_type').map(d => (
            <option key={d} value={d} className="bg-zinc-950 text-white">{d}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-950">
            <tr>
              {[
                { key: 'device_name', label: 'Device' },
                { key: 'avg_hashrate', label: 'Avg Hashrate' },
                { key: 'max_hashrate', label: 'Max Hashrate' },
                { key: 'avg_power', label: 'Power' },
                { key: 'avg_temp', label: 'Temp' },
                { key: 'algorithm', label: 'Algorithm' },
                { key: 'coin_name', label: 'Coin' },
                { key: 'duration_seconds', label: 'Duration' },
                { key: 'device_type', label: 'Type' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-yellow-400 transition-colors"
                  onClick={() => handleSort(key as keyof BenchmarkResult)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {sortField === key && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {filteredResults.map((r, index) => (
              <motion.tr
                key={r.device_name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-zinc-900 hover:border-l-2 hover:border-l-yellow-400 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-white">{r.device_name}</td>
                <td className="px-6 py-4 text-yellow-400 font-mono">{formatHashrate(r.avg_hashrate)}</td>
                <td className="px-6 py-4 text-zinc-400 font-mono">{formatHashrate(r.max_hashrate)}</td>
                <td className="px-6 py-4 text-yellow-400 font-mono">
                  {r.avg_power != null && r.avg_power !== 0
                    ? r.avg_power.toFixed(1) + ' W'
                    : ''}
                </td>
                <td className="px-6 py-4 font-mono">
                  {r.avg_temp != null && r.avg_temp !== 0 ? (
                    <span className={`${r.avg_temp > 75 ? 'text-red-400' :
                      r.avg_temp > 65 ? 'text-orange-400' :
                        'text-yellow-400'
                      }`}>
                      {r.avg_temp.toFixed(1)} °C
                    </span>
                  ) : ''}
                </td>
                <td className="px-6 py-4 text-white">{r.algorithm}</td>
                <td className="px-6 py-4 text-white">{r.coin_name}</td>
                <td className="px-6 py-4 text-zinc-400">{r.duration_seconds.toFixed(0)}s</td>
                <td className="px-6 py-4 text-zinc-400 text-xs uppercase">{r.device_type}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="bg-zinc-950 px-6 py-3 border-t border-zinc-900 flex justify-between text-xs text-zinc-500 uppercase tracking-wide">
        <span>Showing {filteredResults.length} of {localResults.length} devices</span>
        <span>Last updated: {new Date().toLocaleString()}</span>
      </div>
    </motion.div>
  );
}

