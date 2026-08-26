// src/pages/common_pages/AboutUs.jsx
import React from "react";
import { motion } from "framer-motion";

export const aboutUsHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const INTRO_SECTIONS = [
  {
    id: "who-we-are",
    eyebrow: "Who we are",
    title: "Engineering-first partners for modern digital products",
    text: `ECODERS is an engineering-first team focused on building reliable, modern products. We work with startups and growing businesses to deliver AI solutions, web/mobile platforms, automation systems, and testing tools—built with clean design and scalable architecture.`,
    points: [
      "AI-driven digital products",
      "Modern web and mobile platforms",
      "Automation-first engineering systems",
      "Scalable and maintainable architecture",
    ],
    images: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "what-we-do",
    eyebrow: "What we do",
    title: "Building systems that stay strong as products grow",
    text: `We help teams ship faster through strong fundamentals: thoughtful UI/UX, robust backend systems, performance-focused engineering, and automation-driven workflows. Our goal is to build systems that stay maintainable as your product and users grow.`,
    points: [
      "Thoughtful UI and UX direction",
      "Robust backend system design",
      "Performance-focused engineering",
      "Automation-driven product workflows",
    ],
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "how-we-work",
    eyebrow: "How we work",
    title: "Clear process, fast iteration, and long-term thinking",
    text: `We follow a practical, transparent process—discovery, rapid prototyping, iterative delivery, and measurable improvements. You get clear communication, realistic timelines, and code that’s structured for long-term growth.`,
    points: [
      "Discovery and product understanding",
      "Rapid prototyping and feedback loops",
      "Iterative delivery with clarity",
      "Long-term maintainable code structure",
    ],
    images: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "why-ecoders",
    eyebrow: "Why ECODERS",
    title: "Consistency, quality, and delivery without compromise",
    text: `Consistency, quality, and speed—without sacrificing maintainability. We care about shipping features that users love, and we back it with solid engineering practices, documentation, and a clean design system.`,
    points: [
      "Consistent quality across delivery",
      "User-focused product thinking",
      "Strong documentation and systems",
      "Clean and scalable design approach",
    ],
    images: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const VALUES = [
  {
    title: "Quality & Consistency",
    text: "Clean UI, stable systems, and predictable delivery across every milestone.",
  },
  {
    title: "Ownership Mindset",
    text: "We build like it’s our product—focusing on maintainability and real-world outcomes.",
  },
  {
    title: "Transparent Communication",
    text: "Clear updates, clear timelines, and clarity around what’s next—always.",
  },
  {
    title: "Performance & Security",
    text: "Efficient, scalable code with security-first thinking and best practices.",
  },
];

const slideLeft = {
  hidden: { opacity: 0, x: -90 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 90 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

function SectionImages({ images, title }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="col-span-2 overflow-hidden rounded-3xl shadow-lg ring-1 ring-gray-900/10">
        <img
          src={images[0]}
          alt={`${title} main`}
          loading="lazy"
          className="h-52 w-full object-cover transition duration-700 hover:scale-105 sm:h-72"
        />
      </div>

      <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-900/10">
        <img
          src={images[1]}
          alt={`${title} visual one`}
          loading="lazy"
          className="h-36 w-full object-cover transition duration-700 hover:scale-105 sm:h-44"
        />
      </div>

      <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-900/10">
        <img
          src={images[2]}
          alt={`${title} visual two`}
          loading="lazy"
          className="h-36 w-full object-cover transition duration-700 hover:scale-105 sm:h-44"
        />
      </div>
    </div>
  );
}

function AboutSection({ item, reverse = false }) {
  return (
    <section id={item.id} className="py-10 sm:py-12 lg:py-16">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <motion.div
          variants={reverse ? slideRight : slideLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={reverse ? "lg:order-2" : ""}
        >
          <span className="inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-700">
            {item.eyebrow}
          </span>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {item.title}
          </h2>

          <p className="mt-5 text-sm leading-8 text-gray-600 sm:text-base">
            {item.text}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {item.points.map((point) => (
              <div
                key={point}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  <p className="text-sm leading-7 text-gray-700">{point}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={reverse ? slideLeft : slideRight}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={reverse ? "lg:order-1" : ""}
        >
          <SectionImages images={item.images} title={item.title} />
        </motion.div>
      </div>
    </section>
  );
}

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white [font-family:ui-sans-serif,system-ui,-apple-system,Segoe_UI,Roboto,Inter,Helvetica,Arial,'Apple_Color_Emoji','Segoe_UI_Emoji']">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="pt-10 sm:pt-12 lg:pt-16"
        >
          <div className="rounded-[2rem] border border-indigo-100/70 bg-white/80 px-5 py-8 shadow-sm backdrop-blur-sm sm:px-8 sm:py-10 lg:px-12 lg:py-14">
            <span className="text-indigo-700 font-light">About us &rarr;</span>

            <div className="mt-4 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h1 className="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  Building with clarity, quality, and speed
                </h1>

                <p className="mt-5 max-w-3xl text-sm leading-8 text-gray-600 sm:text-base">
                  ECODERS helps teams build AI-driven products, modern web
                  platforms, automation-first systems, and robust engineering
                  solutions crafted to scale with confidence.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#who-we-are"
                    className="inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                  >
                    Our Story
                  </a>
                  <a
                    href="#values"
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    Our Values
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
                  <div className="text-2xl font-semibold text-indigo-700 sm:text-3xl">
                    AI
                  </div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">
                    Intelligent product development
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
                  <div className="text-2xl font-semibold text-indigo-700 sm:text-3xl">
                    Web
                  </div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">
                    Modern platforms and systems
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
                  <div className="text-2xl font-semibold text-indigo-700 sm:text-3xl">
                    QA
                  </div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">
                    Automation-first delivery quality
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
                  <div className="text-2xl font-semibold text-indigo-700 sm:text-3xl">
                    Scale
                  </div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">
                    Built for long-term product growth
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {INTRO_SECTIONS.map((item, index) => (
          <AboutSection key={item.id} item={item} reverse={index % 2 !== 0} />
        ))}

        <motion.section
          id="values"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          className="pb-14 pt-4 sm:pb-16 lg:pb-20"
        >
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-900/10 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
                  Our values
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  Principles that guide how we build and deliver
                </h3>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                These principles shape our communication, engineering, delivery
                quality, and long-term thinking.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {VALUES.map((value, index) => (
                <motion.div
                  key={value.title}
                  variants={index % 2 === 0 ? slideLeft : slideRight}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm ring-1 ring-gray-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {value.title}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    {value.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Want to collaborate? Visit the <code>/contact</code> page.
              </p>
              <div className="flex gap-2">
                <a
                  href="/privacy-policy"
                  className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
                >
                  Privacy Policy
                </a>
                <span className="text-xs text-indigo-300">·</span>
                <a
                  href="mailto:contact@ecoders.in"
                  className="text-xs font-semibold text-indigo-900 hover:text-indigo-700"
                >
                  contact@ecoders.in
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
