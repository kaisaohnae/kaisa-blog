'use client';

import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {Ex3Button} from '@/ui-kit';
import {LoadingFallback} from '@/ui-components';
import './post-editor.css';

type PostEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export default function PostEditor({value, onChange}: PostEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {openOnClick: false, autolink: true},
      }),
      Placeholder.configure({placeholder: '본문을 작성하세요'}),
      Image,
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'post-editor__content',
      },
    },
    onUpdate: ({editor: next}) => onChange(next.getHTML()),
  });

  if (!editor) {
    return <LoadingFallback className="post-editor post-editor--loading" />;
  }

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('링크 URL', previous || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({href: url.trim()}).run();
  };

  const addImage = () => {
    const url = window.prompt('이미지 URL', 'https://');
    if (!url?.trim()) return;
    editor.chain().focus().setImage({src: url.trim()}).run();
  };

  return (
    <div className="post-editor">
      <div className="post-editor__toolbar" role="toolbar" aria-label="본문 서식">
        <Ex3Button
          variant={editor.isActive('bold') ? 'primary' : 'secondary'}
          uiSize="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          굵게
        </Ex3Button>
        <Ex3Button
          variant={editor.isActive('italic') ? 'primary' : 'secondary'}
          uiSize="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          기울임
        </Ex3Button>
        <Ex3Button
          variant={editor.isActive('underline') ? 'primary' : 'secondary'}
          uiSize="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          밑줄
        </Ex3Button>
        <Ex3Button
          variant={editor.isActive('heading', {level: 2}) ? 'primary' : 'secondary'}
          uiSize="sm"
          onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
        >
          제목
        </Ex3Button>
        <Ex3Button
          variant={editor.isActive('bulletList') ? 'primary' : 'secondary'}
          uiSize="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          목록
        </Ex3Button>
        <Ex3Button
          variant={editor.isActive('orderedList') ? 'primary' : 'secondary'}
          uiSize="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          번호
        </Ex3Button>
        <Ex3Button
          variant={editor.isActive('blockquote') ? 'primary' : 'secondary'}
          uiSize="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          인용
        </Ex3Button>
        <Ex3Button variant="secondary" uiSize="sm" onClick={setLink}>
          링크
        </Ex3Button>
        <Ex3Button variant="secondary" uiSize="sm" onClick={addImage}>
          이미지
        </Ex3Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export function isEditorEmpty(html: string) {
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return !text;
}
