"use client";

import Button from "@/components/ui/Button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { classNames } from "@/lib/uitils";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Globe2,
  Mail,
  MapPin,
  MessageSquare,
  MinusIcon,
  Phone,
  PlusIcon,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const subjectOptions = [
  "General Enquiry",
  "Technical Support",
  "Partnership Opportunity",
  "Investment Enquiry",
  "Media & Press",
];

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    primary: "support@capalyse.com",
    secondary: "partnerships@capalyse.com",
    description: "We respond within 24 hours on business days.",
  },
  {
    icon: Phone,
    title: "Call Us",
    primary: "+27 21 xxx xxxx",
    secondary: "+234 1 xxx xxxx",
    description: "Mon - Fri, 9:00 AM - 5:00 PM (SAST / WAT).",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    primary: "Cape Town, South Africa",
    secondary: "Headquarters",
    description: "Book a meeting to visit our offices in person.",
  },
];

const offices = [
  {
    city: "Cape Town",
    country: "South Africa",
    label: "Headquarters",
    address: "12 Innovation Drive, Woodstock, Cape Town 7925",
    phone: "+27 21 xxx xxxx",
    email: "capetown@capalyse.com",
    hours: "Mon - Fri, 9:00 AM - 5:00 PM SAST",
  },
  {
    city: "Nairobi",
    country: "Kenya",
    label: "East Africa Hub",
    address: "4th Floor, Westlands Business Park, Nairobi",
    phone: "+254 20 xxx xxxx",
    email: "nairobi@capalyse.com",
    hours: "Mon - Fri, 9:00 AM - 5:00 PM EAT",
  },
  {
    city: "Lagos",
    country: "Nigeria",
    label: "West Africa Hub",
    address: "15 Idowu Taylor Street, Victoria Island, Lagos",
    phone: "+234 1 xxx xxxx",
    email: "lagos@capalyse.com",
    hours: "Mon - Fri, 9:00 AM - 5:00 PM WAT",
  },
];

