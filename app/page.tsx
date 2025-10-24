'use client';

import { useState, useEffect } from 'react';
import { BenchmarkResult, BenchmarkSummary } from '@/types/benchmark';
import { generateMockData, calculateSummary } from '@/lib/utils';
import BenchmarkTable from '@/components/BenchmarkTable';
import StatsCards, { RecentTests } from '@/components/StatsCards';
import { Activity, BarChart3, Settings, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Logo from '@/public/img/minebench-logo.png'; // або відносний шлях
import discord_icon from '@/public/img/discord-icon.svg';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


export default function Home() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [summary, setSummary] = useState<BenchmarkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [tests, setTests] = useState<BenchmarkResult[]>([]);
  const year = new Date().getFullYear();

  const loadTests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Фільтруємо по унікальному device_uid, беремо останні
      const latestMap = new Map<string, typeof data[0]>();
      data.forEach(item => {
        if (!latestMap.has(item.device_uid) || new Date(item.created_at) > new Date(latestMap.get(item.device_uid)!.created_at)) {
          latestMap.set(item.device_uid, item);
        }
      });

      const uniqueData = Array.from(latestMap.values());
      setTests(uniqueData.map(item => ({
        id: item.id,
        algorithm: item.algorithm,
        device_name: item.device_name,
        device_type: item.device_type,
        avg_hashrate: Number(item.avg_hashrate),
        efficiency: Number(item.efficiency),
        created_at: item.created_at,
        gpu_model: item.gpu_model || item.device_name,
      })));

      // Можеш оновити summary якщо потрібно
      setSummary(calculateSummary(uniqueData));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadTests();
  }, []);

  const handleRefresh = () => {
    loadTests();
  };

  if (loading && results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-mining-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading benchmark data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {summary && <StatsCards summary={summary} />}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Table */}
          <div className="lg:col-span-2">
            <BenchmarkTable results={results} onRefresh={handleRefresh} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Tests */}
            <RecentTests tests={tests} />

            {/* Performance Chart Placeholder */}
            {/* <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Chart visualization</p>
                  <p className="text-sm">coming soon</p>
                </div>
              </div>
            </div> */}

            {/* System Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">System Info</h3>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm font-medium">0.1.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Environment:</span>
                  <span className="text-sm font-medium">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data Points:</span>
                  <span className="text-sm font-medium">{results.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
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
