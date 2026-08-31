import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "../../managers/AuthManager";

export const superAdminDashboardHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

function safeArray(payload, primaryKey = "data") {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[primaryKey])) return payload[primaryKey];
  if (Array.isArray(payload?.messages)) return payload.messages;
  if (Array.isArray(payload?.subscriptions)) return payload.subscriptions;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
}

function monthKeyFromDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey) {
  if (!monthKey || monthKey === "Unknown") return "Unknown";
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

function StatCard({ title, value, subtitle = "", accent = "indigo" }) {
  const accentMap = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    purple: "bg-purple-50 text-purple-700",
    sky: "bg-sky-50 text-sky-700",
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {title}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </div>
          {subtitle ? (
            <div className="mt-2 text-sm text-gray-500">{subtitle}</div>
          ) : null}
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            accentMap[accent] || accentMap.indigo
          }`}
        >
          Live
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="h-[320px] w-full min-w-0">{children}</div>
    </div>
  );
}

function ActionLink({ to, label, variant = "primary" }) {
  const classes =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-500"
      : variant === "success"
        ? "bg-emerald-600 text-white hover:bg-emerald-500"
        : variant === "warning"
          ? "bg-amber-600 text-white hover:bg-amber-500"
          : variant === "purple"
            ? "bg-purple-600 text-white hover:bg-purple-500"
            : "border border-gray-200 text-gray-700 hover:bg-gray-100";

  return (
    <Link
      to={to}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${classes}`}
    >
      {label}
    </Link>
  );
}

