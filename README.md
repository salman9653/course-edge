# 🎓 Course Edge

**Course Edge** is a state-of-the-art AI-powered learning platform designed to provide an immersive and interactive educational experience. Built with the latest web technologies, it offers a seamless interface for students to manage their courses, track progress, and engage with content in a modern, desktop-like environment.

![Course Edge Preview](https://github.com/salman9653/course-edge/blob/main/public/preview.png?raw=true)

## ✨ Features

- 🚀 **Modern Dashboard**: A central hub to view your enrolled courses, current progress, and learning statistics at a glance.
- 📺 **Interactive Course Player**: A sophisticated video learning interface with a dynamic sidebar for module navigation and lesson tracking.
- 🤖 **AI-powered Learning**: Integrated with Google's Generative AI to provide smart assistance and enhance the learning process.
- 📊 **Progress Tracking**: Visualize your learning journey with progress bars, completed modules, and mastered learning phases.
- 🧩 **Interactive Quizzes**: Test your knowledge with built-in quiz modules designed to reinforce learning.
- 🎨 **Premium UI/UX**: A sleek, responsive design featuring glassmorphism, smooth Framer Motion animations, and full Dark/Light mode support.
- 📱 **PWA Ready**: Install Course Edge on your device for a native-like experience with offline capabilities.
- 🔐 **Secure Authentication**: Robust user management powered by Firebase Authentication.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend/Auth**: [Firebase](https://firebase.google.com/) & [Firebase Admin](https://firebase.google.com/docs/admin)
- **AI Integration**: [Google AI SDK](https://sdk.vercel.ai/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Geist Sans & Mono

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/salman9653/course-edge.git
   cd course-edge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   # Firebase Client
   NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

   # Firebase Admin
   FIREBASE_PROJECT_ID="your_project_id"
   FIREBASE_CLIENT_EMAIL="your_admin_email"
   FIREBASE_PRIVATE_KEY="your_private_key"

   # AI & External APIs
   GOOGLE_GENERATIVE_AI_API_KEY="your_google_ai_key"
   YOUTUBE_API_KEY="your_youtube_api_key"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) to see the result.

## 📂 Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components (Shadcn UI, Layout, etc.).
- `src/hooks`: Custom React hooks for state and functionality.
- `src/lib`: Utility functions and third-party configurations (Firebase, AI).
- `src/types`: TypeScript type definitions.
- `public`: Static assets and PWA icons.

## 📱 PWA Support

Course Edge is configured as a Progressive Web App. You can install it on your mobile device or desktop for better performance and a native app feel.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [Salman](https://github.com/salman9653)
