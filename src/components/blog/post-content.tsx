'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function looksLikeHtml(content: string) {
  const trimmed = content.trim();
  return /^<[a-z][\s\S]*>/i.test(trimmed);
}

type PostContentProps = {
  content: string;
  className?: string;
};

export default function PostContent({content, className = 'blog-post__body'}: PostContentProps) {
  if (!content.trim()) return null;

  if (looksLikeHtml(content)) {
    return <div className={className} dangerouslySetInnerHTML={{__html: content}} />;
  }

  return (
    <div className={`${className} blog-post__body--markdown`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
