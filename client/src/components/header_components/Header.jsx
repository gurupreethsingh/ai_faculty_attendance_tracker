"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import {
  ArrowPathIcon,
  Bars3Icon,
  BoltIcon,
  ChartPieIcon,
  CommandLineIcon,
  CpuChipIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/20/solid";
import { useAuth } from "../../managers/AuthManager";

const HERO_BG_DEFAULT =
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=2400&q=70";

const solutionItems = [
  {
    name: "AI / ML",
    description: "Intelligent automation and AI products.",
    href: "/ai-ml",
    icon: CpuChipIcon,
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Technology",
    description: "Scalable platforms and APIs.",
    href: "/technology",
    icon: CommandLineIcon,
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "ERP",
    description: "Workflows, dashboards, and operations.",
    href: "/erp",
    icon: ChartPieIcon,
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Cyber Security",
    description: "Security-first digital systems.",
    href: "/cyber-security",
    icon: ShieldCheckIcon,
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "UI / UX Design",
    description: "Premium interfaces and design systems.",
    href: "/ui-ux-design",
    icon: PaintBrushIcon,
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Digital Transformation",
    description: "Modernization and process improvement.",
    href: "/digital-transformation",
    icon: BoltIcon,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  },
];

const featuredCards = [
  {
    name: "Explore Solutions",
    description: "See all service areas.",
    href: "/solutions",
    icon: SquaresPlusIcon,
  },
  {
    name: "Contact sales",
    description: "Discuss your platform needs.",
    href: "/contact",
    icon: PhoneIcon,
  },
  {
    name: "Automation",
    description: "Faster delivery with automation.",
    href: "/ai-ml",
    icon: ArrowPathIcon,
  },
  {
    name: "Growth Engineering",
    description: "Architecture designed to scale.",
    href: "/technology",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Secure Delivery",
    description: "Build with resilience and trust.",
    href: "/cyber-security",
    icon: FingerPrintIcon,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name = "User") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

function prettifyRole(role = "user") {
  return String(role)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDashboardPathByRole(role) {
  if (!role) return "/user-dashboard";
  if (role === "superadmin") return "/super-admin-dashboard";

  const employeeRoles = [
    "admin",
    "developer",
    "developer_lead",
    "tech_lead",
    "qa_lead",
    "test_engineer",
    "project_manager",
    "product_owner",
    "hr",
    "hr_manager",
    "support_engineer",
    "customer_support",
    "marketing_manager",
    "operations_manager",
    "business_analyst",
    "content_creator",
    "data_scientist",
    "legal_advisor",
    "sales_executive",
    "recruiter",
    "intern",
    "accountant",
    "alumni_relations",
    "course_coordinator",
    "dean",
    "department_head",
    "event_coordinator",
    "exam_controller",
    "librarian",
    "maintenance_staff",
    "registrar",
    "researcher",
    "teacher",
    "student",
    "ux_ui_designer",
  ];

  if (employeeRoles.includes(role)) {
    return `/dashboard/${role}`;
  }

  return "/user-dashboard";
}

function getUnreadMessagesCountFromPayload(payload) {
  const messages = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.messages)
      ? payload.messages
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return messages.filter((message) => !message?.isRead).length;
}

function getSubscriptionsCountFromPayload(payload) {
  if (Array.isArray(payload)) return payload.length;
  if (Array.isArray(payload?.subscriptions))
    return payload.subscriptions.length;
  if (Array.isArray(payload?.data)) return payload.data.length;
  if (typeof payload?.count === "number") return payload.count;
  if (typeof payload?.total === "number") return payload.total;
  return 0;
}

function NotificationBadge({ count, light = false }) {
  if (!count || count <= 0) return null;

  return (
    <span
      className={classNames(
        "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
        light ? "bg-white text-indigo-700" : "bg-red-600 text-white",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Header({
  heroTitle = "Elevating Ambitions, Powering Success,\nYour Strategic Partner For Success.",
  heroSubtitle = "We build AI-driven products, modern web & mobile applications, automation-first systems, software testing tool development, and secure blockchain solutions—crafted to scale with your business.",
  heroBg = HERO_BG_DEFAULT,
  showHero = true,
}) {
  const { user, logout, api, authLoading } = useAuth();
  const location = useLocation();

  const isLoggedIn = !!user;
  const isSuperAdmin = user?.role === "superadmin";
  const currentPath = location.pathname;
  const dashboardPath = getDashboardPathByRole(user?.role);
  const displayName =
    user?.fullName || user?.name || user?.username || user?.email || "User";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerStats, setHeaderStats] = useState({
    unreadMessages: 0,
    subscriptions: 0,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let intervalId;

    const resetStats = () => {
      setHeaderStats({
        unreadMessages: 0,
        subscriptions: 0,
      });
    };

    const loadHeaderStats = async () => {
      if (authLoading || !isLoggedIn || !isSuperAdmin || !api || !user) {
        resetStats();
        return;
      }

      try {
        const [messagesRes, subscriptionsRes] = await Promise.allSettled([
          api.get("/contact/all-contact-messages"),
          api.get("/subscription/all-subscriptions"),
        ]);

        const unreadMessages =
          messagesRes.status === "fulfilled"
            ? getUnreadMessagesCountFromPayload(messagesRes.value?.data)
            : 0;

        const subscriptions =
          subscriptionsRes.status === "fulfilled"
            ? getSubscriptionsCountFromPayload(subscriptionsRes.value?.data)
            : 0;

        setHeaderStats({
          unreadMessages,
          subscriptions,
        });
      } catch (error) {
        resetStats();
      }
    };

    if (!authLoading && isLoggedIn && isSuperAdmin && user) {
      loadHeaderStats();
      intervalId = window.setInterval(loadHeaderStats, 15000);
    } else {
      resetStats();
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [api, isLoggedIn, isSuperAdmin, user, authLoading]);

  const navLinks = useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about-us" },
      { name: "Solutions", href: "/solutions" },
      { name: "AI/ML", href: "/ai-ml" },
      { name: "Technology", href: "/technology" },
      { name: "ERP", href: "/erp" },
      { name: "Cyber Security", href: "/cyber-security" },
      { name: "UI/UX-Design", href: "/ui-ux-design" },
      { name: "Digital Transformation", href: "/digital-transformation" },
      { name: "Contact", href: "/contact" },
    ],
    [],
  );

  const isActive = (href) => {
    if (!currentPath || !href || href === "#") return false;
    if (href === "/") return currentPath === "/";
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  const handleLogout = async () => {
    try {
      setMobileMenuOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const linkBase = "text-sm/6 font-medium tracking-tight transition-colors";
  const linkInactive = "text-white/90 hover:text-white";
  const linkActive = "text-white";

  return (
    <header
      className={classNames(
        "relative overflow-visible",
        "rounded-br-[110px] sm:rounded-br-[140px]",
        "[font-family:ui-sans-serif,system-ui,-apple-system,Segoe_UI,Roboto,Inter,Helvetica,Arial,'Apple_Color_Emoji','Segoe_UI_Emoji']",
      )}
      style={
        showHero
          ? {
              backgroundImage: `url(${heroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {showHero && <div className="absolute inset-0 bg-indigo-800/75" />}

      <div
        className={classNames(
          "relative z-40",
          showHero
            ? scrolled
              ? "bg-black/10 backdrop-blur-sm"
              : "bg-transparent"
            : scrolled
              ? "bg-white/80 backdrop-blur-md shadow-sm"
              : "bg-white shadow",
        )}
      >
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-[1600px] items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">ECODERS</span>
              <img
                alt="ECODERS"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=white"
                className={classNames(
                  "h-8 w-auto",
                  showHero ? "brightness-0 invert" : "",
                )}
              />
            </Link>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={classNames(
                "-m-2.5 inline-flex items-center justify-center rounded-md p-2.5",
                showHero
                  ? "text-white/90 hover:text-white"
                  : "text-gray-700 hover:text-indigo-700",
              )}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>

          <PopoverGroup className="hidden lg:flex lg:items-center lg:gap-x-8">
            <Popover className="relative">
              <PopoverButton
                className={classNames(
                  "flex items-center gap-x-1",
                  linkBase,
                  showHero
                    ? linkInactive
                    : "text-gray-900 hover:text-indigo-700",
                )}
              >
                Product
                <ChevronDownIcon
                  aria-hidden="true"
                  className={classNames(
                    "size-5 flex-none",
                    showHero ? "text-white/70" : "text-gray-400",
                  )}
                />
              </PopoverButton>

              <PopoverPanel
                transition
                className="absolute left-1/2 z-[9999] mt-4 w-[min(92vw,980px)] -translate-x-1/2 overflow-visible rounded-[1.5rem] bg-white shadow-2xl ring-1 ring-gray-900/10 transition duration-200 data-closed:translate-y-1 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in"
              >
                <div className="grid grid-cols-12">
                  <div className="col-span-8 border-r border-gray-100 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-700">
                          Solutions
                        </p>
                        <h3 className="mt-1 text-base font-semibold tracking-tight text-gray-900">
                          Explore service areas
                        </h3>
                      </div>
                      <Link
                        to="/solutions"
                        className="text-xs font-semibold text-indigo-700 hover:text-indigo-600"
                      >
                        View all →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {solutionItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <div className="overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-24 w-full object-cover transition duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>

                          <div className="p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100">
                                <item.icon className="size-4" />
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                                  {item.name}
                                </div>
                                <p className="mt-0.5 text-xs leading-5 text-gray-600">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-4 bg-gradient-to-b from-slate-50 to-white p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-700">
                      Featured
                    </p>
                    <h3 className="mt-1 text-base font-semibold tracking-tight text-gray-900">
                      Quick access
                    </h3>

                    <div className="mt-3 space-y-2.5">
                      {featuredCards.slice(0, 4).map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="group flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition duration-300 hover:border-indigo-100 hover:bg-indigo-50/40 hover:shadow-md"
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-700 transition group-hover:bg-white group-hover:text-indigo-700">
                            <item.icon className="size-4" />
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                              {item.name}
                            </div>
                            <p className="mt-0.5 text-xs leading-5 text-gray-600">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-3 overflow-hidden rounded-2xl bg-indigo-700 p-4 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-100">
                        Build with ECODERS
                      </p>
                      <h4 className="mt-2 text-sm font-semibold">
                        Modern products with strong engineering foundations
                      </h4>
                      <p className="mt-1.5 text-xs leading-5 text-indigo-100">
                        AI systems, scalable platforms, automation workflows,
                        and premium UI experiences.
                      </p>
                      <Link
                        to="/contact"
                        className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                </div>
              </PopoverPanel>
            </Popover>

            {navLinks.map((l) => (
              <Link
                key={l.name}
                to={l.href}
                className={classNames(
                  linkBase,
                  showHero
                    ? isActive(l.href)
                      ? linkActive
                      : linkInactive
                    : isActive(l.href)
                      ? "text-indigo-700"
                      : "text-gray-900 hover:text-indigo-700",
                )}
              >
                {l.name}
              </Link>
            ))}
          </PopoverGroup>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {!isLoggedIn ? (
              <Link
                to="/login"
                className={classNames(
                  linkBase,
                  showHero
                    ? linkInactive
                    : "text-gray-900 hover:text-indigo-700",
                  "font-semibold",
                )}
              >
                Log in <span aria-hidden="true">&rarr;</span>
              </Link>
            ) : (
              <Menu as="div" className="relative">
                <MenuButton
                  className={classNames(
                    "group inline-flex items-center gap-3 rounded-full px-2 py-1.5 text-sm font-semibold focus:outline-none",
                    showHero
                      ? "text-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
                      : "text-gray-900 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600/40",
                  )}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayName}
                      className={classNames(
                        "h-9 w-9 rounded-full object-cover ring-1",
                        showHero ? "ring-white/20" : "ring-gray-900/10",
                      )}
                    />
                  ) : (
                    <div
                      className={classNames(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-1",
                        showHero
                          ? "bg-white/15 text-white ring-white/20"
                          : "bg-gray-100 text-gray-700 ring-gray-900/10",
                      )}
                    >
                      {getInitials(displayName)}
                    </div>
                  )}

                  <span className="max-w-[160px] truncate">{displayName}</span>

                  {isSuperAdmin && headerStats.unreadMessages > 0 && (
                    <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {headerStats.unreadMessages > 99
                        ? "99+"
                        : headerStats.unreadMessages}
                    </span>
                  )}

                  <ChevronDownIcon
                    className={classNames(
                      "size-5",
                      showHero
                        ? "text-white/70 group-hover:text-white"
                        : "text-gray-400 group-hover:text-indigo-700",
                    )}
                    aria-hidden="true"
                  />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-[9999] mt-3 w-72 origin-top-right overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/10 focus:outline-none transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-150 data-enter:ease-out data-leave:duration-120 data-leave:ease-in"
                >
                  <div className="p-1.5">
                    <div className="px-3 py-2">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {displayName}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {prettifyRole(user?.role || "user")}
                      </div>
                    </div>

                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to="/profile"
                          className={classNames(
                            "block rounded-xl px-3 py-2 text-sm font-medium",
                            focus
                              ? "bg-gray-50 text-indigo-700"
                              : "text-gray-900",
                          )}
                        >
                          Profile
                        </Link>
                      )}
                    </MenuItem>

                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to={dashboardPath}
                          className={classNames(
                            "block rounded-xl px-3 py-2 text-sm font-medium",
                            focus
                              ? "bg-gray-50 text-indigo-700"
                              : "text-gray-900",
                          )}
                        >
                          Dashboard
                        </Link>
                      )}
                    </MenuItem>

                    {isSuperAdmin && (
                      <>
                        <div className="my-1.5 h-px bg-gray-100" />

                        <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                          Super Admin
                        </div>

                        <MenuItem>
                          {({ focus }) => (
                            <Link
                              to="/all-messages"
                              className={classNames(
                                "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium",
                                focus
                                  ? "bg-gray-50 text-indigo-700"
                                  : "text-gray-900",
                              )}
                            >
                              <span className="inline-flex items-center">
                                <EnvelopeIcon className="mr-2 size-4" />
                                All Messages
                              </span>
                              <NotificationBadge
                                count={headerStats.unreadMessages}
                              />
                            </Link>
                          )}
                        </MenuItem>

                        <MenuItem>
                          {({ focus }) => (
                            <Link
                              to="/all-replies"
                              className={classNames(
                                "block rounded-xl px-3 py-2 text-sm font-medium",
                                focus
                                  ? "bg-gray-50 text-indigo-700"
                                  : "text-gray-900",
                              )}
                            >
                              All Replies
                            </Link>
                          )}
                        </MenuItem>

                        <MenuItem>
                          {({ focus }) => (
                            <Link
                              to="/all-subscriptions"
                              className={classNames(
                                "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium",
                                focus
                                  ? "bg-gray-50 text-indigo-700"
                                  : "text-gray-900",
                              )}
                            >
                              <span>Subscriptions</span>
                              <NotificationBadge
                                count={headerStats.subscriptions}
                              />
                            </Link>
                          )}
                        </MenuItem>
                      </>
                    )}

                    <div className="my-1.5 h-px bg-gray-100" />

                    <MenuItem>
                      {({ focus }) => (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className={classNames(
                            "w-full rounded-xl px-3 py-2 text-left text-sm font-medium",
                            focus
                              ? "bg-gray-50 text-indigo-700"
                              : "text-gray-900",
                          )}
                        >
                          Logout
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            )}
          </div>
        </nav>
      </div>

      {showHero && (heroTitle || heroSubtitle) && (
        <section className="relative z-10">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="py-24 text-center sm:py-28 lg:py-32">
              <h1 className="mx-auto whitespace-pre-line text-balance text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
                {heroTitle}
              </h1>

              <div className="mx-auto mt-10 h-[3px] w-40 bg-white/80 sm:w-56" />

              <p className="mx-auto mt-8 max-w-3xl text-pretty text-sm leading-7 text-white/90 sm:text-base">
                {heroSubtitle}
              </p>
            </div>
          </div>
        </section>
      )}

      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm" />
        <DialogPanel className="fixed inset-y-0 right-0 z-[9999] w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5" onClick={closeMobileMenu}>
              <span className="sr-only">ECODERS</span>
              <img
                alt="ECODERS"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:text-indigo-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-indigo-700">
                    Product
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="size-5 flex-none group-data-open:rotate-180"
                    />
                  </DisclosureButton>

                  <DisclosurePanel className="mt-2 space-y-2">
                    {solutionItems.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as={Link}
                        to={item.href}
                        className="block rounded-xl px-3 py-3 hover:bg-gray-50"
                        onClick={closeMobileMenu}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                            <item.icon className="size-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {item.name}
                            </div>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>

                {navLinks.map((l) => (
                  <Link
                    key={l.name}
                    to={l.href}
                    onClick={closeMobileMenu}
                    className={classNames(
                      "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold",
                      isActive(l.href)
                        ? "text-indigo-700"
                        : "text-gray-900 hover:bg-gray-50 hover:text-indigo-700",
                    )}
                  >
                    {l.name}
                  </Link>
                ))}
              </div>

              <div className="space-y-2 py-6">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-indigo-700"
                  >
                    Log in
                  </Link>
                ) : (
                  <Fragment>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={displayName}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-900/10"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 ring-1 ring-gray-900/10">
                          {getInitials(displayName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {prettifyRole(user?.role || "user")}
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-indigo-700"
                    >
                      Profile
                    </Link>

                    <Link
                      to={dashboardPath}
                      onClick={closeMobileMenu}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-indigo-700"
                    >
                      Dashboard
                    </Link>

                    {isSuperAdmin && (
                      <>
                        <div className="mx-3 my-3 h-px bg-gray-200" />
                        <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                          Super Admin
                        </div>

                        <Link
                          to="/all-messages"
                          onClick={closeMobileMenu}
                          className="-mx-3 mt-2 flex items-center justify-between rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-indigo-700"
                        >
                          <span>All Messages</span>
                          <NotificationBadge
                            count={headerStats.unreadMessages}
                          />
                        </Link>

                        <Link
                          to="/all-replies"
                          onClick={closeMobileMenu}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-indigo-700"
                        >
                          All Replies
                        </Link>

                        <Link
                          to="/all-subscriptions"
                          onClick={closeMobileMenu}
                          className="-mx-3 flex items-center justify-between rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-indigo-700"
                        >
                          <span>Subscriptions</span>
                          <NotificationBadge
                            count={headerStats.subscriptions}
                          />
                        </Link>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="-mx-3 w-full rounded-lg px-3 py-2.5 text-left text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-indigo-700"
                    >
                      Logout
                    </button>
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
