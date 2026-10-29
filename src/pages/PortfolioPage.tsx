import { PortfolioSkeleton } from '@/components/public/PortfolioSkeleton';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioLayout } from '@/layouts/PortfolioLayout';

export default function PortfolioPage() {
  const { content } = usePortfolio();
  if (!content) return <PortfolioSkeleton />;
  return <PortfolioLayout content={content} />;
}
