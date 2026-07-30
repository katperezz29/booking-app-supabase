import React, { useState } from 'react';
import { isSupabaseConfigured, getSupabaseSqlSchema, supabase } from '../lib/supabase';
import { Database, CheckCircle2, Copy, X, ExternalLink, Code2, Shield, RefreshCw } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  if (!isOpen) return null;

  const sqlSchema = getSupabaseSqlSchema();

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    if (!supabase) {
      setTestResult('No Supabase environment variables detected in client runtime. Currently operating in reactive local storage & real-time BroadcastChannel mode.');
      setIsTesting(false);
      return;
    }

    try {
      const { error } = await supabase.from('appointments').select('count', { count: 'exact', head: true });
      if (error) {
        setTestResult(`Supabase connected, but table error: ${error.message}. Please run the SQL schema below in your Supabase dashboard SQL editor.`);
      } else {
        setTestResult('Success! Connected to Supabase PostgreSQL database and realtime table sync is active.');
      }
    } catch (err: any) {
      setTestResult(`Connection test error: ${err.message || 'Unable to reach Supabase API'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 border-b border-[#E8DFC8] pb-4">
          <div className="w-10 h-10 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center font-bold">
            <Database className="w-5 h-5 text-[#E6C280]" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#3D2C22]">
              Supabase & Vercel Setup Guide
            </h2>
            <p className="text-xs text-stone-500">
              Database schema & deployment environment variables
            </p>
          </div>
        </div>

        {/* Connection Status Box */}
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          isSupabaseConfigured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div className="space-y-1">
            <p className="font-bold">
              Current Database Engine Status: {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage + BroadcastChannel Real-Time Active'}
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              {isSupabaseConfigured
                ? 'Your app is actively communicating with Supabase PostgreSQL and listening to real-time postgres_changes events for time slots.'
                : 'The application is running with instant local storage persistence & real-time tab broadcasting. To connect your custom Supabase project on Vercel, follow the 2 steps below.'}
            </p>
          </div>
        </div>

        {/* Step 1: Copy SQL Schema */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#3D2C22] text-sm flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#8B5A2B]" />
              1. Supabase SQL Table Schema Script:
            </h3>

            <button
              onClick={handleCopySql}
              className="px-3 py-1 rounded-lg bg-[#8B5A2B] hover:bg-[#724821] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <pre className="bg-stone-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-48 scrollbar-thin">
            {sqlSchema}
          </pre>
          <p className="text-[11px] text-stone-500">
            Paste this SQL script into your <strong>Supabase Dashboard -&gt; SQL Editor</strong> and click "Run".
          </p>
        </div>

        {/* Step 2: Vercel Environment Variables */}
        <div className="space-y-2 pt-2 border-t border-[#E8DFC8]">
          <h3 className="font-serif font-bold text-[#3D2C22] text-sm flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-[#8B5A2B]" />
            2. Vercel Environment Variables:
          </h3>
          <p className="text-xs text-stone-600">
            When uploading this repository to Vercel, add these 2 environment variables under <strong>Project Settings -&gt; Environment Variables</strong>:
          </p>

          <div className="space-y-1 font-mono text-xs bg-stone-100 p-3 rounded-xl border border-stone-200">
            <p className="text-stone-800"><strong>VITE_SUPABASE_URL</strong>=https://your-project.supabase.co</p>
            <p className="text-stone-800"><strong>VITE_SUPABASE_ANON_KEY</strong>=your-anon-public-key</p>
          </div>
        </div>

        {/* Test Button & Result */}
        <div className="pt-2 border-t border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3D2C22] hover:bg-[#5C4B40] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Test Supabase Connection</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>

        {testResult && (
          <div className="p-3 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 text-xs font-medium">
            {testResult}
          </div>
        )}

      </div>
    </div>
  );
};
