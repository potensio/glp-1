"user client";

import { Calendar, Pill, Stethoscope, Activity, FileText } from "lucide-react";

import { Card } from "@/components/ui/card";

const medicalReminders = [
  {
    icon: Calendar,
    title: "Doctor Appointment",
    subtitle: "Dr. Smith - Annual Checkup",
    time: "Tomorrow, 2:00 PM",
    color: "bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600",
    urgent: false,
  },
  {
    icon: Pill,
    title: "Medication Reminder",
    subtitle: "Lisinopril 10mg",
    time: "Due in 2 hours",
    color: "bg-gradient-to-br from-red-100 to-red-50 text-red-600",
    urgent: true,
  },
  {
    icon: Activity,
    title: "Blood Pressure Check",
    subtitle: "Weekly monitoring",
    time: "Due in 2 hours",
    color: "bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600",
    urgent: true,
  },
  {
    icon: Stethoscope,
    title: "Cardiology Follow-up",
    subtitle: "Dr. Johnson - Heart Monitor Results",
    time: "Due in 2 hours",
    color: "bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600",
    urgent: false,
  },
  {
    icon: FileText,
    title: "Lab Results",
    subtitle: "Blood work - Ready for review",
    time: "Due in 2 hours",
    color: "bg-gradient-to-br from-green-100 to-green-50 text-green-600",
    urgent: false,
  },
];

export const MedicalReminders = () => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medical Reminders</h3>
      </div>

      <div className="space-y-4">
        {medicalReminders.map((reminder, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-3 mx-[-8] hover:bg-gradient-to-br hover:from-foreground/3 hover:to-foreground/6 rounded-lg transition-all duration-200"
          >
            <div className={`p-2 rounded-lg ${reminder.color} shadow-sm`}>
              <reminder.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{reminder.title}</h4>
              </div>
              <p className="text-sm text-secondary">{reminder.subtitle}</p>
            </div>
            <span className="text-xs">{reminder.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
