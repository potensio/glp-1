"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useUpdateJournal } from "@/hooks/use-journal";
import { toast } from "sonner";

interface Journal {
  id: string;
  title?: string;
  content: string;
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditJournalPage() {
  const params = useParams();
  const router = useRouter();
  const journalId = params.id as string;
  
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  
  const updateJournal = useUpdateJournal();

  // Fetch journal data
  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await fetch(`/api/journals/${journalId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch journal');
        }
        const data = await response.json();
        setJournal(data);
      } catch (error) {
        console.error('Error fetching journal:', error);
        toast.error('Failed to load journal entry');
        router.push('/home/journal');
      } finally {
        setIsLoading(false);
      }
    };

    if (journalId) {
      fetchJournal();
    }
  }, [journalId, router]);

  // Update date and time
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

  // Initialize editor
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

  // Set editor content when journal is loaded
  useEffect(() => {
    if (editor && journal) {
      editor.commands.setContent(journal.content);
      const text = editor.getText().trim();
      setHasContent(text.length > 0);
    }
  }, [editor, journal]);

  const handleSave = async () => {
    if (!editor || !journal) return;
    
    const content = editor.getHTML();
    if (!content || content === '<p></p>') {
      return;
    }

    setIsSaving(true);
    try {
      await updateJournal.mutateAsync({
        id: journal.id,
        data: {
          content,
          capturedDate: new Date(journal.capturedDate),
        },
      });
      
      toast.success("Journal entry updated successfully!", {
        description: "Your changes have been saved.",
      });
      
      router.push("/home/journal");
    } catch (error) {
      console.error('Failed to update journal:', error);
      toast.error("Failed to update journal entry", {
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toolbar components
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

  const StaticToolbar = () => (
    <div className="md:hidden flex items-center gap-1 bg-gray-50 border-b border-gray-200 px-4 py-2 overflow-x-auto">
      <ToolbarButtons editor={editor} />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-muted-foreground">Journal entry not found</p>
      </div>
    );
  }

  const originalDate = new Date(journal.capturedDate);
  const formattedOriginalDate = originalDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/home/journal')}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-background text-3xl leading-tight font-semibold">
            Edit Journal
          </h1>
          <p className="text-background text-lg">
            Editing entry from {formattedOriginalDate}
          </p>
        </div>
      </div>

      {/* Editor */}
      <Card className="min-h-screen bg-white flex flex-col py-0 gap-0">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <p className="text-gray-600 italic text-lg">{formattedOriginalDate}</p>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{currentTime}</span>
          </div>
        </header>

        {/* Static Toolbar for Mobile */}
        {editor && <StaticToolbar />}

        {/* Editor */}
        <main className="flex-1 px-3 py-8 md:px-8 relative">
          <EditorContent editor={editor} className="w-full h-full" />
        </main>

        {/* Footer */}
        <footer className="flex justify-between items-center px-8 py-6 border-t border-gray-100 sticky bottom-0 z-10">
          <div className="flex items-center gap-6">
            {/* Empty space for future features */}
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              className="h-11 w-32" 
              onClick={() => router.push('/home/journal')}
            >
              Cancel
            </Button>
            <Button 
              className="h-11 w-40" 
              onClick={handleSave}
              disabled={!hasContent || isSaving || updateJournal.isPending}
            >
              {isSaving || updateJournal.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </footer>
      </Card>
    </div>
  );
}