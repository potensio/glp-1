"use client";

import type React from "react";

import { Card } from "./ui/card";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Clock,
  Bold,
  Italic,
  Strikethrough,
  Code,
  LinkIcon,
  Trash,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useCreateJournal } from "@/hooks/use-journal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function JournalEditor() {
  /* ------------------------------------------------------------------ */
  /* Date - Time helpers                                                */
  /* ------------------------------------------------------------------ */
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  // Journal mutation hook and router
  const createJournal = useCreateJournal();
  const router = useRouter();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      setCurrentDate(now.toLocaleDateString("en-US", dateOptions));
      setCurrentTime(now.toLocaleTimeString("en-US", timeOptions));
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Tiptap Editor                                                      */
  /* ------------------------------------------------------------------ */
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your thoughts..." }),
      Link.configure({ openOnClick: false }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[60vh] text-gray-900",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText().trim();
      setHasContent(text.length > 0);
    },
    immediatelyRender: false,
  });

  /* ------------------------------------------------------------------ */
  /* Save functionality                                                 */
  /* ------------------------------------------------------------------ */
  const handleSave = async () => {
    if (!editor) return;

    const content = editor.getHTML();
    if (!content || content === "<p></p>") {
      return;
    }

    setIsSaving(true);
    try {
      await createJournal.mutateAsync({
        content,
        capturedDate: new Date(),
      });

      // Show success toast
      toast.success("Journal entry saved successfully!", {
        description: "Your thoughts have been recorded.",
      });

      // Clear the editor after successful save
      editor.commands.clearContent();
      setHasContent(false);

      // Redirect to journal page
      router.push("/home/journal");
    } catch (error) {
      console.error("Failed to save journal:", error);
      toast.error("Failed to save journal entry", {
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update hasContent when editor is first created
  useEffect(() => {
    if (editor) {
      const text = editor.getText().trim();
      setHasContent(text.length > 0);
    }
  }, [editor]);

  /* ------------------------------------------------------------------ */
  /* Reusable Toolbar Components                                        */
  /* ------------------------------------------------------------------ */

  // Reusable toolbar buttons component
  const ToolbarButtons = ({ editor }: { editor: any }) => (
    <>
      <ToolbarBtn
        isActive={editor?.isActive("bold")}
        onClick={() => editor?.chain().focus().toggleBold().run()}
        title="Bold (Ctrl/Cmd+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn
        isActive={editor?.isActive("italic")}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl/Cmd+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn
        isActive={editor?.isActive("strike")}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        title="Strikethrough (Ctrl/Cmd+Shift+S)"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn
        isActive={editor?.isActive("code")}
        onClick={() => editor?.chain().focus().toggleCode().run()}
        title="Inline Code (Ctrl/Cmd+E)"
      >
        <Code className="w-4 h-4" />
      </ToolbarBtn>
      <div className="w-px h-4 bg-gray-600 mx-1" />
      <ToolbarBtn
        isActive={editor?.isActive("link")}
        onClick={() => {
          const previousUrl = editor?.getAttributes("link").href;
          const url = window.prompt("Enter URL", previousUrl || "https://");
          if (url === null) return;
          if (url === "") {
            editor?.chain().focus().unsetLink().run();
            return;
          }
          editor
            ?.chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        title="Add / Edit Link"
      >
        <LinkIcon className="w-4 h-4" />
      </ToolbarBtn>
    </>
  );

  // Static toolbar for mobile/tablet
  const StaticToolbar = () => (
    <div className="md:hidden flex items-center gap-1 bg-gray-50 border-b border-gray-200 p-2 overflow-x-auto">
      <ToolbarButtons editor={editor} />
    </div>
  );

  // Floating toolbar for desktop (selection-based)
  const FloatingToolbar = () => {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!editor) return;

      const update = () => {
        const { from, to } = editor.state.selection;
        // Show only if there's a selection
        if (from === to) {
          setVisible(false);
          return;
        }

        // Compute rectangle around the selection
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const box = {
          x: (start.left + end.right) / 2,
          y: start.top,
        };

        setCoords({ x: box.x, y: box.y });
        setVisible(true);
      };

      editor.on("selectionUpdate", update);
      editor.on("blur", () => setVisible(false));

      // Initialise
      update();

      return () => {
        editor.off("selectionUpdate", update);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    if (!visible) return null;

    return (
      <div
        ref={containerRef}
        style={{
          top: coords.y - 48,
          left: coords.x,
        }}
        className="hidden md:flex fixed z-50 -translate-x-1/2 items-center gap-1 bg-gray-900 text-white rounded-lg shadow-lg px-2 py-1 border border-gray-700"
      >
        <ToolbarButtons editor={editor} />
      </div>
    );
  };

  /* Small reusable button component */
  const ToolbarBtn = ({
    children,
    onClick,
    isActive,
    title,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
    title?: string;
  }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-2 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:p-2 flex items-center justify-center ${
        isActive
          ? "bg-gray-700 md:bg-gray-700 text-white"
          : "hover:bg-gray-700/60 md:hover:bg-gray-700/60 text-gray-700 md:text-white hover:text-white"
      }`}
    >
      {children}
    </button>
  );

  /* ------------------------------------------------------------------ */
  /* UI Layout                                                          */
  /* ------------------------------------------------------------------ */
  return (
    <>
      <Card className="min-h-screen bg-white flex flex-col py-0 gap-0">
        {/* Header */}
        <header className="flex justify-between items-center px-3 py-3 md:px-8 md:py-6 border-b border-gray-100">
          <p className="text-gray-600 italic md:text-lg">{currentDate}</p>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{currentTime}</span>
          </div>
        </header>

        {/* Static Toolbar for Mobile */}
        {editor && <StaticToolbar />}

        {/* Editor */}
        <main className="flex-1 px-3 py-8 md:px-8 relative">
          {editor && <FloatingToolbar />}
          <EditorContent editor={editor} className="w-full h-full" />
        </main>

        {/* Footer */}
        <footer className="flex justify-between items-center px-8 py-6 border-t border-gray-100 sticky bottom-0 z-10">
          <div className="flex items-center gap-6">
            {/* <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Add to Favorites</span>
            </button> */}
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="h-11 w-40"
              onClick={handleSave}
              disabled={!hasContent || isSaving || createJournal.isPending}
            >
              {isSaving || createJournal.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save</>
              )}
            </Button>
          </div>
        </footer>
      </Card>
    </>
  );
}
