"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import { useJournals, useDeleteJournal } from "@/hooks/use-journal";
import { Suspense, useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  } else {
    return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
  }
}

function JournalContent() {
  const { data: journals, isLoading, error } = useJournals();
  const deleteJournal = useDeleteJournal();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    journalId: string | null;
    title: string;
  }>({ open: false, journalId: null, title: "" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEdit = (journalId: string) => {
    router.push(`/home/journal/edit/${journalId}`);
  };

  const handleDelete = (journalId: string, title?: string) => {
    setConfirmDialog({
      open: true,
      journalId,
      title: title || "Untitled Entry",
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.journalId) return;

    try {
      await deleteJournal.mutateAsync(confirmDialog.journalId);
      toast.success("Journal entry deleted successfully");
    } catch (error) {
      console.error("Failed to delete journal:", error);
      toast.error("Failed to delete journal entry");
    } finally {
      setConfirmDialog({ open: false, journalId: null, title: "" });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, journalId: null, title: "" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load journal entries</p>
      </div>
    );
  }

  if (!journals || journals.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <p className="text-muted-foreground mb-4">No journal entries yet</p>
        <Link href="/home/journal/create">
          <Button>Create your first entry</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {journals.map((journal) => {
        const date = new Date(journal.capturedDate);
        const formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const lastUpdated = new Date(journal.updatedAt || journal.createdAt);
        const relativeTime = isMounted ? getRelativeTime(lastUpdated) : null;

        return (
          <Card key={journal.id} className="p-0">
            <div className="flex items-center justify-between px-6 pt-6 pb-1">
              <span className="font-semibold text-base">{formattedDate}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => handleEdit(journal.id)}>
                    Edit Entry
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => handleDelete(journal.id, formattedDate)}>
                    Delete Entry
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardContent className="pt-0 pb-4">
              <div className="mb-2">
                {isMounted && relativeTime && (
                  <div className="italic text-muted-foreground text-sm mb-2">
                    Last updated {relativeTime}
                  </div>
                )}
                <div
                  className="whitespace-pre-line text-base text-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: journal.content }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
      <ConfirmationDialog
         open={confirmDialog.open}
         onOpenChange={(open) => {
           if (!open) handleCancelDelete();
         }}
         onConfirm={handleConfirmDelete}
         title="Delete Journal Entry"
         description={`Are you sure you want to delete "${confirmDialog.title}"? This action cannot be undone.`}
         confirmText="Delete"
         cancelText="Cancel"
         variant="destructive"
       />
    </div>
  );
}

export default function JournalPage() {
  return (
    <div className="flex flex-col gap-8 pb-8 min-h-[80vh]">
      {/* Title and Month Navigation */}
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
            Journal
          </h1>
          <p className="text-background text-lg mb-6">
            Your personal space for thoughts and reflections
          </p>
        </div>{" "}
        <Link href="/home/journal/create">
          <Button
            size={"lg"}
            variant={"outline"}
            className="md:w-36 bg-transparent text-background hover:bg-background/10 hover:text-background cursor-pointer"
          >
            Add Journal
          </Button>
        </Link>
      </div>

      {/* Journal Entries */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <JournalContent />
      </Suspense>
    </div>
  );
}
