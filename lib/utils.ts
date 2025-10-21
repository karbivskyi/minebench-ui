import { BenchmarkResult, BenchmarkSummary } from '@/types/benchmark';

export const formatHashrate = (hashrate: number): string => {
  if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} TH/s`;
  if (hashrate >= 1e9) return `${(hashrate / 1e9).toFixed(2)} GH/s`;
  if (hashrate >= 1e6) return `${(hashrate / 1e6).toFixed(2)} MH/s`;
  if (hashrate >= 1e3) return `${(hashrate / 1e3).toFixed(2)} KH/s`;
  return `${hashrate.toFixed(2)} H/s`;
};

export const formatPower = (power: number): string => {
  return `${power.toFixed(0)}W`;
};

export const formatEfficiency = (efficiency: number): string => {
  return `${efficiency.toFixed(2)} H/W`;
};

export const formatTemperature = (temp: number): string => {
  return `${temp.toFixed(1)}°C`;
};

export const formatUptime = (uptime: number): string => {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatProfitability = (profit: number): string => {
  return `$${profit.toFixed(4)}/day`;
};

export const calculateEfficiency = (hashrate: number, powerConsumption: number): number => {
  return hashrate / powerConsumption;
};

export const generateMockData = (): BenchmarkResult[] => {
  const algorithms = ['SHA256', 'Scrypt', 'Ethash', 'Equihash', 'RandomX'];
  const gpuModels = ['RTX 4090', 'RTX 4080', 'RTX 4070', 'RTX 3090', 'RTX 3080'];
  const miners = ['T-Rex', 'GMiner', 'PhoenixMiner', 'Claymore', 'CGMiner'];
  const pools = ['F2Pool', 'Antpool', 'Slush Pool', 'ViaBTC', 'BTC.com'];
  const osVersions = ['Windows 11', 'Ubuntu 22.04', 'Windows 10', 'Ubuntu 20.04'];

  return Array.from({ length: 50 }, (_, i) => {
    const algorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
    const gpuModel = gpuModels[Math.floor(Math.random() * gpuModels.length)];
    const miner = miners[Math.floor(Math.random() * miners.length)];
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const os = osVersions[Math.floor(Math.random() * osVersions.length)];
    
    const hashrate = Math.random() * 1000 + 100; // 100-1100 MH/s
    const powerConsumption = Math.random() * 200 + 150; // 150-350W
    const efficiency = calculateEfficiency(hashrate, powerConsumption);
    const temperature = Math.random() * 20 + 60; // 60-80°C
    const uptime = Math.random() * 86400; // 0-24 hours
    const profitability = Math.random() * 10; // $0-10/day
    
    return {
      id: `test_${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      algorithm,
      hashrate,
      powerConsumption,
      efficiency,
      temperature,
      gpuModel,
      driverVersion: `5${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
      os,
      miner,
      pool,
      difficulty: Math.random() * 1000000 + 100000,
      shares: {
        accepted: Math.floor(Math.random() * 1000),
        rejected: Math.floor(Math.random() * 50),
        stale: Math.floor(Math.random() * 20),
      },
      uptime,
      profitability,
    };
  });
};

export const calculateSummary = (results: BenchmarkResult[]): BenchmarkSummary => {
  const totalTests = results.length;
  const averageHashrate = results.reduce((sum, r) => sum + r.hashrate, 0) / totalTests;
  const averageEfficiency = results.reduce((sum, r) => sum + r.efficiency, 0) / totalTests;
  
  const bestPerformer = results.reduce((best, current) => 
    current.hashrate > best.hashrate ? current : best
  );
  
  const recentTests = results
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return {
    totalTests,
    averageHashrate,
    averageEfficiency,
    bestPerformer: {
      algorithm: bestPerformer.algorithm,
      hashrate: bestPerformer.hashrate,
      gpuModel: bestPerformer.gpuModel,
    },
    recentTests,
  };
};
