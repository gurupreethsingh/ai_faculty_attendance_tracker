import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import globalBackendRoute from "../config/Config";

const AuthContext = createContext(null);
const API_BASE_URL = `${globalBackendRoute}/api`;
const TOKEN_KEY = "travel_token";
const USER_KEY = "travel_user";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const normalizeText = (value = "") => String(value).trim();
const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || "";

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

  const clearSession = useCallback(() => {
    setUser(null);
    setToken("");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
  }, []);

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

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = getStoredToken();
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("STORED USER ERROR:", error);
        }
      }

      try {
        const res = await api.get("/users/me");
        const nextUser = res?.data?.user || null;

        if (nextUser) {
          setUser(nextUser);
          localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        }

        setToken(storedToken);
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      } catch (error) {
        console.error(
          "AUTH BOOTSTRAP ERROR:",
          error?.response?.data || error?.message,
        );

        setToken(storedToken);

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (parseError) {
            console.error("STORED USER RESTORE ERROR:", parseError);
          }
        }

        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const register = useCallback(async (payload) => {
    const sanitizedPayload = {
      fullName: normalizeText(payload?.fullName),
      email: normalizeEmail(payload?.email),
      password: String(payload?.password || ""),
    };

    const res = await api.post("/users/register", sanitizedPayload);

    const nextUser = res?.data?.user || null;
    const nextToken = res?.data?.token || "";

    if (!nextToken) {
      throw new Error(
        "Registration succeeded but authentication token was not returned.",
      );
    }

    setUser(nextUser);
    setToken(nextToken);
    saveSession(nextToken, nextUser);
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;

    return res.data;
  }, []);

  const login = useCallback(async (payload) => {
    const sanitizedPayload = {
      email: normalizeEmail(payload?.email),
      password: String(payload?.password || ""),
    };

    const res = await api.post("/users/login", sanitizedPayload);

    const nextUser = res?.data?.user || null;
    const nextToken = res?.data?.token || "";

    if (!nextToken) {
      throw new Error(
        "Login succeeded but authentication token was not returned.",
      );
    }

    setUser(nextUser);
    setToken(nextToken);
    saveSession(nextToken, nextUser);
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;

    return res.data;
  }, []);

  const logout = useCallback(async () => {
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
  }, [clearSession]);

  const forgotPassword = useCallback(async (email) => {
    const res = await api.post("/users/forgot-password", {
      email: normalizeEmail(email),
    });

    return res.data;
  }, []);

  const resetPassword = useCallback(async (tokenValue, password) => {
    const res = await api.put(`/users/reset-password/${tokenValue}`, {
      password: String(password || ""),
    });

    return res.data;
  }, []);

  const fetchProfile = useCallback(async () => {
    const res = await api.get("/users/me");
    const nextUser = res?.data?.user || null;

    if (nextUser) {
      setUser(nextUser);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }

    return nextUser;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const res = await api.put("/users/update-profile", payload);
    const nextUser = res?.data?.user || null;

    if (nextUser) {
      setUser(nextUser);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }

    return res.data;
  }, []);

  const getAllUsers = useCallback(async () => {
    const res = await api.get("/users/all-users");
    return res?.data?.users || [];
  }, []);

  const updateUserRole = useCallback(async (id, role) => {
    const res = await api.put(`/users/update-role/${id}`, {
      role: normalizeText(role).toLowerCase(),
    });

    return res.data;
  }, []);

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
      register,
      login,
      logout,
      forgotPassword,
      resetPassword,
      fetchProfile,
      updateProfile,
      getAllUsers,
      updateUserRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

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
  const { loading, isAuthenticated, user } = useAuth();

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

export default AuthContext;
