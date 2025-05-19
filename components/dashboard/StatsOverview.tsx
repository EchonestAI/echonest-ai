import { useState, useEffect } from 'react';

type StatsProps = {
  totalConversations: number;
  successRate: number;
  safetyScore: number;
  loadingStats: boolean;
}

export default function StatsOverview({ 
  totalConversations, 
  successRate, 
  safetyScore,
  loadingStats
}: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">Total Conversations</h2>
            <p className="mt-1 text-3xl font-bold">
              {loadingStats ? (
                <span className="inline-block w-16 h-8 bg-gray-700 animate-pulse rounded"></span>
              ) : (
                totalConversations.toLocaleString()
              )}
            </p>
          </div>
        </div>
        {!loadingStats && totalConversations > 0 && (
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="ml-1">12% increase</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">Safety Score</h2>
            <p className="mt-1 text-3xl font-bold">
              {loadingStats ? (
                <span className="inline-block w-16 h-8 bg-gray-700 animate-pulse rounded"></span>
              ) : (
                `${safetyScore}%`
              )}
            </p>
          </div>
        </div>
        {!loadingStats && safetyScore > 0 && (
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="ml-1">3% increase</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-500/20 text-green-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">Success Rate</h2>
            <p className="mt-1 text-3xl font-bold">
              {loadingStats ? (
                <span className="inline-block w-16 h-8 bg-gray-700 animate-pulse rounded"></span>
              ) : (
                `${successRate}%`
              )}
            </p>
          </div>
        </div>
        {!loadingStats && successRate > 0 && (
          <div className="mt-4">
            <div className="flex items-center text-sm text-yellow-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
              <span className="ml-1">No change</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}