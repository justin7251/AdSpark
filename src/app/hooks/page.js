'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '../../stores/userStore';
import { createMarketingHook, continueHookConversation } from '../../lib/geminiService';
import { logGeneratedHook, logUserSearch } from '../../lib/firebaseService';
import Navbar from '../../components/Navbar';

const HOOK_GENERATION_COST = 10;
const MARKETING_TONES = ['Professional', 'Casual', 'Humorous', 'Inspirational'];
const MARKETING_PLATFORMS = ['Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Twitter'];

export default function HooksPage() {
  const router = useRouter();
  const { user, hasEnoughTokens, updateTokens, fetchTokenBalance } = useUserStore();
  
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [platform, setPlatform] = useState('');
  const [generatedHooks, setGeneratedHooks] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHook, setSelectedHook] = useState(null);
  const [continuationInput, setContinuationInput] = useState('');
  const [selectedHookForContinuation, setSelectedHookForContinuation] = useState(null);

  useEffect(() => {
    if (user && user.uid) {
      fetchTokenBalance(user.uid);
    }
  }, [user]);

  const handleGenerateHook = async (e) => {
    e.preventDefault();
    setError(null);

    // Fetch latest token balance
    if (user && user.uid) {
      await fetchTokenBalance(user.uid);
    }

    // Validate inputs
    if (!product || !audience || !tone || !platform) {
      setError('Please fill in all fields');
      return;
    }

    // Check token balance
    if (!hasEnoughTokens(HOOK_GENERATION_COST)) {
      setError('Insufficient tokens. Please purchase more.');
      return;
    }

    try {
      setIsGenerating(true);

      const hookData = {
        product,
        audience,
        tone,
        platform
      };

      const generatedHooks = await createMarketingHook(hookData);

      // Log each generated hook
      for (const hook of generatedHooks) {
        await logGeneratedHook(user.uid, {
          ...hookData,
          hookContent: hook.content
        });
      }

      // Log the search
      await logUserSearch(user.uid, hookData);

      // Update tokens
      await updateTokens(-HOOK_GENERATION_COST);

      // Update state
      setGeneratedHooks(generatedHooks);
      
      // Reset form
      setProduct('');
      setAudience('');
      setTone('');
      setPlatform('');
    } catch (error) {
      console.error('Hook generation failed', error);
      setError(error.message || 'Failed to generate hooks');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueConversation = async (hook) => {
    // Open continuation modal/input
    setSelectedHookForContinuation(hook);
    setContinuationInput('');
  };

  const submitHookContinuation = async () => {
    if (!selectedHookForContinuation || !continuationInput.trim()) {
      setError('Please provide a continuation prompt');
      return;
    }

    try {
      setIsGenerating(true);

      const continuationContext = {
        product,  // Use existing form context
        audience, 
        platform, 
        tone,
        userPrompt: continuationInput
      };

      const continuedHook = await continueHookConversation(
        selectedHookForContinuation.content, 
        continuationContext
      );

      // Log the continued hook
      await logGeneratedHook(user.uid, {
        ...continuationContext,
        originalHook: selectedHookForContinuation.content,
        hookContent: continuedHook.content
      });

      // Update tokens
      await updateTokens(-HOOK_GENERATION_COST);

      // Add the continued hook to generated hooks
      setGeneratedHooks([...generatedHooks, continuedHook]);
      
      // Reset continuation state
      setSelectedHookForContinuation(null);
      setContinuationInput('');
    } catch (error) {
      console.error('Conversation continuation failed', error);
      setError(error.message || 'Failed to continue conversation');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Hook copied to clipboard!');
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-8 sm:p-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                Generate Marketing Hooks
              </h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleGenerateHook} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                      Product/Service
                    </label>
                    <input
                      type="text"
                      id="product"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., AI Marketing Tool"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      id="audience"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Marketing Professionals"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                      Marketing Tone
                    </label>
                    <select
                      id="tone"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Tone</option>
                      {MARKETING_TONES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                      Marketing Platform
                    </label>
                    <select
                      id="platform"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Platform</option>
                      {MARKETING_PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Hook Generation Cost: {HOOK_GENERATION_COST} Tokens
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Hook'}
                  </button>
                </div>
              </form>
            </div>

            {generatedHooks.length > 0 && (
              <div className="bg-gray-50 px-6 py-8 sm:p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Generated Hooks
                </h3>
                {generatedHooks.map((hook, index) => (
                  <div key={index} className="bg-white shadow rounded-lg p-6 mb-4">
                    <p className="text-gray-800 mb-4">{hook.content}</p>
                    
                    {/* Continuation Input */}
                    {selectedHookForContinuation === hook && (
                      <div className="mt-4">
                        <textarea
                          value={continuationInput}
                          onChange={(e) => setContinuationInput(e.target.value)}
                          placeholder="Provide more context or direction for continuing this hook..."
                          className="w-full p-2 border rounded-md"
                          rows={3}
                        />
                        <button
                          onClick={submitHookContinuation}
                          disabled={isGenerating}
                          className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                          {isGenerating ? 'Generating...' : 'Continue Hook'}
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-500">
                        {tone} tone for {platform}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => copyToClipboard(hook.content)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Copy Hook
                        </button>
                        <button
                          onClick={() => handleContinueConversation(hook)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Refine Hook
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}