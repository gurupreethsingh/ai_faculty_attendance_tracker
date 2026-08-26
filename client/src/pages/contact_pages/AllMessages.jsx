import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaEnvelope,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUser,
  FaClock,
} from "react-icons/fa";
import { useAuth } from "../../managers/AuthManager";

export const allMessagesHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

const ITEMS_PER_PAGE = 6;

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export default function AllMessages() {
  const { api } = useAuth();

  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ error: "" });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setStatus({ error: "" });

        const response = await api.get("/contact/all-contact-messages");

        const payload = response?.data;
        const finalData = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.messages)
            ? payload.messages
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        setMessages(finalData);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setStatus({
          error: error?.response?.data?.message || "Failed to load messages.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [api]);

  const filteredAndSortedMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = messages.filter((message) => {
      const firstName = message?.firstName?.toLowerCase?.() || "";
      const lastName = message?.lastName?.toLowerCase?.() || "";
      const email = message?.email?.toLowerCase?.() || "";
      const messageText =
        message?.message_text?.toLowerCase?.() ||
        message?.message?.toLowerCase?.() ||
        "";

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        email.includes(term) ||
        messageText.includes(term)
      );
    });

    return filtered.sort((a, b) => {
      const first = new Date(a?.createdAt || 0).getTime();
      const second = new Date(b?.createdAt || 0).getTime();
      return sortOrder === "desc" ? second - first : first - second;
    });
  }, [messages, searchTerm, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedMessages.length / ITEMS_PER_PAGE),
  );

  const paginatedMessages = filteredAndSortedMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <section>
          <div className="mx-auto w-full">
            <span className="text-indigo-700 font-light">
              Contact messages &rarr;
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Messages dashboard
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              Review incoming contact enquiries, search quickly, and open any
              conversation to reply.
            </p>
          </div>
        </section>

        <section className="pt-8 sm:pt-10">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-gray-900">
                  Incoming messages
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Search, sort, and manage all contact submissions in one place.
                </p>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                All Messages
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                />
              </div>

              <button
                onClick={toggleSortOrder}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
              >
                {sortOrder === "desc" ? (
                  <>
                    <FaSortAmountDown className="mr-2" />
                    Newest First
                  </>
                ) : (
                  <>
                    <FaSortAmountUp className="mr-2" />
                    Oldest First
                  </>
                )}
              </button>
            </div>

            {status.error && (
              <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {status.error}
              </div>
            )}

            {loading ? (
              <div className="mt-8 rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600 ring-1 ring-gray-200">
                Loading messages...
              </div>
            ) : paginatedMessages.length === 0 ? (
              <div className="mt-8 rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600 ring-1 ring-gray-200">
                No messages found.
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedMessages.map((msg) => (
                  <Link
                    to={`/reply-message/${msg._id}`}
                    key={msg._id}
                    className="group"
                  >
                    <div className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-200">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-indigo-50 p-3 text-indigo-700">
                          <FaEnvelope />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
                            {msg.message_text ||
                              msg.message ||
                              "No message text"}
                          </h3>

                          <div className="mt-4 space-y-2">
                            <p className="flex items-center text-sm text-gray-600">
                              <FaUser className="mr-2 text-indigo-600" />
                              <span className="truncate">
                                {msg.firstName} {msg.lastName}
                              </span>
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {msg.email}
                            </p>

                            <p className="flex items-center text-xs text-gray-500">
                              <FaClock className="mr-2 text-green-600" />
                              {formatDateTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && filteredAndSortedMessages.length > 0 && (
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
