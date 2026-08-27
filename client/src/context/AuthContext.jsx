import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import globalBackendRoute from "../config/Config";

const AuthContext = createContext(null);
const API_BASE_URL = `${globalBackendRoute}/api`;
const TOKEN_KEY = "travel_token";
const USER_KEY = "travel_user";
const SESSION_EXPIRED_KEY = "session_expired_message";
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const ACTIVITY_THROTTLE = 1000;
const TOKEN_REFRESH_BUFFER = 60 * 1000;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const normalizeText = (value = "") => String(value).trim();
const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || "";

const saveSession = (nextToken, nextUser) => {
  if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
  else localStorage.removeItem(TOKEN_KEY);
  if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  else localStorage.removeItem(USER_KEY);
};

const parseJwt = (token) => {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(window.atob(paddedBase64));
  } catch (error) {
    console.error("JWT PARSE ERROR:", error);
    return null;
  }
};

const getDashboardPathByRole = (role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();
  const dashboardRoutes = {
    accountant: "/accountant-dashboard",
    admin: "/admin-dashboard",
    alumni_relations: "/alumni-relations-dashboard",
    assistant_professor: "/assistant-professor-dashboard",
    professor: "/professor-dashboard",
    faculty: "/faculty-dashboard",
    teacher: "/teacher-dashboard",
    business_analyst: "/business-analyst-dashboard",
    content_creator: "/content-creator-dashboard",
    course_coordinator: "/course-coordinator-dashboard",
    customer_support: "/customer-support-dashboard",
    data_scientist: "/data-scientist-dashboard",
    dean: "/dean-dashboard",
    department_head: "/department-head-dashboard",
    hod: "/hod-dashboard",
    developer_lead: "/developer-lead-dashboard",
    developer: "/developer-dashboard",
    event_coordinator: "/event-coordinator-dashboard",
    exam_controller: "/exam-controller-dashboard",
    hr_manager: "/hr-manager-dashboard",
    hr: "/hr-dashboard",
    intern: "/intern-dashboard",
    legal_advisor: "/legal-advisor-dashboard",
    librarian: "/librarian-dashboard",
    maintenance_staff: "/maintenance-staff-dashboard",
    marketing_manager: "/marketing-manager-dashboard",
    operations_manager: "/operations-manager-dashboard",
    product_owner: "/product-owner-dashboard",
    project_manager: "/project-manager-dashboard",
    qa_lead: "/qa-lead-dashboard",
    recruiter: "/recruiter-dashboard",
    registrar: "/registrar-dashboard",
    researcher: "/researcher-dashboard",
    sales_executive: "/sales-executive-dashboard",
    student: "/student-dashboard",
    superadmin: "/super-admin-dashboard",
    support_engineer: "/support-engineer-dashboard",
    tech_lead: "/tech-lead-dashboard",
    test_engineer: "/test-engineer-dashboard",
    user: "/user-dashboard",
    ux_ui_designer: "/ux-ui-designer-dashboard",
  };
  return dashboardRoutes[normalizedRole] || "/login";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("USER STORAGE PARSE ERROR:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);
  const activityThrottleRef = useRef(null);
  const tokenRefreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const refreshSubscribersRef = useRef([]);
  const mountedRef = useRef(true);
  const lastActivityRef = useRef(Date.now());

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const clearActivityThrottle = useCallback(() => {
    if (activityThrottleRef.current) {
      clearTimeout(activityThrottleRef.current);
      activityThrottleRef.current = null;
    }
  }, []);

  const clearTokenRefreshTimer = useCallback(() => {
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearInactivityTimer();
    clearActivityThrottle();
    clearTokenRefreshTimer();
    refreshSubscribersRef.current.forEach((callback) => callback(""));
    refreshSubscribersRef.current = [];
    setUser(null);
    setToken("");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
  }, [clearInactivityTimer, clearActivityThrottle, clearTokenRefreshTimer]);

  const expireSession = useCallback(() => {
    clearInactivityTimer();
    clearActivityThrottle();
    clearTokenRefreshTimer();
    sessionStorage.setItem(
      SESSION_EXPIRED_KEY,
      "Your session has expired due to inactivity. Please login again.",
    );
    setUser(null);
    setToken("");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
    window.location.href = "/login";
  }, [clearInactivityTimer, clearActivityThrottle, clearTokenRefreshTimer]);

  const resetInactivityTimer = useCallback(() => {
    if (!getStoredToken()) return;
    lastActivityRef.current = Date.now();
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      expireSession();
    }, INACTIVITY_TIMEOUT);
  }, [clearInactivityTimer, expireSession]);

  const handleUserActivity = useCallback(() => {
    if (!getStoredToken()) return;
    lastActivityRef.current = Date.now();
    if (activityThrottleRef.current) return;
    activityThrottleRef.current = setTimeout(() => {
      activityThrottleRef.current = null;
      resetInactivityTimer();
    }, ACTIVITY_THROTTLE);
  }, [resetInactivityTimer]);

  const subscribeTokenRefresh = useCallback((callback) => {
    refreshSubscribersRef.current.push(callback);
  }, []);

  const onRefreshed = useCallback((newToken) => {
    refreshSubscribersRef.current.forEach((callback) => {
      try {
        callback(newToken);
      } catch (error) {
        console.error("AUTH REFRESH CALLBACK ERROR:", error);
      }
    });
    refreshSubscribersRef.current = [];
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (isRefreshingRef.current) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) resolve(newToken);
          else reject(new Error("Token refresh failed."));
        });
      });
    }

    isRefreshingRef.current = true;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/users/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      );

      const newToken =
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.access_token ||
        "";
      const newUser = res?.data?.user || null;

      if (!newToken) {
        throw new Error(
          "Refresh token request succeeded but no access token was returned.",
        );
      }

      saveSession(newToken, newUser || user);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      if (mountedRef.current) {
        setToken(newToken);
        if (newUser) setUser(newUser);
      }

      onRefreshed(newToken);
      return newToken;
    } catch (error) {
      onRefreshed("");
      throw error;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [user, subscribeTokenRefresh, onRefreshed]);

  const scheduleTokenRefresh = useCallback(
    (currentToken) => {
      clearTokenRefreshTimer();

      if (!currentToken) return;

      const decoded = parseJwt(currentToken);

      if (!decoded?.exp) return;

      const expiryTime = decoded.exp * 1000;
      const delay = Math.max(
        expiryTime - Date.now() - TOKEN_REFRESH_BUFFER,
        1000,
      );

      tokenRefreshTimerRef.current = setTimeout(async () => {
        const inactiveTime = Date.now() - lastActivityRef.current;

        if (inactiveTime >= INACTIVITY_TIMEOUT) {
          expireSession();
          return;
        }

        try {
          const newToken = await refreshAccessToken();
          scheduleTokenRefresh(newToken);
        } catch (error) {
          console.error(
            "AUTH AUTOMATIC REFRESH ERROR:",
            error?.response?.data || error?.message,
          );
          sessionStorage.setItem(
            SESSION_EXPIRED_KEY,
            "Your session has expired. Please login again.",
          );
          clearSession();
          window.location.href = "/login";
        }
      }, delay);
    },
    [clearTokenRefreshTimer, expireSession, refreshAccessToken, clearSession],
  );

  useEffect(() => {
    if (!token) {
      clearInactivityTimer();
      clearActivityThrottle();
      clearTokenRefreshTimer();
      return;
    }

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "touchmove",
      "click",
      "pointerdown",
      "wheel",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    lastActivityRef.current = Date.now();
    resetInactivityTimer();
    scheduleTokenRefresh(token);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      clearInactivityTimer();
      clearActivityThrottle();
      clearTokenRefreshTimer();
    };
  }, [
    token,
    handleUserActivity,
    resetInactivityTimer,
    scheduleTokenRefresh,
    clearInactivityTimer,
    clearActivityThrottle,
    clearTokenRefreshTimer,
  ]);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const storedToken = getStoredToken();

        if (storedToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${storedToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        const refreshedToken = response.headers?.["x-access-token"];

        if (refreshedToken) {
          setToken(refreshedToken);
          localStorage.setItem(TOKEN_KEY, refreshedToken);
          api.defaults.headers.common.Authorization = `Bearer ${refreshedToken}`;
          scheduleTokenRefresh(refreshedToken);
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) return Promise.reject(error);

        const status = error?.response?.status;
        const requestUrl = originalRequest?.url || "";
        const isLoginRequest = requestUrl.includes("/users/login");
        const isRegisterRequest = requestUrl.includes("/users/register");
        const isRefreshRequest = requestUrl.includes("/users/refresh-token");

        if (
          status === 401 &&
          !originalRequest._retry &&
          !isLoginRequest &&
          !isRegisterRequest &&
          !isRefreshRequest
        ) {
          const inactiveTime = Date.now() - lastActivityRef.current;

          if (inactiveTime >= INACTIVITY_TIMEOUT) {
            expireSession();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken();

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return api(originalRequest);
          } catch (refreshError) {
            sessionStorage.setItem(
              SESSION_EXPIRED_KEY,
              "Your session has expired. Please login again.",
            );
            clearSession();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAccessToken, clearSession, expireSession, scheduleTokenRefresh]);

  useEffect(() => {
    mountedRef.current = true;

    const bootstrap = async () => {
      try {
        const storedToken = getStoredToken();

        if (!storedToken) {
          setLoading(false);
          return;
        }

        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

        const res = await api.get("/users/me");
        const nextUser = res?.data?.user || null;
        const responseToken = res?.headers?.["x-access-token"] || storedToken;

        if (!mountedRef.current) return;

        setUser(nextUser);
        setToken(responseToken);
        saveSession(responseToken, nextUser);
        api.defaults.headers.common.Authorization = `Bearer ${responseToken}`;
        lastActivityRef.current = Date.now();
        resetInactivityTimer();
        scheduleTokenRefresh(responseToken);
      } catch (error) {
        try {
          const inactiveTime = Date.now() - lastActivityRef.current;

          if (inactiveTime >= INACTIVITY_TIMEOUT) {
            expireSession();
            return;
          }

          const newToken = await refreshAccessToken();

          if (mountedRef.current) {
            setToken(newToken);
            lastActivityRef.current = Date.now();
            resetInactivityTimer();
            scheduleTokenRefresh(newToken);
          }
        } catch (refreshError) {
          console.error(
            "AUTH REFRESH FAILED:",
            refreshError?.response?.data || refreshError?.message,
          );
          clearSession();
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      mountedRef.current = false;
      clearInactivityTimer();
      clearActivityThrottle();
      clearTokenRefreshTimer();
    };
  }, [
    refreshAccessToken,
    resetInactivityTimer,
    clearSession,
    expireSession,
    scheduleTokenRefresh,
    clearInactivityTimer,
    clearActivityThrottle,
    clearTokenRefreshTimer,
  ]);

  const register = async (payload) => {
    const sanitizedPayload = {
      fullName: normalizeText(payload?.fullName),
      email: normalizeEmail(payload?.email),
      password: String(payload?.password || ""),
    };

    const res = await api.post("/users/register", sanitizedPayload);
    const nextUser = res?.data?.user || null;
    const nextToken =
      res?.data?.token ||
      res?.data?.accessToken ||
      res?.data?.access_token ||
      "";

    if (!nextToken) {
      throw new Error(
        "Registration succeeded but backend did not return an authentication token.",
      );
    }

    setUser(nextUser);
    setToken(nextToken);
    saveSession(nextToken, nextUser);
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    lastActivityRef.current = Date.now();
    resetInactivityTimer();
    scheduleTokenRefresh(nextToken);

    return res.data;
  };

  const login = async (payload) => {
    const sanitizedPayload = {
      email: normalizeEmail(payload?.email),
      password: String(payload?.password || ""),
    };

    const res = await api.post("/users/login", sanitizedPayload);
    const nextUser = res?.data?.user || null;
    const nextToken =
      res?.data?.token ||
      res?.data?.accessToken ||
      res?.data?.access_token ||
      "";

    if (!nextToken) {
      throw new Error(
        "Login succeeded, but the server did not return an authentication token.",
      );
    }

    setUser(nextUser);
    setToken(nextToken);
    saveSession(nextToken, nextUser);
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    lastActivityRef.current = Date.now();
    resetInactivityTimer();
    scheduleTokenRefresh(nextToken);
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);

    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.warn(
        "LOGOUT API ERROR:",
        error?.response?.data || error?.message,
      );
    } finally {
      clearSession();
    }
  };

  const forgotPassword = async (email) => {
    const res = await api.post("/users/forgot-password", {
      email: normalizeEmail(email),
    });
    return res.data;
  };

  const resetPassword = async (tokenValue, password) => {
    const res = await api.put(`/users/reset-password/${tokenValue}`, {
      password: String(password || ""),
    });
    return res.data;
  };

  const fetchProfile = async () => {
    const res = await api.get("/users/me");
    const nextUser = res?.data?.user || null;
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  const updateProfile = async (payload) => {
    const res = await api.put("/users/update-profile", payload);
    const nextUser = res?.data?.user || null;
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    return res.data;
  };

  const getAllUsers = async () => {
    const res = await api.get("/users/all-users");
    return res?.data?.users || [];
  };

  const updateUserRole = async (id, role) => {
    const res = await api.put(`/users/update-role/${id}`, {
      role: normalizeText(role).toLowerCase(),
    });
    return res.data;
  };

  const value = useMemo(
    () => ({
      api,
      user,
      token,
      loading,
      authLoading: loading,
      isAuthenticated: !!token,
      register,
      login,
      logout,
      forgotPassword,
      resetPassword,
      fetchProfile,
      updateProfile,
      getAllUsers,
      updateUserRole,
      getDashboardPathByRole,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const PrivateRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated &&
    String(user?.role || "").toLowerCase() === "superadmin" ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};

export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = String(user?.role || "")
    .trim()
    .toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).trim().toLowerCase(),
  );

  if (!normalizedAllowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated, user, getDashboardPathByRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to={getDashboardPathByRole(user?.role)} replace />
  ) : (
    children
  );
};
