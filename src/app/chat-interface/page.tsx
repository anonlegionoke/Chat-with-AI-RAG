'use client'

import { useChat } from "ai/react"
import { useRef, useEffect, useState } from 'react'

type ChatMode = 'quick' | 'memory' | 'contextual'

export function ChatInterface() {
    const [chatMode, setChatMode] = useState<ChatMode>('quick')
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
        <main className="flex flex-col w-full h-screen max-h-dvh px-4 sm:px-6 bg-gray-100">

            <header className="p-4 w-full max-w-5xl mx-auto mt-2">
                <h1 className="text-4xl font-bold">Chat with AI</h1>
                <p className="text-muted-foreground text-xs">Powered by LangChain</p>
            </header>

            <section className="container flex flex-col flex-grow gap-4 mx-auto max-w-5xl border-2 mt-10 rounded-xl">
                <ul ref={chatParent} className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4">
                    {messages.map((m, index) => (
                        <div key={index}>
                            {m.role === 'user' ? (
                                <li key={m.id} className="flex flex-row">
                                    <div className="rounded-xl p-4 bg-background shadow-md flex max-w-[85%]">
                                        <p className="text-primary whitespace-pre-wrap">{m.content}</p>
                                    </div>
                                </li>
                            ) : (
                                <li key={m.id} className="flex flex-row-reverse">
                                    <div className="rounded-xl p-4 bg-background shadow-md flex max-w-[85%]">
                                        <p className="text-primary whitespace-pre-wrap">{m.content}</p>
                                    </div>
                                </li>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <li className="flex flex-row-reverse">
                            <div className="rounded-xl p-4 bg-background shadow-md flex">
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
                        className={`${chatMode === 'quick' ? 'bg-red-300 scale-x-105' : 'bg-red-200'} text-red-800 font-bold rounded-2xl px-4 py-2 hover:bg-red-300 cursor-pointer border-2 border-red-300 flex items-center gap-2 transition-all duration-300 ease-in-out`}
                    >
                        {chatMode === 'quick' && <span className="text-red-800 font-bold">✓</span>}
                        Quick Chat
                    </button>
                    <button 
                        onClick={() => setChatMode('memory')}
                        className={`${chatMode === 'memory' ? 'bg-green-300 scale-x-105' : 'bg-green-200'} text-green-900 font-bold rounded-2xl px-4 py-2 hover:bg-green-300 cursor-pointer border-2 border-green-300 flex items-center gap-2 transition-all duration-300 ease-in-out`}
                    >
                        {chatMode === 'memory' && <span className="text-green-900 font-bold">✓</span>}
                        Chat with Memory
                    </button>
                    <button 
                        onClick={() => setChatMode('contextual')}
                        className={`${chatMode === 'contextual' ? 'bg-blue-300 scale-x-105' : 'bg-blue-200'} text-blue-900 font-bold rounded-2xl px-4 py-2 hover:bg-blue-300 cursor-pointer border-2 border-blue-300 flex items-center gap-2 transition-all duration-300 ease-in-out`}
                    >
                        {chatMode === 'contextual' && <span className="text-blue-900 font-bold">✓</span>}
                        Contextual Chat
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex w-full max-w-5xl mx-auto items-center">
                    <input 
                        className="flex-1 min-h-[60px] rounded-xl px-4 py-2 border-2 focus:border-3" 
                        placeholder={getPlaceholder()} 
                        type="text" 
                        value={input} 
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                    <button 
                        className="ml-2 bg-black text-white rounded-xl px-5 py-4.5 hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Thinking...' : 'Submit'}
                    </button>
                </form>
            </section>
        </main>
    )
}
