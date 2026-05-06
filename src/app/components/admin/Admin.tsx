import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminSignup from './AdminSignup';
import AdminCheck from './AdminCheck';
import { supabase } from '../../../../utils/supabase/client';

interface AdminProps {
  onNavigate?: (page: string) => void;
}

export default function Admin({ onNavigate }: AdminProps = {}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        setAccessToken(session.access_token);
        setCheckingAdmin(true);
      }
    } catch (error) {
      console.error('[Admin] Erro ao verificar sessão');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    setAccessToken(token);
    setCheckingAdmin(true);
  };

  const handleAdminVerified = () => {
    console.log('[Admin] ✅ Admin verificado - entrando no dashboard');
    setCheckingAdmin(false);
  };

  const handleNotAdmin = async () => {
    console.log('[Admin] ❌ Não é admin - fazendo logout');
    setCheckingAdmin(false);
    await handleLogout();
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAccessToken(null);
      setCheckingAdmin(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (showSignup) {
    return (
      <AdminSignup
        onSignupSuccess={handleSignupSuccess}
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  if (!accessToken) {
    return (
      <AdminLogin onLoginSuccess={handleLoginSuccess} onShowSignup={() => setShowSignup(true)} />
    );
  }

  // Se tem token mas precisa verificar se é admin
  if (checkingAdmin) {
    return (
      <AdminCheck
        accessToken={accessToken}
        onAdminVerified={handleAdminVerified}
        onNotAdmin={handleNotAdmin}
      />
    );
  }

  return (
    <AdminDashboard
      accessToken={accessToken}
      onLogout={handleLogout}
      onNavigateHome={onNavigate ? () => onNavigate('home') : undefined}
    />
  );
}
