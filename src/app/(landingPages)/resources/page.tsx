"use client";

import Button from "@/components/ui/Button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { classNames } from "@/lib/uitils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Headphones,
  Layers,
  Mail,
  Search,
  TrendingUp,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const categories = [
  { label: "All", value: "all", icon: Layers },
  { label: "Guides", value: "guides", icon: BookOpen },
  { label: "Reports", value: "reports", icon: FileText },
  { label: "Case Studies", value: "case-studies", icon: TrendingUp },
  { label: "Webinars", value: "webinars", icon: Headphones },
  { label: "Tools", value: "tools", icon: Wrench },
];

const featuredResource = {
  title: "The 2026 African SME Investment Readiness Report",
  description:
    "A comprehensive analysis of investment readiness trends across 15 African markets. Discover which sectors are attracting the most capital, where compliance gaps persist, and what the top-performing SMEs are doing differently to close funding rounds faster.",
  category: "Reports",
  readTime: "25 min read",
  date: "March 2026",
  author: "Capalyse Research Team",
  href: "#",
};

const resources = [
  {
    title: "How to Ace Your Investment Readiness Assessment",
    description:
      "A step-by-step guide for SME founders preparing to take the Capalyse readiness assessment. Learn what investors look for and how to position your business effectively.",
    category: "guides",
    readTime: "8 min read",
    date: "Feb 2026",
    author: "Adaeze Nwosu",
    href: "#",
  },
  {
    title: "AfCFTA Compliance: What Every SME Needs to Know",
    description:
      "The African Continental Free Trade Area is reshaping cross-border business. This guide breaks down the key requirements and how to ensure your business stays compliant.",
    category: "guides",
    readTime: "12 min read",
    date: "Jan 2026",
    author: "Samuel Osei",
    href: "#",
  },
  {
    title: "Case Study: GreenHarvest Agritech's Funding Journey",
    description:
      "How a Nigerian agritech startup used Capalyse to improve their readiness score from 42% to 87% and secured $1.2M in Series A funding within four months.",
    category: "case-studies",
    readTime: "6 min read",
    date: "Dec 2025",
    author: "Lina Muthoni",
    href: "#",
  },
  {
    title: "Q4 2025 African Venture Capital Report",
    description:
      "Quarterly analysis of VC activity across Africa, including deal volume, sector breakdowns, and emerging trends in impact investing and blended finance.",
    category: "reports",
    readTime: "18 min read",
    date: "Jan 2026",
    author: "Capalyse Research Team",
    href: "#",
  },
  {
    title: "Building Investor-Ready Financial Statements",
    description:
      "Most SMEs fail to raise capital because of poor financial documentation. This toolkit walks you through preparing statements that meet investor expectations.",
    category: "tools",
    readTime: "10 min read",
    date: "Nov 2025",
    author: "Tariq Hassan",
    href: "#",
  },
  {
    title: "Webinar: Navigating ECOWAS Trade Regulations",
    description:
      "Recording of our live session with trade compliance experts from across West Africa. Covers tariff frameworks, rules of origin, and practical compliance strategies.",
    category: "webinars",
    readTime: "45 min watch",
    date: "Oct 2025",
    author: "Capalyse Events",
    href: "#",
  },
  {
    title: "The Investor's Guide to African SME Deal Flow",
    description:
      "For investors looking to enter or deepen their position in African markets. Covers sector analysis, risk frameworks, and how to evaluate SME readiness scores.",
    category: "guides",
    readTime: "15 min read",
    date: "Sep 2025",
    author: "David Mwangi",
    href: "#",
  },
  {
    title: "Case Study: Sahel Healthtech's Regional Expansion",
    description:
      "How a Kenyan healthtech company leveraged Capalyse compliance tools to expand into three new SADC markets while maintaining full regulatory compliance.",
    category: "case-studies",
    readTime: "7 min read",
    date: "Aug 2025",
    author: "Lina Muthoni",
    href: "#",
  },
  {
    title: "SME Governance Checklist & Template Pack",
    description:
      "Downloadable templates for board structures, shareholder agreements, and governance policies. Designed specifically for early-stage African businesses.",
    category: "tools",
    readTime: "5 min read",
    date: "Jul 2025",
    author: "Adaeze Nwosu",
    href: "#",
  },
];

