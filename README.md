# AdSpark - AI-Powered Marketing Hook Generator

## Overview

AdSpark is a cutting-edge web application designed to help marketers generate high-converting ad copy using advanced AI technology.

## Features

- 🚀 AI-Powered Marketing Hooks: Instant, compelling ad copy generation
- 🔐 Secure Authentication: Firebase Authentication
- 💾 Persistent Storage: Firestore Database for saving and managing hooks
- ⚡ High-Performance Web App: Next.js App Router with Server Components

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React
- **Styling**: Tailwind CSS
- **State Management**: Zustand

### Backend
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **API**: Google Gemini AI (Flash 2)

### Deployment
- **Hosting**: Firebase Hosting
- **Serverless Functions**: Firebase Cloud Functions

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18+ recommended)
- npm or Yarn
- Firebase Account
- Google Cloud Project
- Gemini API Access

## Installation

### 1. Clone the Repository

git clone https://github.com/your-repo/adspark.git
cd adspark

### 2. Install Dependencies

npm install

Set up environment variables:
Create a .env.local file and add:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

### 4. Run the Development Server

npm run dev

Access the app at http://localhost:3000

Usage Guide

Home Page: Click on "Generate Marketing Hooks" to access the AI tool.

Generate Hooks: Enter a product description and get AI-generated marketing hooks.

Authentication: Login functionality will be added in future updates.

## Key Functionalities

- 🔍 AI-Powered Hook Generation
- 💾 Save and Manage Marketing Hooks
- 🔐 Secure User Authentication
- 📊 User-Specific Hook History

## Roadmap

### Upcoming Features
- [ ] Enhanced AI Prompt Engineering
- [ ] Advanced Hook Customization
- [ ] Multi-Platform Hook Generation
- [ ] Analytics and Performance Tracking
- [ ] Collaborative Hook Editing

## Performance Optimization

- Server-side rendering with Next.js App Router
- Efficient state management with Zustand
- Optimized Firebase interactions
- Tailwind CSS for minimal CSS footprint

## Security Considerations

- Firebase Authentication
- Secure API key management
- Environment-based configuration
- Input validation and sanitization

## Contribution

### How to Contribute
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

- Ensure all environment variables are correctly set
- Check Firebase project configurations
- Verify Gemini API access and credentials

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [Your Email]
Project Link: [https://github.com/your-username/adspark](https://github.com/your-username/adspark)