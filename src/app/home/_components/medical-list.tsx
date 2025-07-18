"use client";

import { Pill } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const medications = [
  {
    icon: Pill,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    doctor: "Dr. Smith",
  },
  {
    icon: Pill,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    doctor: "Dr. Lee",
  },
  {
    icon: Pill,
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once at night",
    doctor: "Dr. Johnson",
  },
];

export const MedicationList = () => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medication List</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              + Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent>{/* Empty for now */}</DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {medications.map((med, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-3 mx-[-8] hover:bg-gradient-to-br hover:from-foreground/3 hover:to-foreground/6 rounded-lg transition-all duration-200"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 shadow-sm">
              <med.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{med.name}</h4>
                <span className="text-xs text-secondary">{med.dosage}</span>
              </div>
              <p className="text-sm text-secondary">{med.frequency}</p>
              <p className="text-xs text-muted-foreground">
                Prescribed by {med.doctor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
