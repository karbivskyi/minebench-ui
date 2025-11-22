'use client';
import { useState, useEffect } from 'react';
import { BenchmarkSummary, Test, BenchmarkResult } from '@/types/benchmark';
import { formatHashrate, formatEfficiency } from '@/lib/utils';
import { TrendingUp, Cpu, Zap, Award, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface StatsCardsProps {
  summary: BenchmarkSummary;
}
interface BenchmarkTest {
  id: number;
  algorithm: string;
  device_name: string;
  device_type: string;
  avg_hashrate: number;
  avg_power: number | null;
  efficiency: number;
  created_at: string;
  gpu_model: string;
}

export default function StatsCards({ summary }: StatsCardsProps) {
  const [localTests, setLocalTests] = useState<BenchmarkTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
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
      const latestMap = new Map<string, typeof data[0]>();
      data.forEach(item => {
        if (!latestMap.has(item.device_uid) || new Date(item.created_at) > new Date(latestMap.get(item.device_uid)!.created_at)) {
          latestMap.set(item.device_uid, item);
        }
      });
      const uniqueData = Array.from(latestMap.values());
      setLocalTests(uniqueData.map(item => ({
        id: item.id,
        algorithm: item.algorithm,
        device_name: item.device_name,
        device_type: item.device_type,
        avg_hashrate: Number(item.avg_hashrate),
        avg_power: item.avg_power ? Number(item.avg_power) : null,
        efficiency: item.avg_power && Number(item.avg_power) > 0
          ? Number(item.avg_hashrate) / Number(item.avg_power)
          : 0,
        created_at: item.created_at,
        gpu_model: item.device_name
      })));
      setLoading(false);
    };

    fetchTests();
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-zinc-900 border border-zinc-800 mb-8"></div>;
  if (localTests.length === 0) return <p className="text-zinc-400">No benchmark data found.</p>;

  const totalTests = localTests.length;
  const averageHashrate = localTests.reduce((acc, t) => acc + t.avg_hashrate, 0) / totalTests;

  // Calculate efficiency only for tests with power data
  const testsWithPower = localTests.filter(t => t.efficiency && t.efficiency > 0);
  const averageEfficiency = testsWithPower.length > 0
    ? testsWithPower.reduce((acc, t) => acc + t.efficiency, 0) / testsWithPower.length
    : 0;

  const bestPerformer = localTests.reduce((best, t) => t.avg_hashrate > best.avg_hashrate ? t : best, localTests[0]);

  const stats = [
    {
      title: 'Total Tests',
      value: totalTests.toString(),
      icon: Cpu,
      textColor: 'text-yellow-400',
    },
    {
      title: 'Average Hashrate',
      value: formatHashrate(averageHashrate),
      icon: TrendingUp,
      textColor: 'text-yellow-400',
    },
    {
      title: 'Average Efficiency',
      value: formatEfficiency(averageEfficiency),
      icon: Zap,
      textColor: 'text-yellow-400',
    },
    {
      title: 'Best Performer',
      value: bestPerformer.algorithm,
      subtitle: bestPerformer.gpu_model,
      icon: Award,
      textColor: 'text-yellow-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="border border-zinc-800 p-6 hover:border-yellow-400 transition-all">
            <div className="flex items-center">
              <div className="p-3 border border-yellow-400">
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-sm text-zinc-500 truncate max-w-[150px]" title={stat.subtitle}>{stat.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface RecentTestsProps {
  tests: BenchmarkResult[];
}

export function RecentTests({ tests }: RecentTestsProps) {
  if (tests.length === 0) return <p className="text-zinc-400">No benchmark data found.</p>;

  return (
    <div className="border border-zinc-900 p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-900">
        <h3 className="text-lg font-semibold text-white uppercase tracking-wide">Recent Tests</h3>
        <Clock className="w-5 h-5 text-zinc-500" />
      </div>

      <div className="space-y-4">
        {tests.map(test => (
          <div key={test.id} className="flex items-center justify-between p-4 border border-zinc-900 hover:border-yellow-400 transition-all">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 border border-yellow-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{test.algorithm}</p>
                <p className="text-sm text-zinc-500">{test.device_name}</p>
                {test.avg_temp !== undefined && test.avg_temp !== null && test.avg_temp > 0 && (
                  <p className="text-sm text-zinc-400">Temp: {test.avg_temp.toFixed(1)}°C</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{test.avg_hashrate != null ? formatHashrate(test.avg_hashrate) : 'N/A'}</p>
              <p className="text-sm text-zinc-500">{test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}