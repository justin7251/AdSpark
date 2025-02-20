// components/renderHookHistory.js
import React from "react";

/**
 * Renders a list of generated marketing hooks.
 * @param {Array} data - Array of hook objects [{ id, hookContent, product, platform, timestamp }]
 * @returns JSX element
 */
export default function RenderPurchaseHistory({ data }) {
  return (
    <div className="space-y-4">
    {data.map((search, index) => (
        <div 
        key={index} 
        className="bg-white shadow rounded-lg p-4"
        >
        <div className="flex justify-between">
            <div>
            <p className="font-medium">Product: {search.product}</p>
            <p className="text-gray-600">
                Audience: {search.audience} | 
                Tone: {search.tone} | 
                Platform: {search.platform}
            </p>
            </div>
            <span className="text-sm text-gray-500">
            { search.timestamp?.toLocaleString() }
            </span>
        </div>
        </div>
    ))}
    </div>
  );
}

