import React, { useEffect, useState } from 'react';
import { ScreenIcon, AlertTriangleIcon } from './icons';
import { User } from '../App';

declare const google: any;

interface LoginScreenProps {
    onLoginSuccess: (user: User) => void;
}

// IMPORTANT: You must replace this with your own Google Cloud project's Client ID.
// Go to https://console.cloud.google.com/apis/credentials to create one.
const GOOGLE_CLIENT_ID = '834692381201-1rj4fohkijemsi4b2arq7b8jv1e51sc4.apps.googleusercontent.com';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [origin, setOrigin] = useState<string>('');
    const [copyButtonText, setCopyButtonText] = useState('Copy');
    const isClientIdPlaceholder = GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID');

    const handleCredentialResponse = (response: any) => {
        try {
            // For a real app, you would send the credential to your backend server
            // to validate the token and create a user session.
            console.log("Encoded JWT ID token: " + response.credential);
            const credential = response.credential;
            const payload = JSON.parse(atob(credential.split('.')[1]));
            
            const user: User = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
            };
            onLoginSuccess(user);

        } catch (error) {
            console.error("Error decoding JWT or processing login:", error);
            // Optionally, show an error message to the user here.
        }
    };

    useEffect(() => {
        // Set the origin for the user to see
        setOrigin(window.location.origin);

        if (isClientIdPlaceholder) {
            return; // Don't initialize if the client ID is a placeholder
        }

        // Polls to wait for the Google script to load before initializing.
        const initializeGoogleSignIn = () => {
            if (google?.accounts?.id) {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                });
                google.accounts.id.renderButton(
                    document.getElementById('googleSignInButton'),
                    { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill', width: '300' }
                );
            } else {
                setTimeout(initializeGoogleSignIn, 100);
            }
        };

        initializeGoogleSignIn();

    }, [onLoginSuccess, isClientIdPlaceholder]);

    const handleCopyOrigin = () => {
        navigator.clipboard.writeText(origin).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy'), 2000);
        }).catch(err => {
            console.error('Failed to copy origin URL: ', err);
            // You could add user-facing error handling here if needed
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
            <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-indigo-600 rounded-full mb-6">
                       <ScreenIcon className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Web Screen Mirror</h1>
                    <p className="text-gray-400 mb-8">
                        Share your screen from any device to your PC in real-time.
                        Sign in to get started.
                    </p>
                    
                    {isClientIdPlaceholder ? (
                        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-left w-full my-2">
                            <div className="flex">
                                <div className="py-1 shrink-0"><AlertTriangleIcon className="w-6 h-6 mr-3 text-yellow-400" /></div>
                                <div>
                                    <p className="font-bold">Configuration Needed</p>
                                    <p className="text-sm leading-relaxed">
                                        Replace the placeholder Client ID in the code.
                                        <br />
                                        1. Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Google Cloud Console</a>.
                                        <br />
                                        2. Create an "OAuth 2.0 Client ID" for a "Web application".
                                        <br />
                                        3. Add your app's URL to "Authorized JavaScript origins".
                                        <br />
                                        4. Copy the ID and paste it in <code>components/LoginScreen.tsx</code>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div id="googleSignInButton" className="flex justify-center w-full my-2"></div>
                    )}
                    
                    <div className="bg-gray-700/50 border border-gray-600 text-gray-300 px-4 py-3 rounded-lg text-left w-full mt-6 text-sm">
                        <div className="flex">
                            <div className="py-1 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold text-gray-200">Configuration Guide</p>
                                <p className="leading-relaxed mt-1">
                                     To fix the <code className="bg-red-900/50 text-red-300 px-1 rounded-sm text-xs font-mono">origin_mismatch</code> error, your app's exact URL must be in your Google Cloud project.
                                </p>
                                <div className="mt-3">
                                    <label htmlFor="originUrl" className="text-xs text-gray-400 block text-left font-semibold">1. Copy your unique URL:</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input 
                                            id="originUrl"
                                            type="text" 
                                            readOnly 
                                            value={origin} 
                                            className="flex-grow bg-gray-900 p-2 rounded border border-gray-500 text-green-400 font-mono text-xs cursor-pointer"
                                            onFocus={(e) => e.target.select()}
                                            aria-label="Your current origin URL"
                                        />
                                        <button 
                                            onClick={handleCopyOrigin}
                                            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-md text-xs transition-colors duration-200"
                                            aria-label="Copy origin URL to clipboard"
                                        >
                                            {copyButtonText}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs leading-relaxed text-gray-400 space-y-1.5 pl-1">
                                    <p>2. Go to your <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google Cloud Credentials</a> and edit your Web Client ID.</p>
                                    <p>3. In "Authorized JavaScript origins," <strong className="text-gray-300">remove any old URLs</strong> and paste the one you just copied.</p>
                                    <p>4. <strong className="text-yellow-300">Save your changes and wait 2-5 minutes.</strong> Google's settings can take time to update.</p>
                                    <p>5. Finally, do a <strong className="text-yellow-300">full refresh</strong> of this page (<strong className="text-gray-200">Cmd+Shift+R</strong> or <strong className="text-gray-200">Ctrl+Shift+R</strong>) and try signing in.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-8">
                        By signing in, you agree to our terms of service. You will be prompted to sign in with your Google Account.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
