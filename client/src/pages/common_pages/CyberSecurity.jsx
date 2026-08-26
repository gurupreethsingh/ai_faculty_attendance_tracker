import React from "react";
import { motion } from "framer-motion";

export const cyberSecurityHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const PAGE_DATA = [
  {
    id: "security-foundation",
    eyebrow: "Cyber Security",
    title: "Security-first digital systems for modern businesses",
    description:
      "We help teams strengthen digital products with better security thinking across architecture, workflows, and access control. The goal is to reduce risk, improve resilience, and build trust into the product from the start.",
    points: [
      "Security-aware architecture and implementation",
      "Role-based access and permission controls",
      "Safer workflows and operational practices",
      "Strong protection mindset across products",
    ],
    images: [
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "secure-operations",
    eyebrow: "Risk Reduction",
    title: "Practical protection for platforms, users, and workflows",
    description:
      "Cyber security should support product growth, not block it. We focus on practical improvements in access management, platform hardening, and secure engineering practices that help teams move confidently.",
    points: [
      "Better access control and user safety",
      "Secure implementation guidance",
      "Operational risk awareness",
      "Security aligned with business delivery",
    ],
    images: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1614064548237-096f735f344f?auto=format&fit=crop&w=900&q=80",
    ],
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
          className="h-64 w-full object-cover transition duration-700 hover:scale-105 sm:h-80"
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

function ContentSection({ item, reverse = false }) {
  return (
    <section id={item.id} className="py-12 sm:py-16 lg:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <motion.div
          variants={reverse ? slideRight : slideLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={reverse ? "lg:order-2" : ""}
        >
          <span className="inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
            {item.eyebrow}
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {item.title}
          </h2>
          <p className="mt-5 text-sm leading-8 text-gray-600 sm:text-base">
            {item.description}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {item.points.map((point) => (
              <div
                key={point}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/10"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600" />
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

export default function CyberSecurity() {
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
            <span className="text-indigo-700 font-light">
              Cyber Security &rarr;
            </span>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Practical cyber security solutions for stronger digital confidence
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-gray-600 sm:text-base">
              We help teams improve platform trust, reduce avoidable risk, and
              build products with stronger security thinking from the ground up.
            </p>
          </div>
        </motion.section>

        {PAGE_DATA.map((item, index) => (
          <ContentSection key={item.id} item={item} reverse={index % 2 !== 0} />
        ))}
      </div>
    </main>
  );
}
