import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Minus, Smile, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Extension } from '@tiptap/core';

// FontSize extension using TextStyle's style attribute
const FontSizeExtension = Extension.create({
  name: 'fontSizeExt',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize?.replace('px', '') || null,
          renderHTML: (attributes) => {
            if (!attributes.fontSize) return {};
            return { style: `font-size: ${attributes.fontSize}px` };
          },
        },
      },
    }];
  },
  addCommands(): any {
    return {
      setFontSize: (size: number) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: size }).run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const EMOJI_PICKS = ['✅', '⭐', '🔥', '💎', '🏠', '🚗', '✨', '🧹', '💧', '🪟', '📍', '📞', '💪', '👍', '🎯', '⚡', '🛡️', '🌟', '💼', '🔑'];
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const ToolbarButton = ({
  active, onClick, children, title,
}: {
  active?: boolean; onClick: () => void; children: React.ReactNode; title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 rounded-lg transition-colors",
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
  >
    {children}
  </button>
);

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const isInternalChange = useRef(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      FontSizeExtension,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: cn(
          'focus:outline-none min-h-[140px] px-4 py-3 text-sm',
          'prose prose-sm max-w-none',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-4 [&_h1]:mb-2',
          '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1',
          '[&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-2',
          '[&_strong]:text-foreground [&_strong]:font-semibold',
          '[&_ul]:space-y-1 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-muted-foreground',
          '[&_ol]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-muted-foreground',
          '[&_hr]:my-4 [&_hr]:border-border',
        ),
      },
    },
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  useEffect(() => {
    if (editor && !isInternalChange.current) {
      const currentHTML = editor.getHTML();
      if (content !== currentHTML && content !== (currentHTML === '<p></p>' ? '' : currentHTML)) {
        editor.commands.setContent(content || '');
      }
    }
    isInternalChange.current = false;
  }, [content, editor]);

  // Get current font size from selection
  const getCurrentSize = useCallback((): string => {
    if (!editor) return '14';
    const attrs = editor.getAttributes('textStyle');
    return attrs?.fontSize || '14';
  }, [editor]);

  const applyFontSize = (size: number) => {
    if (!editor) return;
    (editor.commands as any).setFontSize(size);
    setShowSizes(false);
  };

  const insertEmoji = (emoji: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojis(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showEmojis && !showSizes) return;
    const handler = (e: MouseEvent) => {
      setShowEmojis(false);
      setShowSizes(false);
    };
    // Delay to avoid immediate close
    const timer = setTimeout(() => document.addEventListener('click', handler), 10);
    return () => { clearTimeout(timer); document.removeEventListener('click', handler); };
  }, [showEmojis, showSizes]);

  if (!editor) return null;

  const currentSize = getCurrentSize();

  return (
    <div className={cn("rounded-xl border border-input bg-background overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50 bg-secondary/20 flex-wrap">
        {/* Font size — Word style dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => { setShowSizes(!showSizes); setShowEmojis(false); }}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors min-w-[52px] justify-between",
              showSizes ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            title="Taille du texte"
          >
            <span>{currentSize}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSizes && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg py-1 w-[60px] max-h-[200px] overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => applyFontSize(size)}
                  className={cn(
                    "w-full text-center px-2 py-1.5 text-sm hover:bg-secondary transition-colors",
                    String(size) === String(currentSize) && "bg-primary/10 text-primary font-semibold"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Bold */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        {/* Italic */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        {/* Underline */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste à puces">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur">
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Emoji */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <ToolbarButton onClick={() => { setShowEmojis(!showEmojis); setShowSizes(false); }} active={showEmojis} title="Emoji">
            <Smile className="w-4 h-4" />
          </ToolbarButton>
          {showEmojis && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg p-2 grid grid-cols-5 gap-1 w-[200px]">
              {EMOJI_PICKS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-base transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <div className="px-3 py-1.5 border-t border-border/30 bg-secondary/10">
        <p className="text-[10px] text-muted-foreground">
          ✏️ Aperçu en direct — ce que vous voyez ici est ce qui s'affichera sur votre page
        </p>
      </div>
    </div>
  );
}
