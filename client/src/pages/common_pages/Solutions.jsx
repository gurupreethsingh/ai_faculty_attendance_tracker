// src/pages/common_pages/Solutions.jsx
import React from "react";
import { motion } from "framer-motion";

export const solutionsHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const SECTION_DATA = [
  {
    id: "ai-solutions",
    eyebrow: "AI Solutions",
    title: "Intelligent systems built for real business impact",
    description:
      "We build AI-powered products that go beyond demos. From smart assistants and recommendation systems to intelligent workflows and predictive features, our focus is always on practical value, clean architecture, and long-term scalability.",
    points: [
      "AI assistants and chatbot systems",
      "Recommendation and personalization engines",
      "Business workflow automation with AI",
      "Custom ML-powered decision support tools",
    ],
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "platform-engineering",
    eyebrow: "Platform Engineering",
    title: "Modern web platforms designed to scale with confidence",
    description:
      "We create fast, elegant, and maintainable digital platforms for startups and growing businesses. Every platform is designed with responsive UI, stable backend architecture, API-first thinking, and production-ready engineering practices.",
    points: [
      "Responsive modern frontend experiences",
      "Scalable backend and API development",
      "Admin dashboards and internal tools",
      "Performance-first architecture and optimization",
    ],
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "qa-automation",
    eyebrow: "QA Automation",
    title: "Automation-first quality systems for faster releases",
    description:
      "We help teams reduce manual effort and release with confidence by building robust automation frameworks, reusable validations, scalable test workflows, and quality-focused engineering processes that fit modern product teams.",
    points: [
      "Reusable automation frameworks",
      "Regression and smoke test coverage",
      "UI and API validation workflows",
      "Better release confidence and defect prevention",
    ],
    images: [
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "business-systems",
    eyebrow: "Business Systems",
    title: "Custom tools, dashboards, and workflows tailored to operations",
    description:
      "Not every business problem needs an off-the-shelf product. We design and develop custom business systems that simplify day-to-day operations, improve team productivity, centralize reporting, and make complex workflows easier to manage.",
    points: [
      "Custom admin and reporting portals",
      "Workflow management systems",
      "Role-based dashboards and controls",
      "Operational visibility and business efficiency",
    ],
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "growth-support",
    eyebrow: "Growth Support",
    title: "Continuous improvement after launch, not just one-time delivery",
    description:
      "We support products beyond release with ongoing optimization, feature expansion, UI improvement, performance tuning, and engineering cleanup. The goal is not just shipping once, but helping your product stay healthy as it grows.",
    points: [
      "Post-launch engineering support",
      "Feature enhancement and roadmap work",
      "UI refinement and user experience upgrades",
      "Performance, scalability, and maintenance",
    ],
    images: [
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const stats = [
  { value: "AI", label: "Intelligent products" },
  { value: "Web", label: "Modern platforms" },
  { value: "QA", label: "Automation systems" },
  { value: "Scale", label: "Built for growth" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: -90 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 90 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

function SectionImages({ images = [], title = "" }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="col-span-2 overflow-hidden rounded-3xl shadow-lg ring-1 ring-gray-900/10">
        <img
          src={images[0]}
          alt={`${title} main visual`}
          className="h-64 w-full object-cover transition duration-700 hover:scale-105 sm:h-80"
          loading="lazy"
        />
      </div>

      <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-900/10">
        <img
          src={images[1]}
          alt={`${title} supporting visual 1`}
          className="h-40 w-full object-cover transition duration-700 hover:scale-105 sm:h-48"
          loading="lazy"
        />
      </div>

      <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-900/10">
        <img
          src={images[2]}
          alt={`${title} supporting visual 2`}
          className="h-40 w-full object-cover transition duration-700 hover:scale-105 sm:h-48"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function SolutionSection({ section, reverse = false }) {
  const textAnimation = reverse ? slideRight : slideLeft;
  const imageAnimation = reverse ? slideLeft : slideRight;

  return (
    <section id={section.id} className="py-12 sm:py-16 lg:py-20">
      <div
        className={`grid items-center gap-8 lg:gap-14 ${
          reverse
            ? "lg:grid-cols-[1.05fr_0.95fr]"
            : "lg:grid-cols-[0.95fr_1.05fr]"
        }`}
      >
        <motion.div
          variants={textAnimation}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={`${reverse ? "lg:order-2" : "lg:order-1"}`}
        >
          <span className="inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-700">
            {section.eyebrow}
          </span>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {section.title}
          </h2>

          <p className="mt-5 text-sm leading-8 text-gray-600 sm:text-base">
            {section.description}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {section.points.map((point) => (
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

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Get Started
            </a>
            <a
              href="/about-us"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        <motion.div
          variants={imageAnimation}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={`${reverse ? "lg:order-1" : "lg:order-2"}`}
        >
          <SectionImages images={section.images} title={section.title} />
        </motion.div>
      </div>
    </section>
  );
}

export default function Solutions() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white [font-family:ui-sans-serif,system-ui,-apple-system,Segoe_UI,Roboto,Inter,Helvetica,Arial,'Apple_Color_Emoji','Segoe_UI_Emoji']">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.section
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative overflow-hidden pt-10 sm:pt-12 lg:pt-16"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_28%)]" />

          <div className="rounded-[2rem] border border-indigo-100/70 bg-white/80 px-5 py-8 shadow-sm backdrop-blur-sm sm:px-8 sm:py-10 lg:px-12 lg:py-14">
            <span className="text-indigo-700 font-light">Solutions &rarr;</span>

            <div className="mt-4 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h1 className="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  Premium digital solutions engineered for performance and
                  growth
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-8 text-gray-600 sm:text-base">
                  ECODERS builds high-impact AI systems, modern product
                  platforms, automation-first workflows, and custom business
                  software that combines elegant UI with strong engineering
                  foundations.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#ai-solutions"
                    className="inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                  >
                    Explore Services
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    Talk to Us
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10"
                  >
                    <div className="text-2xl font-semibold text-indigo-700 sm:text-3xl">
                      {item.value}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-gray-600">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {SECTION_DATA.map((section, index) => (
          <SolutionSection
            key={section.id}
            section={section}
            reverse={index % 2 !== 0}
          />
        ))}

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={fadeUp}
          className="pb-14 pt-4 sm:pb-16 lg:pb-20"
        >
          <div className="overflow-hidden rounded-[2rem] bg-indigo-700 px-6 py-8 shadow-lg sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Let’s build a solution that actually moves your business
                  forward
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-indigo-100 sm:text-base">
                  Whether you need an AI-powered product, a modern web platform,
                  a strong automation framework, or a custom internal system, we
                  can help you shape, build, and improve it.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                  Contact Us
                </a>
                <a
                  href="/privacy-policy"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
