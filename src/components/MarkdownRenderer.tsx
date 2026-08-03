import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-slate-900 mb-3 border-b pb-1 mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-slate-900 mb-2 mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-emerald-700 mb-2 mt-3">{children}</h3>,
          p: ({ children }) => <p className="mb-3 text-slate-700 leading-relaxed text-sm">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-sm text-slate-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-sm text-slate-700">{children}</ol>,
          li: ({ children }) => <li className="text-slate-700">{children}</li>,
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            return isInline ? (
              <code className="bg-slate-100 text-emerald-800 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200">
                {children}
              </code>
            ) : (
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto my-3 border border-slate-800 shadow-sm">
                <code>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/50 italic px-3 py-2 text-slate-700 text-sm my-3 rounded-r">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
