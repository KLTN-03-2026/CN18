'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const processAuth = async () => {
      // Check for errors in URL
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        console.error('OAuth Error:', error, errorDescription);
        
        let displayError = errorDescription || 'Có lỗi xảy ra trong quá trình đăng nhập.';
        if (errorDescription?.includes('Unable to exchange external code')) {
          displayError = 'Lỗi cấu hình Google OAuth trong Supabase: Vui lòng kiểm tra lại Client ID và Client Secret trong Supabase Dashboard (Authentication -> Providers -> Google).';
        }
        
        setErrorMsg(displayError);
        
        // Notify opener about the error
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: displayError }, '*');
          // Don't close immediately so user can see the error
          setTimeout(() => window.close(), 5000);
        }
        return;
      }

      // Wait for Supabase to process the session from the URL hash
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session Error:', sessionError);
        setErrorMsg(sessionError.message || 'Lỗi xác thực phiên đăng nhập.');
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: sessionError.message }, '*');
          setTimeout(() => window.close(), 3000);
        }
        return;
      }

      // If no session yet, wait for the auth state change event
      if (!session) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (event === 'SIGNED_IN' && newSession) {
            subscription.unsubscribe();
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          }
        });
        
        // Timeout after 5 seconds if still no session
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            window.close();
          } else {
            window.location.href = '/dashboard';
          }
        }, 5000);
        return;
      }
      
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
        window.close();
      } else {
        window.location.href = '/dashboard';
      }
    };
    
    processAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans">
      <div className="text-center max-w-md p-6">
        {errorMsg ? (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">!</div>
            <h2 className="text-xl font-bold mb-2">Đăng nhập thất bại</h2>
            <p className="text-slate-400 text-sm mb-4">{errorMsg}</p>
            <p className="text-slate-500 text-xs">Cửa sổ này sẽ tự động đóng...</p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-4 border-[#C6102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Đang xác thực... Cửa sổ này sẽ tự động đóng.</p>
          </>
        )}
      </div>
    </div>
  );
}
