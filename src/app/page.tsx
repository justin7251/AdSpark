'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  RocketLaunchIcon 
} from '@heroicons/react/24/solid';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
        >
          Unleash AI-Powered 
          <span className="block text-indigo-600">Marketing Hooks</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-2xl mx-auto text-xl text-gray-600 mb-10"
        >
          Generate compelling marketing copy in seconds with our advanced AI technology
        </motion.p>

        <div className="flex justify-center space-x-4">
          <Link 
            href="/auth/signup"
            className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
          >
            Get Started Free
          </Link>
          <Link 
            href="/auth/login"
            className="px-8 py-3 border border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-50 transition"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <SparklesIcon className="w-12 h-12 text-indigo-600" />,
              title: 'AI-Powered Generation',
              description: 'Leverage cutting-edge AI to create unique marketing hooks instantly'
            },
            {
              icon: <LightBulbIcon className="w-12 h-12 text-green-600" />,
              title: 'Creative Insights',
              description: 'Get innovative marketing copy tailored to your brand'
            },
            {
              icon: <RocketLaunchIcon className="w-12 h-12 text-purple-600" />,
              title: 'Rapid Deployment',
              description: 'Generate hooks for multiple platforms in seconds'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-white p-6 rounded-lg shadow-md text-center"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-600 text-white py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to Revolutionize Your Marketing?
          </h2>
          <p className="text-xl mb-8">
            Start generating high-converting marketing hooks today
          </p>
          <Link 
            href="/auth/signup"
            className="px-10 py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition"
          >
            Create Free Account
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
