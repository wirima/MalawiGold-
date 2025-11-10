
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { processChat } from '../services/geminiService';
import { Content } from '@google/genai';

const Chatbot: React.FC = () => {
    // FIX: Removed unused products and sales from useAuth call
    const {} = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Content[]>([
        { role: 'model', parts: [{ text: 'Hello! How can I help you with your sales, products, or stock today?' }] }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage) return;

        const newMessages: Content[] = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            // FIX: Removed products and sales from processChat call as they are no longer needed
            const modelResponseText = await processChat(newMessages, userMessage);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: modelResponseText }] }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Sorry, there was an error: ${errorMessage}` }] }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderContent = (content: string) => {
        // Simple markdown-to-html for lists and bolding, similar to other Gemini responses
        const html = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />')
            .replace(/<br \/>\*/g, '<ul><li>')
            .replace(/<\/li><br \/>\*/g, '</li><li>')
            .replace(/<\/li><br \/>/g, '</li></ul>');
        
        return { __html: html };
    };

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-40 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Open AI Assistant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            </div>

            <div className={`fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-sm h-[calc(100%-5rem)] max-h-[600px] z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h3 className="text-lg font-bold">AI Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close chat">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center flex-shrink-0 text-sm font-bold">AI</div>}
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                                }`}
                            >
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={renderContent(msg.parts[0].text || '')}></div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center flex-shrink-0 text-sm font-bold">AI</div>
                            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-none p-3 flex items-center space-x-1">
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 flex-shrink-0">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full pl-4 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !inputValue.trim()} className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
};

export default Chatbot;