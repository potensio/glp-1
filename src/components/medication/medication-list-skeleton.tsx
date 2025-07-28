import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MedicationListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-8 w-56 mb-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="">
            <div className="flex items-start gap-3 flex-1">
              <Skeleton className="w-8 h-8 rounded" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
