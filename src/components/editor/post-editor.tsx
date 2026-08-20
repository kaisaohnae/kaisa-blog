'use client';

import {useMemo} from 'react';
import dynamic from 'next/dynamic';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import type {BytemdPlugin} from 'bytemd';
import ko from 'bytemd/locales/ko.json';
import {LoadingFallback} from '@/ui-components';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import './post-editor.css';

const ByteMdEditor = dynamic(() => import('@bytemd/react').then((m) => m.Editor), {
  ssr: false,
  loading: () => <LoadingFallback className="post-editor post-editor--loading" />,
});

type PostEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
};

export default function PostEditor({value, onChange}: PostEditorProps) {
  const plugins = useMemo<BytemdPlugin[]>(() => [gfm(), highlight()], []);

  return (
    <div className="post-editor">
      <ByteMdEditor
        value={value}
        plugins={plugins}
        locale={ko}
        mode="split"
        placeholder="마크다운으로 본문을 작성하세요"
        onChange={onChange}
      />
    </div>
  );
}

export function isEditorEmpty(content: string) {
  return !content.trim();
}
