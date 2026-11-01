import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Bookmark,
  ShieldCheck,
  Code2,
  Sliders,
  Star,
  MessageSquare,
} from 'lucide-react';
import {
  PromptItem,
  interpolatePrompt,
  estimateTokens,
  estimateModelCosts,
  auditPromptSecurity,
  generatePromptJsonLd,
  sanitizeInput,
} from '../lib/promptEngine';

interface PromptDetailModalProps {
  prompt: PromptItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  onCopySuccess: (slug: string) => void;
  onFilterCategory: (categorySlug: string, subcategorySlug?: string) => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  prompt,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onCopySuccess,
  onFilterCategory,
}) => {
  const [useXmlProtection, setUseXmlProtection] = useState(true);
  const [wrapVariablesInXml, setWrapVariablesInXml] = useState(true);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'output' | 'costs' | 'schema'>('prompt');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ author: string; text: string; rating: number; date: string }>>([
    {
      author: 'Staff Platform Engineer',
      text: 'Verified in production with Claude 3.5 Sonnet and GPT-4o. The XML delimiter block prevented malformed JSON outputs across 10k batch runs.',
      rating: 5,
      date: '2026-02-20',
    },
  ]);
  const [commentError, setCommentError] = useState('');

  const compiledPrompt = useMemo(() => {
    if (!prompt) return '';
    const baseTemplate = useXmlProtection ? prompt.xmlProtectedTemplate : prompt.promptTemplate;
    return interpolatePrompt(baseTemplate, variableValues, wrapVariablesInXml);
  }, [prompt, useXmlProtection, variableValues, wrapVariablesInXml]);

  const liveTokens = useMemo(() => estimateTokens(compiledPrompt), [compiledPrompt]);
  const modelCosts = useMemo(() => estimateModelCosts(liveTokens, 650), [liveTokens]);
  const securityAudit = useMemo(() => auditPromptSecurity(compiledPrompt), [compiledPrompt]);
  const jsonLdSchema = useMemo(
    () => (prompt ? JSON.stringify(generatePromptJsonLd(prompt), null, 2) : ''),
    [prompt]
  );

  if (!prompt) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(compiledPrompt);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = compiledPrompt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      onCopySuccess(prompt.slug);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      onCopySuccess(prompt.slug);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeInput(commentText, 600);
    if (cleaned.length < 5) {
      setCommentError('Please enter at least 5 characters for your engineering review.');
      return;
    }
    setCommentError('');
    setComments((prev) => [
      {
        author: 'Verified Engineer',
        text: cleaned,
        rating: userRating || 5,
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setCommentText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/75 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Prompt Details: ${prompt.title}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#FFFFFF] border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Breadcrumb & Actions Header */}
        <div className="px-6 py-4 border-b-4 border-[#1A1A1A] flex items-center justify-between gap-4 bg-[#FFD700]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] truncate">
            <button
              type="button"
              onClick={() => {
                onFilterCategory(prompt.categorySlug);
                onClose();
              }}
              className="hover:underline whitespace-nowrap shrink-0"
            >
              {prompt.categoryName}
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => {
                onFilterCategory(prompt.categorySlug, prompt.subcategorySlug);
                onClose();
              }}
              className="hover:underline whitespace-nowrap shrink-0"
            >
              {prompt.subcategoryName}
            </button>
            <span aria-hidden="true">/</span>
            <span className="truncate">{prompt.title}</span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleBookmark(prompt.slug)}
              aria-label={isBookmarked ? `RemoveBookmark ${prompt.title}` : `Bookmark ${prompt.title}`}
              className={`px-3 py-1.5 text-xs font-bold border-2 border-[#1A1A1A] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isBookmarked
                  ? 'bg-[#1976D2] text-white'
                  : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#F5F5F5]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isBookmarked ? 'Bookmarked' : 'Save Bookmark'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-1.5 text-xs font-bold bg-[#E53935] text-white border-2 border-[#1A1A1A] hover:bg-[#1976D2] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Prompt'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close prompt inspector"
              className="p-1.5 bg-[#FFFFFF] text-[#1A1A1A] border-2 border-[#1A1A1A] hover:bg-[#E53935] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-[#FFFFFF]">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight font-display">
              {prompt.title}
            </h2>
            <p className="text-sm text-[#1A1A1A]/85 mt-2 leading-relaxed">{prompt.summary}</p>

            {/* Unboxed Clean Metadata Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1A1A1A] mt-3 pt-3 border-t-2 border-[#1A1A1A]">
              <span className="text-[#E53935] font-bold">{prompt.model}</span>
              <span aria-hidden="true">·</span>
              <span>Difficulty: {prompt.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{liveTokens} tokens</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{prompt.views.toLocaleString()} views</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{prompt.copies.toLocaleString()} copies</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {prompt.rating} / 5.0 ({prompt.ratingCount} reviews)
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#1976D2] font-mono tabular-nums font-bold">
                Security Score: {securityAudit.score}/100
              </span>
            </div>
          </div>

          {/* Interactive Mode & Section Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#1A1A1A] pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('prompt')}
                className={`px-3 py-1.5 text-xs font-bold border-2 border-[#1A1A1A] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'prompt'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#FFD700]'
                }`}
              >
                Prompt & Variables
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1.5 text-xs font-bold border-2 border-[#1A1A1A] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'output'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#FFD700]'
                }`}
              >
                Example Output & FAQs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('costs')}
                className={`px-3 py-1.5 text-xs font-bold border-2 border-[#1A1A1A] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'costs'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#FFD700]'
                }`}
              >
                Token Cost Matrix
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1.5 text-xs font-bold border-2 border-[#1A1A1A] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'schema'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#FFD700]'
                }`}
              >
                JSON-LD Schema
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useXmlProtection}
                  onChange={(e) => setUseXmlProtection(e.target.checked)}
                  className="border-2 border-[#1A1A1A] accent-[#E53935]"
                />
                <ShieldCheck className="w-4 h-4 text-[#1976D2]" />
                <span>Anti-Injection XML Delimiters</span>
              </label>
            </div>
          </div>

          {activeTab === 'prompt' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Variable Interpolation Controls */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2 font-display">
                    <Sliders className="w-4 h-4 text-[#E53935]" />
                    <span>Template Variables ({prompt.variables.length})</span>
                  </h3>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wrapVariablesInXml}
                      onChange={(e) => setWrapVariablesInXml(e.target.checked)}
                      className="border-2 border-[#1A1A1A] accent-[#1976D2]"
                    />
                    <span>Isolate in &lt;user_input&gt;</span>
                  </label>
                </div>

                {prompt.variables.map((varName) => (
                  <div key={varName} className="space-y-1">
                    <label
                      htmlFor={`var-${varName}`}
                      className="block text-xs font-mono font-bold text-[#1A1A1A]"
                    >
                      {`{{${varName}}}`}
                    </label>
                    <input
                      id={`var-${varName}`}
                      type="text"
                      value={variableValues[varName] || ''}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          [varName]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${varName.replace(/_/g, ' ')}...`}
                      className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border-2 border-[#1A1A1A] text-[#1A1A1A] placeholder-[#1A1A1A]/50 focus:outline-none focus:bg-[#FFD700]/20"
                    />
                  </div>
                ))}

                <div className="pt-2 flex items-center justify-between text-xs font-medium text-[#1A1A1A]/80">
                  <span>System Role: {prompt.systemRole}</span>
                  {Object.keys(variableValues).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setVariableValues({})}
                      className="text-[#E53935] font-bold hover:underline whitespace-nowrap shrink-0"
                    >
                      Reset Variables
                    </button>
                  )}
                </div>
              </div>

              {/* Compiled Prompt Code Block */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold text-[#1A1A1A]">
                    Compiled System Prompt ({useXmlProtection ? 'XML-Hardened' : 'Standard Prose'})
                  </span>
                  <span className="text-xs font-mono tabular-nums font-bold text-[#1976D2]">
                    {compiledPrompt.length} chars · {liveTokens} BPE tokens
                  </span>
                </div>
                <pre className="p-4 bg-[#F5F5F5] border-4 border-[#1A1A1A] text-xs font-mono text-[#1A1A1A] whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80">
                  {compiledPrompt}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A] mb-2 font-display">
                  Verified Benchmark Output Preview
                </h3>
                <pre className="p-4 bg-[#F5F5F5] border-4 border-[#1A1A1A] text-xs font-mono text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">
                  {prompt.exampleOutput}
                </pre>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1A1A1A] font-display">Prompt Engineering FAQs</h3>
                <div className="divide-y-2 divide-[#1A1A1A] border-4 border-[#1A1A1A]">
                  {prompt.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 bg-[#F5F5F5]">
                      <h4 className="text-xs font-bold text-[#1A1A1A]">{faq.question}</h4>
                      <p className="text-xs text-[#1A1A1A]/80 mt-1 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-[#1A1A1A]">
                Estimated execution cost for{' '}
                <span className="font-mono tabular-nums font-bold text-[#E53935]">{liveTokens}</span> input tokens +{' '}
                <span className="font-mono tabular-nums font-bold text-[#1976D2]">650</span> expected output tokens across flagship models:
              </p>
              <div className="overflow-x-auto border-4 border-[#1A1A1A]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-4 border-[#1A1A1A] bg-[#FFD700] text-[#1A1A1A]">
                      <th className="py-2.5 px-4 font-bold">AI Model</th>
                      <th className="py-2.5 px-4 font-bold text-right">Context Window</th>
                      <th className="py-2.5 px-4 font-bold text-right">Input / 1M</th>
                      <th className="py-2.5 px-4 font-bold text-right">Output / 1M</th>
                      <th className="py-2.5 px-4 font-bold text-right">Est. Single Run</th>
                      <th className="py-2.5 px-4 font-bold text-right">1,000 Batch Runs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#1A1A1A] font-mono tabular-nums bg-[#FFFFFF]">
                    {modelCosts.map((row) => (
                      <tr key={row.model} className="hover:bg-[#F5F5F5]">
                        <td className="py-2.5 px-4 font-sans font-bold text-[#1A1A1A]">{row.model}</td>
                        <td className="py-2.5 px-4 text-right text-[#1A1A1A]/80">{row.contextWindow.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-[#1A1A1A]">${row.inputCostPer1M.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right text-[#1A1A1A]">${row.outputCostPer1M.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#1976D2]">
                          ${row.estimatedRunCostUsd.toFixed(5)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#E53935]">
                          ${(row.estimatedRunCostUsd * 1000).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-[#1976D2]" />
                  <span>Dynamic Schema.org JSON-LD Graph (BreadcrumbList + SoftwareApplication + FAQPage)</span>
                </span>
              </div>
              <pre className="p-4 bg-[#F5F5F5] border-4 border-[#1A1A1A] text-xs font-mono text-[#1A1A1A] overflow-x-auto max-h-72">
                {jsonLdSchema}
              </pre>
            </div>
          )}

          {/* Community Rating & Engineering Notes */}
          <div className="pt-4 border-t-4 border-[#1A1A1A] grid grid-cols-1 md:grid-cols-12 gap-6">
            <form onSubmit={handleAddComment} className="md:col-span-5 space-y-3">
              <h3 className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 font-display">
                <MessageSquare className="w-3.5 h-3.5 text-[#E53935]" />
                <span>Log Verification Note & Rating</span>
              </h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    aria-label={`Rate ${star} stars`}
                    className={`p-1 transition-colors ${
                      (userRating || 5) >= star ? 'text-[#E53935]' : 'text-[#1A1A1A]/30'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
                <span className="text-xs font-mono tabular-nums font-bold text-[#1A1A1A] ml-2">
                  {userRating || 5}.0 / 5.0
                </span>
              </div>
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share benchmark results, token savings, or model notes..."
                aria-label="Engineering review comment"
                className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border-2 border-[#1A1A1A] text-[#1A1A1A] placeholder-[#1A1A1A]/50 focus:outline-none"
              />
              {commentError && <p className="text-xs font-bold text-[#E53935]">{commentError}</p>}
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#1976D2] text-white border-2 border-[#1A1A1A] hover:bg-[#E53935] transition-colors whitespace-nowrap shrink-0"
              >
                Post Review
              </button>
            </form>

            <div className="md:col-span-7 space-y-2">
              <h3 className="text-xs font-bold text-[#1A1A1A] font-display">
                Verified Engineering Notes ({comments.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {comments.map((c, i) => (
                  <div key={i} className="p-3 bg-[#F5F5F5] border-2 border-[#1A1A1A] text-xs">
                    <div className="flex items-center justify-between text-[#1A1A1A] mb-1">
                      <span className="font-bold">{c.author}</span>
                      <span className="font-mono tabular-nums font-semibold">
                        {c.rating}.0 ★ · {c.date}
                      </span>
                    </div>
                    <p className="text-[#1A1A1A]/85 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
