import React, { useState, useRef, useEffect } from 'react';

const App = () => {
  // State for managing the chat history
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hello, I am your personal AI assistant. How can I help you today?' },
  ]);
  // State for the current user input
  const [userInput, setUserInput] = useState('');
  // State to handle the loading indicator
  const [isLoading, setIsLoading] = useState(false);
  // Ref to automatically scroll the chat window to the bottom
  const chatEndRef = useRef(null);

  // Constants for API interaction
  const API_KEY = ""; // The API key is handled by the canvas environment
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

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      sendMessage(userInput.trim());
    }
  };

  // CSS classes for styling using Tailwind CSS
  const chatContainerClasses = 'flex flex-col h-full bg-gray-900 text-gray-100 rounded-xl shadow-2xl overflow-hidden';
  const chatWindowClasses = 'flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800';
  const userMessageClasses = 'flex justify-end';
  const modelMessageClasses = 'flex justify-start';
  const messageBubbleClasses = 'p-3 max-w-lg rounded-xl';
  const userBubbleClasses = 'bg-blue-600 text-white rounded-br-none';
  const modelBubbleClasses = 'bg-gray-800 text-gray-100 rounded-bl-none';
  const inputFormClasses = 'flex p-4 border-t border-gray-700';
  const inputFieldClasses = 'flex-1 bg-gray-800 text-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300';
  const sendButtonClasses = 'ml-3 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed';
  const loadingIndicatorClasses = 'flex justify-center p-2';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 p-4 font-sans antialiased">
      <div className="w-full max-w-3xl h-[80vh] min-h-[500px]">
        <div className={chatContainerClasses}>
          <div className={chatWindowClasses}>
            {chatHistory.map((msg, index) => (
              <div key={index} className={msg.role === 'user' ? userMessageClasses : modelMessageClasses}>
                <div className={`${messageBubbleClasses} ${msg.role === 'user' ? userBubbleClasses : modelBubbleClasses}`}>
                  {msg.text}
                </div>
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
    </div>
  );
};

export default App;
