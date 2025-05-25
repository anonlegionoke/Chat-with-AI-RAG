'use client'

import AttachmentIcon from "@/components/ui/AttachmentIcon"
import { useChat } from "ai/react"
import { useRef, useEffect, useState } from 'react'
import AttachmentPopup from "../../components/AttachmentPopup"
import ReactMarkdown from 'react-markdown'
import { Moon, Sun } from 'lucide-react'

type ChatMode = 'quick' | 'memory' | 'contextual'

export default function ChatInterface() {
    const [isAttachmentPopupOpen, setIsAttachmentPopupOpen] = useState(false);
    const [chatMode, setChatMode] = useState<ChatMode>('quick');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: `api/${chatMode}`,
        onError: (e) => {
            console.log(e)
        }
    })
    const chatParent = useRef<HTMLUListElement>(null)

    useEffect(() => {
        const domNode = chatParent.current
        if (domNode) {
            domNode.scrollTop = domNode.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark')
            document.documentElement.setAttribute('data-theme', savedTheme)
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setIsDarkMode(prefersDark)
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
        }
    }, [])

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode
        setIsDarkMode(newDarkMode)
        document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light')
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    }

    const getPlaceholder = () => {
        switch (chatMode) {
            case 'quick':
                return '✨ Ask me anything - I\'m all ears!'
            case 'memory':
                return '💭 Let\'s continue our conversation - what\'s on your mind?'
            case 'contextual':
                return '📄 Upload your document and let\'s explore it together!'
            default:
                return 'Ask here...'
        }
    }

    const getLoadingColor = () => {
        switch (chatMode) {
            case 'quick':
                return 'bg-red-400'
            case 'memory':
                return 'bg-green-500'
            case 'contextual':
                return 'bg-blue-500'
            default:
                return 'bg-blue-500'
        }
    }

    return (
        <main className="flex flex-col w-full h-screen max-h-dvh px-4 sm:px-6" style={{ backgroundColor: 'var(--background)' }}>

            <header className="p-4 w-full max-w-5xl mx-auto mt-2 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}><img src="/ai-rag-chatapp-icon-minimal.png" alt="Chat with AI" className="inline-block w-14 h-14 -ml-2" style={{ filter: isDarkMode ? 'invert(1)' : 'none' }} /> Chat with AI</h1>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Powered by LangChain <img src="/langchain.svg" alt="LangChain" className="inline-block w-6 h-6" style={{ filter: isDarkMode ? 'invert(1)' : 'none' }} /></p>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full transition-colors cursor-pointer"
                    style={{ backgroundColor: 'var(--chat-bg)' }}
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />}
                </button>
            </header>

            <section className="container flex flex-col flex-grow gap-4 mx-auto max-w-5xl mt-10 rounded-xl" style={{ border: '2px solid var(--border-color)' }}>
                <ul ref={chatParent} className="h-1 p-4 flex-grow rounded-lg overflow-y-auto flex flex-col gap-4" style={{ backgroundColor: 'var(--chat-bg)' }}>
                    {messages.map((m, index) => (
                        <div key={index}>
                            {m.role === 'user' ? (
                                <li key={m.id} className="flex flex-row">
                                    <div className="rounded-xl p-4 shadow-md flex max-w-[85%]" style={{ backgroundColor: 'var(--message-bg)' }}>
                                        <p className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{m.content}</p>
                                    </div>
                                </li>
                            ) : (
                                <li key={m.id} className="flex flex-row-reverse">
                                    <div className="rounded-xl p-4 shadow-md flex max-w-[85%]" style={{ backgroundColor: 'var(--message-bg)' }}>
                                        <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
                                            <ReactMarkdown
                                                components={{
                                                    pre: ({ node, ...props }) => (
                                                        <div className="relative">
                                                            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto" {...props as React.HTMLAttributes<HTMLPreElement>} />
                                                        </div>
                                                    ),
                                                    code: ({ node, className, children, ...props }) => {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        return match ? (
                                                            <pre className={className} {...props as React.HTMLAttributes<HTMLPreElement>}>
                                                                {children}
                                                            </pre>
                                                        ) : (
                                                            <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded" {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    }
                                                }}
                                            >
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </li>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <li className="flex flex-row-reverse">
                            <div className="rounded-xl p-4 shadow-md flex" style={{ backgroundColor: 'var(--message-bg)' }}>
                                <div className="flex space-x-3">
                                    <div className={`w-3 h-3 ${getLoadingColor()} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
                                    <div className={`w-3 h-3 ${getLoadingColor()} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
                                    <div className={`w-3 h-3 ${getLoadingColor()} rounded-full animate-bounce`}></div>
                                </div>
                            </div>
                        </li>
                    )}
                </ul>
            </section>

            <section className="flex flex-col pt-10 pb-20 justify-center">
                <div id="buttons" className="flex w-full max-w-5xl mx-auto items-center pb-4 space-x-4">
                    <button 
                        onClick={() => setChatMode('quick')}
                        className={`${chatMode === 'quick' ? 'scale-x-105' : ''} font-bold rounded-2xl px-4 py-2 cursor-pointer border-2 flex items-center gap-2 transition-all duration-300 ease-in-out`}
                        style={{ 
                            backgroundColor: chatMode === 'quick' ? 'var(--quick-button-active)' : 'var(--quick-button-bg)',
                            color: 'var(--quick-button-text)',
                            borderColor: chatMode === 'quick' ? 'var(--quick-button-active)' : 'var(--quick-button-border)'
                        }}
                    >
                        {chatMode === 'quick' && <span className="font-bold" style={{ color: 'var(--quick-button-text)' }}>✓</span>}
                        Quick Chat
                    </button>
                    <button 
                        onClick={() => setChatMode('memory')}
                        className={`${chatMode === 'memory' ? 'scale-x-105' : ''} font-bold rounded-2xl px-4 py-2 cursor-pointer border-2 flex items-center gap-2 transition-all duration-300 ease-in-out`}
                        style={{ 
                            backgroundColor: chatMode === 'memory' ? 'var(--memory-button-active)' : 'var(--memory-button-bg)',
                            color: 'var(--memory-button-text)',
                            borderColor: chatMode === 'memory' ? 'var(--memory-button-active)' : 'var(--memory-button-border)'
                        }}
                    >
                        {chatMode === 'memory' && <span className="font-bold" style={{ color: 'var(--memory-button-text)' }}>✓</span>}
                        Chat with Memory
                    </button>
                    <button 
                        onClick={() => setChatMode('contextual')}
                        className={`${chatMode === 'contextual' ? 'scale-x-105' : ''} font-bold rounded-2xl px-4 py-2 cursor-pointer border-2 flex items-center gap-2 transition-all duration-300 ease-in-out`}
                        style={{ 
                            backgroundColor: chatMode === 'contextual' ? 'var(--contextual-button-active)' : 'var(--contextual-button-bg)',
                            color: 'var(--contextual-button-text)',
                            borderColor: chatMode === 'contextual' ? 'var(--contextual-button-active)' : 'var(--contextual-button-border)'
                        }}
                    >
                        {chatMode === 'contextual' && <span className="font-bold" style={{ color: 'var(--contextual-button-text)' }}>✓</span>}
                        Contextual Chat
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex w-full max-w-5xl mx-auto items-center">
                    <div className="flex-1 relative">
                        <input 
                            className="w-full min-h-[60px] rounded-xl px-4 py-2 border-2 focus:border-3 pr-12" 
                            style={{ 
                                backgroundColor: 'var(--message-bg)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)'
                            }}
                            placeholder={getPlaceholder()} 
                            type="text" 
                            value={input} 
                            onChange={handleInputChange}
                            disabled={isLoading}
                            autoFocus
                        />
                        {chatMode === 'contextual' && (
                            <button 
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                style={{ color: 'var(--text-secondary)' }}
                                onClick={() => {setIsAttachmentPopupOpen(true)}}
                            >
                                <AttachmentIcon />
                            </button>
                        )}
                    </div>
                    <button 
                        className="ml-2 rounded-xl px-5 py-4.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200" 
                        style={{ 
                            backgroundColor: 'var(--text-primary)',
                            color: 'var(--background)'
                        }}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Thinking...' : 'Submit'}
                    </button>
                </form>
            </section>
            {isAttachmentPopupOpen && <AttachmentPopup setIsAttachmentPopupOpen={setIsAttachmentPopupOpen} />}
        </main>
    )
}
