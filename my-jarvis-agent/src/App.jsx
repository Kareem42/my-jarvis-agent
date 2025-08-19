import React, { useState, useRef, useEffect } from 'react';
import Speech from './Component/speech';

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hello, I am your personal AI assistant. How can I help you today?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  // const [isListening, setIsListening] = useState(false);
  // const [transcript, setTranscript] = useState('');
  // const [statusMessage, setStatusMessage] = useState('Click the microphone to start.');
  // const [errorMessage, setErrorMessage] = useState('');

  // Constants for API interaction
  const API_KEY = "AIzaSyA4l0PKxgzjvKz0DWXIi17ON1LEL4V24qc"; // The API key is handled by the canvas environment
  const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

  // Effect to scroll to the bottom of the chat window whenever the chat history updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Function to handle sending the user message to the Gemini API
  const sendMessage = async (message) => {
    // Add the user's message to the chat history
    const newUserMessage = { role: 'user', text: message };
    setChatHistory((prevHistory) => [...prevHistory, newUserMessage]);
    setUserInput(''); // Clear the input field
    setIsLoading(true); // Show the loading indicator

    try {
      const payload = {
        contents: [...chatHistory, newUserMessage].map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        })),
      };
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      const modelResponseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (modelResponseText) {
        // Add the model's response to the chat history
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { role: 'model', text: modelResponseText },
        ]);
      } else {
        // Handle cases where the response is empty or malformed
        console.error('API response was not in the expected format:', result);
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { role: 'model', text: 'I am sorry, I could not generate a response.' },
        ]);
      }

    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: 'model', text: 'There was an error communicating with the server. Please try again.' },
      ]);
    } finally {
      setIsLoading(false); // Hide the loading indicator
    }
  };

  // Function to clear the entire chat history
  const handleClearChat = () => {
    setChatHistory([{ role: 'model', text: 'Chat history cleared. How can I help you now?' }]);
  };

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      sendMessage(userInput.trim());
    }
  };

  // CSS classes for styling using Tailwind CSS
  const chatContainerClasses = 'flex flex-col h-full bg-gray-900 text-gray-100 rounded-xl shadow-2xl overflow-hidden';
  const chatHeaderClasses = 'flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700';
  const chatWindowClasses = 'flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-800';
  const userMessageClasses = 'flex items-start justify-end gap-3';
  const modelMessageClasses = 'flex items-start justify-start gap-3';
  const messageBubbleClasses = 'p-3 max-w-xl rounded-xl drop-shadow-lg';
  const userBubbleClasses = 'bg-blue-600 text-white rounded-br-none';
  const modelBubbleClasses = 'bg-gray-800 text-gray-100 rounded-bl-none';
  const avatarClasses = 'w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center border-2 border-gray-600 drop-shadow-md';
  const userAvatarClasses = 'bg-gray-700 text-blue-400';
  const modelAvatarClasses = 'bg-purple-700 text-purple-200';
  const inputFormClasses = 'flex p-4 border-t border-gray-700';
  const inputFieldClasses = 'flex-1 bg-gray-800 text-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300';
  const sendButtonClasses = 'ml-3 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed';
  const clearButtonClasses = 'ml-3 bg-gray-600 text-gray-200 p-3 rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed';
  const loadingIndicatorClasses = 'flex justify-center p-2';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 p-4 font-sans antialiased">
      <div className="w-full max-w-3xl h-[80vh] min-h-[500px]">
        <div className={chatContainerClasses}>
          <div className={chatHeaderClasses}>
            <h2 className="text-xl font-semibold">AI Assistant</h2>
            <button onClick={handleClearChat} className={clearButtonClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.93a2.25 2.25 0 01-2.244-2.077L4.74 5.823m11.23-2.618c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.93a2.25 2.25 0 01-2.244-2.077L4.74 5.823m11.23-2.618c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.93a2.25 2.25 0 01-2.244-2.077L4.74 5.823m11.23-2.618c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.93a2.25 2.25 0 01-2.244-2.077L4.74 5.823m11.23-2.618c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.93a2.25 2.25 0 01-2.244-2.077L4.74 5.823m11.23-2.618c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.93a2.25 2.25 0 01-2.244-2.077L4.74 5.823m11.23-2.618c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.93a2.25 2.25 0 01-2.244-2.077L4.74 5.823" />
              </svg>
            </button>
          </div>
          <div className={chatWindowClasses}>
            {chatHistory.map((msg, index) => (
              <div key={index} className={msg.role === 'user' ? userMessageClasses : modelMessageClasses}>
                {msg.role === 'model' && (
                  <div className={modelAvatarClasses + ' ' + avatarClasses}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 7.5a.75.75 0 110-1.5.75.75 0 010 1.5zm4.875 0a.75.75 0 110-1.5.75.75 0 010 1.5zm-2.25 4.875a3.375 3.375 0 003.375-3.375.75.75 0 011.5 0 4.875 4.875 0 01-4.875 4.875A.75.75 0 0112 14.25z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className={`${messageBubbleClasses} ${msg.role === 'user' ? userBubbleClasses : modelBubbleClasses}`}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className={userAvatarClasses + ' ' + avatarClasses}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.108.843l-5.06-2.53a1.5 1.5 0 00-1.444 0l-5.06 2.53a.75.75 0 01-.108-.843z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={loadingIndicatorClasses}>
                <div className="w-6 h-6 border-4 border-t-4 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSubmit} className={inputFormClasses}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className={inputFieldClasses}
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
            <button type="submit" className={sendButtonClasses} disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      <Speech />
    </div>
    
  );
};

export default App;