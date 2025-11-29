import React, { useState } from 'react';
import { api } from '../utils/api';   // adjust path if needed

import {
  Plus,
  LogIn,
  Copy,
  Check,
  Code,
  Users,
  Zap,
  Home,
  Download,
  Info,
  User,
  Lock
} from 'lucide-react';

interface RoomManagerProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string, userName: string) => void;
  isLoading: boolean;
}

const RoomManager: React.FC<RoomManagerProps> = ({
  onCreateRoom,
  onJoinRoom,
  isLoading
}) => {
  const [mode, setMode] = useState<'home' | 'join' | 'create'>('home');
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleJoinRoom = () => {
    if (roomId.trim() && userName.trim()) {
      onJoinRoom(roomId.trim(), userName.trim());
    }
  };

  const handleCreateRoom = async () => {
  if (userName.trim()) {
    try {
      const data = await api.createRoom();   // 👍 correct API call
      setNewRoomId(data.roomId);
      setMode('create');
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  }
};


  const copyRoomId = () => {
    navigator.clipboard.writeText(newRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinCreatedRoom = () => {
    if (newRoomId && userName.trim()) {
      onJoinRoom(newRoomId, userName.trim());
    }
  };

  // Collaborative Coding Logo Component
  const CollaborativeLogo = () => (
    <div className="flex items-center justify-center py-6 relative z-20">
      <div className="flex items-center space-x-4 bg-gradient-to-r from-gray-800/80 to-slate-800/80 backdrop-blur-xl rounded-2xl px-8 py-4 border border-gray-600/30 shadow-2xl">
        {/* Animated Logo Icon */}
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-500">
            <div className="relative">
              {/* Main Code Brackets */}
              <Code className="w-8 h-8 text-white" />

              {/* Collaborative Dots */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Connection Lines */}
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400/50 rounded-bl-lg"></div>
        </div>

        {/* Logo Text */}
        <div className="text-left">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            CodeSync
          </h1>
          <p className="text-xs text-gray-400 font-medium tracking-wider">
            COLLABORATIVE CODING
          </p>
        </div>
      </div>
    </div>
  );

  // Alternative Minimal Logo
  const MinimalLogo = () => (
    <div className="flex items-center justify-center py-6 relative z-20">
      <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/80 to-slate-800/80 backdrop-blur-xl rounded-xl px-6 py-3 border border-gray-600/30 shadow-xl">
        {/* Stacked Code Icons */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Users className="w-2 h-2 text-white" />
          </div>
        </div>

        <div className="text-left">
          <h1 className="text-xl font-bold text-white">CodeSync</h1>
          <p className="text-xs text-gray-400">Real-time Collaboration</p>
        </div>
      </div>
    </div>
  );

  // Navigation Component with Logo
  const Navigation = () => (
    <nav className="relative z-10">
      <CollaborativeLogo />
    </nav>
  );

  // Enhanced Background with multiple overlays
  const BackgroundWithOverlay = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900"></div>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent_70%)]"></div>

      {/* Hexagon Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_0%,transparent_75%,rgba(103,232,249,0.1)_75%,rgba(103,232,249,0.1)_100%),linear-gradient(150deg,transparent_0%,transparent_75%,rgba(59,130,246,0.1)_75%,rgba(59,130,246,0.1)_100%)] bg-[size:60px_60px]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-orb-float-1"></div>
      <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-orb-float-2"></div>
      <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-orb-float-3"></div>
      <div className="absolute bottom-1/3 -right-20 w-60 h-60 bg-gradient-to-r from-green-500/15 to-cyan-500/15 rounded-full blur-3xl animate-orb-float-4"></div>

      {/* Scan Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] opacity-30"></div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_70%)"></div>

      {/* Binary Code Animation */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(103,232,249,0.1)_50%,transparent_100%)] animate-scan"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-line"></div>
      </div>

      {/* Glass Morphism Reflection */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-20"></div>

      {/* Circuit Board Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(103,232,249,0.3)_24px,rgba(103,232,249,0.3)_25px,transparent_25px),linear-gradient(0deg,transparent_24px,rgba(59,130,246,0.3)_24px,rgba(59,130,246,0.3)_25px,transparent_25px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Holographic Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,rgba(103,232,249,0.1)_0%,rgba(59,130,246,0.1)_25%,rgba(147,51,234,0.1)_50%,rgba(103,232,249,0.1)_75%,rgba(59,130,246,0.1)_100%)] [mask-image:radial-gradient(circle_at_center,transparent_20%,black_70%)]"></div>
      </div>
    </div>
  );

  if (mode === 'create') {
    return (
      <div className="min-h-screen relative">
        <BackgroundWithOverlay />
        <Navigation />
        <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[calc(100vh-120px)] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">
            {/* Left Side - Welcome Text */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Room
                  </span>
                  <br />
                  <span className="text-white">Created!</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-md">
                  Your collaborative coding space is ready. Share the room ID with your team to start coding together in real-time.
                </p>
              </div>
            </div>

            {/* Right Side - Room Info */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-600/30 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Room Created!</h2>
                  <p className="text-gray-400">Share the room ID with others to collaborate</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Room ID
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newRoomId}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-cyan-400/50 transition-all duration-200 backdrop-blur-sm"
                    />
                    <button
                      onClick={copyRoomId}
                      className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={joinCreatedRoom}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-md"
                  >
                    <Code className="w-5 h-5" />
                    Enter Room
                  </button>
                  <button
                    onClick={() => setMode('home')}
                    className="px-6 py-3 bg-gray-700/60 hover:bg-gray-600/80 text-white rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-600/50 backdrop-blur-sm"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen relative">
        <BackgroundWithOverlay />
        <Navigation />
        <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[calc(100vh-120px)] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">
            {/* Left Side - Welcome Text */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Join
                  </span>
                  <br />
                  <span className="text-white">Room.</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-md">
                  Enter the room ID provided by your team lead to join the collaborative coding session.
                </p>
              </div>
            </div>

            {/* Right Side - Join Form */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-600/30 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <LogIn className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Join Room</h2>
                  <p className="text-gray-400">Enter the room ID to start collaborating</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-cyan-400/50 transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Room ID
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-cyan-400/50 transition-all duration-200 backdrop-blur-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleJoinRoom}
                    disabled={!roomId.trim() || !userName.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-md"
                  >
                    <LogIn className="w-5 h-5" />
                    Join Room
                  </button>
                  <button
                    onClick={() => setMode('home')}
                    className="px-6 py-3 bg-gray-700/60 hover:bg-gray-600/80 text-white rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-600/50 backdrop-blur-sm"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home Page - Main Auth Interface
  return (
    <div className="min-h-screen relative">
      <BackgroundWithOverlay />
      <Navigation />
      <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[calc(100vh-120px)] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">
          {/* Left Side - Welcome Text */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Real-time
                </span>
                <br />
                <span className="text-white">Code Editor.</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-md">
                Start collaborating on code in real-time with your team. Create or join a coding room to begin your session.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Real-time code collaboration</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Multi-user support</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Live code execution</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-800/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-600/30 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Get Started</h2>
                <p className="text-gray-400">Choose how you want to start coding</p>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-cyan-400/50 transition-all duration-200 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <button
                  onClick={handleCreateRoom}
                  disabled={!userName.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create New Room
                </button>

                <button
                  onClick={() => setMode('join')}
                  disabled={!userName.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  Join Existing Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations for the enhanced background */}
      <style >{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
        
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -15px) rotate(5deg); }
          50% { transform: translate(-10px, 10px) rotate(-3deg); }
          75% { transform: translate(15px, 5px) rotate(2deg); }
        }
        
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-15px, 20px) rotate(-5deg); }
          50% { transform: translate(10px, -10px) rotate(3deg); }
          75% { transform: translate(-20px, -5px) rotate(-2deg); }
        }
        
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -15px) scale(1.1); }
        }
        
        @keyframes orb-float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 25px) scale(1.05); }
        }
        
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-orb-float-1 {
          animation: orb-float-1 25s ease-in-out infinite;
        }
        
        .animate-orb-float-2 {
          animation: orb-float-2 30s ease-in-out infinite;
        }
        
        .animate-orb-float-3 {
          animation: orb-float-3 35s ease-in-out infinite;
        }
        
        .animate-orb-float-4 {
          animation: orb-float-4 40s ease-in-out infinite;
        }
        
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        
        .animate-scan-line {
          animation: scan-line 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RoomManager;