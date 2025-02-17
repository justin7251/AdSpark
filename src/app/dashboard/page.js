'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import useUserStore from '../../stores/userStore';
import TokenManager from '../../components/TokenManager';
import { 
  getUserSearchHistory, 
  getUserPurchaseHistory,
  getUserGeneratedHooks
} from '../../lib/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import Navbar from '../../components/Navbar';
import RenderHookHistory from "../../components/RenderHookHistory";
import RenderSearchHistory from '../../components/RenderSearchHistory';
import RenderPurchaseHistory from '../../components/RenderPurchaseHistory';

export default function Dashboard() {
  const { signOutUser } = useAuth();
  const { user } = useUserStore();
  const [searchHistory, setSearchHistory] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [generatedHooks, setGeneratedHooks] = useState([]);
  const [activeTab, setActiveTab] = useState('hooks');
  const [isLoading, setIsLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistoryData = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [searches, purchases, hooks] = await Promise.all([
          getUserSearchHistory(user.uid),
          getUserPurchaseHistory(user.uid),
          getUserGeneratedHooks(user.uid)
        ]);

        setSearchHistory(searches);
        setPurchaseHistory(purchases);
        setGeneratedHooks(hooks);
      } catch (error) {
        console.error('Failed to fetch history data', error);
        setError(error.message || 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, [user]);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (user && user.uid) {
        try {
          // Fetch user document to get current token balance
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setTokenBalance(userDoc.data().tokens || 0);
          }
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      }
    };

    fetchTokenBalance();
  }, [user]);

  const handleLogout = () => {
    signOutUser();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 text-center p-4">
          {error}
        </div>
      );
    }

    const renderTable = (data, columns) => {
      if (data.length === 0) {
        return (
          <div className="text-center text-gray-500 p-4">
            No {activeTab} history found
          </div>
        );
      }

      return (
        <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="space-y-4">
          {data.map((item) => (
            <div 
              key={item.id} 
              className="bg-white shadow rounded-lg p-4"
            >
              <p className="text-gray-800 mb-2">{item.hookContent}</p>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>
                  {item.product} - {item.platform}
                </span>
                <span>
                    {item.timestamp?.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).slice(0, columns.length).map((value, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {value instanceof Date 
                        ? value.toLocaleString() 
                        : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
        </div>
      );
    };

    switch (activeTab) {
      case 'hooks':
        return (<RenderHookHistory data={generatedHooks} />);
      case 'searches':
        return (<RenderSearchHistory data={searchHistory} />);
      case 'purchases':
        return (<RenderPurchaseHistory data={purchaseHistory} />);
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            {user?.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{user?.displayName}</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/hooks"
              className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              Create Marketing Hook
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-50 rounded-md px-3 py-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-indigo-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="font-medium text-indigo-800">
            Token Balance: {tokenBalance}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
            <div className="flex border-b mb-4">
              {['hooks', 'searches', 'purchases'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 capitalize ${
                    activeTab === tab 
                      ? 'border-b-2 border-indigo-500 text-indigo-600' 
                      : 'text-gray-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {renderContent()}
          </div>

          <div>
            <TokenManager />
          </div>
        </div>
      </div>
    </div>
  );
}
