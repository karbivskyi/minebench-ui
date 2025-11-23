'use client';

import { useState, useEffect } from 'react';
import { BenchmarkResult, BenchmarkSummary } from '@/types/benchmark';
import { calculateSummary } from '@/lib/utils';
import BenchmarkTable from '@/components/BenchmarkTable';
import StatsCards, { RecentTests } from '@/components/StatsCards';
import { Settings, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Dashboard() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [summary, setSummary] = useState<BenchmarkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<BenchmarkResult[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Keep only the latest entry per device_uid
      const latestMap = new Map<string, typeof data[0]>();
      data.forEach(item => {
        if (!latestMap.has(item.device_uid) || new Date(item.created_at) > new Date(latestMap.get(item.device_uid)!.created_at)) {
          latestMap.set(item.device_uid, item);
        }
      });
      const uniqueData = Array.from(latestMap.values());

      // Map data for results display
      setResults(
        uniqueData.map(item => ({
          id: item.id,
          algorithm: item.algorithm,
          device_name: item.device_name,
          device_type: item.device_type,
          avg_hashrate: Number(item.avg_hashrate),
          efficiency: Number(item.efficiency),
          created_at: item.created_at,
          gpu_model: item.gpu_model || item.device_name,
        }))
      );

      // Map data for summary calculation with proper field names
      const summaryData = uniqueData.map(item => ({
        id: item.id,
        algorithm: item.algorithm,
        device_name: item.device_name,
        device_type: item.device_type,
        hashrate: Number(item.avg_hashrate),
        powerConsumption: item.avg_power ? Number(item.avg_power) : undefined,
        efficiency: Number(item.efficiency),
        created_at: item.created_at,
        timestamp: item.created_at,
        gpu_model: item.gpu_model || item.device_name,
        gpuModel: item.gpu_model || item.device_name,
      }));

      setTests(uniqueData);
      setSummary(calculateSummary(summaryData));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => loadData();

  if (loading && results.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-12 h-12 animate-spin text-yellow-400" />
        <p className="ml-4 text-yellow-400">Loading benchmark data…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-400">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {summary && <StatsCards summary={summary} />}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 bg-black border border-zinc-800 rounded-lg p-4">
            <BenchmarkTable results={results} onRefresh={handleRefresh} />
          </div>
          <div className="space-y-6">
            <RecentTests tests={tests} />
            <div className="bg-black border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">System Info</h3>
                <Settings className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">Version:</span>
                  <span className="text-sm font-medium text-white">0.1.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">Environment:</span>
                  <span className="text-sm font-medium text-white">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">Data Points:</span>
                  <span className="text-sm font-medium text-white">{results.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">Status:</span>
                  <span className="text-sm font-medium text-yellow-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
