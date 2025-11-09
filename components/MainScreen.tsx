import React, { useState, useRef, useEffect } from 'react';
import { ScreenShareIcon, StopCircleIcon, MonitorIcon, AlertTriangleIcon } from './icons';
import { User } from '../App';

interface MainScreenProps {
    onLogout: () => void;
    user: User;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const ConnectionStatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
    const statusConfig = {
        disconnected: { text: 'Disconnected', color: 'bg-gray-500', pulse: false },
        connecting: { text: 'Connecting...', color: 'bg-yellow-500', pulse: 'yellow' },
        connected: { text: 'Connected', color: 'bg-green-500', pulse: 'green' },
        error: { text: 'Error', color: 'bg-red-500', pulse: false },
    };

    const { text, color, pulse } = statusConfig[status];
    const pulseClass = pulse === 'green' ? 'animate-pulse-green' : pulse === 'yellow' ? 'animate-pulse-yellow' : '';

    return (
        <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-full text-sm">
            <span className={`w-3 h-3 rounded-full ${color} ${pulseClass}`}></span>
            <span className="text-gray-300 font-medium">{text}</span>
        </div>
    );
};


const MainScreen: React.FC<MainScreenProps> = ({ onLogout, user }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const isSharing = stream !== null;

    const status: ConnectionStatus = (() => {
        if (error) return 'error';
        if (isConnecting) return 'connecting';
        if (stream) return 'connected';
        return 'disconnected';
    })();

    const handleStopSharing = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    };

    const handleStartSharing = async () => {
        setError(null);
        setIsConnecting(true);
        if (!navigator.mediaDevices?.getDisplayMedia) {
            setError("Screen sharing is not supported by your browser or device. For the best experience, please use a recent version of Chrome or Firefox on a desktop computer.");
            setIsConnecting(false);
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // Listen for when the user stops sharing via the browser's native UI
            mediaStream.getVideoTracks()[0].onended = () => {
                handleStopSharing();
            };

        } catch (err) {
            console.error("Error starting screen share:", err);
            if (err instanceof Error && err.name === 'NotAllowedError') {
                 setError('Screen sharing permission was denied. Please allow screen sharing in your browser and try again.');
            } else {
                setError('Could not start screen sharing. Please ensure your browser supports it and permissions are granted.');
            }
            setStream(null);
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        // Clean up stream on component unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-md flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <MonitorIcon className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-xl font-bold text-white">Web Screen Mirror</h1>
                    </div>
                    <ConnectionStatusIndicator status={status} />
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-3 text-right">
                        <div className="hidden sm:flex flex-col">
                            <span className="text-sm font-medium text-white" aria-label="User name">{user.name}</span>
                            <span className="text-xs text-gray-400" aria-label="User email">{user.email}</span>
                        </div>
                        <img
                            src={user.picture}
                            alt="User profile"
                            className="w-10 h-10 rounded-full border-2 border-gray-600"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <button
                        onClick={onLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-300"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8 flex items-center justify-center overflow-auto">
                <div className="w-full h-full max-w-7xl bg-black rounded-xl shadow-2xl border border-gray-700 relative flex flex-col items-center justify-center overflow-hidden">
                    {error && (
                        <div className="absolute top-4 left-4 right-4 z-20 bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg flex items-center gap-3">
                            <AlertTriangleIcon className="w-6 h-6" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {isSharing ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute bottom-6 z-10">
                                <button
                                    onClick={handleStopSharing}
                                    className="flex items-center gap-2 bg-red-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500"
                                >
                                    <StopCircleIcon className="w-6 h-6" />
                                    <span>Stop Sharing</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8">
                            <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-600 rounded-full">
                                <MonitorIcon className="w-10 h-10 text-gray-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Your screen is not being shared</h2>
                            <p className="text-gray-400 mb-8 max-w-md">
                                Click the button below to start mirroring your screen. You will be prompted to select which screen, window, or tab you want to share.
                            </p>
                            <button
                                onClick={handleStartSharing}
                                disabled={isConnecting}
                                className="flex items-center gap-3 mx-auto bg-indigo-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isConnecting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <ScreenShareIcon className="w-6 h-6" />
                                        <span>Start Sharing</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MainScreen;
