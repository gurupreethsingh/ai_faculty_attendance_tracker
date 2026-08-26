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

// =====================================================
// LOCAL STORAGE / SESSION STORAGE KEYS
// =====================================================

const TOKEN_KEY = "travel_token";
const USER_KEY = "travel_user";

const SESSION_EXPIRED_KEY = "session_expired_message";

// =====================================================
// SESSION SETTINGS
// =====================================================

// 15 minutes of user inactivity
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

// Check activity only at most once every 1 second.
// This prevents mouse movement from continuously
// resetting React state / timers.
const ACTIVITY_THROTTLE = 1000;

// =====================================================
// AXIOS INSTANCE
// =====================================================

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// HELPERS
// =====================================================

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const normalizeText = (value = "") => String(value).trim();

// =====================================================
// JWT PARSER
// =====================================================

const parseJwt = (token) => {
  try {
    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedBase64 =
      base64 +
      "=".repeat((4 - (base64.length % 4)) % 4);

    return JSON.parse(window.atob(paddedBase64));
  } catch (error) {
    console.error("JWT PARSE ERROR:", error);

    return null;
  }
};

// =====================================================
// GET TOKEN FROM STORAGE
// =====================================================

const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY) || "";
};

// =====================================================
// SAVE SESSION
// =====================================================

