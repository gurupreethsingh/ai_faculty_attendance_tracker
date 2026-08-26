import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaClock,
  FaEnvelope,
  FaEye,
  FaReply,
  FaTrash,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

export const singleReplyHero = {
  heroTitle: "",
  heroSubtitle: "",
  showHero: true,
};

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export default function SingleReply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState({
    error: "",
    success: "",
    info: "",
  });

  const fetchSingleMessage = async () => {
    try {
      setLoading(true);
      setStatus({ error: "", success: "", info: "" });

      const response = await api.get(`/contact/single-message/${id}`);

      const fetchedMessage =
        response?.data?.message ||
        response?.data?.contactMessage ||
        response?.data?.data ||
        response?.data ||
        null;

      setMessage(fetchedMessage);
    } catch (error) {
      console.error("Failed to load single reply thread:", error);
      setStatus({
        error:
          error?.response?.data?.message ||
          "Failed to load reply thread details.",
        success: "",
        info: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSingleMessage();
    }
  }, [id]);

  const sortedReplies = useMemo(() => {
    if (!Array.isArray(message?.replies)) return [];
    return [...message.replies].sort(
      (a, b) => new Date(b?.timestamp || 0) - new Date(a?.timestamp || 0),
    );
  }, [message]);

  const handleDeleteMessage = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message thread?",
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setStatus({ error: "", success: "", info: "" });

      await api.delete(`/contact/delete-message/${id}`);

      setStatus({
        error: "",
        success: "Message thread deleted successfully.",
        info: "",
      });

      setTimeout(() => {
        navigate("/all-replies");
      }, 800);
    } catch (error) {
      console.error("Delete thread failed:", error);
      setStatus({
        error:
          error?.response?.data?.message ||
          "Failed to delete this thread. Make sure the backend delete route exists.",
        success: "",
        info: "",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <p className="text-sm text-gray-500">Loading reply thread...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!message) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <p className="text-sm text-red-600">
              {status.error || "Reply thread not found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/all-replies")}
              className="mt-4 inline-flex items-center rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              <FaArrowLeft className="mr-2" />
              Back to All Replies
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <section>
          <div className="mx-auto w-full">
            <span className="font-light text-indigo-700">
              Contact replies &rarr;
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Single reply thread
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              Detailed enterprise view of one message thread, including original
              message, full reply history, metadata, and management actions.
            </p>
          </div>
        </section>

        <section className="pt-8 sm:pt-10">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-gray-900">
                  Thread details
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Inspect the original enquiry and every reply in one dedicated
                  workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Thread ID: {message?._id}
                </span>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Replies: {sortedReplies.length}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    sortedReplies.length > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {sortedReplies.length > 0 ? "Replied" : "Pending"}
                </span>
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

            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-indigo-50 p-3 text-indigo-700">
                      <FaEnvelope />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Original message
                      </h3>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaUser className="text-indigo-600" />
                          <span>
                            {message.firstName || ""}
                            {message.firstName || message.lastName ? " " : ""}
                            {message.lastName || ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaClock className="text-green-600" />
                          <span>{formatDateTime(message.createdAt)}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">
                          Email:{" "}
                        </span>
                        {message.email || "N/A"}
                      </div>

                      {message.phone && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">
                            Phone:{" "}
                          </span>
                          {message.phone}
                        </div>
                      )}

                      <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-4 text-sm leading-7 text-gray-800 ring-1 ring-gray-200">
                        {message.message_text ||
                          message.message ||
                          "No message text found."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                  <div className="flex items-center gap-2">
                    <FaReply className="text-indigo-700" />
                    <h3 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                      Reply timeline
                    </h3>
                  </div>

                  {sortedReplies.length === 0 ? (
                    <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600 ring-1 ring-gray-200">
                      No replies found for this thread.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {sortedReplies.map((reply, index) => (
                        <div
                          key={`${reply?._id || reply?.timestamp || "reply"}-${index}`}
                          className="rounded-2xl border border-gray-200 bg-white p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-2">
                              <FaUserCircle className="text-indigo-700" />
                              <span className="font-semibold text-gray-800">
                                {reply?.name || "Admin"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaClock className="text-green-600" />
                              <span>{formatDateTime(reply?.timestamp)}</span>
                            </div>
                          </div>

                          {reply?.email && (
                            <p className="mt-2 text-xs text-gray-500">
                              {reply.email}
                            </p>
                          )}

                          <div className="mt-3 rounded-xl border-l-4 border-indigo-600 bg-indigo-50/40 px-4 py-3 text-sm leading-7 text-gray-700">
                            {reply?.message || ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="xl:col-span-1">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                  <div className="flex items-center gap-2">
                    <FaEye className="text-indigo-700" />
                    <h3 className="text-base font-semibold text-gray-900">
                      Quick summary
                    </h3>
                  </div>

                  <div className="mt-5 space-y-4 text-sm text-gray-600">
                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Sender
                      </p>
                      <p className="mt-2 font-medium text-gray-900">
                        {message.firstName || ""}
                        {message.firstName || message.lastName ? " " : ""}
                        {message.lastName || ""}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Email
                      </p>
                      <p className="mt-2 break-all font-medium text-gray-900">
                        {message.email || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Created At
                      </p>
                      <p className="mt-2 font-medium text-gray-900">
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Latest Reply
                      </p>
                      <p className="mt-2 font-medium text-gray-900">
                        {sortedReplies.length > 0
                          ? formatDateTime(sortedReplies[0]?.timestamp)
                          : "N/A"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total Replies
                      </p>
                      <p className="mt-2 font-medium text-gray-900">
                        {sortedReplies.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() => navigate("/all-replies")}
                      className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50"
                    >
                      <FaArrowLeft className="mr-2" />
                      Back to All Replies
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteMessage}
                      disabled={actionLoading}
                      className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaTrash className="mr-2" />
                      Delete Thread
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
