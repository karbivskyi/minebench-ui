import React from "react";
import { Monitor, Download } from "lucide-react";
import Image from "next/image";
import Windows from "@/public/img/windows.svg";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Release = {
    version: string;
    url: string | null;
    name: string | null;
};

async function getLatestRelease(repo: string): Promise<Release | null> {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: { "Accept": "application/vnd.github+json" },
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        console.error(`Failed to fetch release for ${repo}`);
        return null;
    }

    const data = await res.json();

    const asset =
        data.assets.find((a: any) => a.name.endsWith(".zip")) ||
        data.assets.find((a: any) => a.name.endsWith(".exe"));

    return {
        version: data.tag_name,
        url: asset ? asset.browser_download_url : null,
        name: asset ? asset.name : null,
    };
}

export default async function DownloadsPage() {
    const cpuRepo = "karbivskyi/MineBench-CPU-ZEPH";
    const gpuRepo = "karbivskyi/MineBench-GPU-RVN";

    const [cpuRelease /*, gpuRelease*/] = await Promise.all([
        getLatestRelease(cpuRepo),
        // getLatestRelease(gpuRepo),
    ]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="container mx-auto px-6 py-16 flex-1">
                <h1 className="text-4xl font-bold mb-10 text-center text-gray-900 dark:text-white">
                    MineBench Downloads
                </h1>

                <div className="grid gap-6 max-w-lg mx-auto">
                    {/* CPU CLIENT */}
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-3">
                            <Monitor className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                MineBench CPU
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                            <Image src={Windows} alt="Windows" width={24} height={24} />
                            <span>Windows version</span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                            Benchmark your CPU performance using the latest MineBench release.
                        </p>

                        {cpuRelease && cpuRelease.url ? (
                            <a
                                href={cpuRelease.url}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download {cpuRelease.name} ({cpuRelease.version})
                            </a>
                        ) : (
                            <p className="text-red-500 font-medium">
                                Download temporarily unavailable.
                            </p>
                        )}
                    </div>

                    {/* GPU CLIENT (coming soon) */}
                    {/*
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 opacity-60">
          <div className="flex items-center gap-3 mb-3">
            <Monitor className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              MineBench GPU
            </h2>
          </div>

          <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
            <Windows className="w-5 h-5" />
            <span>Windows version</span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            GPU benchmark version coming soon.
          </p>
        </div>
        */}
                </div>
            </main>
            <Footer />
        </div>
    );
}
