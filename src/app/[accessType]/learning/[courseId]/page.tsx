"use client";

import { PlayCircle, BookOpen, FileText, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import {
  CheckCircle2Icon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  SendIcon,
  ChevronRightIcon,
  FileIcon,
  VideoIcon,
  FileTextIcon,
  HelpCircleIcon,
  AwardIcon,
  ArrowRightIcon,
  LinkIcon,
  ThumbsUpIcon,
  MessageCircleIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabKey = "content" | "notes" | "discussions" | "resources";
type LessonType = "video" | "article" | "quiz";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isCurrent?: boolean;
  type: LessonType;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Note {
  id: string;
  content: string;
  timestamp: string;
  lessonTitle: string;
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  content: string;
  timestamp: string;
  replyCount: number;
  likes: number;
  replies: DiscussionReply[];
}

interface DiscussionReply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface CourseResource {
  id: string;
  title: string;
  type: string;
  size: string;
  url: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

// ---------------------------------------------------------------------------
// Mock Data (clearly marked — replace with API data when available)
// ---------------------------------------------------------------------------
const courseData = {
  title: "Trading Across Africa: How AfCFTA is Changing the Game",
  instructor: {
    name: "Dr. Emily Carter",
    avatar: "/avatars/01.png",
    title: "Trade Policy Expert",
  },
  category: "Trade & Commerce",
  rating: 4.7,
  ratingCount: 128,
  enrolledCount: 2450,
  estimatedTime: "4h 30m",
  lastUpdated: "2026-02-15",
  description:
    "This comprehensive course explores how the African Continental Free Trade Area (AfCFTA) is transforming trade across the continent. Learn about the legal landscape, financial readiness, and operational strategies for businesses looking to leverage intra-African trade.",
  modules: [
    {
      id: "mod-1",
      title: "Module 1: Introduction to AfCFTA",
      lessons: [
        { id: "L-001", title: "What is AfCFTA?", duration: "12:34", isCompleted: true, type: "video" as LessonType },
        { id: "L-002", title: "Key Objectives and Benefits", duration: "15:20", isCompleted: true, type: "article" as LessonType },
        {
          id: "L-003",
          title: "The Role of SMEs in AfCFTA",
          duration: "10:05",
          isCompleted: false,
          isCurrent: true,
          type: "video" as LessonType,
        },
        { id: "L-004", title: "Module 1 Quiz", duration: "5:00", isCompleted: false, type: "quiz" as LessonType },
      ],
    },
    {
      id: "mod-2",
      title: "Module 2: Navigating the Legal Landscape",
      lessons: [
        { id: "L-005", title: "Understanding Rules of Origin", duration: "22:10", isCompleted: false, type: "video" as LessonType },
        { id: "L-006", title: "Tariff Concessions and Trade Barriers", duration: "18:45", isCompleted: false, type: "article" as LessonType },
        { id: "L-007", title: "Dispute Resolution Mechanisms", duration: "14:00", isCompleted: false, type: "video" as LessonType },
        { id: "L-008", title: "Module 2 Quiz", duration: "5:00", isCompleted: false, type: "quiz" as LessonType },
      ],
    },
    {
      id: "mod-3",
      title: "Module 3: Financial and Operational Readiness",
      lessons: [
        { id: "L-009", title: "Cross-Border Payments and FinTech", duration: "14:55", isCompleted: false, type: "video" as LessonType },
        { id: "L-010", title: "Logistics and Supply Chain Management", duration: "20:30", isCompleted: false, type: "article" as LessonType },
        { id: "L-011", title: "Currency and Foreign Exchange Risks", duration: "16:20", isCompleted: false, type: "video" as LessonType },
        { id: "L-012", title: "Final Assessment", duration: "10:00", isCompleted: false, type: "quiz" as LessonType },
      ],
    },
  ] as Module[],
};

const MOCK_NOTES: Note[] = [
  {
    id: "N-001",
    content: "AfCFTA aims to boost intra-African trade by 52% by eliminating import duties. Key point for pitch deck.",
    timestamp: "2026-03-10T14:30:00Z",
    lessonTitle: "What is AfCFTA?",
  },
  {
    id: "N-002",
    content: "Rules of origin determine which goods qualify for preferential tariffs. Need to understand this for our export strategy.",
    timestamp: "2026-03-11T09:15:00Z",
    lessonTitle: "Key Objectives and Benefits",
  },
  {
    id: "N-003",
    content: "SMEs represent 80% of African businesses. AfCFTA specifically includes provisions to support SME participation.",
    timestamp: "2026-03-12T16:45:00Z",
    lessonTitle: "The Role of SMEs in AfCFTA",
  },
];

const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: "D-001",
    title: "How does AfCFTA benefit small-scale exporters?",
    author: "James Okafor",
    content: "I am a small-scale exporter of agricultural products from Nigeria. How can I leverage AfCFTA to expand into East African markets?",
    timestamp: "2026-03-08T10:00:00Z",
    replyCount: 5,
    likes: 12,
    replies: [
      {
        id: "DR-001",
        author: "Dr. Emily Carter",
        content: "Great question! AfCFTA reduces tariffs on agricultural products significantly. I would recommend starting with Kenya and Tanzania as entry points due to their import demand for processed foods.",
        timestamp: "2026-03-08T14:00:00Z",
        likes: 8,
      },
      {
        id: "DR-002",
        author: "Amina Diallo",
        content: "I have been exporting to Tanzania and the process has become much smoother since AfCFTA. Happy to share my experience.",
        timestamp: "2026-03-09T09:30:00Z",
        likes: 4,
      },
    ],
  },
  {
    id: "D-002",
    title: "Challenges with rules of origin documentation",
    author: "Grace Wanjiku",
    content: "Has anyone encountered issues with proving origin for manufactured goods that use imported raw materials? What documentation worked for you?",
    timestamp: "2026-03-10T08:00:00Z",
    replyCount: 3,
    likes: 7,
    replies: [
      {
        id: "DR-003",
        author: "Michael Adeyemi",
        content: "Yes, this was a challenge for us. We needed to provide manufacturing process documentation showing that substantial transformation occurred in our country.",
        timestamp: "2026-03-10T11:00:00Z",
        likes: 3,
      },
    ],
  },
  {
    id: "D-003",
    title: "Best payment solutions for cross-border trade",
    author: "David Mensah",
    content: "What payment platforms do you recommend for receiving payments from buyers in other African countries? I am looking for something with low fees and fast settlement.",
    timestamp: "2026-03-12T15:00:00Z",
    replyCount: 8,
    likes: 15,
    replies: [],
  },
];

const MOCK_RESOURCES: CourseResource[] = [
  { id: "R-001", title: "AfCFTA Official Agreement (Full Text)", type: "PDF", size: "4.2 MB", url: "#" },
  { id: "R-002", title: "Rules of Origin Manual", type: "PDF", size: "2.8 MB", url: "#" },
  { id: "R-003", title: "Tariff Reduction Schedule", type: "Excel", size: "1.5 MB", url: "#" },
  { id: "R-004", title: "Country Readiness Assessment Template", type: "Word", size: "890 KB", url: "#" },
  { id: "R-005", title: "Trade Facilitation Checklist", type: "PDF", size: "450 KB", url: "#" },
  { id: "R-006", title: "Cross-Border Payment Guide", type: "PDF", size: "1.2 MB", url: "#" },
];

const MOCK_QUIZ: QuizQuestion[] = [
  {
    id: "Q-001",
    question: "How many African Union member states have signed the AfCFTA agreement?",
    options: ["44", "54", "36", "48"],
    correctAnswer: 1,
  },
  {
    id: "Q-002",
    question: "By how much does AfCFTA aim to boost intra-African trade?",
    options: ["25%", "35%", "52%", "75%"],
    correctAnswer: 2,
  },
  {
    id: "Q-003",
    question: "When was AfCFTA officially launched?",
    options: ["2019", "2020", "2021", "2022"],
    correctAnswer: 2,
  },
];

const RELATED_COURSES = [
  { id: "RC-001", title: "Understanding Trade Finance in Africa", category: "Finance" },
  { id: "RC-002", title: "Export Documentation Masterclass", category: "Operations" },
  { id: "RC-003", title: "African Market Entry Strategies", category: "Marketing" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function LessonTypeIcon({ type }: { type: LessonType }) {
  switch (type) {
    case "video":
      return <VideoIcon className="w-4 h-4" />;
    case "article":
      return <FileTextIcon className="w-4 h-4" />;
    case "quiz":
      return <HelpCircleIcon className="w-4 h-4" />;
    default:
      return <PlayCircle className="w-4 h-4" />;
  }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <StarIcon
            key={s}
            className={cn(
              "w-4 h-4",
              s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-[#18181B]">{rating}</span>
      <span className="text-xs text-gray-500">({count} ratings)</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SingleCoursePage() {
  const { accessType } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>("content");
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [discussions, setDiscussions] = useState<Discussion[]>(MOCK_DISCUSSIONS);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [discussionDialogOpen, setDiscussionDialogOpen] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [newReply, setNewReply] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const totalLessons = courseData.modules.flatMap((mod) => mod.lessons).length;
  const completedLessons = courseData.modules
    .flatMap((mod) => mod.lessons)
    .filter((l) => l.isCompleted).length;
  const progress = Math.round((completedLessons / totalLessons) * 100);

  const currentLesson = courseData.modules
    .flatMap((mod) => mod.lessons)
    .find((l) => l.isCurrent);

  const nextLesson = useMemo(() => {
    const allLessons = courseData.modules.flatMap((mod) => mod.lessons);
    const currentIndex = allLessons.findIndex((l) => l.isCurrent);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return allLessons.find((l) => !l.isCompleted);
  }, []);

  // Estimated time remaining
  const timeRemaining = useMemo(() => {
    const remaining = courseData.modules
      .flatMap((mod) => mod.lessons)
      .filter((l) => !l.isCompleted)
      .reduce((acc, l) => {
        const parts = l.duration.split(":");
        return acc + parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }, 0);
    const hours = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }, []);

  // Note handlers
  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `N-${Date.now()}`,
      content: newNote,
      timestamp: new Date().toISOString(),
      lessonTitle: currentLesson?.title || "General",
    };
    setNotes([note, ...notes]);
    setNewNote("");
    toast.success("Note saved");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    toast.success("Note deleted");
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditNoteContent(note.content);
  };

  const saveEditNote = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, content: editNoteContent } : n)));
    setEditingNote(null);
    setEditNoteContent("");
    toast.success("Note updated");
  };

  // Discussion handlers
  const addDiscussion = () => {
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) return;
    const discussion: Discussion = {
      id: `D-${Date.now()}`,
      title: newDiscussionTitle,
      author: "You",
      content: newDiscussionContent,
      timestamp: new Date().toISOString(),
      replyCount: 0,
      likes: 0,
      replies: [],
    };
    setDiscussions([discussion, ...discussions]);
    setNewDiscussionTitle("");
    setNewDiscussionContent("");
    toast.success("Discussion posted");
  };

  const openDiscussionDetail = (disc: Discussion) => {
    setSelectedDiscussion(disc);
    setDiscussionDialogOpen(true);
  };

  const addReply = () => {
    if (!newReply.trim() || !selectedDiscussion) return;
    const reply: DiscussionReply = {
      id: `DR-${Date.now()}`,
      author: "You",
      content: newReply,
      timestamp: new Date().toISOString(),
      likes: 0,
    };
    const updated = {
      ...selectedDiscussion,
      replies: [...selectedDiscussion.replies, reply],
      replyCount: selectedDiscussion.replyCount + 1,
    };
    setSelectedDiscussion(updated);
    setDiscussions(discussions.map((d) => (d.id === updated.id ? updated : d)));
    setNewReply("");
    toast.success("Reply posted");
  };

  // Quiz handlers
  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const correct = MOCK_QUIZ.filter((q) => quizAnswers[q.id] === q.correctAnswer).length;
    if (correct === MOCK_QUIZ.length) {
      toast.success(`Perfect score! ${correct}/${MOCK_QUIZ.length} correct`);
    } else {
      toast.info(`${correct}/${MOCK_QUIZ.length} correct. Review and try again!`);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  // Tab config
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "content", label: "Content", icon: <BookOpen className="w-4 h-4" /> },
    { key: "notes", label: "Notes", icon: <FileText className="w-4 h-4" /> },
    { key: "discussions", label: "Discussions", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "resources", label: "Resources", icon: <FileIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/50">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${accessType}/learning`}>Resources</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{courseData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Course Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4FFFC] text-[#008060]">
                {courseData.category}
              </span>
              <span className="text-xs text-gray-400">
                Updated {format(new Date(courseData.lastUpdated), "MMM yyyy")}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#18181B] mb-2">
              {courseData.title}
            </h1>
            <p className="text-sm text-gray-600 mb-3">{courseData.description}</p>

            {/* Instructor */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#F4FFFC] flex items-center justify-center">
                <span className="text-xs font-bold text-[#008060]">
                  {courseData.instructor.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#18181B]">{courseData.instructor.name}</p>
                <p className="text-xs text-gray-500">{courseData.instructor.title}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4">
              <StarRating rating={courseData.rating} count={courseData.ratingCount} />
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <UsersIcon className="w-4 h-4" />
                <span>{courseData.enrolledCount.toLocaleString()} enrolled</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>{courseData.estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full md:w-64 shrink-0">
            <Card className="p-4 bg-[#F4FFFC] border-[#ABD2C7]">
              <div className="text-center mb-3">
                <p className="text-3xl font-bold text-[#008060]">{progress}%</p>
                <p className="text-xs text-gray-500">Course Progress</p>
              </div>
              <div className="w-full bg-white rounded-full h-2.5 mb-3">
                <div
                  className="bg-[#008060] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-medium">
                    {completedLessons}/{totalLessons} lessons
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Remaining</span>
                  <span className="font-medium">{timeRemaining}</span>
                </div>
                <div className="flex justify-between">
                  <span>Certificates</span>
                  <span className="font-medium">{progress === 100 ? "1 earned" : "0 earned"}</span>
                </div>
              </div>
              <Separator className="my-3" />
              {nextLesson && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Next Lesson</p>
                  <p className="text-sm font-medium text-[#18181B] mb-2">{nextLesson.title}</p>
                  <Button variant="primary" size="small" className="w-full">
                    Continue Learning
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
              {progress === 100 && (
                <Button variant="primary" size="small" className="w-full">
                  <AwardIcon className="w-4 h-4 mr-1" />
                  Get Certificate
                </Button>
              )}
            </Card>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-[#008060] text-[#008060]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================= CONTENT TAB ========================= */}
      {activeTab === "content" && (
        <div className="grid gap-6 md:grid-cols-7">
          {/* Main Content Area */}
          <div className="md:col-span-4 space-y-6">
            {/* Video Player Placeholder */}
            <Card>
              <CardContent className="p-0">
                <AspectRatio ratio={16 / 9}>
                  <div className="flex flex-col items-center justify-center w-full h-full bg-slate-800 text-white">
                    <PlayCircle className="h-16 w-16 mb-2" />
                    <p className="text-sm text-gray-300">
                      {currentLesson?.title || "Select a lesson to begin"}
                    </p>
                  </div>
                </AspectRatio>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="secondary" size="small">
                Previous Lesson
              </Button>
              <Button size="small" iconPosition="right">
                Next Lesson
              </Button>
            </div>

            {/* Lesson Content */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#18181B]">
                {currentLesson?.title || "Introduction"}
              </h2>
              <p className="text-gray-600">
                Africa is home to over 1.4 billion people and a combined GDP exceeding $3.4 trillion,
                yet intra-African trade has historically remained below 20%. Fragmented markets, high
                tariffs, and inconsistent regulations have long stood in the way of seamless economic
                integration. But the African Continental Free Trade Area (AfCFTA) is set to change
                that narrative.
              </p>
              <p className="text-gray-600">
                Launched in 2021, AfCFTA is the largest free trade area in the world by number of
                countries — 54 African Union members have signed on. It aims to create a single market
                for goods and services, foster economic integration, and enhance competitiveness
                across the continent.
              </p>
              <p className="text-gray-600">
                In this article, we explore how AfCFTA is transforming the trading landscape across
                Africa and what it means for entrepreneurs, small businesses, and startups.
              </p>
            </div>

            {/* Quiz Section */}
            {showQuiz && (
              <Card className="p-6">
                <h3 className="font-semibold text-base text-[#18181B] mb-4">
                  Module Quiz
                </h3>
                <div className="space-y-6">
                  {MOCK_QUIZ.map((q, qIdx) => (
                    <div key={q.id}>
                      <p className="text-sm font-medium text-[#18181B] mb-3">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, oIdx) => {
                          const isSelected = quizAnswers[q.id] === oIdx;
                          const isCorrect = quizSubmitted && oIdx === q.correctAnswer;
                          const isWrong = quizSubmitted && isSelected && oIdx !== q.correctAnswer;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                if (!quizSubmitted) {
                                  setQuizAnswers({ ...quizAnswers, [q.id]: oIdx });
                                }
                              }}
                              className={cn(
                                "w-full text-left p-3 rounded-lg border text-sm transition-all",
                                isCorrect
                                  ? "border-green-500 bg-green-50 text-green-800"
                                  : isWrong
                                    ? "border-red-500 bg-red-50 text-red-800"
                                    : isSelected
                                      ? "border-[#008060] bg-[#F4FFFC] text-[#008060]"
                                      : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                    isCorrect
                                      ? "border-green-500 bg-green-500"
                                      : isWrong
                                        ? "border-red-500 bg-red-500"
                                        : isSelected
                                          ? "border-[#008060] bg-[#008060]"
                                          : "border-gray-300"
                                  )}
                                >
                                  {(isSelected || isCorrect) && (
                                    <CheckCircle2Icon className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                {option}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  {!quizSubmitted ? (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < MOCK_QUIZ.length}
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button variant="secondary" size="small" onClick={resetQuiz}>
                      Retry Quiz
                    </Button>
                  )}
                </div>
                {quizSubmitted && (
                  <div className="mt-4 p-3 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium">
                      Result: {MOCK_QUIZ.filter((q) => quizAnswers[q.id] === q.correctAnswer).length}/{MOCK_QUIZ.length} correct
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar — Course Content Accordion */}
          <div className="space-y-4 md:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Course Content</CardTitle>
                <p className="text-xs text-gray-500">
                  {completedLessons}/{totalLessons} lessons completed
                </p>
              </CardHeader>
              <CardContent className="px-2.5 pb-4">
                <Accordion type="single" collapsible defaultValue="mod-1" className="space-y-3">
                  {courseData.modules.map((module) => {
                    const modCompleted = module.lessons.filter((l) => l.isCompleted).length;
                    const modTotal = module.lessons.length;
                    return (
                      <AccordionItem
                        value={module.id}
                        key={module.id}
                        className="border border-gray-100 shadow-sm rounded-lg"
                      >
                        <AccordionTrigger className="px-4 hover:no-underline">
                          <div className="flex items-center gap-2 text-left">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{module.title}</p>
                              <p className="text-xs text-gray-400">
                                {modCompleted}/{modTotal} completed
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 px-2">
                            {module.lessons.map((lesson) => (
                              <li
                                key={lesson.id}
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors",
                                  lesson.isCurrent
                                    ? "bg-[#F4FFFC] border border-[#ABD2C7]"
                                    : "hover:bg-gray-50"
                                )}
                                onClick={() => {
                                  if (lesson.type === "quiz") {
                                    setShowQuiz(true);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  {lesson.isCompleted ? (
                                    <CheckCircle2Icon className="w-4 h-4 text-[#008060]" />
                                  ) : (
                                    <div
                                      className={cn(
                                        "w-4 h-4 flex items-center justify-center",
                                        lesson.isCurrent ? "text-[#008060]" : "text-gray-400"
                                      )}
                                    >
                                      <LessonTypeIcon type={lesson.type} />
                                    </div>
                                  )}
                                  <span
                                    className={cn(
                                      "text-sm",
                                      lesson.isCurrent
                                        ? "font-medium text-[#008060]"
                                        : lesson.isCompleted
                                          ? "text-gray-500"
                                          : "text-[#18181B]"
                                    )}
                                  >
                                    {lesson.title}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================= NOTES TAB ========================= */}
      {activeTab === "notes" && (
        <div className="space-y-4 max-w-3xl">
          {/* Add Note */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-[#18181B] mb-2">Add a Note</h3>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your notes here..."
              className="min-h-[80px] mb-3"
            />
            <Button variant="primary" size="small" onClick={addNote} disabled={!newNote.trim()}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Save Note
            </Button>
          </Card>

          {/* Notes List */}
          <div className="space-y-3">
            {notes.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notes yet. Start taking notes as you learn!</p>
              </Card>
            ) : (
              notes.map((note) => (
                <Card key={note.id} className="p-4">
                  {editingNote === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" size="small" onClick={() => saveEditNote(note.id)}>
                          Save
                        </Button>
                        <Button variant="ghost" size="small" onClick={() => setEditingNote(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F4FFFC] text-[#008060]">
                            {note.lessonTitle}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(note.timestamp), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditNote(note)}
                            className="p-1 text-gray-400 hover:text-[#008060]"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{note.content}</p>
                    </>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================= DISCUSSIONS TAB ========================= */}
      {activeTab === "discussions" && (
        <div className="space-y-4 max-w-3xl">
          {/* New Discussion */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-[#18181B] mb-2">Start a Discussion</h3>
            <Input
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
              placeholder="Discussion title..."
              className="mb-2"
            />
            <Textarea
              value={newDiscussionContent}
              onChange={(e) => setNewDiscussionContent(e.target.value)}
              placeholder="Share your thoughts or ask a question..."
              className="min-h-[60px] mb-3"
            />
            <Button
              variant="primary"
              size="small"
              onClick={addDiscussion}
              disabled={!newDiscussionTitle.trim() || !newDiscussionContent.trim()}
            >
              Post Discussion
            </Button>
          </Card>

          {/* Discussion List */}
          <div className="space-y-3">
            {discussions.map((disc) => (
              <Card
                key={disc.id}
                className="p-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => openDiscussionDetail(disc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-[#18181B] mb-1">{disc.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{disc.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{disc.author}</span>
                      <span>{format(new Date(disc.timestamp), "MMM dd, yyyy")}</span>
                      <div className="flex items-center gap-1">
                        <MessageCircleIcon className="w-3 h-3" />
                        <span>{disc.replyCount} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUpIcon className="w-3 h-3" />
                        <span>{disc.likes}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================= RESOURCES TAB ========================= */}
      {activeTab === "resources" && (
        <div className="space-y-6 max-w-3xl">
          {/* Downloadable Materials */}
          <Card className="p-6">
            <h3 className="font-semibold text-base text-[#18181B] mb-4">Course Materials</h3>
            <div className="space-y-2">
              {MOCK_RESOURCES.map((res) => {
                const iconMap: Record<string, string> = {
                  PDF: "text-red-500",
                  Excel: "text-green-600",
                  Word: "text-blue-600",
                };
                return (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                        <FileIcon className={cn("w-5 h-5", iconMap[res.type] || "text-gray-500")} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#18181B]">{res.title}</p>
                        <p className="text-xs text-gray-400">
                          {res.type} - {res.size}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-[#008060] transition-colors">
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Related Courses */}
          <Card className="p-6">
            <h3 className="font-semibold text-base text-[#18181B] mb-4">Related Courses</h3>
            <div className="space-y-3">
              {RELATED_COURSES.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F4FFFC] flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#008060]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#18181B]">{course.title}</p>
                      <span className="text-xs text-gray-400">{course.category}</span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================= DISCUSSION THREAD DIALOG ========================= */}
      <Dialog open={discussionDialogOpen} onOpenChange={setDiscussionDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDiscussion?.title}</DialogTitle>
            <DialogDescription>
              Posted by {selectedDiscussion?.author} on{" "}
              {selectedDiscussion && format(new Date(selectedDiscussion.timestamp), "MMM dd, yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedDiscussion && (
            <div className="space-y-4 mt-4">
              {/* Original Post */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#F4FFFC] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#008060]">
                      {selectedDiscussion.author[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{selectedDiscussion.author}</span>
                </div>
                <p className="text-sm text-gray-700">{selectedDiscussion.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#008060]">
                    <ThumbsUpIcon className="w-3.5 h-3.5" />
                    {selectedDiscussion.likes}
                  </button>
                </div>
              </div>

              {/* Replies */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-3">
                  Replies ({selectedDiscussion.replies.length})
                </h4>
                <div className="space-y-3">
                  {selectedDiscussion.replies.map((reply) => (
                    <div key={reply.id} className="p-3 border border-gray-100 rounded-lg ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {reply.author[0]}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{reply.author}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(reply.timestamp), "MMM dd, HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 ml-8">{reply.content}</p>
                      <div className="ml-8 mt-2">
                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#008060]">
                          <ThumbsUpIcon className="w-3 h-3" />
                          {reply.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Reply Area */}
              <div className="space-y-3">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px]"
                />
                <Button
                  variant="primary"
                  size="small"
                  onClick={addReply}
                  disabled={!newReply.trim()}
                >
                  <SendIcon className="w-4 h-4 mr-1" />
                  Post Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
