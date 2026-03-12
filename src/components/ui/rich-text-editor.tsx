import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, Heading1, Heading2, Heading3, ListOrdered, Minus, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const EMOJI_PICKS = ['✅', '⭐', '🔥', '💎', '🏠', '🚗', '✨', '🧹', '💧', '🪟', '📍', '📞', '💪', '👍', '🎯', '⚡', '🛡️', '🌟', '💼', '🔑'];

const ToolbarButton = ({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 rounded-lg transition-colors",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
  >
    {children}
  </button>
);

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const isInternalChange = useRef(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: cn(
          'focus:outline-none min-h-[140px] px-4 py-3 text-sm',
          // Match the public page rendering exactly
          'prose prose-sm max-w-none',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-4 [&_h1]:mb-2',
          '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1',
          '[&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-2',
          '[&_strong]:text-foreground [&_strong]:font-semibold',
          '[&_em]:italic',
          '[&_u]:underline',
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

  // Sync external content changes (but not our own updates)
  useEffect(() => {
    if (editor && !isInternalChange.current) {
      const currentHTML = editor.getHTML();
      if (content !== currentHTML && content !== (currentHTML === '<p></p>' ? '' : currentHTML)) {
        editor.commands.setContent(content || '');
      }
    }
    isInternalChange.current = false;
  }, [content, editor]);

  const insertEmoji = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
      setShowEmojis(false);
    }
  };

  if (!editor) return null;

  return (
    <div className={cn("rounded-xl border border-input bg-background overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50 bg-secondary/20 flex-wrap">
        {/* Heading controls */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        {/* Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Souligné"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Bullet list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        {/* Ordered list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        {/* Horizontal rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Séparateur"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Emoji picker */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowEmojis(!showEmojis)}
            active={showEmojis}
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </ToolbarButton>

          {showEmojis && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg p-2 grid grid-cols-5 gap-1 w-[200px]">
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

      {/* Editor — true WYSIWYG preview */}
      <EditorContent editor={editor} />

      {/* Helper text */}
      <div className="px-3 py-1.5 border-t border-border/30 bg-secondary/10">
        <p className="text-[10px] text-muted-foreground">
          ✏️ Aperçu en direct — ce que vous voyez ici est ce qui s'affichera sur votre page
        </p>
      </div>
    </div>
  );
}
