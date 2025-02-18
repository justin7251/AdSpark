'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import useUserStore from '../../stores/userStore';
import { 
  getUserGeneratedHooks, 
  getUserSearchHistory 
} from '../../lib/firebaseService';

import RenderHookHistory from "../../components/RenderHookHistory";
import RenderSearchHistory from '../../components/RenderSearchHistory';

export default function HistoryPage() {
  const { user } = useUserStore();
  const [generatedHooks, setGeneratedHooks] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hooks');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [hooks, searches] = await Promise.all([
          getUserGeneratedHooks(user.uid, 50),
          getUserSearchHistory(user.uid, 50)
        ]);

        setGeneratedHooks(hooks);
        setSearchHistory(searches);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
      );
    }

    if (activeTab === 'hooks') {
      return generatedHooks.length === 0 ? (
        <p className="text-center text-gray-500">No generated hooks yet</p>
      ) : (
        <RenderHookHistory data={generatedHooks} />
      );
    }

      return searchHistory.length === 0 ? (
      <p className="text-center text-gray-500">No search history</p>
    ) : (
      <RenderSearchHistory data={searchHistory} />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Marketing Hook History
        </h1>

        <div className="bg-white shadow rounded-lg">
          <div className="flex border-b">
            {['hooks', 'searches'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize ${
                  activeTab === tab 
                    ? 'border-b-2 border-indigo-500 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 