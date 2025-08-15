import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUpdateProfile,
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/hooks/use-profile";

export function ProfileInfo() {
  const { profile, user, refreshUser } = useAuth();
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phoneNumber: profile?.phoneNumber || "",
    },
  });

  // Track if there are any changes (form or avatar)
  const hasAvatarChanges = selectedAvatarFile !== null || shouldRemoveAvatar;
  const hasChanges = isDirty || hasAvatarChanges;
  const isLoading = updateProfileMutation.isPending;

  // Reset form when profile data changes
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phoneNumber: profile.phoneNumber || "",
      });
    }
  }, [profile, reset]);

  const phoneValue = watch("phoneNumber");

  // Generate initials from user's actual name
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    return "JD"; // Fallback
  };

  // Format phone number as US format
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Handle different lengths
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue("phoneNumber", formatted, { shouldDirty: true });
  };

  const onSubmit = async (data: ProfileUpdateInput) => {
    try {
      let avatarUrl = (profile as any)?.avatarUrl;

      // Handle avatar upload/removal first if needed
      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append("file", selectedAvatarFile);

        const response = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to upload avatar");
        }
        avatarUrl = result.url;
      } else if (shouldRemoveAvatar) {
        avatarUrl = null;
      }

      // Update profile data with avatar changes
      const updateData = { ...data };
      if (hasAvatarChanges) {
        (updateData as any).avatarUrl = avatarUrl;
      }

      await updateProfileMutation.mutateAsync(updateData);

      // Clear avatar selection state after successful save
      setSelectedAvatarFile(null);
      if (previewAvatarUrl) {
        URL.revokeObjectURL(previewAvatarUrl);
        setPreviewAvatarUrl(null);
      }
      setShouldRemoveAvatar(false);

      toast.success("Profile updated successfully!");
      // Form will be reset automatically via useEffect when profile updates
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setSelectedAvatarFile(file);
    setPreviewAvatarUrl(previewUrl);
    setShouldRemoveAvatar(false);

    // Reset the input
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatarFile(null);
    if (previewAvatarUrl) {
      URL.revokeObjectURL(previewAvatarUrl);
      setPreviewAvatarUrl(null);
    }
    setShouldRemoveAvatar(true);
  };

  const handleClearAvatarSelection = () => {
    setSelectedAvatarFile(null);
    if (previewAvatarUrl) {
      URL.revokeObjectURL(previewAvatarUrl);
      setPreviewAvatarUrl(null);
    }
    setShouldRemoveAvatar(false);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewAvatarUrl) {
        URL.revokeObjectURL(previewAvatarUrl);
      }
    };
  }, [previewAvatarUrl]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-10">
            {/* Avatar section on the left */}
            <div className="flex flex-col items-center space-y-4 justify-center">
              <div className="relative group">
                <Avatar className="size-28 cursor-pointer transition-all duration-200 group-hover:ring-4 group-hover:ring-primary/20">
                  <AvatarImage
                    src={
                      previewAvatarUrl ||
                      (shouldRemoveAvatar
                        ? "/placeholder.svg?height=80&width=80"
                        : (profile as any)?.avatarUrl ||
                          "/placeholder.svg?height=80&width=80")
                    }
                    alt="Profile"
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                {/* Overlay on hover or loading */}
                <div
                  className={`absolute inset-0 bg-black/50 rounded-full transition-opacity duration-200 flex items-center justify-center ${
                    isLoading
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="text-white text-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 mx-auto mb-1 animate-spin" />
                        <span className="text-xs font-medium">Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6 mx-auto mb-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-xs font-medium">Change</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
              </div>

              {/* Avatar action buttons */}
              <div className="flex flex-col items-center space-y-2 min-w-48">
                {(selectedAvatarFile || shouldRemoveAvatar) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAvatarSelection}
                    className="h-8 px-3 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear Changes
                  </Button>
                )}

                {(profile as any)?.avatarUrl &&
                  !shouldRemoveAvatar &&
                  !selectedAvatarFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="h-8 px-3 text-xs text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove Avatar
                    </Button>
                  )}

                {/* Upload hint text */}
                <p className="text-xs text-muted-foreground text-center">
                  {selectedAvatarFile
                    ? "New image selected"
                    : shouldRemoveAvatar
                    ? "Avatar will be removed"
                    : "Click avatar to change photo"}
                </p>
              </div>
            </div>

            {/* Form fields in 2x2 grid on the right */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  className="h-11"
                  id="firstName"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  className="h-11"
                  id="lastName"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  className="h-11 bg-muted"
                  id="email"
                  value={user?.email || ""}
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
                  value={phoneValue || ""}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-end space-x-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 md:flex-0"
              onClick={() => window.location.reload()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 flex-1 md:flex-0"
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
