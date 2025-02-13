'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useUserStore from '../../stores/userStore';

export default function HooksPage() {
  const [hookContent, setHookContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useUserStore();
  const { addHook } = useUserStore();

  const handleGenerateHook = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement AI Hook Generation Logic
      // This is a placeholder - replace with actual AI hook generation
      const generatedHook = {
        id: Date.now().toString(),
        content: `Generated Marketing Hook: ${hookContent}`,
        createdAt: new Date().toISOString()
      };

      addHook(generatedHook);
      setHookContent('');
    } catch (error) {
      console.error('Hook generation failed', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Marketing Hook Generator
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <textarea
          value={hookContent}
          onChange={(e) => setHookContent(e.target.value)}
          placeholder="Describe your product, target audience, or key message..."
          className="w-full p-3 border rounded-md mb-4 min-h-[150px]"
        />

        <button
          onClick={handleGenerateHook}
          disabled={isGenerating || !hookContent}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Marketing Hook'}
        </button>
      </div>

      {/* Recent Hooks Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Hooks</h2>
        {user?.hooks?.length === 0 ? (
          <p className="text-gray-500">No hooks generated yet.</p>
        ) : (
          <div className="space-y-4">
            {user?.hooks?.map((hook) => (
              <div 
                key={hook.id} 
                className="bg-gray-100 p-4 rounded-md"
              >
                <p>{hook.content}</p>
                <small className="text-gray-500">
                  {new Date(hook.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 