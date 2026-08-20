'use client';

import dynamic from 'next/dynamic';
import {LoadingFallback} from '@/ui-components';
import '@uiw/react-md-editor/markdown-editor.css';
import './post-editor.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => <LoadingFallback className="post-editor post-editor--loading" />,
});

type PostEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
};

export default function PostEditor({value, onChange}: PostEditorProps) {
  return (
    <div className="post-editor" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(next) => onChange(next || '')}
        preview="live"
        height={560}
        visibleDragbar={false}
        textareaProps={{
          placeholder: '마크다운으로 본문을 작성하세요. `# 제목`, **굵게**, ```코드``` 등을 사용할 수 있습니다.',
        }}
      />
    </div>
  );
}

export function isEditorEmpty(content: string) {
  return !content.trim();
}
