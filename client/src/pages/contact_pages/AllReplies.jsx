import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckSquare,
  FaClock,
  FaDownload,
  FaEnvelope,
  FaEye,
  FaRedo,
  FaReply,
  FaSearch,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

export const allRepliesHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function safeLower(value) {
  return String(value || "").toLowerCase();
}

function getLatestReplyTimestamp(replies = []) {
  if (!Array.isArray(replies) || replies.length === 0) return null;
  return replies.reduce((latest, current) => {
    const latestTime = new Date(latest?.timestamp || 0).getTime();
    const currentTime = new Date(current?.timestamp || 0).getTime();
    return currentTime > latestTime ? current : latest;
  }, replies[0])?.timestamp;
}

function getMessagePreview(message) {
  const text = message?.message_text || message?.message || "";
  if (text.length <= 80) return text;
  return `${text.slice(0, 80)}...`;
}

function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AllReplies() {
  const { api } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [replyStatusFilter, setReplyStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "latestReplyAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState({
    error: "",
    success: "",
    info: "",
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setStatus({ error: "", success: "", info: "" });

      const response = await api.get("/contact/all-contact-messages");

      const payload = response?.data;
      const rawMessages = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.messages)
          ? payload.messages
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      const normalizedMessages = rawMessages
        .map((msg) => {
          const sortedReplies = Array.isArray(msg?.replies)
            ? [...msg.replies].sort(
                (a, b) =>
                  new Date(b?.timestamp || 0) - new Date(a?.timestamp || 0),
              )
            : [];

          return {
            ...msg,
            replies: sortedReplies,
            replyCount: sortedReplies.length,
            latestReplyAt: getLatestReplyTimestamp(sortedReplies),
            senderName:
              `${msg?.firstName || ""} ${msg?.lastName || ""}`.trim() ||
              msg?.name ||
              "N/A",
          };
        })
        .filter((msg) => Array.isArray(msg.replies) && msg.replies.length > 0);

      setMessages(normalizedMessages);
      setSelectedIds((prev) =>
        prev.filter((id) => normalizedMessages.some((msg) => msg._id === id)),
      );
    } catch (error) {
      console.error("Failed to fetch replies:", error);
      setStatus({
        error: error?.response?.data?.message || "Failed to load replies.",
        success: "",
        info: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [api]);

  const filteredMessages = useMemo(() => {
    const term = safeLower(searchTerm.trim());

    return messages.filter((message) => {
      const messageText = safeLower(message?.message_text || message?.message);
      const senderName = safeLower(message?.senderName);
      const email = safeLower(message?.email);
      const latestReplyText = safeLower(message?.replies?.[0]?.message);
      const replyCount = Number(message?.replyCount || 0);

      const matchesSearch =
        !term ||
        messageText.includes(term) ||
        senderName.includes(term) ||
        email.includes(term) ||
        latestReplyText.includes(term);

      const matchesReplyStatus =
        replyStatusFilter === "all"
          ? true
          : replyStatusFilter === "replied"
            ? replyCount > 0
            : replyCount === 0;

      return matchesSearch && matchesReplyStatus;
    });
  }, [messages, searchTerm, replyStatusFilter]);

  const sortedMessages = useMemo(() => {
    const list = [...filteredMessages];

    list.sort((a, b) => {
      const { key, direction } = sortConfig;
      let aValue = a?.[key];
      let bValue = b?.[key];

      if (key === "senderName" || key === "email") {
        aValue = safeLower(aValue);
        bValue = safeLower(bValue);
      }

      if (key === "createdAt" || key === "latestReplyAt") {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (key === "replyCount") {
        aValue = Number(aValue || 0);
        bValue = Number(bValue || 0);
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredMessages, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedMessages.length / itemsPerPage),
  );

  const currentMessages = sortedMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const allVisibleSelected =
    currentMessages.length > 0 &&
    currentMessages.every((msg) => selectedIds.includes(msg._id));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-2 inline" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="ml-2 inline" />
    ) : (
      <FaSortDown className="ml-2 inline" />
    );
  };

  const toggleRowSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectVisible = () => {
    const visibleIds = currentMessages.map((msg) => msg._id);

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleViewSingle = (id) => {
    navigate(`/single-reply/${id}`);
  };

  const handleDeleteSingle = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message thread?",
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setStatus({ error: "", success: "", info: "" });

      await api.delete(`/contact/delete-message/${id}`);

      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));

      setStatus({
        error: "",
        success: "Message thread deleted successfully.",
        info: "",
      });
    } catch (error) {
      console.error("Failed to delete message thread:", error);
      setStatus({
        error:
          error?.response?.data?.message ||
          "Failed to delete message thread. Make sure the backend delete route exists.",
        success: "",
        info: "",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      setStatus({
        error: "Please select at least one row for bulk delete.",
        success: "",
        info: "",
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected message thread(s)?`,
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setStatus({ error: "", success: "", info: "" });

      await api.post("/contact/bulk-delete-messages", {
        ids: selectedIds,
      });

      setMessages((prev) =>
        prev.filter((msg) => !selectedIds.includes(msg._id)),
      );
      setSelectedIds([]);

      setStatus({
        error: "",
        success: "Selected message threads deleted successfully.",
        info: "",
      });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      setStatus({
        error:
          error?.response?.data?.message ||
          "Bulk delete failed. Make sure the backend bulk delete route exists.",
        success: "",
        info: "",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportSelected = () => {
    const rowsToExport =
      selectedIds.length > 0
        ? sortedMessages.filter((msg) => selectedIds.includes(msg._id))
        : sortedMessages;

    if (rowsToExport.length === 0) {
      setStatus({
        error: "No rows available to export.",
        success: "",
        info: "",
      });
      return;
    }

    const csvRows = [
      [
        "Message ID",
        "Sender",
        "Email",
        "Original Message",
        "Reply Count",
        "Latest Reply At",
        "Created At",
        "Status",
      ],
      ...rowsToExport.map((msg) => [
        msg._id,
        msg.senderName,
        msg.email || "",
        msg.message_text || msg.message || "",
        msg.replyCount || 0,
        formatDateTime(msg.latestReplyAt),
        formatDateTime(msg.createdAt),
        msg.replyCount > 0 ? "Replied" : "Pending",
      ]),
    ];

    downloadCsv("all_replies_export.csv", csvRows);

    setStatus({
      error: "",
      success: "CSV exported successfully.",
      info: "",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <section>
          <div className="mx-auto w-full">
            <span className="font-light text-indigo-700">
              Contact replies &rarr;
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              All replies
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              Enterprise-style reply management with table view, selection,
              search, sorting, pagination, export, and bulk actions.
            </p>
          </div>
        </section>

        <section className="pt-8 sm:pt-10">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-gray-900">
                  Reply management table
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Compact, searchable and scalable view of all replied message
                  threads.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Replied Threads: {sortedMessages.length}
                </span>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Selected: {selectedIds.length}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-12">
              <div className="relative lg:col-span-5">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sender, email, original message, or reply text..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                />
              </div>

              <div className="lg:col-span-2">
                <select
                  value={replyStatusFilter}
                  onChange={(e) => {
                    setReplyStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-gray-900 ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                >
                  <option value="all">All statuses</option>
                  <option value="replied">Replied</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-gray-900 ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} / page
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2 lg:col-span-3 lg:justify-end">
                <button
                  type="button"
                  onClick={fetchMessages}
                  disabled={loading || actionLoading}
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaRedo className="mr-2" />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleExportSelected}
                  disabled={loading || actionLoading}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaDownload className="mr-2" />
                  Export CSV
                </button>
              </div>
            </div>

            {status.error && (
              <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {status.error}
              </div>
            )}

            {status.success && (
              <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
                {status.success}
              </div>
            )}

            {status.info && (
              <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
                {status.info}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
              <button
                type="button"
                onClick={toggleSelectVisible}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50"
              >
                <FaCheckSquare className="mr-2" />
                {allVisibleSelected ? "Unselect Visible" : "Select Visible"}
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0 || actionLoading}
                className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaTrash className="mr-2" />
                Delete Selected
              </button>

              <div className="ml-auto text-xs text-gray-500">
                Showing {currentMessages.length} of {sortedMessages.length}{" "}
                row(s)
              </div>
            </div>

            {loading ? (
              <div className="mt-8 rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600 ring-1 ring-gray-200">
                Loading replies...
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="mt-8 rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600 ring-1 ring-gray-200">
                No replied messages found.
              </div>
            ) : (
              <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse bg-white">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        <th className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectVisible}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </th>

                        <th
                          className="cursor-pointer px-4 py-4"
                          onClick={() => handleSort("senderName")}
                        >
                          Sender {renderSortIcon("senderName")}
                        </th>

                        <th
                          className="cursor-pointer px-4 py-4"
                          onClick={() => handleSort("email")}
                        >
                          Email {renderSortIcon("email")}
                        </th>

                        <th className="px-4 py-4">Original Message</th>

                        <th
                          className="cursor-pointer px-4 py-4"
                          onClick={() => handleSort("replyCount")}
                        >
                          Replies {renderSortIcon("replyCount")}
                        </th>

                        <th
                          className="cursor-pointer px-4 py-4"
                          onClick={() => handleSort("latestReplyAt")}
                        >
                          Latest Reply {renderSortIcon("latestReplyAt")}
                        </th>

                        <th
                          className="cursor-pointer px-4 py-4"
                          onClick={() => handleSort("createdAt")}
                        >
                          Created {renderSortIcon("createdAt")}
                        </th>

                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4 text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentMessages.map((msg) => {
                        const isSelected = selectedIds.includes(msg._id);
                        const isReplied = (msg.replyCount || 0) > 0;

                        return (
                          <tr
                            key={msg._id}
                            className={`border-t border-gray-100 transition hover:bg-indigo-50/40 ${
                              isSelected ? "bg-indigo-50/30" : ""
                            }`}
                          >
                            <td className="px-4 py-4 align-top">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRowSelection(msg._id)}
                                className="mt-1 h-4 w-4 rounded border-gray-300"
                              />
                            </td>

                            <td
                              className="cursor-pointer px-4 py-4 align-top"
                              onClick={() => handleViewSingle(msg._id)}
                            >
                              <div className="flex items-start gap-2">
                                <FaUser className="mt-1 text-indigo-600" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {msg.senderName}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td
                              className="cursor-pointer px-4 py-4 align-top text-sm text-gray-600"
                              onClick={() => handleViewSingle(msg._id)}
                            >
                              <div className="flex items-start gap-2">
                                <FaEnvelope className="mt-1 text-indigo-600" />
                                <span className="break-all">
                                  {msg.email || "N/A"}
                                </span>
                              </div>
                            </td>

                            <td
                              className="max-w-[280px] cursor-pointer px-4 py-4 align-top text-sm text-gray-700"
                              onClick={() => handleViewSingle(msg._id)}
                            >
                              {getMessagePreview(msg)}
                            </td>

                            <td className="px-4 py-4 align-top">
                              <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                <FaReply className="mr-2" />
                                {msg.replyCount || 0}
                              </span>
                            </td>

                            <td className="px-4 py-4 align-top text-sm text-gray-600">
                              <div className="flex items-start gap-2">
                                <FaClock className="mt-1 text-green-600" />
                                <span>{formatDateTime(msg.latestReplyAt)}</span>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top text-sm text-gray-600">
                              {formatDateTime(msg.createdAt)}
                            </td>

                            <td className="px-4 py-4 align-top">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  isReplied
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {isReplied ? "Replied" : "Pending"}
                              </span>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewSingle(msg._id)}
                                  className="inline-flex items-center rounded-full bg-indigo-700 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-600"
                                >
                                  <FaEye className="mr-1" />
                                  View
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteSingle(msg._id)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <FaTrash className="mr-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && sortedMessages.length > 0 && (
              <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaArrowLeft className="mr-2" />
                  Previous
                </button>

                <p className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </p>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
