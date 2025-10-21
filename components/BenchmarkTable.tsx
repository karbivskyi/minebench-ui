'use client';

import { useState } from 'react';
import { BenchmarkResult, FilterOptions } from '@/types/benchmark';
import { 
  formatHashrate, 
  formatPower, 
  formatEfficiency, 
  formatTemperature, 
  formatUptime, 
  formatProfitability 
} from '@/lib/utils';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

interface BenchmarkTableProps {
  results: BenchmarkResult[];
  onRefresh?: () => void;
}

export default function BenchmarkTable({ results, onRefresh }: BenchmarkTableProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortField, setSortField] = useState<keyof BenchmarkResult>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResults = results
    .filter(result => {
      if (filters.algorithm && result.algorithm !== filters.algorithm) return false;
      if (filters.gpuModel && result.gpuModel !== filters.gpuModel) return false;
      if (filters.miner && result.miner !== filters.miner) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          result.algorithm.toLowerCase().includes(searchLower) ||
          result.gpuModel.toLowerCase().includes(searchLower) ||
          result.miner.toLowerCase().includes(searchLower) ||
          result.pool.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const handleSort = (field: keyof BenchmarkResult) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getUniqueValues = (field: keyof BenchmarkResult) => {
    return Array.from(new Set(results.map(r => r[field] as string))).sort();
  };

  const exportToCSV = () => {
    const headers = [
      'Timestamp', 'Algorithm', 'Hashrate (MH/s)', 'Power (W)', 'Efficiency (H/W)',
      'Temperature (°C)', 'GPU Model', 'Driver', 'OS', 'Miner', 'Pool', 'Difficulty',
      'Shares Accepted', 'Shares Rejected', 'Shares Stale', 'Uptime (h)', 'Profitability ($/day)'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(result => [
        result.timestamp,
        result.algorithm,
        result.hashrate.toFixed(2),
        result.powerConsumption.toFixed(0),
        result.efficiency.toFixed(2),
        result.temperature.toFixed(1),
        result.gpuModel,
        result.driverVersion,
        result.os,
        result.miner,
        result.pool,
        result.difficulty.toFixed(0),
        result.shares.accepted,
        result.shares.rejected,
        result.shares.stale,
        (result.uptime / 3600).toFixed(2),
        result.profitability.toFixed(4)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minebench-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-mining-600 to-mining-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Benchmark Results</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mining-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.algorithm || ''}
            onChange={(e) => setFilters({ ...filters, algorithm: e.target.value || undefined })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mining-500 focus:border-transparent"
          >
            <option value="">All Algorithms</option>
            {getUniqueValues('algorithm').map(algo => (
              <option key={algo} value={algo}>{algo}</option>
            ))}
          </select>

          <select
            value={filters.gpuModel || ''}
            onChange={(e) => setFilters({ ...filters, gpuModel: e.target.value || undefined })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mining-500 focus:border-transparent"
          >
            <option value="">All GPU Models</option>
            {getUniqueValues('gpuModel').map(gpu => (
              <option key={gpu} value={gpu}>{gpu}</option>
            ))}
          </select>

          <select
            value={filters.miner || ''}
            onChange={(e) => setFilters({ ...filters, miner: e.target.value || undefined })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mining-500 focus:border-transparent"
          >
            <option value="">All Miners</option>
            {getUniqueValues('miner').map(miner => (
              <option key={miner} value={miner}>{miner}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('timestamp')}
              >
                Timestamp {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('algorithm')}
              >
                Algorithm {sortField === 'algorithm' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('hashrate')}
              >
                Hashrate {sortField === 'hashrate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('powerConsumption')}
              >
                Power {sortField === 'powerConsumption' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('efficiency')}
              >
                Efficiency {sortField === 'efficiency' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('temperature')}
              >
                Temp {sortField === 'temperature' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('gpuModel')}
              >
                GPU Model {sortField === 'gpuModel' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('miner')}
              >
                Miner {sortField === 'miner' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('profitability')}
              >
                Profit {sortField === 'profitability' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(result.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {result.algorithm}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatHashrate(result.hashrate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPower(result.powerConsumption)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatEfficiency(result.efficiency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    result.temperature > 75 ? 'bg-red-100 text-red-800' : 
                    result.temperature > 70 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {formatTemperature(result.temperature)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.gpuModel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.miner}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatProfitability(result.profitability)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredResults.length} of {results.length} results
          </p>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
