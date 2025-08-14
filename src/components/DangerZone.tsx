import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DangerZone() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Delete Account</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Deactivate Account</h4>
            <p className="text-sm text-muted-foreground">
              Temporarily disable your account
            </p>
          </div>
          <Button variant="outline" size="sm">
            Deactivate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
