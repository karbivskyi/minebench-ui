'use client';
import { useState, useEffect } from 'react';
import { BenchmarkSummary, Test } from '@/types/benchmark';
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
  efficiency: number;
  created_at: string;
  gpu_model: string;
}

export default function StatsCards({ summary }: StatsCardsProps) {
  const [tests, setTests] = useState<BenchmarkTest[]>([]);
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

      setTests(data.map(item => ({
        id: item.id,
        algorithm: item.algorithm,
        device_name: item.device_name,
        device_type: item.device_type,
        avg_hashrate: Number(item.avg_hashrate),
        efficiency: Number(item.efficiency),
        created_at: item.created_at,
        gpu_model: item.device_name // або окреме поле gpu_model, якщо є
      })));
      setLoading(false);
    };

    fetchTests();
  }, []);
  if (loading) return <p>Loading...</p>;
  if (tests.length === 0) return <p>No benchmark data found.</p>;

  // --- Обчислюємо статистику ---
  const totalTests = tests.length;
  const averageHashrate = tests.reduce((acc, t) => acc + t.avg_hashrate, 0) / totalTests;
  const averageEfficiency = tests.reduce((acc, t) => acc + t.efficiency, 0) / totalTests;
  // Найкращий перформер по hashrate
  const bestPerformer = tests.reduce((best, t) => t.avg_hashrate > best.avg_hashrate ? t : best, tests[0]);
  const stats = [
    {
      title: 'Total Tests',
      value: totalTests.toString(),
      icon: Cpu,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Average Hashrate',
      value: formatHashrate(averageHashrate),
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Average Efficiency',
      value: formatEfficiency(averageEfficiency),
      icon: Zap,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Best Performer',
      value: bestPerformer.algorithm,
      subtitle: bestPerformer.gpu_model,
      icon: Award,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-sm text-gray-500">{stat.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RecentTests() {
  const [tests, setTests] = useState<Test[]>([]);
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

      if (!data) {
        setTests([]);
        setLoading(false);
        return;
      }

      // Відбираємо останні унікальні тести за device_name + algorithm
      const seen = new Set<string>();
      const uniqueTests = data.filter((item) => {
        const key = `${item.device_name}-${item.algorithm}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setTests(
        uniqueTests.map(item => ({
          id: item.id,
          algorithm: item.algorithm,
          device_name: item.device_name,
          device_type: item.device_type,
          avg_hashrate: Number(item.avg_hashrate),
          avg_temp: item.avg_temp ? Number(item.avg_temp) : null,
          created_at: item.created_at,
        }))
      );

      setLoading(false);
    };

    fetchTests();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (tests.length === 0) return <p>No benchmark data found.</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Tests</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {tests.map(test => (
          <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-mining-100 rounded-full flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-mining-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{test.algorithm}</p>
                <p className="text-sm text-gray-500">{test.device_name}</p>
                {test.avg_temp !== undefined ? (
                  <p className="text-sm text-gray-400">Temp: {test.avg_temp?.toFixed(1) ? `${test.avg_temp.toFixed(1)}°C` : 'N/A'}</p>
                ) : (
                  <p className="text-sm text-gray-400">Temp: –</p>
                )}
                {/* {test.efficiency !== undefined ? (
                  <p className="text-sm text-gray-400">Efficiency: {test.efficiency.toFixed(2)}</p>
                ) : (
                  <p className="text-sm text-gray-400">Efficiency: –</p>
                )} */}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{formatHashrate(test.avg_hashrate)}</p>
              <p className="text-sm text-gray-500">{new Date(test.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}