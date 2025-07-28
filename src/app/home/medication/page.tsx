"use client";

import { useState, Suspense, useEffect } from "react";
import { Save, Printer } from "lucide-react";
import { MedicationCreationDialog } from "@/app/home/_components/dialogs/medication-creation-dialog";
import { MedicationList } from "@/components/medication/medication-list";
import { MedicationListSkeleton } from "@/components/medication/medication-list-skeleton";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useDoctorNote } from "@/hooks/use-doctor-note";

export default function MedicationManagement() {
  const {
    doctorNote,
    isLoading: isLoadingNote,
    saveDoctorNote,
    isSaving,
  } = useDoctorNote();
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load existing note when component mounts or when doctorNote changes
  useEffect(() => {
    if (doctorNote?.content) {
      setNotes(doctorNote.content);
      setIsInitialized(true);
    } else if (!isLoadingNote && !doctorNote) {
      // No default notes - start with empty state
      setNotes("");
      setIsInitialized(true);
    }
  }, [doctorNote, isLoadingNote]);

  const handleSaveNotes = () => {
    if (notes.trim()) {
      saveDoctorNote({ content: notes.trim() });
    }
  };

  const handleEditMedication = (medication: any) => {
    setEditingMedication(medication);
    setIsDialogOpen(true);
  };

  const handleAddMedication = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingMedication(null);
  };

  return (
    <>
      {/* Main Content */}

      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
            {" "}
            Medication Management
          </h1>
          <p className="text-background text-lg mb-6">
            {" "}
            Keep track of your medications and ensure you&apos;re always on schedule.
          </p>
        </div>{" "}
        <Button
          size={"lg"}
          variant={"outline"}
          className="md:w-36 bg-transparent text-background hover:bg-background/10 hover:text-background"
        >
          Print
          <Printer />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Current Medications */}
        <div className="lg:col-span-2">
          <Suspense fallback={<MedicationListSkeleton />}>
            <MedicationList
              onAddMedication={handleAddMedication}
              onEditMedication={handleEditMedication}
            />
          </Suspense>
        </div>

        {/* Notes for Doctor */}
        <div>
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Doctor Notes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px] resize-none"
                placeholder="Add notes for your doctor..."
                disabled={!isInitialized || isLoadingNote}
              />
              <Button
                variant="outline"
                onClick={handleSaveNotes}
                disabled={!isInitialized || isSaving || isLoadingNote}
                className="h-11 w-full"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <MedicationCreationDialog
        open={isDialogOpen}
        setOpen={handleDialogClose}
        editingMedication={editingMedication}
      />
    </>
  );
}
