"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// Mock data for tips & tricks posts
const tipsData = [
  {
    id: 1,
    title: "Medication Injection Tips",
    icon: "💉",
    date: "January 25, 2025",
    description: "Essential guidance for safe and effective GLP-1 injections",
    images: [
      {
        url: "/illustration/tips-injection-1.webp",
        caption: "Abdomen",
        subtitle: "2 inches away from belly button",
      },
      {
        url: "/illustration/tips-injection-4.webp",
        caption: "Rotate Sites",
        subtitle: "Change location each injection",
      },
      {
        url: "/illustration/tips-injection-3.webp",
        caption: "Upper Thigh",
        subtitle: "Front and outer area",
      },
      {
        url: "/illustration/tips-injection-2.webp",
        caption: "Upper Arm",
        subtitle: "Back of upper arm",
      },
    ],
    detailedContent: {
      type: "numbered",
      title: "Injection Technique",
      items: [
        "Clean the injection site with an alcohol swab and let it dry completely",
        "Remove the pen cap and check that the medication is clear and colorless",
        "Pinch the skin gently and insert the needle at a 90-degree angle",
        "Press and hold the injection button for 6 seconds after hearing the click",
      ],
    },
    likes: 0,
    shares: 0,
  },
  {
    id: 2,
    title: "Dietary Advice",
    icon: "🥗",
    date: "January 24, 2025",
    description:
      "Nutrition strategies to support your GLP-1 medication effectiveness.",
    images: [
      {
        url: "/illustration/tips-dietary-1.webp",
        caption:
          "Include lean protein at every meal to help maintain muscle mass and increase satiety",
      },
      {
        url: "/illustration/tips-dietary-2.webp",
        caption: "Increase Fiber",
        subtitle:
          "Choose whole grains, vegetables, and fruits to support digestive health and blood sugar control",
      },
      {
        url: "/illustration/tips-dietary-3.webp",
        caption: "Stay Hydrated",
        subtitle:
          "Drink plenty of water throughout the day to prevent constipation and support overall health",
      },
      {
        url: "/illustration/tips-dietary-4.webp",
        caption: "Smaller Portions",
        subtitle:
          "Listen to your body's hunger cues and eat slowly to recognize fullness signals",
      },
    ],
    detailedContent: {
      type: "bulleted",
      title: "Foods to Limit",
      items: [
        "High-fat foods that may worsen nausea and digestive discomfort",
        "Carbonated beverages that can contribute to bloating and gas",
        "Spicy foods that may increase gastrointestinal side effects",
      ],
    },
    likes: 0,
    shares: 0,
  },
  {
    id: 3,
    title: "Exercise Tips",
    date: "January 6, 2025",
    description: "Safe and effective exercise recommendations for GLP-1 users",
    images: [
      {
        url: "/illustration/tips-exercise-1.webp",
        caption: "Cardiovascular Exercise",
        subtitle:
          "Start with 150 minutes of moderate-intensity cardio per week, such as brisk walking or swimming",
      },
      {
        url: "/illustration/tips-exercise-2.webp",
        caption: "Strength Training",
        subtitle:
          "Include resistance exercises 2-3 times per week to preserve muscle mass during weight loss",
      },
      {
        url: "/illustration/tips-exercise-3.webp",
        caption: "Flexibility Work",
        subtitle:
          "Incorporate yoga or stretching to improve flexibility and reduce stress levels",
      },
      {
        url: "/illustration/tips-exercise-4.webp",
        caption: "Gradual Progression",
        subtitle:
          "Increase intensity and duration slowly to avoid injury and maintain consistency",
      },
    ],
    likes: 0,
    shares: 0,
  },
  {
    id: 4,
    title: "Building Support",
    icon: "🤝",
    date: "January 23, 2025",
    description: "Create a strong foundation for long-term success",
    images: [
      {
        url: "/illustration/tips-support-1.webp",
        caption: "Regular Healthcare Check-ins",
        subtitle:
          "Schedule regular appointments with your healthcare provider to monitor progress and adjust treatment",
      },
      {
        url: "/illustration/tips-support-2.webp",
        caption: "Join Support Groups",
        subtitle:
          "Connect with others on similar journeys through online communities or local support groups",
      },
      {
        url: "/illustration/tips-support-3.webp",
        caption: "Family Involvement",
        subtitle:
          "Educate family members about your journey so they can provide encouragement and understanding",
      },
    ],
    detailedContent: {
      type: "bulleted",
      title: "Building Your Support Network",
      items: [
        "Regular Healthcare Check-ins: Schedule regular appointments with your healthcare provider to monitor progress and adjust treatment",
        "Join Support Groups: Connect with others on similar journeys through online communities or local support groups",
        "Family Involvement: Educate family members about your journey so they can provide encouragement and understanding",
      ],
    },
    likes: 0,
    shares: 0,
  },
];

function TipCard({ tip }: { tip: (typeof tipsData)[0] }) {
  return (
    <Card className="gap-3 md:gap-5">
      <CardHeader className="px-3 md:px-6">
        <div className="flex justify-center items-start gap-3">
          <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            {tip.icon ? (
              <span className="text-2xl">{tip.icon}</span>
            ) : (
              <Heart className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-0.5">{tip.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {tip.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {tip.images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[3/2] overflow-hidden rounded-lg bg-gray-100 snap-start"
            >
              <Image
                src={image.url}
                alt={image.caption}
                fill
                className="object-cover transition-transform duration-200 hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-sm font-medium text-white">
                  {image.caption}
                </p>
                <p className="text-sm text-white/80">{image.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Content Section */}
        {tip.detailedContent && (
          <div
            className={`mb-4 p-4 rounded-lg border ${
              tip.detailedContent.type === "numbered"
                ? "bg-blue-50 border-blue-100"
                : "bg-orange-50 border-orange-100"
            }`}
          >
            <h4
              className={`text-sm font-semibold mb-3 ${
                tip.detailedContent.type === "numbered"
                  ? "text-blue-900"
                  : "text-orange-900"
              }`}
            >
              {tip.detailedContent.title}
            </h4>
            <div className="space-y-2">
              {tip.detailedContent.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  {tip.detailedContent.type === "numbered" ? (
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Read More Button */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() =>
              window.open("https://blog.mydailyhealthjournal.com/", "_blank")
            }
          >
            <ExternalLink className="w-4 h-4" />
            Read More on Our Blog
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TipCardSkeleton() {
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Description */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />

        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg bg-gray-100"
            >
              <Skeleton className="aspect-video" />
              <div className="p-2 bg-white">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Content Skeleton */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="flex-shrink-0 w-6 h-6 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

function TipsContent() {
  return (
    <div className="space-y-6">
      {tipsData.map((tip) => (
        <TipCard key={tip.id} tip={tip} />
      ))}
    </div>
  );
}

function TipsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <TipCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function TipsPage() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8 mx-auto">
        <h1 className="text-background text-2xl md:text-3xl text-center leading-tight font-semibold mb-2">
          Tips & Tricks
        </h1>
        <p className="text-background/80 text-base text-center md:text-lg">
          Discover helpful tips and expert advice to improve your health and
          wellness journey
        </p>
      </div>

      {/* Tips List */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<TipsLoadingSkeleton />}>
            <TipsContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
