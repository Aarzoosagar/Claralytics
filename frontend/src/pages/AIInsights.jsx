import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/appStore.js'
import { useInsights, useAIChat } from '../hooks/useAI.js'
import EmptyState from '../components/ui/EmptyState.jsx'
import { SkeletonText, SkeletonCard } from '../components/ui/SkeletonCard.jsx'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'
import { ToastContainer } from '../components/ui/Toast.jsx'
import ReactMarkdown from 'react-markdown'
import {
  Sparkles, Send, Database, TrendingUp,
  AlertTriangle, Lightbulb, Target, BookOpen,
} from 'lucide-react'
import clsx from 'clsx'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
      <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
      <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
    </div>
  )
}

function InsightsPanel({ datasetId }) {
  

const { data, isLoading } =
  useInsights(datasetId)

const insights =
  data?.insights || data
console.log(insights)

  if (isLoading) {
    return (
      <div className="space-y-4 p-5">
        <SkeletonCard />
        <SkeletonText lines={4} />
        <SkeletonText lines={3} />
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-zinc-600 p-8 text-center">
        No insights available. Ensure your dataset is analyzed first.
      </div>
    )
  }

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* Executive Summary */}
      {insights.executive_summary && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={13} className="text-zinc-500" />
            <span className="section-title">Executive Summary</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {insights.executive_summary}
          </p>
        </div>
      )}

      {/* Key Insights */}
      {insights.key_insights && insights.key_insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={13} className="text-zinc-500" />
            <span className="section-title">Key Insights</span>
          </div>
          <div className="space-y-2">
            {insights.key_insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 card p-3.5"
              >
                <span className="text-xs font-mono text-zinc-700 shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {insight.text || insight.description || insight}
                </p>
                {insight.type && (
                  <span className="badge-neutral text-[10px] shrink-0">
                    {insight.type}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {insights.risks && insights.risks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-red-500/70" />
            <span className="section-title">Risks</span>
          </div>
          <div className="space-y-2">
            {insights.risks.map((risk, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 bg-red-500/5 border border-red-500/10 rounded-sm"
              >
                <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300/80 leading-relaxed">
                  {risk.text || risk.description || risk}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {insights.opportunities && insights.opportunities.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} className="text-green-500/70" />
            <span className="section-title">Opportunities</span>
          </div>
          <div className="space-y-2">
            {insights.opportunities.map((opp, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 bg-green-500/5 border border-green-500/10 rounded-sm"
              >
                <TrendingUp size={12} className="text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-green-300/80 leading-relaxed">
                  {opp.text || opp.description || opp}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Recommendations */}
      {insights.strategic_recommendations && insights.strategic_recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={13} className="text-zinc-500" />
            <span className="section-title">Strategic Recommendations</span>
          </div>
          <ol className="space-y-3">
            {insights.strategic_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-sm bg-white/8 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {rec.text || rec.action || rec}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function ChatPanel({ datasetId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your data analyst. Ask me anything about your dataset — patterns, anomalies, predictions, or recommendations.",
    },
  ])
  const [input, setInput] = useState('')
  const [useContext, setUseContext] = useState(true)
  const chatMutation = useAIChat()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatMutation.isPending])

  const handleSend = async () => {

  const text = input.trim()

  if (
    !text ||
    chatMutation.isPending
  ) return

  // User message
  const userMsg = {

    role: 'user',

    content: text,
  }

  // Add user message
  const newMessages = [
    ...messages,
    userMsg,
  ]

  setMessages(newMessages)

  setInput('')

  try {

    // Call AI API
    const result =
      await chatMutation.mutateAsync({

        messages: newMessages,

        datasetId:
          useContext
            ? datasetId
            : undefined,
      })

    // Normalize AI response
    const aiText =

  typeof result === 'string'
    ? result

    : result?.reply ||
      result?.data?.reply ||
      result?.message ||
      result?.content ||
      result?.response ||
      result?.data?.message ||
      result?.data?.content ||
      'No response generated.'

const assistantMsg = {

  role: 'assistant',

  content: aiText,
}

    // Add assistant message
    setMessages((prev) => [

      ...prev,

      assistantMsg,
    ])

  } catch (err) {

    console.error(err)

    setMessages((prev) => [

      ...prev,

      {
        role: 'assistant',

        content:
          'Sorry, I encountered an error. Please try again.',

        error: true,
      },
    ])
  }
}

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Context toggle */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 shrink-0">
        <button
          onClick={() => setUseContext(!useContext)}
          className={clsx(
            'flex items-center gap-1.5 text-xs transition-all px-2 py-1 rounded-sm',
            useContext
              ? 'text-white bg-white/10 border border-white/15'
              : 'text-zinc-500 hover:text-zinc-300 border border-white/5'
          )}
        >
          <Database size={11} />
          Dataset context {useContext ? 'on' : 'off'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-sm bg-white/8 border border-white/10 flex items-center justify-center shrink-0 mr-2.5 mt-0.5">
                <Sparkles size={11} className="text-zinc-400" />
              </div>
            )}
            <div
              className={clsx(
                'max-w-[85%] text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-white/8 border border-white/10 rounded-sm px-4 py-3 text-zinc-200'
                  : 'text-zinc-400',
                msg.error && 'text-red-400'
              )}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    code: ({ children }) => (
                      <code className="bg-white/5 border border-white/8 rounded px-1 py-0.5 text-xs font-mono text-zinc-300">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-white/5 border border-white/8 rounded-sm p-3 text-xs font-mono text-zinc-300 overflow-x-auto my-2">
                        {children}
                      </pre>
                    ),
                    ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1 mb-2">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="text-zinc-200 font-semibold">{children}</strong>,
                  }}
                >
                  {typeof msg.content === 'string'
  ? msg.content
  : JSON.stringify(
      msg.content,
      null,
      2
    )}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-sm bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
              <Sparkles size={11} className="text-zinc-400" />
            </div>
            <div className="card">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-4 shrink-0">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your data..."
            rows={1}
            className="input flex-1 resize-none min-h-[40px] max-h-32 overflow-auto py-2.5"
            style={{
              height: Math.min(32 + input.split('\n').length * 20, 128),
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="btn-primary p-2.5 shrink-0 disabled:opacity-30"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-zinc-700 mt-1.5">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default function AIInsights() {
  const activeDatasetId = useAppStore((s) => s.activeDatasetId)
  const [activePanel, setActivePanel] = useState('insights')

  if (!activeDatasetId) return <EmptyState />

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col pb-16 md:pb-0">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="page-title">AI Insights</h1>
          <p className="text-sm text-zinc-500 mt-1">
            AI-powered analysis and interactive data chat
          </p>
        </div>
        {/* Mobile tab toggle */}
        <div className="flex md:hidden items-center gap-1 p-1 bg-[#111111] border border-white/5 rounded-sm">
          {['insights', 'chat'].map((panel) => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={clsx(
                'px-3 py-1 text-xs rounded-sm capitalize transition-all',
                activePanel === panel
                  ? 'bg-white text-black font-medium'
                  : 'text-zinc-500'
              )}
            >
              {panel}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insights panel */}
        <div
          className={clsx(
            'card overflow-hidden flex flex-col',
            activePanel !== 'insights' && 'hidden md:flex'
          )}
        >
          <div className="px-5 py-4 border-b border-white/5 shrink-0 flex items-center gap-2">
            <Sparkles size={13} className="text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              AI Insights
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ErrorBoundary fallbackTitle="Insights failed to load">
              <InsightsPanel datasetId={activeDatasetId} />
            </ErrorBoundary>
          </div>
        </div>

        {/* Chat panel */}
        <div
          className={clsx(
            'card overflow-hidden flex flex-col',
            activePanel !== 'chat' && 'hidden md:flex'
          )}
        >
          <div className="px-5 py-4 border-b border-white/5 shrink-0 flex items-center gap-2">
            <Send size={13} className="text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Data Chat
            </span>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatPanel datasetId={activeDatasetId} />
          </div>
        </div>
      </div>
    </div>
  )
}