const popularTopics = [
  "Investment Readiness",
  "AfCFTA Compliance",
  "Financial Statements",
  "Governance",
  "Due Diligence",
  "Impact Investing",
  "SME Scaling",
  "Trade Compliance",
  "ECOWAS",
  "SADC",
  "Venture Capital",
  "Blended Finance",
  "ESG Reporting",
  "Founder Guides",
];

const categoryColors: Record<string, string> = {
  guides: "bg-blue-50 text-blue-700",
  reports: "bg-purple-50 text-purple-700",
  "case-studies": "bg-amber-50 text-amber-700",
  webinars: "bg-rose-50 text-rose-700",
  tools: "bg-emerald-50 text-emerald-700",
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function ResourcePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesCategory =
        activeCategory === "all" || r.category === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 lg:py-28 relative bg-gradient-to-b from-[#F4FFFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="text-green font-medium text-sm uppercase tracking-wide mb-4">
              Resource Library
            </span>
            <h1 className="text-4xl lg:text-[56px] font-bold leading-tight mb-6">
              Resources &{" "}
              <span className="text-green">Insights</span>
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8 max-w-2xl">
              From compliance guides to investor readiness toolkits, access
              learning tools, frameworks, and insights designed for African SMEs,
              investors, and development organizations.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-12 pr-4 py-3.5 border border-primary-green-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="sticky top-[80px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={classNames(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                  activeCategory === cat.value
                    ? "bg-green text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resource */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-[#01281D] to-[#03503a] rounded-3xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="inline-block bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-4">
                  FEATURED
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  {featuredResource.title}
                </h2>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  {featuredResource.description}
                </p>
                <div className="flex items-center gap-4 text-white/60 text-xs mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredResource.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {featuredResource.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {featuredResource.author}
                  </span>
                </div>
                <Link
                  href={featuredResource.href}
                  className="inline-flex items-center gap-2 bg-white text-green font-bold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm w-max"
                >
                  Read Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Image / Illustration Side */}
              <div className="hidden md:flex items-center justify-center p-8 bg-white/5">
                <div className="w-full max-w-sm">
                  <div className="bg-white/10 rounded-2xl p-8 text-center">
                    <FileText className="w-20 h-20 text-white/40 mx-auto mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-white/20 rounded w-3/4 mx-auto" />
                      <div className="h-3 bg-white/15 rounded w-1/2 mx-auto" />
                      <div className="h-3 bg-white/10 rounded w-2/3 mx-auto" />
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <div className="h-16 bg-white/10 rounded-lg" />
                      <div className="h-16 bg-white/10 rounded-lg" />
                      <div className="h-16 bg-white/10 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Resource Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredResources.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No resources found
              </h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 text-green font-medium text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  <Link
                    href={resource.href}
                    className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-green-2 transition-all duration-300 h-full"
                  >
                    {/* Category colored top bar */}
                    <div className="h-1.5 bg-green" />
                    <div className="p-6">
                      <span
                        className={classNames(
                          "inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 capitalize",
                          categoryColors[resource.category] ||
                            "bg-gray-100 text-gray-700"
                        )}
                      >
                        {resource.category.replace("-", " ")}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {resource.readTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {resource.date}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {resource.author}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={itemVariants}>
            <div className="w-14 h-14 bg-[#F4FFFC] border border-primary-green-2 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-green" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Stay in the Loop
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Get the latest resources, market reports, and ecosystem insights
              delivered directly to your inbox. No spam, just value.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-primary-green-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
              />
              <Button variant="primary" size="medium" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
            <p className="text-gray-400 text-xs mt-3">
              Join 2,000+ subscribers. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Popular Topics */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular Topics
          </h2>
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {popularTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSearchQuery(topic)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-green hover:text-green hover:bg-[#F4FFFC] transition-all duration-200"
              >
                {topic}
              </button>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-green rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative z-10 py-16 md:py-20 px-6 md:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want to Contribute?
            </h2>
            <p className="text-white/90 max-w-xl mx-auto mb-8">
              Are you an expert in African trade, investment, or SME
              development? We welcome guest contributions to our resource
              library.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-green font-bold rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
