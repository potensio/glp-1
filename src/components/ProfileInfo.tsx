import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileInfo() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-10">
          {/* Avatar section on the left */}
          <div className="flex flex-col items-center space-y-3 justify-center">
            <Avatar className="size-28">
              <AvatarImage
                src="/placeholder.svg?height=80&width=80"
                alt="Profile"
              />
              <AvatarFallback className="text-lg">JD</AvatarFallback>
            </Avatar>
            {/* <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs"
            >
              Change Avatar
            </Button> */}
          </div>

          {/* Form fields in 2x2 grid on the right */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input className="h-11" id="firstName" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input className="h-11" id="lastName" defaultValue="Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                className="h-11"
                id="email"
                defaultValue="john.doe@example.com"
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                className="h-11"
                id="phone"
                defaultValue="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button className="h-11">Save Changes</Button>
          <Button variant="outline" className="h-11">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
