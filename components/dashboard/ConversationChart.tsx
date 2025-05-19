import { useEffect, useState } from 'react';

type ChartData = {
  date: string;
  count: number;
}[];

type ConversationChartProps = {
  data: ChartData;
  loading: boolean;
};

export default function ConversationChart({ data, loading }: ConversationChartProps) {
  // Find max value to calculate bar heights
  const maxValue = Math.max(...data.map(d => d.count), 10);
  
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4">Conversation Trends</h2>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-300">No data available</h3>
          <p className="mt-1 text-sm text-gray-400">Start chatting with your bot to see trends.</p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="relative h-60">
            <div className="absolute inset-0 flex items-end justify-between">
              {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center w-full">
                  <div 
                    className="w-8 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-500 ease-in-out hover:opacity-80"
                    style={{ 
                      height: `${Math.max((item.count / maxValue) * 100, 4)}%`,
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Y-axis grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((_, i) => (
                <div key={i} className="w-full h-px bg-gray-700"></div>
              ))}
            </div>
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>7 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}