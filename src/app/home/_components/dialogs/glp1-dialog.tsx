import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Syringe } from "lucide-react";
import { useGlp1 } from "@/hooks/use-glp1";
import { glp1Schema } from "@/lib/services/glp1.service";

const glp1Types = ["Ozempic", "Wegovy", "Mounjaro", "Zepbound"];

export function Glp1DialogContent({
  onSave,
}: {
  onSave?: (data: { type: string; dose: string }) => void;
}) {
  const [type, setType] = useState(glp1Types[0]);
  const [dose, setDose] = useState("");
  const [errors, setErrors] = useState<{ type?: string; dose?: string }>({});
  const { createGlp1Entry, isLoading } = useGlp1();

  const handleSave = async () => {
    try {
      // Validate the form data
      const validatedData = glp1Schema.parse({ type, dose });
      
      // Clear any previous errors
      setErrors({});
      
      // Create the GLP-1 entry
      await createGlp1Entry(validatedData);
      
      // Call the onSave callback if provided (for closing dialog)
      onSave?.({ type, dose });
      
      // Reset form
      setType(glp1Types[0]);
      setDose("");
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        // Handle validation errors
        const zodError = error as any;
        const fieldErrors: { type?: string; dose?: string } = {};
        
        zodError.errors?.forEach((err: any) => {
          if (err.path[0] === "type") {
            fieldErrors.type = err.message;
          } else if (err.path[0] === "dose") {
            fieldErrors.dose = err.message;
          }
        });
        
        setErrors(fieldErrors);
      }
      // Other errors are handled by the hook's toast notifications
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-3 rounded-full">
            <Syringe className="size-5 text-blue-600" />
          </div>
          <DialogTitle className="text-lg font-semibold">GLP-1</DialogTitle>
        </div>
      </DialogHeader>
      {/* GLP-1 type selector */}
      <div className="flex flex-col gap-2">
        <label
          className="block text-sm font-medium text-secondary w-full"
          htmlFor="glp1-type-toggle"
        >
          Select your GLP-1 type
        </label>

        <div
          id="glp1-type-toggle"
          className="grid grid-cols-2 gap-2 mb-4 w-full"
        >
          {glp1Types.map((t) => (
            <button
              key={t}
              type="button"
              className={`px-4 py-2 rounded-lg border text-base font-semibold transition-colors flex items-center justify-center min-w-[90px] ${
                type === t
                  ? "bg-background border-primary ring ring-primary text-foreground"
                  : "bg-background border-border text-secondary hover:border-primary"
              }`}
              onClick={() => setType(t)}
              title={t}
              aria-label={t}
              disabled={isLoading}
            >
              {t}
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="text-sm text-red-500 mt-1">{errors.type}</p>
        )}
      </div>

      {/* Dosage input like calories */}
      <div className="flex flex-col items-center gap-4 mb-4">
        <label className="text-3xl font-bold flex items-baseline">
          <input
            id="glp1-dose"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="2.5"
            value={dose}
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) setDose(e.target.value);
            }}
            className="h-12 w-20 text-center bg-transparent outline-none border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-0 m-0 text-3xl font-bold appearance-none transition-colors"
            style={{ maxWidth: 120 }}
            aria-label="Dosage in mg"
            disabled={isLoading}
          />
          <span className="text-base font-medium text-gray-500 ml-1">mg</span>
        </label>
        {errors.dose && (
          <p className="text-sm text-red-500 mt-1">{errors.dose}</p>
        )}
      </div>
      <DialogFooter className="flex flex-col mt-2">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={!dose || !type || isLoading}
        >
          {isLoading ? "Logging..." : `Log ${type}`}
        </Button>
      </DialogFooter>
    </>
  );
}
