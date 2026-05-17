import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { supabaseConfigured } from '../lib/supabase';

export default function App() {
  return (
    <>
      {!supabaseConfigured && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#ef4444', color: '#fff', textAlign: 'center',
          padding: '10px 16px', fontSize: '13px', fontFamily: 'monospace',
        }}>
          ⚠ Supabase not configured — create <strong>frontend/.env.local</strong> with
          VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.
          playerId is null; auth and rooms are disabled.
        </div>
      )}
      <RouterProvider router={router} />
    </>
  );
}
