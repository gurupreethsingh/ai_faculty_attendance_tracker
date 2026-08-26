// src/pages/common_pages/Homepage.jsx
import React from "react";
import { motion } from "framer-motion";

// ✅ HERO PROPS FOR THIS PAGE
export const homepageHero = {
  heroTitle: "Welcome to ECODERS  - Build. Scale. Innovate.",
  heroSubtitle:
    "From AI solutions to modern web platforms, we help teams ship faster with reliable engineering and clean design.",
  showHero: true,
};

const HIGHLIGHTS = [
  {
    title: "AI Systems",
    text: "Smart assistants, automation, decision support, and modern AI product workflows.",
  },
  {
    title: "Modern Platforms",
    text: "Scalable web applications, fast interfaces, APIs, dashboards, and digital products.",
  },
  {
    title: "Automation-First",
    text: "Testing systems, workflow automation, and quality-focused engineering delivery.",
  },
  {
    title: "Growth Ready",
    text: "Architecture and product thinking designed for long-term scale and maintainability.",
  },
];

const FEATURE_SECTIONS = [
  {
    id: "ai-products",
    eyebrow: "AI-Powered Products",
    title:
      "Build intelligent products that go beyond basic digital experiences",
    text: "We design and engineer AI-powered systems that help businesses automate work, improve user experience, and unlock better decisions from their products and data. From assistants and recommendation engines to business-facing intelligence layers, our focus is on practical systems that create real value.",
    points: [
      "Custom AI assistants and intelligent workflows",
      "Recommendation, prediction, and automation systems",
      "Production-ready product integration",
      "Scalable engineering for real-world use",
    ],
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "platform-engineering",
    eyebrow: "Platform Engineering",
    title: "Modern web platforms built for performance, clarity, and scale",
    text: "We create digital platforms that feel fast, polished, and dependable. Whether you need a customer-facing product, internal business dashboard, or full platform ecosystem, we combine frontend quality, backend stability, and thoughtful architecture to deliver systems that grow with you.",
    points: [
      "Responsive product interfaces and premium UI",
      "Robust backend systems and API layers",
      "Admin dashboards and internal business tools",
      "Scalable product architecture and optimization",
    ],
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "automation-quality",
    eyebrow: "Automation & Quality",
    title:
      "Ship faster with strong automation systems and engineering discipline",
    text: "Modern teams need more than just code delivery. We help organizations reduce manual effort and improve release confidence through automation frameworks, validation workflows, process systems, and reliable engineering practices that support quality at every stage.",
    points: [
      "Reusable testing and QA automation systems",
      "Workflow optimization and process support",
      "Better release confidence and defect prevention",
      "Engineering systems built for consistency",
    ],
    images: [
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const SHOWCASE_CARDS = [
  {
    title: "Clean Product Thinking",
    text: "Modern digital experiences shaped with clarity, usability, and business value.",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Engineering for Growth",
    text: "Strong systems, scalable architecture, and maintainable code across the product lifecycle.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Automation Mindset",
    text: "Faster delivery through systems that reduce repetition and improve reliability.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Premium User Experience",
    text: "Interfaces that feel modern, usable, and polished across devices.",
    image:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Business Visibility",
    text: "Dashboards, analytics, and systems that make decision-making easier.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Future-Ready Delivery",
    text: "Digital products designed to evolve, improve, and scale over time.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
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

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

function SectionImages({ images, title }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="col-span-2 overflow-hidden rounded-[1.75rem] shadow-lg ring-1 ring-gray-900/10">
        <img
          src={images[0]}
          alt={`${title} main`}
          loading="lazy"
          className="h-56 w-full object-cover transition duration-700 hover:scale-105 sm:h-80"
        />
      </div>

      <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-900/10">
        <img
          src={images[1]}
          alt={`${title} visual one`}
          loading="lazy"
          className="h-40 w-full object-cover transition duration-700 hover:scale-105 sm:h-48"
        />
      </div>

      <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-900/10">
        <img
          src={images[2]}
          alt={`${title} visual two`}
          loading="lazy"
          className="h-40 w-full object-cover transition duration-700 hover:scale-105 sm:h-48"
        />
      </div>
    </div>
  );
}

function FeatureSection({ section, reverse = false }) {
  return (
    <section id={section.id} className="py-12 sm:py-16 lg:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <motion.div
          variants={reverse ? slideRight : slideLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={reverse ? "lg:order-2" : ""}
        >
          <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-indigo-700">
            {section.eyebrow}
          </span>

          <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {section.title}
          </h2>

          <p className="mt-5 text-sm leading-8 text-gray-600 sm:text-base">
            {section.text}
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-6 grid gap-3 sm:grid-cols-2"
          >
            {section.points.map((point) => (
              <motion.div
                key={point}
                variants={cardReveal}
                className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  <p className="text-sm leading-7 text-gray-700">{point}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/solutions"
              className="inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Explore Solutions
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Contact Us
            </a>
          </div>
        </motion.div>

        <motion.div
          variants={reverse ? slideLeft : slideRight}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={reverse ? "lg:order-1" : ""}
        >
          <SectionImages images={section.images} title={section.title} />
        </motion.div>
      </div>
    </section>
  );
}

const Homepage = () => {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_32%,#ffffff_100%)] [font-family:ui-sans-serif,system-ui,-apple-system,Segoe_UI,Roboto,Inter,Helvetica,Arial,'Apple_Color_Emoji','Segoe_UI_Emoji']">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="pt-10 sm:pt-12 lg:pt-16"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-indigo-100/70 bg-white/70 px-5 py-8 shadow-sm backdrop-blur-sm sm:px-8 sm:py-10 lg:px-12 lg:py-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_28%)]" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-indigo-700">
                  MODERN DIGITAL DELIVERY
                </span>

                <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  Modern engineering for products that need to move fast and
                  grow well
                </h1>

                <p className="mt-5 max-w-3xl text-sm leading-8 text-gray-600 sm:text-base">
                  ECODERS helps businesses build intelligent systems, premium
                  digital products, automation-first workflows, and scalable
                  engineering foundations with a modern, product-driven
                  approach.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="/solutions"
                    className="inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                  >
                    Explore Services
                  </a>
                  <a
                    href="/about-us"
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    About ECODERS
                  </a>
                </div>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.18 }}
                className="grid grid-cols-2 gap-3 sm:gap-4"
              >
                {HIGHLIGHTS.map((item, index) => (
                  <motion.div
                    key={item.title}
                    variants={index % 2 === 0 ? slideLeft : slideRight}
                    className="rounded-3xl border border-gray-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm"
                  >
                    <div className="text-lg font-semibold text-indigo-700 sm:text-xl">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-gray-600">
                      {item.text}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          className="py-12 sm:py-16 lg:py-20"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SHOWCASE_CARDS.map((card) => (
              <motion.div
                key={card.title}
                variants={cardReveal}
                className="group overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold tracking-tight text-gray-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    {card.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {FEATURE_SECTIONS.map((section, index) => (
          <FeatureSection
            key={section.id}
            section={section}
            reverse={index % 2 !== 0}
          />
        ))}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          className="pb-14 pt-4 sm:pb-16 lg:pb-20"
        >
          <div className="overflow-hidden rounded-[2rem] bg-indigo-700 px-6 py-8 shadow-lg sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Let’s build something modern, scalable, and meaningful
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-indigo-100 sm:text-base">
                  Whether you need an AI product, a premium web platform, an
                  automation-driven workflow, or a full digital system, ECODERS
                  can help turn the idea into a strong product foundation.
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
};

export default Homepage;
