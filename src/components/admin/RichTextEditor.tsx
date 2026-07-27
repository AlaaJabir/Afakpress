"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { plainTextToArticleHtml } from "@/lib/article-html";

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, active = false, disabled = false, onClick }: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      className={`rounded-md border px-3 py-2 text-xs font-black transition ${
        active ? "border-red-700 bg-red-700 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-red-500 hover:text-red-700"
      } disabled:cursor-not-allowed disabled:opacity-40`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {label}
    </button>
  );
}

function editorHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /<\/?[a-z][\s\S]*>/i.test(trimmed) ? trimmed : plainTextToArticleHtml(trimmed);
}

export function RichTextEditor({ value, onChange, placeholder = "Write the full article content…" }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: editorHtml(value),
    editorProps: {
      attributes: {
        class: "rich-text-editor-content min-h-72 px-4 py-4 outline-none",
        dir: "auto",
        "aria-label": "Full article content",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextContent = editorHtml(value);
    if (nextContent !== editor.getHTML() && !(editor.isEmpty && !nextContent)) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => currentEditor ? {
      paragraph: currentEditor.isActive("paragraph"),
      h2: currentEditor.isActive("heading", { level: 2 }),
      h3: currentEditor.isActive("heading", { level: 3 }),
      h4: currentEditor.isActive("heading", { level: 4 }),
      bold: currentEditor.isActive("bold"),
      italic: currentEditor.isActive("italic"),
      underline: currentEditor.isActive("underline"),
      bulletList: currentEditor.isActive("bulletList"),
      orderedList: currentEditor.isActive("orderedList"),
      blockquote: currentEditor.isActive("blockquote"),
      link: currentEditor.isActive("link"),
      left: currentEditor.isActive({ textAlign: "left" }),
      center: currentEditor.isActive({ textAlign: "center" }),
      right: currentEditor.isActive({ textAlign: "right" }),
      inTable: currentEditor.isActive("table"),
    } : null,
  });

  if (!editor) {
    return <div className="min-h-72 animate-pulse rounded-md border border-slate-300 bg-slate-50" aria-label="Loading rich text editor" />;
  }

  const setLink = () => {
    const existing = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL", existing ?? "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim(), target: "_blank" }).run();
  };
  const inTable = Boolean(state?.inTable);

  return (
    <div className="overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-red-700 focus-within:ring-4 focus-within:ring-red-100">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
        <ToolbarButton label="Paragraph" active={state?.paragraph} onClick={() => editor.chain().focus().setParagraph().run()} />
        <ToolbarButton label="H2" active={state?.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="H3" active={state?.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolbarButton label="H4" active={state?.h4} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} />
        <ToolbarButton label="Bold" active={state?.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton label="Italic" active={state?.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="Underline" active={state?.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton label="Bullet list" active={state?.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="Numbered list" active={state?.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="Quote" active={state?.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton label="Link" active={state?.link} onClick={setLink} />
        <ToolbarButton label="Align left" active={state?.left} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
        <ToolbarButton label="Align center" active={state?.center} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
        <ToolbarButton label="Align right" active={state?.right} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
        <ToolbarButton label="Horizontal separator" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <ToolbarButton label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        <ToolbarButton label="Undo" disabled={!editor.can().chain().focus().undo().run()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton label="Redo" disabled={!editor.can().chain().focus().redo().run()} onClick={() => editor.chain().focus().redo().run()} />
      </div>

      {inTable ? (
        <div className="flex flex-wrap gap-2 border-b border-amber-200 bg-amber-50 p-3">
          <ToolbarButton label="Add row before" disabled={!editor.can().addRowBefore()} onClick={() => editor.chain().focus().addRowBefore().run()} />
          <ToolbarButton label="Add row after" disabled={!editor.can().addRowAfter()} onClick={() => editor.chain().focus().addRowAfter().run()} />
          <ToolbarButton label="Delete row" disabled={!editor.can().deleteRow()} onClick={() => editor.chain().focus().deleteRow().run()} />
          <ToolbarButton label="Add column before" disabled={!editor.can().addColumnBefore()} onClick={() => editor.chain().focus().addColumnBefore().run()} />
          <ToolbarButton label="Add column after" disabled={!editor.can().addColumnAfter()} onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <ToolbarButton label="Delete column" disabled={!editor.can().deleteColumn()} onClick={() => editor.chain().focus().deleteColumn().run()} />
          <ToolbarButton label="Toggle header row" disabled={!editor.can().toggleHeaderRow()} onClick={() => editor.chain().focus().toggleHeaderRow().run()} />
          <ToolbarButton label="Merge cells" disabled={!editor.can().mergeCells()} onClick={() => editor.chain().focus().mergeCells().run()} />
          <ToolbarButton label="Split cell" disabled={!editor.can().splitCell()} onClick={() => editor.chain().focus().splitCell().run()} />
          <ToolbarButton label="Delete table" disabled={!editor.can().deleteTable()} onClick={() => editor.chain().focus().deleteTable().run()} />
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}
