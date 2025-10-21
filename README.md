# Minebench UI - Mining Benchmark Dashboard

A comprehensive Next.js dashboard for mining benchmark results with performance analytics, built for deployment on Akash Network.

## 🚀 Features

- **Real-time Benchmark Data**: Display mining performance metrics including hashrate, power consumption, efficiency, and temperature
- **Interactive Tables**: Sortable and filterable results with search functionality
- **Performance Analytics**: Statistical summaries and trend analysis
- **Export Capabilities**: CSV export for data analysis
- **Responsive Design**: Modern UI with Tailwind CSS
- **Docker Ready**: Optimized for containerized deployment
- **Akash Compatible**: Ready for decentralized cloud deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Docker + Akash Network

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minebench-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t minebench-ui .
```

### Run Container

```bash
docker run -p 3000:3000 minebench-ui
```

### Using Docker Compose

```bash
docker-compose up -d
```

## 🌐 Akash Network Deployment

### Prerequisites for Akash

1. Install Akash CLI
2. Create Akash account and fund it
3. Configure Akash provider

### Deploy to Akash

1. **Build and push image to registry**
   ```bash
   # Build the image
   docker build -t minebench-ui .
   
   # Tag for your registry
   docker tag minebench-ui your-registry/minebench-ui:latest
   
   # Push to registry
   docker push your-registry/minebench-ui:latest
   ```

2. **Update deploy.yml with your image**
   ```yaml
   services:
     minebench-ui:
       image: your-registry/minebench-ui:latest
   ```

3. **Deploy using Akash CLI**
   ```bash
   akash tx deployment create deploy.yml --from your-key
   ```

### Akash Configuration

The `deploy.yml` file is configured for:
- **CPU**: 0.5 units
- **Memory**: 512Mi
- **Storage**: 1Gi
- **Port**: 3000 (exposed as port 80)
- **Pricing**: 1000 uakt per block

## 📊 Data Structure

### Benchmark Result Interface

```typescript
interface BenchmarkResult {
  id: string;
  timestamp: string;
  algorithm: string;
  hashrate: number;
  powerConsumption: number;
  efficiency: number;
  temperature: number;
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
  uptime: number;
  profitability: number;
}
```

## 🎨 Customization

### Adding New Metrics

1. Update the `BenchmarkResult` interface in `types/benchmark.ts`
2. Add formatting functions in `lib/utils.ts`
3. Update table columns in `components/BenchmarkTable.tsx`

### Styling

The app uses Tailwind CSS with custom mining-themed colors:
- Primary: Blue gradient
- Mining: Yellow/Gold gradient
- Custom utilities in `app/globals.css`

### Mock Data

Currently uses generated mock data. To connect to real data:
1. Replace `generateMockData()` calls with API calls
2. Update data fetching in `app/page.tsx`
3. Add error handling and loading states

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: Production/development mode
- `PORT`: Server port (default: 3000)
- `HOSTNAME`: Server hostname (default: 0.0.0.0)

### Next.js Configuration

The app is configured with:
- Standalone output for Docker optimization
- App Router enabled
- Image optimization disabled for static deployment

## 📈 Performance

- **Bundle Size**: Optimized with Next.js standalone output
- **Loading**: Lazy loading and code splitting
- **Caching**: Static generation where possible
- **Responsive**: Mobile-first design

## 🚀 Production Checklist

- [ ] Update image registry in `deploy.yml`
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS certificates
- [ ] Set up backup strategies
- [ ] Configure scaling policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the Akash deployment guide

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Akash Network](https://akash.network/)
- [Docker Documentation](https://docs.docker.com/)

---

**Ready for Akash deployment** 🚀
