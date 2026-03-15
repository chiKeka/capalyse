"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Briefcase,
  BarChart3,
  FileText,
  Search,
  Target,
  Building2,
  Users,
  Upload,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  ChevronRight,
  Sparkles,
  Globe,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Stepper from "@/components/ui/stepper";
import {
  useOnboardingProgress,
  getStepsForRole,
  type OnboardingRole,
} from "@/hooks/useOnboarding";
import { useProfileCompletion } from "@/hooks/useOnboarding";
import { getCurrentProfile } from "@/hooks/useUpdateProfile";
import { useAtomValue } from "jotai";
import { authAtom } from "@/lib/atoms/atoms";
import { routes } from "@/lib/routes";

// ============================================================================
// ICON MAP
// ============================================================================

const stepIcons: Record<string, React.ElementType> = {
  rocket: Rocket,
  briefcase: Briefcase,
  chart: BarChart3,
  document: FileText,
  search: Search,
  target: Target,
  program: Building2,
  users: Users,
};

function getStepIcon(iconName: string) {
  return stepIcons[iconName] || Sparkles;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.35,
};

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

function Confetti() {
  const colors = [
    "#047857",
    "#10B981",
    "#34D399",
    "#6EE7B7",
    "#FDB022",
    "#3B82F6",
    "#F472B6",
    "#A78BFA",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => {
        const color = colors[i % colors.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 2 + Math.random() * 2;
        const size = 6 + Math.random() * 8;
        const rotation = Math.random() * 360;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${left}%`,
              top: -20,
              width: size,
              height: size * 0.6,
              backgroundColor: color,
              rotate: rotation,
            }}
            initial={{ y: -20, opacity: 1, rotate: rotation }}
            animate={{
              y: "100vh",
              opacity: [1, 1, 0],
              rotate: rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
            }}
            transition={{
              duration,
              delay,
              ease: "easeIn",
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// STEP CONTENT COMPONENTS
// ============================================================================

// --- SME Steps ---

function SmeWelcome({ onNext }: { onNext: () => void }) {
  const auth: any = useAtomValue(authAtom);
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
      <div className="w-20 h-20 rounded-full bg-primary-green-1 flex items-center justify-center mb-6">
        <Rocket className="w-10 h-10 text-green" />
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-black-500 mb-3">
        Welcome to Capalyse{auth?.name ? `, ${auth.name.split(" ")[0]}` : ""}!
      </h2>
      <p className="text-base text-black-400 mb-6 leading-relaxed">
        We're excited to have you on board. In just a few steps, you'll set up
        your business profile, assess your investment readiness, and start
        connecting with investors who are looking for SMEs like yours.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
        {[
          {
            icon: Briefcase,
            title: "Build Your Profile",
            desc: "Showcase your business to investors",
          },
          {
            icon: BarChart3,
            title: "Get Your Score",
            desc: "Measure your investment readiness",
          },
          {
            icon: TrendingUp,
            title: "Find Investors",
            desc: "Connect with matching investors",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1"
          >
            <item.icon className="w-6 h-6 text-green mb-2" />
            <p className="text-sm font-semibold text-black-500">{item.title}</p>
            <p className="text-xs text-black-300 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
      <Button variant="primary" size="big" onClick={onNext}>
        Let's Get Started <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

function SmeCompleteProfile({
  onNext,
  onSkip,
  accessType,
}: {
  onNext: () => void;
  onSkip?: () => void;
  accessType: string;
}) {
  const router = useRouter();
  const { data: profile } = getCurrentProfile();
  const completionPct = profile
    ? Math.round(
        ((profile?.completedSteps?.length || 0) / (profile?.totalSteps || 1)) *
          100
      )
    : 0;
  const isProfileDone = completionPct >= 80;

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary-green-1 flex items-center justify-center shrink-0">
          <Briefcase className="w-7 h-7 text-green" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-black-500">
            Complete Your Business Profile
          </h2>
          <p className="text-sm text-black-300 mt-1">
            A complete profile helps investors find and trust your business.
          </p>
        </div>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-black-400">
              Profile Completion
            </p>
            <Badge
              className={
                isProfileDone
                  ? "bg-green/10 text-green border-0"
                  : "bg-warning-50 text-warning-600 border-0"
              }
            >
              {completionPct}%
            </Badge>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-green transition-all duration-500 rounded-full"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="space-y-3">
            {[
              { label: "Business name & sector", icon: Building2 },
              { label: "Country of operation", icon: Globe },
              { label: "Business description & stage", icon: FileText },
              { label: "Team members", icon: Users },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm text-black-400"
              >
                <item.icon className="w-4 h-4 text-black-200" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="medium"
          onClick={() => router.push(`/${accessType}/profile`)}
          className="flex-1"
        >
          {isProfileDone ? "View Profile" : "Go to Profile"}{" "}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="secondary" size="medium" onClick={onNext} className="flex-1">
          {isProfileDone ? "Continue" : "I'll do this later"}
        </Button>
      </div>
    </div>
  );
}

function SmeTakeAssessment({
  onNext,
  onSkip,
  accessType,
}: {
  onNext: () => void;
  onSkip?: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary-green-1 flex items-center justify-center shrink-0">
          <BarChart3 className="w-7 h-7 text-green" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-black-500">
            Take the Readiness Assessment
          </h2>
          <p className="text-sm text-black-300 mt-1">
            This assessment measures how ready your business is for investment.
          </p>
        </div>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-black-500 mb-4">
            What you'll be assessed on:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Financial Health", icon: DollarSign, color: "text-green" },
              { label: "Operational Readiness", icon: Building2, color: "text-blue-600" },
              { label: "Market Position", icon: TrendingUp, color: "text-yellow-600" },
              { label: "Compliance Status", icon: CheckCircle2, color: "text-purple-600" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-black-50 bg-white"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm font-medium text-black-400">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-black-300 mt-4">
            The assessment takes approximately 15-20 minutes. You can save your
            progress and come back anytime.
          </p>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="medium"
          onClick={() => router.push(`/${accessType}/readiness`)}
          className="flex-1"
        >
          Start Assessment <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="secondary" size="medium" onClick={onNext} className="flex-1">
          I'll do this later
        </Button>
      </div>
    </div>
  );
}

function SmeUploadDocuments({
  onNext,
  onSkip,
  accessType,
}: {
  onNext: () => void;
  onSkip?: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary-green-1 flex items-center justify-center shrink-0">
          <FileText className="w-7 h-7 text-green" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-black-500">
            Upload Key Documents
          </h2>
          <p className="text-sm text-black-300 mt-1">
            Compliance documents help build trust with investors.
          </p>
        </div>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-black-500 mb-4">
            Recommended documents:
          </h3>
          <div className="space-y-3">
            {[
              "Business Registration Certificate",
              "Financial Statements (last 2 years)",
              "Tax Compliance Certificate",
              "Board Resolution / Company Structure",
            ].map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-black-100 bg-black-25"
              >
                <Upload className="w-4 h-4 text-black-300" />
                <span className="text-sm text-black-400">{doc}</span>
              </div>
            ))}
          </div>
          <Badge className="mt-4 bg-warning-25 text-warning-600 border-warning-100">
            Optional - you can upload these later
          </Badge>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="medium"
          onClick={() => router.push(`/${accessType}/profile?tab=document`)}
          className="flex-1"
        >
          Upload Documents <Upload className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="secondary" size="medium" onClick={onSkip || onNext} className="flex-1">
          Skip for now <SkipForward className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function SmeExploreMatches({
  onComplete,
  accessType,
}: {
  onComplete: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
      <div className="w-20 h-20 rounded-full bg-primary-green-1 flex items-center justify-center mb-6">
        <PartyPopper className="w-10 h-10 text-green" />
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-black-500 mb-3">
        You're All Set!
      </h2>
      <p className="text-base text-black-400 mb-8 leading-relaxed">
        Great job completing your onboarding! Your profile is now active and
        you'll start receiving investor matches based on your readiness score.
      </p>
      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div
          className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/${accessType}/investors`)}
        >
          <Search className="w-6 h-6 text-green mb-2 mx-auto" />
          <p className="text-sm font-semibold text-black-500">
            View Investor Matches
          </p>
        </div>
        <div
          className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/${accessType}`)}
        >
          <BarChart3 className="w-6 h-6 text-green mb-2 mx-auto" />
          <p className="text-sm font-semibold text-black-500">Go to Dashboard</p>
        </div>
      </div>
      <Button variant="primary" size="big" onClick={onComplete}>
        Finish Setup <Sparkles className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

// --- Investor Steps ---

function InvestorWelcome({ onNext }: { onNext: () => void }) {
  const auth: any = useAtomValue(authAtom);
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
      <div className="w-20 h-20 rounded-full bg-primary-green-1 flex items-center justify-center mb-6">
        <Rocket className="w-10 h-10 text-green" />
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-black-500 mb-3">
        Welcome to Capalyse{auth?.name ? `, ${auth.name.split(" ")[0]}` : ""}!
      </h2>
      <p className="text-base text-black-400 mb-6 leading-relaxed">
        Discover investment-ready SMEs across Africa. Set up your investor profile,
        define your criteria, and start connecting with high-potential businesses.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
        {[
          {
            icon: Briefcase,
            title: "Set Preferences",
            desc: "Define your investment focus",
          },
          {
            icon: Target,
            title: "Define Criteria",
            desc: "Specify what you're looking for",
          },
          {
            icon: Search,
            title: "Discover SMEs",
            desc: "Browse investment-ready businesses",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1"
          >
            <item.icon className="w-6 h-6 text-green mb-2" />
            <p className="text-sm font-semibold text-black-500">{item.title}</p>
            <p className="text-xs text-black-300 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
      <Button variant="primary" size="big" onClick={onNext}>
        Let's Get Started <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

function InvestorCompleteProfile({
  onNext,
  accessType,
}: {
  onNext: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary-green-1 flex items-center justify-center shrink-0">
          <Briefcase className="w-7 h-7 text-green" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-black-500">
            Set Your Investment Profile
          </h2>
          <p className="text-sm text-black-300 mt-1">
            Tell us about your investment preferences and organization.
          </p>
        </div>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[
              { label: "Preferred sectors & industries", icon: Building2 },
              { label: "Target regions & geographies", icon: Globe },
              { label: "Ticket size range", icon: DollarSign },
              { label: "Organization details", icon: Briefcase },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm text-black-400"
              >
                <item.icon className="w-4 h-4 text-black-200" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="medium"
          onClick={() => router.push(`/${accessType}/profile`)}
          className="flex-1"
        >
          Complete Profile <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="secondary" size="medium" onClick={onNext} className="flex-1">
          I'll do this later
        </Button>
      </div>
    </div>
  );
}

function InvestorSetCriteria({
  onNext,
  accessType,
}: {
  onNext: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary-green-1 flex items-center justify-center shrink-0">
          <Target className="w-7 h-7 text-green" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-black-500">
            Define Your Investment Criteria
          </h2>
          <p className="text-sm text-black-300 mt-1">
            Help us match you with the right SMEs by refining your investment mandate.
          </p>
        </div>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-black-500 mb-4">
            What criteria can you set?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Business Stage", desc: "Seed, Growth, Expansion" },
              { label: "Revenue Range", desc: "Minimum revenue thresholds" },
              { label: "Readiness Score", desc: "Minimum readiness requirement" },
              { label: "Sector Focus", desc: "Agri, Fintech, Health, etc." },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-black-50 bg-white"
              >
                <p className="text-sm font-medium text-black-400">
                  {item.label}
                </p>
                <p className="text-xs text-black-200 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="medium"
          onClick={() => router.push(`/${accessType}/profile?tab=investment-preference`)}
          className="flex-1"
        >
          Set Criteria <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="secondary" size="medium" onClick={onNext} className="flex-1">
          I'll do this later
        </Button>
      </div>
    </div>
  );
}

function InvestorBrowseSmes({
  onComplete,
  accessType,
}: {
  onComplete: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
      <div className="w-20 h-20 rounded-full bg-primary-green-1 flex items-center justify-center mb-6">
        <PartyPopper className="w-10 h-10 text-green" />
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-black-500 mb-3">
        You're Ready to Invest!
      </h2>
      <p className="text-base text-black-400 mb-8 leading-relaxed">
        Your investor profile is set up. Browse investment-ready SMEs across
        Africa, review their readiness scores, and start building your portfolio.
      </p>
      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div
          className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/${accessType}/sme-directory`)}
        >
          <Search className="w-6 h-6 text-green mb-2 mx-auto" />
          <p className="text-sm font-semibold text-black-500">
            Browse SME Directory
          </p>
        </div>
        <div
          className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/${accessType}`)}
        >
          <BarChart3 className="w-6 h-6 text-green mb-2 mx-auto" />
          <p className="text-sm font-semibold text-black-500">Go to Dashboard</p>
        </div>
      </div>
      <Button variant="primary" size="big" onClick={onComplete}>
        Finish Setup <Sparkles className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

// --- Development Org Steps ---

function DevWelcome({ onNext }: { onNext: () => void }) {
  const auth: any = useAtomValue(authAtom);
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
      <div className="w-20 h-20 rounded-full bg-primary-green-1 flex items-center justify-center mb-6">
        <Rocket className="w-10 h-10 text-green" />
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-black-500 mb-3">
        Welcome to Capalyse{auth?.name ? `, ${auth.name.split(" ")[0]}` : ""}!
      </h2>
      <p className="text-base text-black-400 mb-6 leading-relaxed">
        Set up your organization, create development programs, and start
        empowering SMEs across Africa to become investment-ready.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
        {[
          {
            icon: Building2,
            title: "Set Up Org",
            desc: "Add your organization details",
          },
          {
            icon: FileText,
            title: "Create Programs",
            desc: "Launch development programs",
          },
          {
            icon: Users,
            title: "Invite SMEs",
            desc: "Onboard SMEs to your programs",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1"
          >
            <item.icon className="w-6 h-6 text-green mb-2" />
            <p className="text-sm font-semibold text-black-500">{item.title}</p>
            <p className="text-xs text-black-300 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
      <Button variant="primary" size="big" onClick={onNext}>
        Let's Get Started <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

function DevOrgProfile({
  onNext,
  accessType,
}: {
  onNext: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary-green-1 flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-green" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-black-500">
            Set Up Your Organization
          </h2>
          <p className="text-sm text-black-300 mt-1">
            Add your organization details, mission, and focus areas.
          </p>
        </div>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[
              { label: "Organization name & details", icon: Building2 },
              { label: "Mission & focus areas", icon: Target },
              { label: "Country & headquarters", icon: Globe },
              { label: "Website & contact", icon: FileText },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm text-black-400"
              >
                <item.icon className="w-4 h-4 text-black-200" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="medium"
          onClick={() => router.push(`/${accessType}/profile`)}
          className="flex-1"
        >
          Go to Profile <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="secondary" size="medium" onClick={onNext} className="flex-1">
          I'll do this later
        </Button>
      </div>
    </div>
  );
}

function DevCreateProgram({
  onNext,
  accessType,
}: {
  onNext: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary-green-1 flex items-center justify-center shrink-0">
          <FileText className="w-7 h-7 text-green" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-black-500">
            Create Your First Program
          </h2>
          <p className="text-sm text-black-300 mt-1">
            Set up a development program and start supporting SMEs.
          </p>
        </div>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-black-500 mb-4">
            Programs let you:
          </h3>
          <div className="space-y-3">
            {[
              "Define program objectives and eligibility criteria",
              "Accept applications from qualified SMEs",
              "Track impact and disbursements",
              "Measure and report program outcomes",
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm text-black-400"
              >
                <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="medium"
          onClick={() => router.push(`/${accessType}/programs`)}
          className="flex-1"
        >
          Create a Program <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="secondary" size="medium" onClick={onNext} className="flex-1">
          I'll do this later
        </Button>
      </div>
    </div>
  );
}

function DevInviteSmes({
  onComplete,
  accessType,
}: {
  onComplete: () => void;
  accessType: string;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
      <div className="w-20 h-20 rounded-full bg-primary-green-1 flex items-center justify-center mb-6">
        <PartyPopper className="w-10 h-10 text-green" />
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-black-500 mb-3">
        You're All Set!
      </h2>
      <p className="text-base text-black-400 mb-8 leading-relaxed">
        Your organization is ready. Browse the SME directory and start inviting
        businesses to join your programs.
      </p>
      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div
          className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/${accessType}/sme-directory`)}
        >
          <Users className="w-6 h-6 text-green mb-2 mx-auto" />
          <p className="text-sm font-semibold text-black-500">
            Browse SME Directory
          </p>
        </div>
        <div
          className="p-4 rounded-lg border border-primary-green-2 bg-primary-green-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/${accessType}`)}
        >
          <BarChart3 className="w-6 h-6 text-green mb-2 mx-auto" />
          <p className="text-sm font-semibold text-black-500">Go to Dashboard</p>
        </div>
      </div>
      <Button variant="primary" size="big" onClick={onComplete}>
        Finish Setup <Sparkles className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN ONBOARDING PAGE
