'use client';

import { BenchmarkSummary } from '@/types/benchmark';
import { formatHashrate, formatEfficiency } from '@/lib/utils';
import { TrendingUp, Cpu, Zap, Award, Clock, DollarSign } from 'lucide-react';

interface StatsCardsProps {
  summary: BenchmarkSummary;
}

export default function StatsCards({ summary }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Tests',
      value: summary.totalTests.toString(),
      icon: Cpu,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Average Hashrate',
      value: formatHashrate(summary.averageHashrate),
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Average Efficiency',
      value: formatEfficiency(summary.averageEfficiency),
      icon: Zap,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Best Performer',
      value: `${summary.bestPerformer.algorithm}`,
      subtitle: `${summary.bestPerformer.gpuModel}`,
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

interface RecentTestsProps {
  tests: BenchmarkSummary['recentTests'];
}

export function RecentTests({ tests }: RecentTestsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Tests</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {tests.map((test) => (
          <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-mining-100 rounded-full flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-mining-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{test.algorithm}</p>
                <p className="text-sm text-gray-500">{test.gpuModel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{formatHashrate(test.hashrate)}</p>
              <p className="text-sm text-gray-500">{new Date(test.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
