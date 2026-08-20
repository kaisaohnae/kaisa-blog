'use client';

import {useMemo} from 'react';
import dynamic from 'next/dynamic';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import type {BytemdPlugin} from 'bytemd';
import 'bytemd/dist/index.css';
import 'github-markdown-css/github-markdown-light.css';
import 'highlight.js/styles/github.css';

const ByteMdViewer = dynamic(() => import('@bytemd/react').then((m) => m.Viewer), {
  ssr: false,
});

function looksLikeHtml(content: string) {
  const trimmed = content.trim();
  return /^<[a-z][\s\S]*>/i.test(trimmed);
}

type PostContentProps = {
  content: string;
  className?: string;
};

export default function PostContent({content, className = 'blog-post__body'}: PostContentProps) {
  const plugins = useMemo<BytemdPlugin[]>(() => [gfm(), highlight()], []);

  if (!content.trim()) return null;

  if (looksLikeHtml(content)) {
    return <div className={className} dangerouslySetInnerHTML={{__html: content}} />;
  }

  return (
    <div className={`${className} blog-post__body--markdown`}>
      <ByteMdViewer value={content} plugins={plugins} />
    </div>
  );
}