// ============================================================================

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const accessType = params.accessType as string;
  const role = accessType as OnboardingRole;

  const {
    steps,
    progress,
    currentStep,
    currentStepConfig,
    completionPercentage,
    isComplete,
    goNext,
    goBack,
    skipStep,
    markComplete,
  } = useOnboardingProgress(role);

  const [direction, setDirection] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleNext = useCallback(() => {
    setDirection(1);
    goNext();
  }, [goNext]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    goBack();
  }, [goBack]);

  const handleSkip = useCallback(() => {
    setDirection(1);
    skipStep(currentStep);
  }, [currentStep, skipStep]);

  const handleComplete = useCallback(() => {
    setShowConfetti(true);
    markComplete();
    setTimeout(() => {
      router.push(
        routes[role as keyof typeof routes]?.root || `/${accessType}`
      );
    }, 3000);
  }, [markComplete, router, role, accessType]);

  // Map step content by role
  const stepperSteps = steps.map((s) => ({
    id: s.id,
    label: s.label,
    optional: s.optional,
  }));

  const renderStepContent = () => {
    const stepKey = currentStepConfig?.key;

    if (role === "sme") {
      switch (stepKey) {
        case "welcome":
          return <SmeWelcome onNext={handleNext} />;
        case "complete-profile":
          return (
            <SmeCompleteProfile
              onNext={handleNext}
              onSkip={handleSkip}
              accessType={accessType}
            />
          );
        case "take-assessment":
          return (
            <SmeTakeAssessment
              onNext={handleNext}
              onSkip={handleSkip}
              accessType={accessType}
            />
          );
        case "upload-documents":
          return (
            <SmeUploadDocuments
              onNext={handleNext}
              onSkip={handleSkip}
              accessType={accessType}
            />
          );
        case "explore-matches":
          return (
            <SmeExploreMatches
              onComplete={handleComplete}
              accessType={accessType}
            />
          );
        default:
          return null;
      }
    }

    if (role === "investor") {
      switch (stepKey) {
        case "welcome":
          return <InvestorWelcome onNext={handleNext} />;
        case "complete-profile":
          return (
            <InvestorCompleteProfile
              onNext={handleNext}
              accessType={accessType}
            />
          );
        case "set-criteria":
          return (
            <InvestorSetCriteria
              onNext={handleNext}
              accessType={accessType}
            />
          );
        case "browse-smes":
          return (
            <InvestorBrowseSmes
              onComplete={handleComplete}
              accessType={accessType}
            />
          );
        default:
          return null;
      }
    }

    if (role === "development") {
      switch (stepKey) {
        case "welcome":
          return <DevWelcome onNext={handleNext} />;
        case "org-profile":
          return (
            <DevOrgProfile
              onNext={handleNext}
              accessType={accessType}
            />
          );
        case "create-program":
          return (
            <DevCreateProgram
              onNext={handleNext}
              accessType={accessType}
            />
          );
        case "invite-smes":
          return (
            <DevInviteSmes
              onComplete={handleComplete}
              accessType={accessType}
            />
          );
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-black-500">
              Getting Started
            </h1>
            <p className="text-sm text-black-300 mt-1">
              Step {currentStep} of {steps.length}
              {currentStepConfig?.optional && " (Optional)"}
            </p>
          </div>
          <Badge className="bg-primary-green-1 text-green border-primary-green-2 text-sm px-3 py-1">
            {completionPercentage}% complete
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-black-50 rounded-full overflow-hidden mt-3 mb-6">
          <motion.div
            className="h-full bg-green rounded-full"
            initial={false}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Stepper */}
        <Stepper steps={stepperSteps} currentStep={currentStep} />
      </div>

      {/* Step Content with Animations */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation (not shown on welcome or final step) */}
      {currentStep > 1 && !isComplete && currentStep < steps.length && (
        <div className="flex items-center justify-between pt-6 border-t border-black-50 mt-6">
          <Button
            variant="tertiary"
            size="medium"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            {currentStepConfig?.optional && (
              <Button
                variant="tertiary"
                size="medium"
                onClick={handleSkip}
              >
                Skip <SkipForward className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