export default function SuperAdminDashboard() {
  const { getAllUsers, user, logout, api } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    superAdmins: 0,
    normalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0,
    repliedMessages: 0,
    pendingMessages: 0,
    totalReplies: 0,
    subscriptions: 0,
  });

  const [chartData, setChartData] = useState({
    messageStatusData: [],
    userRoleData: [],
    monthlyMessageData: [],
    subscriptionVsMessagesData: [],
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboardData = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const [users, contactRes, subscriptionRes] = await Promise.allSettled([
        getAllUsers(),
        api.get("/contact/all-contact-messages"),
        api.get("/subscription/all-subscriptions"),
      ]);

      const userList =
        users.status === "fulfilled" && Array.isArray(users.value)
          ? users.value
          : [];

      const contactMessages =
        contactRes.status === "fulfilled"
          ? safeArray(contactRes.value?.data, "messages")
          : [];

      const subscriptions =
        subscriptionRes.status === "fulfilled"
          ? safeArray(subscriptionRes.value?.data, "subscriptions")
          : [];

      const totalUsers = userList.length;
      const superAdmins = userList.filter(
        (u) => u.role === "superadmin",
      ).length;
      const normalUsers = userList.filter((u) => u.role === "user").length;

      const unreadMessages = contactMessages.filter((m) => !m?.isRead).length;
      const repliedMessages = contactMessages.filter(
        (m) => Array.isArray(m?.replies) && m.replies.length > 0,
      ).length;
      const pendingMessages = contactMessages.length - repliedMessages;

      const totalReplies = contactMessages.reduce(
        (sum, m) => sum + (Array.isArray(m?.replies) ? m.replies.length : 0),
        0,
      );

      setStats({
        totalUsers,
        superAdmins,
        normalUsers,
        totalMessages: contactMessages.length,
        unreadMessages,
        repliedMessages,
        pendingMessages,
        totalReplies,
        subscriptions: subscriptions.length,
      });

      const roleMap = userList.reduce((acc, current) => {
        const role = current?.role || "unknown";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const userRoleData = Object.entries(roleMap).map(([name, value]) => ({
        name,
        value,
      }));

      const messageStatusData = [
        { name: "Unread", value: unreadMessages },
        { name: "Replied", value: repliedMessages },
        { name: "Pending", value: pendingMessages },
      ];

      const monthlyMessageMap = contactMessages.reduce((acc, current) => {
        const key = monthKeyFromDate(current?.createdAt);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const monthlySubscriptionMap = subscriptions.reduce((acc, current) => {
        const key = monthKeyFromDate(current?.createdAt);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const allMonths = Array.from(
        new Set([
          ...Object.keys(monthlyMessageMap),
          ...Object.keys(monthlySubscriptionMap),
        ]),
      )
        .filter(Boolean)
        .sort();

      const monthlyMessageData = allMonths.map((month) => ({
        month: formatMonthLabel(month),
        messages: monthlyMessageMap[month] || 0,
      }));

      const subscriptionVsMessagesData = allMonths.map((month) => ({
        month: formatMonthLabel(month),
        messages: monthlyMessageMap[month] || 0,
        subscriptions: monthlySubscriptionMap[month] || 0,
      }));

      setChartData({
        messageStatusData,
        userRoleData,
        monthlyMessageData,
        subscriptionVsMessagesData,
      });

      const messageActivities = contactMessages.slice(0, 8).map((message) => ({
        id: `message-${message?._id}`,
        type: "message",
        title: `New message from ${
          message?.firstName || message?.name || "User"
        }`,
        time: message?.createdAt,
        meta: message?.email || "No email",
      }));

      const replyActivities = contactMessages
        .flatMap((message) =>
          (message?.replies || []).map((reply, index) => ({
            id: `reply-${message?._id}-${index}`,
            type: "reply",
            title: `Reply by ${reply?.name || "Admin"}`,
            time: reply?.timestamp,
            meta: message?.email || "No thread email",
          })),
        )
        .slice(0, 8);

      const subscriptionActivities = subscriptions
        .slice(0, 8)
        .map((item, index) => ({
          id: `sub-${item?._id || index}`,
          type: "subscription",
          title: "New subscription",
          time: item?.createdAt,
          meta: item?.email || item?.subscriberEmail || "No email",
        }));

      const mergedActivities = [
        ...messageActivities,
        ...replyActivities,
        ...subscriptionActivities,
      ]
        .filter((item) => item.time)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);

      setRecentActivity(mergedActivities);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      setErrorMessage("Failed to load super admin dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const intervalId = window.setInterval(() => {
      loadDashboardData({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const overviewCards = useMemo(
    () => [
      {
        title: "Total Users",
        value: stats.totalUsers,
        subtitle: "All registered accounts",
        accent: "indigo",
      },
      {
        title: "Super Admins",
        value: stats.superAdmins,
        subtitle: "Privileged administrators",
        accent: "purple",
      },
      {
        title: "Users",
        value: stats.normalUsers,
        subtitle: "Standard user accounts",
        accent: "sky",
      },
      {
        title: "All Messages",
        value: stats.totalMessages,
        subtitle: "Contact module messages",
        accent: "emerald",
      },
      {
        title: "Unread Messages",
        value: stats.unreadMessages,
        subtitle: "Needs attention",
        accent: "rose",
      },
      {
        title: "Replied Messages",
        value: stats.repliedMessages,
        subtitle: "Already answered",
        accent: "amber",
      },
      {
        title: "Total Replies",
        value: stats.totalReplies,
        subtitle: "Full reply volume",
        accent: "purple",
      },
      {
        title: "Subscriptions",
        value: stats.subscriptions,
        subtitle: "Newsletter / subscriber count",
        accent: "emerald",
      },
    ],
    [stats],
  );

  if (loading) {
    return (
      <div className="mb-20 bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
          <p className="text-sm text-gray-500">
            Loading enterprise dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-20 bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10">
      <div className="mx-auto max-w-7xl min-w-0">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              Super Admin Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Enterprise operations overview for users, contact messages,
              replies, subscriptions, and activity monitoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadDashboardData({ silent: true })}
              className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={logout}
              className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Logged In Admin
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {user?.fullName || user?.name || user?.email || "-"}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Role:{" "}
              <span className="font-semibold text-gray-900">
                {user?.role || "-"}
              </span>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-8 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              accent={item.accent}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ActionLink to="/all-users" label="Manage Users" variant="primary" />
          <ActionLink
            to="/all-messages"
            label="View Messages"
            variant="success"
          />

          <ActionLink
            to="/create-faculty"
            label="Create Faculty"
            variant="success"
          />

          <ActionLink
            to="/create-timetable"
            label="Create Time Table"
            variant="success"
          />

          <ActionLink
            to="/all-faculties"
            label="All Faculties"
            variant="success"
          />
          <ActionLink to="/all-replies" label="View Replies" variant="purple" />

          <ActionLink
            to="/all-timetables"
            label="All Time Tables"
            variant="purple"
          />
          <ActionLink
            to="/all-subscriptions"
            label="Subscriptions"
            variant="warning"
          />
          <ActionLink to="/profile" label="My Profile" variant="secondary" />
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Activity Feed
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Recent message, reply, and subscription events.
            </p>
          </div>

          {recentActivity.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600 ring-1 ring-gray-200">
              No recent activity found.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {item.meta}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(item.time).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
