import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyCenter } from '@/hooks/useCenter';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePro?: boolean;
}

export default function ProtectedRoute({ children, requirePro = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { center, loading: centerLoading } = useMyCenter();

  if (loading || (user && centerLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if route requires Pro and user doesn't have it
  if (requirePro && center && center.subscription_plan !== 'pro') {
    return <Navigate to="/dashboard/upgrade" replace />;
  }

  return <>{children}</>;
}
