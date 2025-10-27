import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Globe, Smartphone, Monitor, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "./animated-section";

export const metadata: Metadata = {
  title: "My Daily Health Journal Is Not an App",
  description: "My Daily Health Journal is a web-based health dashboard, not an app. Access your data anywhere without downloads or installations.",
};

export default function NotAnAppPage() {
  const benefits = [
    {
      icon: <Globe className="size-5" />,
      title: "Universal Access",
      description: "Works on any device with a web browser — phone, tablet, or computer"
    },
    {
      icon: <Zap className="size-5" />,
      title: "Always Updated",
      description: "No downloads, no updates, always the latest version automatically"
    },
    {
      icon: <Smartphone className="size-5" />,
      title: "Instant Access",
      description: "Just open your browser and start tracking — no installation required"
    },
    {
      icon: <Monitor className="size-5" />,
      title: "Cross-Platform",
      description: "Seamlessly switch between devices without losing your data"
    }
  ];

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is My Daily Health Journal an app?",
                "acceptedAnswer": { 
                  "@type": "Answer", 
                  "text": "No. My Daily Health Journal is a web-based dashboard you can access from any browser — phone, tablet, or computer." 
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to download anything?",
                "acceptedAnswer": { 
                  "@type": "Answer", 
                  "text": "No downloads required. Simply open your dashboard online at mydailyhealthjournal.com and start tracking instantly." 
                }
              }
            ]
          })
        }} 
      />

      <div className="flex min-h-[100dvh] flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b">
          <div className="container flex px-4 h-20 items-center justify-between mx-auto">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <div className="size-8 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                <Image
                  src="/logo-2.png"
                  alt="My Daily Health Journal"
                  width={40}
                  height={40}
                  className="mx-auto mt-0.5"
                />
              </div>
              <span>My Daily Health Journal</span>
            </Link>
            <Button asChild className="rounded-full">
              <Link href="/">
                Back to Home
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <AnimatedSection className="w-full py-20 overflow-hidden">
            <div className="container px-4 md:px-6 relative mx-auto">
              <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

              <div className="text-center max-w-4xl mx-auto mb-16">
                <Badge
                  className="my-4 rounded-full px-4 py-1.5 text-sm font-medium bg-background"
                  variant="outline"
                >
                  Web-based health dashboard
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  No App. Web-Based Dashboard. Always Accessible.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  My Daily Health Journal runs entirely in your browser — no installation, no updates, and no storage limits. Access it anywhere, anytime.
                </p>
                
                <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>No downloads required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Works on any device</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Always up to date</span>
                  </div>
                </div>
              </div>

              {/* Benefits Grid */}
              <AnimatedSection delay={0.2} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                {benefits.map((benefit, index) => (
                  <AnimatedSection key={index} delay={0.1 * index}>
                    <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                          {benefit.icon}
                        </div>
                        <h3 className="font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                ))}
              </AnimatedSection>

              {/* FAQ Section */}
              <AnimatedSection delay={0.4} className="max-w-3xl mx-auto mt-20">
                <div className="text-center mb-12">
                  <Badge
                    className="rounded-full px-4 py-1.5 text-sm font-medium"
                    variant="outline"
                  >
                    Frequently Asked Questions
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-4">
                    Common Questions
                  </h2>
                </div>

                <div className="space-y-6">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 text-lg">Is My Daily Health Journal an app?</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        No. My Daily Health Journal is a web-based dashboard you can access from any browser — phone, tablet, or computer. No app store downloads required.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 text-lg">Do I need to download anything?</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        No downloads required. Simply open your dashboard online at mydailyhealthjournal.com and start tracking instantly. It works just like any website you visit.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedSection>

              {/* CTA Section */}
              <AnimatedSection delay={0.6} className="text-center mt-20">
                <Button asChild size="lg" className="rounded-full h-12 px-8 text-base">
                  <Link href="/">
                    Try It Now - No Download Required
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </main>
      </div>
    </>
  );
}