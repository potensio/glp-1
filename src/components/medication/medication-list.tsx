"use client";

import { useState } from "react";
import { MoreHorizontal, Pill } from "lucide-react";
import { useMedication } from "@/hooks/use-medication";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { MedicationListSkeleton } from "@/components/medication/medication-list-skeleton";

interface MedicationListProps {
  onAddMedication: () => void;
  onEditMedication: (medication: any) => void;
}

export function MedicationList({
  onAddMedication,
  onEditMedication,
}: MedicationListProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    medicationId: string;
    medicationName: string;
  }>({ open: false, medicationId: "", medicationName: "" });
  const [activeTab, setActiveTab] = useState<string>("active");

  const {
    entries: medications,
    error,
    isLoading,
    updateMedication,
    deleteMedication,
  } = useMedication();

  // Format medication data for display
  const formatMedications = (meds: any[]) => {
    return meds.map((med) => ({
      id: med.id,
      name: med.name,
      dosage: `${med.dosage}${med.dosageUnit}`,
      frequency: `${med.repeatEvery} ${med.repeatUnit}`,
      condition: med.description || "No description provided",
      started: new Date(med.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      nextRefill: "", // This would need to be calculated based on prescription length
      status: med.status.charAt(0).toUpperCase() + med.status.slice(1),
      icon: "💊",
      prescribingDoctor: med.prescribingDoctor,
      enableReminders: med.enableReminders,
    }));
  };

  const formattedMedications = formatMedications(medications || []);

  // Filter medications based on active tab
  const filteredMedications = formattedMedications.filter((medication) => {
    const status = medication.status.toLowerCase();
    return status === activeTab;
  });

  const handlePauseMedication = async (medication: any) => {
    const newStatus = medication.status === "paused" ? "active" : "paused";
    await updateMedication({
      id: medication.id,
      data: { status: newStatus },
    });
  };

  const handleRemoveMedication = (medication: any) => {
    setConfirmDialog({
      open: true,
      medicationId: medication.id,
      medicationName: medication.name,
    });
  };

  const handleConfirmRemove = async () => {
    await deleteMedication(confirmDialog.medicationId);
    setConfirmDialog({ open: false, medicationId: "", medicationName: "" });
  };

  const handleCancelRemove = () => {
    setConfirmDialog({ open: false, medicationId: "", medicationName: "" });
  };

  const handleMedicationCardClick = (medication: any) => {
    // Find the original medication data from the raw medications array
    const originalMedication = medications?.find(
      (med: any) => med.id === medication.id
    );
    onEditMedication(originalMedication || medication);
  };

  if (isLoading) {
    return <MedicationListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-500">
            Error loading medications. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Pill className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Current Medications
              </CardTitle>
            </div>
            <Button
              variant={"outline"}
              onClick={onAddMedication}
              className="h-11"
            >
              Add Medication
            </Button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-fit"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="active" className="text-sm cursor-pointer">
                  Active
                </TabsTrigger>
                <TabsTrigger value="paused" className="text-sm cursor-pointer">
                  Paused
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="text-sm text-gray-500">
              {filteredMedications.length} medications
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredMedications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {formattedMedications.length === 0
                ? "No medications found. Add your first medication to get started."
                : `No ${activeTab} medications found.`}
            </div>
          ) : (
            filteredMedications.map((medication) => (
              <div
                key={medication.id}
                className="border rounded-2xl p-4 bg-background duration-200 transition-all cursor-pointer hover:shadow-xl"
                onClick={() => handleMedicationCardClick(medication)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className=" p-2 rounded-lg">
                      <span className="text-lg text-green-600">
                        {medication.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {medication.name}
                        </h3>
                        <Badge
                          variant={
                            medication.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            medication.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {medication.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {medication.dosage} • {medication.frequency}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {medication.condition}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Started: {medication.started}</span>
                        {medication.nextRefill && (
                          <span>Next refill: {medication.nextRefill}</span>
                        )}
                        {medication.prescribingDoctor && (
                          <span>Doctor: {medication.prescribingDoctor}</span>
                        )}
                      </div>
                    </div>
                  </div>
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
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          const originalMedication = medications?.find(
                            (med: any) => med.id === medication.id
                          );
                          onEditMedication(originalMedication || medication);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePauseMedication(medication);
                        }}
                      >
                        {medication.status === "Active" ? "Pause" : "Resume"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMedication(medication);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={handleConfirmRemove}
        title="Remove Medication"
        description={`Are you sure you want to remove ${confirmDialog.medicationName}? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
