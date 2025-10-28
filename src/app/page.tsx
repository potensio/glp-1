"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
  Star,
  Syringe,
  Flame,
  BarChart,
  Calendar,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { useTheme } from "next-themes";
import { useAuthNavigation } from "@/hooks/use-auth-navigation";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { navigateBasedOnAuth, navigateToRegister, scrollToSection } =
    useAuthNavigation();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const features = [
    {
      title: "Journal",
      description:
        "Track your daily progress and insights with our comprehensive journaling system.",
      icon: <NotebookPen className="size-5" />,
    },
    {
      title: "Medication Tracking",
      description:
        "Log your GLP-1 injections, dosages, and track medication adherence.",
      icon: <Syringe className="size-5" />,
    },
    {
      title: "Health Analytics",
      description:
        "Visualize your progress with weight, blood sugar, and health trends.",
      icon: <BarChart className="size-5" />,
    },
    {
      title: "Food & Calorie Logging",
      description:
        "Track your meals, estimate calories, and monitor nutritional intake.",
      icon: <Flame className="size-5" />,
    },

    {
      title: "Calendar Integration",
      description:
        "Sync with Google Calendar to schedule medication reminders and appointments.",
      icon: <Calendar className="size-5" />,
    },
    {
      title: "Progress Insights",
      description:
        "Get personalized insights and tips to optimize your health journey.",
      icon: <Star className="size-5" />,
    },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
          isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container flex px-4 h-20 items-center justify-between mx-auto">
          <div className="flex items-center gap-2 font-bold">
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
          </div>
          <nav className="hidden md:flex gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer bg-transparent border-none"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer bg-transparent border-none"
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer bg-transparent border-none"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer bg-transparent border-none"
            >
              FAQ
            </button>
            <Link
              href="https://blog.mydailyhealthjournal.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Blog
            </Link>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            <Button
              className="rounded-full cursor-pointer"
              onClick={navigateToRegister}
            >
              Get Started
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
          >
            <div className="container p-4 flex flex-col gap-4">
              <button
                onClick={() => {
                  scrollToSection("features");
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-sm font-medium text-left cursor-pointer bg-transparent border-none"
              >
                Features
              </button>
              <button
                onClick={() => {
                  scrollToSection("testimonials");
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-sm font-medium text-left cursor-pointer bg-transparent border-none"
              >
                Testimonials
              </button>
              <button
                onClick={() => {
                  scrollToSection("pricing");
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-sm font-medium text-left cursor-pointer bg-transparent border-none"
              >
                Pricing
              </button>
              <button
                onClick={() => {
                  scrollToSection("faq");
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-sm font-medium text-left cursor-pointer bg-transparent border-none"
              >
                FAQ
              </button>
              <Link
                href="https://ap.mydailyhealthjournal.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-medium text-left"
              >
                Blog
              </Link>
              <div className="flex flex-col gap-2 pt-2 mb-4">
                <Button className="rounded-full" onClick={navigateToRegister}>
                  Get Started
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 overflow-hidden">
          <div className="container px-4 md:px-6 relative mx-auto">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Badge
                className="my-4 rounded-full px-4 py-1.5 text-sm font-medium bg-background"
                variant="outline"
              >
                Web-based health dashboard
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                My Daily Health Journal: A Web-Based Dashboard That Actually
                Works.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Track Your Health Anywhere. No App. No Frustration. Just
                Results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="rounded-full h-12 px-8 text-base cursor-pointer"
                  onClick={() => navigateBasedOnAuth()}
                >
                  Start Tracking
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-8 text-base cursor-pointer"
                  onClick={() => scrollToSection("features")}
                >
                  Learn More
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Privacy focused</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Easy to use</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-background to-muted/20">
                <Image
                  src="/illustration/hero-image.png"
                  width={1280}
                  height={720}
                  alt="SaaSify dashboard"
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="outline"
              >
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything You Need to Succeed
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Our comprehensive platform provides all the tools you need to
                streamline your workflow, boost productivity, and achieve your
                goals.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="outline"
              >
                How It Works
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Simple Steps to Better Health
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Start tracking your health journey in minutes and take control
                of your wellness goals.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
              {[
                {
                  step: "01",
                  title: "Set Up Profile",
                  description:
                    "Create your health profile with your goals, medications, and health conditions.",
                },
                {
                  step: "02",
                  title: "Track Daily Health",
                  description:
                    "Log medications, weight, blood sugar, meals, and other health metrics easily.",
                },
                {
                  step: "03",
                  title: "Monitor Progress",
                  description:
                    "View insights, trends, and progress towards your health goals with detailed analytics.",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="outline"
              >
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Trusted by Health-Conscious Users
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                See how My Daily Health Journal is helping people achieve their
                wellness goals.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote:
                    "This app has been a game-changer for managing my GLP-1 journey. I've lost 45 pounds and my A1C is finally in a healthy range!",
                  author: "Sarah Johnson",
                  role: "GLP-1 User, 8 months",
                  rating: 5,
                },
                {
                  quote:
                    "The medication tracking and reminders have helped me stay consistent with my injections. My doctor is impressed with my progress data.",
                  author: "Michael Chen",
                  role: "Type 2 Diabetic",
                  rating: 5,
                },
                {
                  quote:
                    "I love how easy it is to log my meals and see how they affect my blood sugar. The insights have helped me make better food choices.",
                  author: "Emily Rodriguez",
                  role: "Health Enthusiast",
                  rating: 5,
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex mb-4">
                        {Array(testimonial.rating)
                          .fill(0)
                          .map((_, j) => (
                            <Star
                              key={j}
                              className="size-4 text-yellow-500 fill-yellow-500"
                            />
                          ))}
                      </div>
                      <p className="text-lg mb-6 flex-grow">
                        {testimonial.quote}
                      </p>
                      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="w-full py-20 bg-muted/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>
          <div className="container px-4 md:px-6 mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="outline"
              >
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Choose Your Health Plan
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Start your health journey with our flexible plans. Free tier
                available with premium features for advanced tracking.
              </p>
            </motion.div>

            <div className="mx-auto max-w-4xl">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                {[
                  {
                    name: "Free",
                    price: "$0",
                    description: "Basic health tracking features",
                    features: [
                      "Unlimited health entries",
                      "Basic charts & tracking",
                      "Weight & medication tracking",
                      "Community support",
                    ],
                    cta: "Get Started Free",
                  },
                  {
                    name: "Premium",
                    price: "$9",
                    description:
                      "Advanced health tracking with unlimited features",
                    features: [
                      "Unlimited health entries",
                      "Advanced charts & analytics",
                      "Data export & custom reports",
                      "Premium support",
                      "Calendar integration",
                      "Advanced health insights",
                    ],
                    cta: "Start Premium",
                    popular: true,
                  },
                ].map((plan, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card
                      className={`relative overflow-hidden h-full ${
                        plan.popular
                          ? "border-primary shadow-lg"
                          : "border-border/40 shadow-md"
                      } bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                          Most Popular
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline mt-4">
                          <span className="text-4xl font-bold">
                            {plan.price}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            /month
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {plan.description}
                        </p>
                        <ul className="space-y-3 my-6 flex-grow">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center">
                              <Check className="mr-2 size-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full mt-auto rounded-full cursor-pointer ${
                            plan.popular
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() =>
                            plan.popular
                              ? navigateToRegister()
                              : navigateBasedOnAuth()
                          }
                        >
                          {plan.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="outline"
              >
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Find answers to common questions about health tracking and our
                app.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "Can I track multiple medications?",
                    answer:
                      "Absolutely! You can track multiple medications including GLP-1 injections, insulin, blood pressure medications, and any other prescriptions. Set custom reminders and dosage schedules for each medication.",
                  },
                  {
                    question: "Does the app work with my doctor?",
                    answer:
                      "Yes, you can easily export your health reports and trends to share with your healthcare provider. Many doctors appreciate having detailed tracking data to better understand your progress and adjust treatments.",
                  },
                  {
                    question: "What health metrics can I track?",
                    answer:
                      "You can track weight, blood sugar levels, blood pressure, medication adherence, food intake, exercise, mood, and custom metrics.",
                  },
                  {
                    question: "Is there a free version available?",
                    answer:
                      "Yes! Our free plan includes basic health tracking, weight and medication logging, and 7 days of data history. Premium plans offer unlimited history, advanced analytics, and additional features like calendar integration.",
                  },
                  {
                    question: "Can I sync with my calendar and other apps?",
                    answer:
                      "Yes, we integrate with Google Calendar for medication reminders and appointments. We also support data export to popular health apps and can sync with fitness trackers and glucose monitors.",
                  },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <AccordionItem
                      value={`item-${i}`}
                      className="border-b border-border/40 py-2"
                    >
                      <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Ready to Take Control of Your Health?
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Join thousands of users who are successfully managing their
                GLP-1 journey, tracking their health metrics, and achieving
                their wellness goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-8 text-base bg-transparent border-white text-white hover:bg-white/10 cursor-pointer"
                  onClick={() => navigateBasedOnAuth()}
                >
                  Start Your Health Journey
                </Button>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-4">
                No credit card required. Start tracking for free!
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16 mx-auto">
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-4">
            {/* Brand Section - Expanded */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 font-bold">
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
              </div>
              <div className="text-sm text-muted-foreground max-w-md">
                Your comprehensive health tracking companion. Monitor GLP-1
                medications, track vital health metrics, and achieve your
                wellness goals with ease. My Daily Health Journal is a{" "}
                <Link
                  href="/not-an-app"
                  target="_blank"
                  className="text-foreground hover:underline"
                >
                  web-based health dashboard
                </Link>{" "}
                — no app required.
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign up
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ap.mydailyhealthjournal.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold">Social</h4>
              <div className="flex gap-4">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} GLP-1 Tracker. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
