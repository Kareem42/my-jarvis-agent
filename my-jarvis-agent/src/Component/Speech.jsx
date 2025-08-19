import React, { useState, useEffect, useRef } from "react";


// Main App component
const Speech = () => {
    // State variables to manage the component's UI and data
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [statusMessage, setStatusMessage] = useState('Click the microphone to start.');
    const [errorMessage, setErrorMessage] = useState('');

    // useRef is used to persist the recognition instance across re-renders
    const recognitionRef = useRef(null);

    // useEffect hook to handle side effects, like initializing the Web Speech API
    useEffect(() => {
        // Check for browser support of the Web Speech API
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!window.SpeechRecognition) {
            setErrorMessage('Speech Recognition API is not supported in this browser. Please try Chrome or Edge.');
            return;
        }

        // Initialize the SpeechRecognition instance once
        recognitionRef.current = new window.SpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.continuous = true; // Keep listening after a pause
        recognition.interimResults = true; // Show results as they are being recognized
        recognition.lang = 'en-US'; // Set the language

        // Event handler for a successful recognition result
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            // Loop through the results to build the transcript
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcriptPart = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPart + '. ';
                } else {
                    interimTranscript += transcriptPart;
                }
            }
            
            // Append final results to the transcript state
            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
            }
            // Update the status message with the interim result
            setStatusMessage(interimTranscript || 'Listening...');
        };

        // Event handler for an error
        recognition.onerror = (event) => {
            setErrorMessage(`Error occurred: ${event.error}. Please ensure your microphone is connected and you have granted permission.`);
            setIsListening(false);
        };

        // Event handler when the recognition service ends
        recognition.onend = () => {
            setIsListening(false);
            setStatusMessage('Click the microphone to start.');
        };

        // Cleanup function to stop the service when the component unmounts
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once

    // Function to toggle the listening state
    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            // Clear previous error message and transcript before starting
            setErrorMessage('');
            setTranscript('');
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    // The JSX to render the UI
    return (
        <div className="bg-gray-900 text-gray-100 flex items-center justify-center min-h-screen p-4">
            <style>
                {`
                /* Custom scrollbar for the text area */
                .scrollbar-custom::-webkit-scrollbar { width: 8px; }
                .scrollbar-custom::-webkit-scrollbar-track { background: #1f2937; }
                .scrollbar-custom::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 20px; border: 2px solid #1f2937; }
                .loading-dot { animation: bounce 1.4s infinite ease-in-out both; }
                .loading-dot:nth-child(1) { animation-delay: -0.32s; }
                .loading-dot:nth-child(2) { animation-delay: -0.16s; }
                .loading-dot:nth-child(3) { animation-delay: 0s; }
                @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } }
                `}
            </style>
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col items-center">
                <h1 className="text-3xl font-semibold mb-6 text-center">Voice to Text</h1>
                
                {/* Status and error messages */}
                <p className="text-gray-400 text-sm mb-4">{statusMessage}</p>
                <p className={`text-red-400 text-sm mb-4 ${errorMessage ? '' : 'hidden'}`}>{errorMessage}</p>

                {/* Main control button with microphone icon */}
                <button 
                    onClick={toggleListening}
                    disabled={errorMessage}
                    className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg transition-all duration-300 hover:bg-blue-700 transform hover:scale-105 active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isListening ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-red-400 animate-pulse">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.326 9.873a2.25 2.25 0 000 4.5h4.65a2.25 2.25 0 000-4.5h-4.65z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                            <path d="M8.25 4.5a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v3h3.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-.375v3.375c0 .621-.504 1.125-1.125 1.125h-2.25a.75.75 0 01-.75-.75v-3h-3.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 01.75-.75h.375v-3.375zM12 21.75a9.75 9.75 0 110-19.5 9.75 9.75 0 010 19.5z" />
                        </svg>
                    )}
                </button>

                {/* Loading indicator */}
                <div className={`flex space-x-2 ${isListening ? '' : 'hidden'}`}>
                    <div className="w-3 h-3 bg-blue-500 rounded-full loading-dot"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full loading-dot"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full loading-dot"></div>
                </div>

                {/* Text area to display recognized speech */}
                <div className="w-full mt-6">
                    <label htmlFor="transcript" className="block text-gray-400 text-sm mb-2">Transcript:</label>
                    <textarea 
                        id="transcript" 
                        rows="10" 
                        className="w-full p-4 bg-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 scrollbar-custom" 
                        placeholder="Your transcribed text will appear here..." 
                        value={transcript} 
                        readOnly
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default Speech;
