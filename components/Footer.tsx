import Image from 'next/image';
import discord_icon from '@/public/img/discord-icon.svg';
import x_icon from '@/public/img/x-icon.svg'; // додай свій файл

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500 mb-2 sm:mb-0">
          © {year} Minebench. Mining benchmark dashboard for performance analysis.
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="https://discord.gg/a3gNvZUW"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-mining-600 hover:text-mining-700 font-medium transition-colors"
          >
            <Image src={discord_icon} alt="Discord" width={20} height={20} className="mr-2" />
            Join our Discord
          </a>

          <a
            href="https://x.com/MineBenchdapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-mining-600 hover:text-mining-700 font-medium transition-colors"
          >
            <Image src={x_icon} alt="Twitter" width={20} height={20} className="mr-2" />
            Follow us on X
          </a>
        </div>
      </div>
    </footer>
  );
}
