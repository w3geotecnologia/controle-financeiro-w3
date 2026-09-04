import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileMenu } from '@/components/MobileMenu';

const MenuFinanceiro = () => {
  const navigate = useNavigate();
  return <MobileMenu onViewDashboard={() => navigate('/')} />;
};

export default MenuFinanceiro;
