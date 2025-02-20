// components/renderHookHistory.js
import React from "react";

/**
 * Renders a list of generated marketing hooks.
 * @param {Array} data - Array of hook objects [{ id, hookContent, product, platform, timestamp }]
 * @returns JSX element
 */
export default function RenderHookHistory({ data }) {
  return (
    <div className="space-y-4">
          {data.map((hook) => (
            <div 
              key={hook.id} 
              className="bg-white shadow rounded-lg p-4"
            >
              <p className="text-gray-800 mb-2">{hook.hookContent}</p>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>
                  {hook.product} - {hook.platform}
                </span>
                <span>
                    {hook.timestamp?.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
  );
}

