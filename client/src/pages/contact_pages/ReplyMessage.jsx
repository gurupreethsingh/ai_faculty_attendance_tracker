import React, { useEffect, useMemo, useState } from "react";
import {
  FaEnvelope,
  FaUser,
  FaClock,
  FaReply,
  FaCommentDots,
  FaUserCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../managers/AuthManager";

export const replyMessageHero = {
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

export default function ReplyMessage({ setUnreadMessagesCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();

  const [message, setMessage] = useState(null);
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({
    ok: false,
    error: "",
    info: "",
  });

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        setStatus({ ok: false, error: "", info: "" });

        const response = await api.get(`/contact/single-message/${id}`);
        const fetchedMessage =
          response?.data?.message ||
          response?.data?.contactMessage ||
          response?.data?.data ||
          response?.data ||
          null;

        setMessage(fetchedMessage);
        setReplies(
          Array.isArray(fetchedMessage?.replies) ? fetchedMessage.replies : [],
        );

        try {
          if (!fetchedMessage?.isRead) {
            await api.patch(`/contact/mark-as-read/${id}`, {});
            if (typeof setUnreadMessagesCount === "function") {
              setUnreadMessagesCount((prevCount) =>
                Math.max((prevCount || 0) - 1, 0),
              );
            }
          }
        } catch (markError) {
          console.error("Error marking message as read:", markError);
        }
      } catch (error) {
        console.error("Error fetching message:", error);
        setStatus({
          ok: false,
          info: "",
          error:
            error?.response?.data?.message || "Failed to load message details.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMessage();
    }
  }, [api, id, setUnreadMessagesCount]);

  const sortedReplies = useMemo(() => {
    return [...replies].sort(
      (a, b) => new Date(b?.timestamp || 0) - new Date(a?.timestamp || 0),
    );
  }, [replies]);

  const handleReply = async () => {
    const trimmedReply = reply.trim();

    if (!trimmedReply) {
      setStatus({
        ok: false,
        info: "",
        error: "Please enter a reply before sending.",
      });
      return;
    }

    try {
      setSending(true);
      setStatus({ ok: false, error: "", info: "" });

      const replyPayload = {
        name:
          user?.name ||
          user?.fullName ||
          user?.firstName ||
          user?.username ||
          "Super Admin",
        email: user?.email || "admin@example.com",
        message: trimmedReply,
      };

      const response = await api.post(
        `/contact/reply-message/${id}`,
        replyPayload,
      );

      const updatedMessage =
        response?.data?.contactMessage ||
        response?.data?.message ||
        response?.data?.data ||
        null;

      if (updatedMessage) {
        setMessage(updatedMessage);
        setReplies(
          Array.isArray(updatedMessage.replies) ? updatedMessage.replies : [],
        );
      } else {
        setReplies((prev) => [
          {
            ...replyPayload,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

      setReply("");
      setStatus({
        ok: true,
        error: "",
        info: response?.data?.message || "Reply sent successfully.",
      });
    } catch (error) {
      console.error("Error sending reply:", error);
      setStatus({
        ok: false,
        info: "",
        error:
          error?.response?.data?.message ||
          "Failed to send reply. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <p className="text-sm text-gray-500">Loading message details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!message) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-900/10">
            <p className="text-sm text-red-600">
              {status.error || "Message not found."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <section>
          <div className="mx-auto w-full">
            <span className="font-light text-indigo-700">
              Contact replies &rarr;
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Reply to message
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              Review the original enquiry, check previous replies, and respond
              from one clean workspace.
            </p>
          </div>
        </section>

        <section className="pt-8 sm:pt-10">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10 sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-gray-900">
                  Message thread
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  View sender details, reply history, and send a new response.
                </p>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Contact Reply
              </span>
            </div>

            {status.error && (
              <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {status.error}
              </div>
            )}

            {status.ok && (
              <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
                {status.info || "Reply sent successfully."}
              </div>
            )}

            {!status.ok && status.info && (
              <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
                {status.info}
              </div>
            )}

            <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
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
                        {message.firstName} {message.lastName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaClock className="text-indigo-600" />
                      <span>{formatDateTime(message.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Email: </span>
                    {message.email}
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
                    {message.message_text || message.message || ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-2">
                <FaReply className="text-indigo-700" />
                <h3 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                  Previous replies
                </h3>
              </div>

              {sortedReplies.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600 ring-1 ring-gray-200">
                  No replies yet.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {sortedReplies.map((eachReply, index) => (
                    <div
                      key={`${eachReply?._id || eachReply?.timestamp || "reply"}-${index}`}
                      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/10"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                          <FaUserCircle className="text-indigo-700" />
                          <span className="font-semibold text-gray-800">
                            {eachReply?.name || "Admin"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FaClock className="text-green-600" />
                          <span>{formatDateTime(eachReply?.timestamp)}</span>
                        </div>
                      </div>

                      {eachReply?.email && (
                        <p className="mt-2 text-xs text-gray-500">
                          {eachReply.email}
                        </p>
                      )}

                      <p className="mt-3 border-l-4 border-indigo-600 pl-4 text-sm leading-7 text-gray-700">
                        {eachReply?.message || ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/10">
              <div className="flex items-center gap-2">
                <FaCommentDots className="text-indigo-700" />
                <h3 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                  Write your reply
                </h3>
              </div>

              <p className="mt-2 text-sm leading-7 text-gray-600">
                Keep the response clear, professional, and action-oriented.
              </p>

              <textarea
                className="mt-4 min-h-[140px] w-full rounded-2xl bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  if (status.error || status.info || status.ok) {
                    setStatus({ ok: false, error: "", info: "" });
                  }
                }}
                placeholder="Type your reply here..."
              />

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  This reply will be stored in the message conversation history.
                </p>

                <button
                  type="button"
                  onClick={handleReply}
                  disabled={sending}
                  className="inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                >
                  <FaReply className="mr-2" />
                  {sending ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-xs text-indigo-900 hover:text-indigo-700"
              >
                <FaArrowLeft className="text-indigo-700" />
                <span>Go back to previous page</span>
              </button>

              <div className="text-xs text-gray-500">
                Thread ID:{" "}
                <span className="font-medium text-gray-700">{id}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
