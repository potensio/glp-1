import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityPrivacy() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security & Privacy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Password</h4>
            <p className="text-sm text-muted-foreground">
              Last changed 3 months ago
            </p>
          </div>
          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </div>
        {/* 
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security
            </p>
          </div>
          <Button variant="outline" size="sm">
            Enable 2FA
          </Button>
        </div> */}

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Login Activity</h4>
            <p className="text-sm text-muted-foreground">
              View recent login sessions
            </p>
          </div>
          <Button variant="outline" size="sm">
            View Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
