// export interface BenchmarkResult {
//   id: string;
//   timestamp: string;
//   algorithm: string;
//   hashrate: number;
//   powerConsumption: number;
//   efficiency: number;
//   temperature: number;
//   gpuModel: string;
//   driverVersion: string;
//   os: string;
//   miner: string;
//   pool: string;
//   difficulty: number;
//   shares: {
//     accepted: number;
//     rejected: number;
//     stale: number;
//   };
//   uptime: number;
//   profitability: number;
// }
export interface BenchmarkResult {
  id: number;                // або string, якщо Supabase генерує uuid
  timestamp: string;         // дата у ISO форматі
  algorithm: string;
  hashrate: number;          // в H/s
  powerConsumption: number;  // в W
  efficiency: number;        // H/W
  temperature: number;       // °C
  gpuModel: string;
  driverVersion: string;
  os: string;
  miner: string;
  pool: string;
  difficulty: number;
  shares: {
    accepted: number;
    rejected: number;
    stale: number;
  };
  uptime: number;            // в секундах
  profitability: number;     // $/day
}

export interface BenchmarkSummary {
  totalTests: number;
  averageHashrate: number;
  averageEfficiency: number;
  bestPerformer: {
    algorithm: string;
    hashrate: number;
    gpuModel: string;
  };
  recentTests: BenchmarkResult[];
}

export interface FilterOptions {
  algorithm?: string;
  gpuModel?: string;
  miner?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
