import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardSales() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard/stats?tab=sales', { replace: true });
  }, [navigate]);
  return null;
}