const faqs = [
  {
    question: "How quickly can I expect a response?",
    answer:
      "For general enquiries, our team typically responds within 24 business hours. Partnership and investment enquiries are prioritized and usually receive a response within 12 hours.",
  },
  {
    question: "Is there a cost to use Capalyse?",
    answer:
      "Capalyse offers a free tier that includes the Investment Readiness Assessment and basic profile features. Premium features, including advanced analytics, compliance tools, and investor matching, are available through our subscription plans.",
  },
  {
    question: "How do I sign up as an investor?",
    answer:
      "Click 'Get Started' in the navigation and select 'As Investor'. You will be guided through a brief onboarding process where you define your investment preferences, including sector, geography, ticket size, and stage.",
  },
  {
    question: "Can development organizations partner with Capalyse?",
    answer:
      "Absolutely. We work with DFIs, NGOs, government agencies, and foundations to deliver data-driven capacity-building programs. Contact us through the Partnership Opportunity subject to start a conversation.",
  },
  {
    question: "Is my data secure on Capalyse?",
    answer:
      "Yes. We follow industry-standard data protection protocols including end-to-end encryption, regular security audits, and GDPR-compliant data handling. Your information is never shared without your explicit consent.",
  },
  {
    question: "Which countries does Capalyse operate in?",
    answer:
      "We currently support businesses across 15 African countries, with a strong presence in Nigeria, Kenya, South Africa, Ghana, Senegal, and Tanzania. We are actively expanding to additional markets within ECOWAS, SADC, and EAC trade zones.",
  },
  {
    question: "How does the Investment Readiness Assessment work?",
    answer:
      "The assessment is a structured questionnaire covering five dimensions: governance, financial management, compliance, market traction, and scalability. Your responses generate a readiness score with actionable recommendations for improvement.",
  },
  {
    question: "Can I schedule a demo of the platform?",
    answer:
      "Yes. Use the contact form above and select 'General Enquiry' or 'Partnership Opportunity' as the subject. Include your preferred date and time, and our team will arrange a personalized walkthrough.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function ContactUsPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    organization: "",
    subject: "",
    message: "",
  });
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      // Simulate submission
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1500);
    },
    []
  );

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 lg:py-28 relative bg-gradient-to-b from-[#F4FFFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="text-green font-medium text-sm uppercase tracking-wide mb-4">
              Contact Us
            </span>
            <h1 className="text-4xl lg:text-[56px] font-bold leading-tight mb-6">
              Get in <span className="text-green">Touch</span>
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-2xl">
              Have a question, want to explore a partnership, or need support?
              Our team is here to help you make the most of the Capalyse
              platform.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="pb-16 -mt-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((info) => (
              <motion.div
                key={info.title}
                variants={itemVariants}
                className="bg-white border border-primary-green-2 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#F4FFFC] border border-primary-green-2 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-green" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-green font-medium text-sm mb-1">
                  {info.primary}
                </p>
                <p className="text-gray-500 text-sm mb-2">{info.secondary}</p>
                <p className="text-gray-400 text-xs">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Form Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form Side */}
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we will get back to you as soon as
                possible.
              </p>

              {isSubmitted ? (
                <div className="bg-[#F4FFFC] border border-primary-green-2 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Message Sent Successfully
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Thank you for reaching out. Our team will review your
                    message and respond within 24 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormState({
                        name: "",
                        email: "",
                        organization: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="text-green font-medium text-sm hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-1.5 text-sm font-bold text-gray-700"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green placeholder:text-gray-400"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-1.5 text-sm font-bold text-gray-700"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Organization */}
                    <div>
                      <label
                        htmlFor="organization"
                        className="block mb-1.5 text-sm font-bold text-gray-700"
                      >
                        Organization
                      </label>
                      <input
                        id="organization"
                        name="organization"
                        type="text"
                        value={formState.organization}
                        onChange={handleChange}
                        placeholder="Your Company Name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green placeholder:text-gray-400"
                      />
                    </div>

                    {/* Subject Dropdown */}
                    <div className="relative">
                      <label
                        htmlFor="subject"
                        className="block mb-1.5 text-sm font-bold text-gray-700"
                      >
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                        className={classNames(
                          "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green",
                          formState.subject
                            ? "text-gray-900"
                            : "text-gray-400"
                        )}
                      >
                        {formState.subject || "Select a subject"}
                        <ChevronDown
                          className={classNames(
                            "w-4 h-4 text-gray-400 transition-transform duration-200",
                            isSubjectOpen ? "rotate-180" : ""
                          )}
                        />
                      </button>
                      {isSubjectOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                          {subjectOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormState((prev) => ({
                                  ...prev,
                                  subject: option,
                                }));
                                setIsSubjectOpen(false);
                              }}
                              className={classNames(
                                "w-full px-4 py-2.5 text-sm text-left hover:bg-[#F4FFFC] transition-colors duration-150",
                                formState.subject === option
                                  ? "text-green font-medium bg-[#F4FFFC]"
                                  : "text-gray-700"
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block mb-1.5 text-sm font-bold text-gray-700"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green placeholder:text-gray-400 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="medium"
                      state={isSubmitting ? "loading" : "default"}
                      type="submit"
                    >
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </span>
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>

            {/* Info Side */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
              <div className="bg-[#01281D] rounded-3xl p-8 lg:p-10 flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Quick Contacts
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1">
                      General Enquiries
                    </p>
                    <p className="text-white font-medium">
                      support@capalyse.com
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1">
                      Partnerships
                    </p>
                    <p className="text-white font-medium">
                      partnerships@capalyse.com
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1">
                      Investment Enquiries
                    </p>
                    <p className="text-white font-medium">
                      invest@capalyse.com
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1">
                      Press & Media
                    </p>
                    <p className="text-white font-medium">
                      press@capalyse.com
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
                    Business Hours
                  </p>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Clock className="w-4 h-4 text-primary-green-2" />
                    <span>Monday - Friday, 9:00 AM - 5:00 PM SAST</span>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-2xl overflow-hidden relative h-[220px] border border-gray-200">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-green rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-700 text-sm">
                    Cape Town, South Africa
                  </p>
                  <p className="text-gray-500 text-xs">
                    Capalyse Headquarters
                  </p>
                </div>
                {/* Map background pattern */}
                <div className="absolute inset-0 opacity-[0.08]">
                  <svg
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Office Locations */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm text-green font-medium uppercase tracking-wide">
              Our Offices
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Find Us Across <span className="text-green">Africa</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              We have a growing presence across the continent to better serve our
              communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-primary-green-2 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#F4FFFC] rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-green" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-green uppercase tracking-wide">
                      {office.label}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {office.city}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{office.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">{office.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-green">{office.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 text-xs">
                      {office.hours}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-20 bg-[#FAFFFE]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked
            </h2>
            <h2 className="text-4xl font-bold text-green">Questions</h2>
            <p className="text-gray-600 mt-4 sm:max-w-md mx-auto">
              Quick answers to common questions about the Capalyse platform and
              how to get started.
            </p>
          </div>

          <div className="space-y-4 max-w-[48.0625rem] mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                key={index}
                className={classNames(
                  "rounded-lg relative border",
                  openFaq === index
                    ? "bg-[#F5FFFC] border-primary-green-2"
                    : "bg-white border-gray-200"
                )}
              >
                <button
                  className={classNames(
                    "w-full px-6 py-4 text-left flex justify-between items-center rounded-lg transition-colors",
                    openFaq === index ? "text-green" : "hover:bg-gray-50"
                  )}
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                >
                  <span className="font-bold text-sm pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openFaq === index ? (
                      <MinusIcon className="h-5 w-5 text-green" />
                    ) : (
                      <PlusIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="pl-6 pb-4 pr-11">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-green rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative z-10 py-16 md:py-20 px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Ready to Get Started?
                </h2>
                <p className="text-white/90 max-w-lg">
                  Join hundreds of African SMEs and investors already using
                  Capalyse to build, fund, and scale impactful businesses.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/sme/signup"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-green font-bold rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm whitespace-nowrap"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-bold rounded-md hover:bg-white/10 transition-colors duration-200 text-sm whitespace-nowrap"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
