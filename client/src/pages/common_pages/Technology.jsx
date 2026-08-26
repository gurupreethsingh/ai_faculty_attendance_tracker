import React from "react";
import { motion } from "framer-motion";

export const technologyHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const PAGE_DATA = [
  {
    id: "modern-stack",
    eyebrow: "Modern Technology",
    title: "Technology solutions built on strong modern foundations",
    description:
      "We design and develop technology ecosystems that support performance, maintainability, and future growth. From frontend architecture and backend systems to APIs and integration layers, we focus on practical engineering that scales.",
    points: [
      "Scalable frontend and backend architecture",
      "API-first system design",
      "Cloud-ready and integration-friendly solutions",
      "Maintainable engineering practices",
    ],
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "integration-layer",
    eyebrow: "Engineering Enablement",
    title: "Technology choices that support faster product delivery",
    description:
      "Good technology is not just about tools. It is about selecting and implementing the right stack for your product goals, user scale, and team workflow. We help create systems that are reliable, flexible, and easier to evolve.",
    points: [
      "Architecture planning and system modernization",
      "Platform integration and workflow enablement",
      "Performance improvement and cleanup",
      "Future-ready development strategy",
    ],
    images: [
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
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

export default function Technology() {
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
              Technology &rarr;
            </span>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Modern technology solutions built for speed, scale, and stability
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-gray-600 sm:text-base">
              We help teams choose, build, and evolve technology systems that
              support strong product delivery and long-term maintainability.
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
