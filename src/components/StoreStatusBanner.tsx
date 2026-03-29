interface StoreStatusBannerProps {
  isOpen: boolean;
  message: string;
}

export default function StoreStatusBanner({ isOpen, message }: StoreStatusBannerProps) {
  return (
    <div
      className={`w-full py-2.5 px-4 text-center text-sm font-medium transition-colors ${
        isOpen
          ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-b border-green-100 dark:border-green-500/20'
          : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-b border-red-100 dark:border-red-500/20'
      }`}
      id="store-status-banner"
    >
      <span className="inline-flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        {message}
      </span>
    </div>
  );
}
