import { useEffect, useState } from 'react';

type Activity = {
  id: number | string;
  type: 'chat' | 'test' | 'create';
  bot: string;
  time: string;
  message: string;
};

type RecentActivityProps = {
  activities: Activity[];
  loading: boolean;
};

export default function RecentActivity({ activities, loading }: RecentActivityProps) {
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-300">No recent activity</h3>
          <p className="mt-1 text-sm text-gray-400">Your recent bot activity will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {activities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-gray-700">
                  {activity.type === 'chat' && (
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  )}
                  {activity.type === 'test' && (
                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                  {activity.type === 'create' && (
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{activity.bot}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && activities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-700 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-300">View All Activity</button>
        </div>
      )}
    </div>
  );
}