const saveSession = (nextToken, nextUser) => {
  if (nextToken) {
    localStorage.setItem(TOKEN_KEY, nextToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (nextUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

// =====================================================
// DASHBOARD ROUTES
// =====================================================

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

// =====================================================
// AUTH PROVIDER
// =====================================================

export const AuthProvider = ({ children }) => {
  // ===================================================
  // USER
  // ===================================================

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("USER STORAGE PARSE ERROR:", error);

      return null;
    }
  });

  // ===================================================
  // TOKEN
  // ===================================================

  const [token, setToken] = useState(() => {
    return getStoredToken();
  });

  // ===================================================
  // AUTH LOADING
  // ===================================================

  const [loading, setLoading] = useState(true);

  // ===================================================
  // REFS
  // ===================================================

  const inactivityTimerRef = useRef(null);

  const activityThrottleRef = useRef(null);

  const isRefreshingRef = useRef(false);

  const refreshSubscribersRef = useRef([]);

  const mountedRef = useRef(true);

  // ===================================================
  // CLEAR INACTIVITY TIMER
  // ===================================================

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);

      inactivityTimerRef.current = null;
    }
  }, []);

  // ===================================================
  // CLEAR ACTIVITY THROTTLE
  // ===================================================

  const clearActivityThrottle = useCallback(() => {
    if (activityThrottleRef.current) {
      clearTimeout(activityThrottleRef.current);

      activityThrottleRef.current = null;
    }
  }, []);

  // ===================================================
  // CLEAR SESSION
  // ===================================================

  const clearSession = useCallback(() => {
    console.log("AUTH: Clearing session.");

    clearInactivityTimer();

    clearActivityThrottle();

    setUser(null);

    setToken("");

    localStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(USER_KEY);

    delete api.defaults.headers.common.Authorization;
  }, [
    clearInactivityTimer,
    clearActivityThrottle,
  ]);

  // ===================================================
  // SESSION EXPIRED
  // ===================================================

  const expireSession = useCallback(() => {
    console.log(
      "AUTH: Session expired because of inactivity."
    );

    clearInactivityTimer();

    clearActivityThrottle();

    sessionStorage.setItem(
      SESSION_EXPIRED_KEY,
      "Your session has expired due to inactivity. Please login again."
    );

    setUser(null);

    setToken("");

    localStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(USER_KEY);

    delete api.defaults.headers.common.Authorization;

    window.location.href = "/login";
  }, [
    clearInactivityTimer,
    clearActivityThrottle,
  ]);

  // ===================================================
  // RESET INACTIVITY TIMER
  // ===================================================

  const resetInactivityTimer = useCallback(() => {
    if (!getStoredToken()) {
      return;
    }

    clearInactivityTimer();

    inactivityTimerRef.current = setTimeout(() => {
      expireSession();
    }, INACTIVITY_TIMEOUT);
  }, [
    clearInactivityTimer,
    expireSession,
  ]);

  // ===================================================
  // USER ACTIVITY HANDLER
  // ===================================================

  const handleUserActivity = useCallback(() => {
    if (!getStoredToken()) {
      return;
    }

    // Prevent extremely frequent timer resets.
    if (activityThrottleRef.current) {
      return;
    }

    activityThrottleRef.current = setTimeout(() => {
      activityThrottleRef.current = null;

      resetInactivityTimer();
    }, ACTIVITY_THROTTLE);
  }, [resetInactivityTimer]);

  // ===================================================
  // ACTIVITY LISTENER
  // ===================================================

  useEffect(() => {
    if (!token) {
      clearInactivityTimer();

      clearActivityThrottle();

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
      window.addEventListener(
        eventName,
        handleUserActivity,
        { passive: true }
      );
    });

    // Start timer immediately after authentication.
    resetInactivityTimer();

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(
          eventName,
          handleUserActivity
        );
      });

      clearInactivityTimer();

      clearActivityThrottle();
    };
  }, [
    token,
    handleUserActivity,
    resetInactivityTimer,
    clearInactivityTimer,
    clearActivityThrottle,
  ]);

  // ===================================================
  // UPDATE AXIOS AUTHORIZATION HEADER
  // ===================================================

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization =
        `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // ===================================================
  // TOKEN REFRESH SUBSCRIBERS
  // ===================================================

  const subscribeTokenRefresh = useCallback(
    (callback) => {
      refreshSubscribersRef.current.push(callback);
    },
    []
  );

  // ===================================================
  // TOKEN REFRESH COMPLETED
  // ===================================================

  const onRefreshed = useCallback((newToken) => {
    refreshSubscribersRef.current.forEach(
      (callback) => {
        try {
          callback(newToken);
        } catch (error) {
          console.error(
            "AUTH REFRESH CALLBACK ERROR:",
            error
          );
        }
      }
    );

    refreshSubscribersRef.current = [];
  }, []);

  // ===================================================
  // REFRESH ACCESS TOKEN
  // ===================================================

  const refreshAccessToken = useCallback(async () => {
    console.log(
      "AUTH: Trying to refresh access token..."
    );

    const res = await axios.post(
      `${API_BASE_URL}/users/refresh-token`,
      {},
      {
        withCredentials: true,
      }
    );

    console.log(
      "AUTH: Refresh response:",
      res.data
    );

    const newToken =
      res?.data?.token ||
      res?.data?.accessToken ||
      res?.data?.access_token ||
      "";

    const newUser = res?.data?.user || null;

    if (!newToken) {
      throw new Error(
        "Refresh token request succeeded but no access token was returned."
      );
    }

    if (!mountedRef.current) {
      return newToken;
    }

    setToken(newToken);

    if (newUser) {
      setUser(newUser);
    }

    saveSession(
      newToken,
      newUser || user
    );

    api.defaults.headers.common.Authorization =
      `Bearer ${newToken}`;

    // IMPORTANT:
    // A successful token refresh means the session is
    // still valid. However, the inactivity timer is
    // still controlled by actual user activity.
    resetInactivityTimer();

    return newToken;
  }, [
    resetInactivityTimer,
    user,
  ]);

  // ===================================================
  // AXIOS INTERCEPTORS
  // ===================================================

  useEffect(() => {
    const requestInterceptor =
      api.interceptors.request.use(
        (config) => {
          const storedToken =
            getStoredToken();

          if (storedToken) {
            config.headers =
              config.headers || {};

            config.headers.Authorization =
              `Bearer ${storedToken}`;

            console.log(
              "API REQUEST:",
              config.method?.toUpperCase(),
              config.url,
              "Authorization: PRESENT"
            );
          } else {
            console.log(
              "API REQUEST:",
              config.method?.toUpperCase(),
              config.url,
              "Authorization: MISSING"
            );
          }

          return config;
        },
        (error) => Promise.reject(error)
      );

    const responseInterceptor =
      api.interceptors.response.use(
        (response) => response,

        async (error) => {
          const originalRequest =
            error.config;

          if (!originalRequest) {
            return Promise.reject(error);
          }

          const status =
            error?.response?.status;

          const requestUrl =
            originalRequest?.url || "";

          const isLoginRequest =
            requestUrl.includes(
              "/users/login"
            );

          const isRegisterRequest =
            requestUrl.includes(
              "/users/register"
            );

          const isRefreshRequest =
            requestUrl.includes(
              "/users/refresh-token"
            );

          // =============================================
          // HANDLE 401
          // =============================================

          if (
            status === 401 &&
            !originalRequest._retry &&
            !isLoginRequest &&
            !isRegisterRequest &&
            !isRefreshRequest
          ) {
            // ===========================================
            // REFRESH ALREADY RUNNING
            // ===========================================

            if (isRefreshingRef.current) {
              return new Promise(
                (resolve, reject) => {
                  subscribeTokenRefresh(
                    (newToken) => {
                      if (!newToken) {
                        reject(
                          new Error(
                            "Token refresh failed."
                          )
                        );

                        return;
                      }

                      try {
                        originalRequest.headers =
                          originalRequest.headers ||
                          {};

                        originalRequest.headers.Authorization =
                          `Bearer ${newToken}`;

                        resolve(
                          api(originalRequest)
                        );
                      } catch (err) {
                        reject(err);
                      }
                    }
                  );
                }
              );
            }

            // ===========================================
            // START REFRESH
            // ===========================================

            originalRequest._retry = true;

            isRefreshingRef.current = true;

            try {
              const newToken =
                await refreshAccessToken();

              onRefreshed(newToken);

              originalRequest.headers =
                originalRequest.headers ||
                {};

              originalRequest.headers.Authorization =
                `Bearer ${newToken}`;

              return api(
                originalRequest
              );
            } catch (refreshError) {
              console.error(
                "AUTH: Token refresh failed:",
                refreshError?.response?.data ||
                  refreshError?.message
              );

              onRefreshed("");

              clearSession();

              sessionStorage.setItem(
                SESSION_EXPIRED_KEY,
                "Your session has expired. Please login again."
              );

              window.location.href =
                "/login";

              return Promise.reject(
                refreshError
              );
            } finally {
              isRefreshingRef.current =
                false;
            }
          }

          return Promise.reject(error);
        }
      );

    return () => {
      api.interceptors.request.eject(
        requestInterceptor
      );

      api.interceptors.response.eject(
        responseInterceptor
      );
    };
  }, [
    refreshAccessToken,
    subscribeTokenRefresh,
    onRefreshed,
    clearSession,
  ]);

  // ===================================================
  // BOOTSTRAP AUTHENTICATION
  // ===================================================

  useEffect(() => {
    mountedRef.current = true;

    const bootstrap = async () => {
      console.log(
        "================================="
      );

      console.log(
        "AUTH BOOTSTRAP"
      );

      console.log(
        "================================="
      );

      try {
        const storedToken =
          getStoredToken();

        console.log(
          "Stored token:",
          storedToken
            ? "FOUND"
            : "NOT FOUND"
        );

        // -----------------------------------------------
        // NO TOKEN
        // -----------------------------------------------

        if (!storedToken) {
          setLoading(false);

          return;
        }

        // -----------------------------------------------
        // SET AXIOS TOKEN
        // -----------------------------------------------

        api.defaults.headers.common.Authorization =
          `Bearer ${storedToken}`;

        // -----------------------------------------------
        // VERIFY CURRENT USER
        // -----------------------------------------------

        const res =
          await api.get("/users/me");

        const nextUser =
          res?.data?.user || null;

        console.log(
          "AUTH BOOTSTRAP USER:",
          nextUser
        );

        if (!mountedRef.current) {
          return;
        }

        setUser(nextUser);

        setToken(storedToken);

        saveSession(
          storedToken,
          nextUser
        );

        // Start inactivity timer.
        resetInactivityTimer();
      } catch (error) {
        console.error(
          "AUTH BOOTSTRAP ERROR:",
          error?.response?.data ||
            error?.message
        );

        // ---------------------------------------------
        // TRY REFRESH TOKEN
        // ---------------------------------------------

        try {
          const newToken =
            await refreshAccessToken();

          if (mountedRef.current) {
            setToken(newToken);
          }
        } catch (refreshError) {
          console.error(
            "AUTH REFRESH FAILED:",
            refreshError?.response?.data ||
              refreshError?.message
          );

          clearSession();
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mountedRef.current = false;

      clearInactivityTimer();

      clearActivityThrottle();
    };
  }, [
    refreshAccessToken,
    resetInactivityTimer,
    clearSession,
    clearInactivityTimer,
    clearActivityThrottle,
  ]);

  // ===================================================
  // REGISTER
  // ===================================================

  const register = async (payload) => {
    const sanitizedPayload = {
      fullName: normalizeText(
        payload?.fullName
      ),

      email: normalizeEmail(
        payload?.email
      ),

      password: String(
        payload?.password || ""
      ),
    };

    const res = await api.post(
      "/users/register",
      sanitizedPayload
    );

    console.log(
      "REGISTER RESPONSE:",
      res.data
    );

    const nextUser =
      res?.data?.user || null;

    const nextToken =
      res?.data?.token ||
      res?.data?.accessToken ||
      res?.data?.access_token ||
      "";

    if (!nextToken) {
      throw new Error(
        "Registration succeeded but backend did not return an authentication token."
      );
    }

    setUser(nextUser);

    setToken(nextToken);

    saveSession(
      nextToken,
      nextUser
    );

    api.defaults.headers.common.Authorization =
      `Bearer ${nextToken}`;

    resetInactivityTimer();

    return res.data;
  };

  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (payload) => {
    const sanitizedPayload = {
      email: normalizeEmail(
        payload?.email
      ),

      password: String(
        payload?.password || ""
      ),
    };

    console.log(
      "================================="
    );

    console.log("LOGIN");

    console.log(
      "Email:",
      sanitizedPayload.email
    );

    console.log(
      "================================="
    );

    const res = await api.post(
      "/users/login",
      sanitizedPayload
    );

    console.log(
      "LOGIN RESPONSE:",
      res.data
    );

    const nextUser =
      res?.data?.user || null;

    const nextToken =
      res?.data?.token ||
      res?.data?.accessToken ||
      res?.data?.access_token ||
      "";

    console.log(
      "LOGIN TOKEN:",
      nextToken
        ? "FOUND"
        : "MISSING"
    );

    if (!nextToken) {
      console.error(
        "LOGIN ERROR: Backend login response does not contain token.",
        res.data
      );

      throw new Error(
        "Login succeeded, but the server did not return an authentication token."
      );
    }

    // ===============================================
    // SAVE USER + TOKEN
    // ===============================================

    setUser(nextUser);

    setToken(nextToken);

    saveSession(
      nextToken,
      nextUser
    );

    // ===============================================
    // SET AXIOS AUTHORIZATION
    // ===============================================

    api.defaults.headers.common.Authorization =
      `Bearer ${nextToken}`;

    // ===============================================
    // RESET INACTIVITY TIMER
    // ===============================================

    resetInactivityTimer();

    // ===============================================
    // REMOVE OLD SESSION MESSAGE
    // ===============================================

    sessionStorage.removeItem(
      SESSION_EXPIRED_KEY
    );

    console.log(
      "AUTH: Token saved to localStorage."
    );

    console.log(
      "AUTH: Authorization header configured."
    );

    return res.data;
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = async () => {
    try {
      await api.post(
        "/users/logout"
      );
    } catch (error) {
      console.warn(
        "LOGOUT API ERROR:",
        error?.response?.data ||
          error?.message
      );
    } finally {
      clearSession();
    }
  };

  // ===================================================
  // FORGOT PASSWORD
  // ===================================================

  const forgotPassword = async (
    email
  ) => {
    const res = await api.post(
      "/users/forgot-password",
      {
        email: normalizeEmail(email),
      }
    );

    return res.data;
  };

  // ===================================================
  // RESET PASSWORD
  // ===================================================

  const resetPassword = async (
    tokenValue,
    password
  ) => {
    const res = await api.put(
      `/users/reset-password/${tokenValue}`,
      {
        password: String(
          password || ""
        ),
      }
    );

    return res.data;
  };

  // ===================================================
  // FETCH PROFILE
  // ===================================================

  const fetchProfile = async () => {
    const res =
      await api.get("/users/me");

    const nextUser =
      res?.data?.user || null;

    setUser(nextUser);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(nextUser)
    );

    return nextUser;
  };

  // ===================================================
  // UPDATE PROFILE
  // ===================================================

  const updateProfile = async (
    payload
  ) => {
    const res =
      await api.put(
        "/users/update-profile",
        payload
      );

    const nextUser =
      res?.data?.user || null;

    setUser(nextUser);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(nextUser)
    );

    return res.data;
  };

  // ===================================================
  // GET ALL USERS
  // ===================================================

  const getAllUsers = async () => {
    const res =
      await api.get(
        "/users/all-users"
      );

    return (
      res?.data?.users || []
    );
  };

  // ===================================================
  // UPDATE USER ROLE
  // ===================================================

  const updateUserRole = async (
    id,
    role
  ) => {
    const res =
      await api.put(
        `/users/update-role/${id}`,
        {
          role: normalizeText(
            role
          ).toLowerCase(),
        }
      );

    return res.data;
  };

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

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
    [
      user,
      token,
      loading,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// USE AUTH
// =====================================================

export const useAuth = () =>
  useContext(AuthContext);

// =====================================================
// PRIVATE ROUTE
// =====================================================

export const PrivateRoute = ({
  children,
}) => {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
};

// =====================================================
// ADMIN ROUTE
// =====================================================

export const AdminRoute = ({
  children,
}) => {
  const {
    loading,
    isAuthenticated,
    user,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated &&
    String(
      user?.role || ""
    ).toLowerCase() ===
      "superadmin" ? (
    children
  ) : (
    <Navigate
      to="/"
      replace
    />
  );
};

// =====================================================
// ROLE ROUTE
// =====================================================

export const RoleRoute = ({
  children,
  allowedRoles = [],
}) => {
  const {
    loading,
    isAuthenticated,
    user,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const currentRole =
    String(user?.role || "")
      .trim()
      .toLowerCase();

  const normalizedAllowedRoles =
    allowedRoles.map((role) =>
      String(role)
        .trim()
        .toLowerCase()
    );

  if (
    !normalizedAllowedRoles.includes(
      currentRole
    )
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

// =====================================================
// PUBLIC ROUTE
// =====================================================

export const PublicRoute = ({
  children,
}) => {
  const {
    loading,
    isAuthenticated,
    user,
    getDashboardPathByRole,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate
      to={getDashboardPathByRole(
        user?.role
      )}
      replace
    />
  ) : (
    children
  );
};