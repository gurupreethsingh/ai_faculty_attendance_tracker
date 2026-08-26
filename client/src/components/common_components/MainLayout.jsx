import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Header from "../header_components/Header";
import Footer from "../footer_components/Footer";
import Breadcrumb from "./Breadcrumb";
import ScrollToTopButton from "./ScrollToTopButton";

import Homepage, { homepageHero } from "../../pages/common_pages/Homepage";
import PageNotFound, {
  pageNotFoundHero,
} from "../../pages/common_pages/PageNotFound";

import Contact, { contactHero } from "../../pages/contact_pages/Contact";
import SingleReply, {
  singleReplyHero,
} from "../../pages/contact_pages/SingleReply";
import AboutUs, { aboutUsHero } from "../../pages/common_pages/AboutUs";
import PrivacyPolicy, {
  privacyPolicyHero,
} from "../../pages/common_pages/PrivacyPolicy";
import Solutions, { solutionsHero } from "../../pages/common_pages/Solutions";
import AIML, { aimlHero } from "../../pages/common_pages/AIML";
import Technology, {
  technologyHero,
} from "../../pages/common_pages/Technology";
import ERP, { erpHero } from "../../pages/common_pages/ERP";
import CyberSecurity, {
  cyberSecurityHero,
} from "../../pages/common_pages/CyberSecurity";
import UIUXDesign, {
  uiuxDesignHero,
} from "../../pages/common_pages/UIUXDesign";
import DigitalTransformation, {
  digitalTransformationHero,
} from "../../pages/common_pages/DigitalTransformation";

import Login, { loginHero } from "../../pages/user_pages/Login";
import Register, { registerHero } from "../../pages/user_pages/Register";
import ForgotPassword, {
  forgotPasswordHero,
} from "../../pages/user_pages/ForgotPassword";
import ResetPassword, {
  resetPasswordHero,
} from "../../pages/user_pages/ResetPassword";

import UserDashboard, {
  userDashboardHero,
} from "../../pages/user_pages/UserDashboard";

import Profile, { profileHero } from "../../pages/user_pages/Profile";
import UpdateProfile, {
  updateProfileHero,
} from "../../pages/user_pages/UpdateProfile";

import AllUsers, { allUsersHero } from "../../pages/user_pages/AllUsers";
import UpdateRole, { updateRoleHero } from "../../pages/user_pages/UpdateRole";

import SuperAdminDashboard, {
  superAdminDashboardHero,
} from "../../pages/super_admin_pages/SuperAdminDashboard";

import EmployeeDashboard, {
  employeeDashboardHero,
} from "../../pages/employee_pages/EmployeeDashboard";

import RoleDashboard, {
  roleDashboardHero,
} from "../../pages/role_pages/RoleDashboard";

import AllSubscriptions, {
  allSubscriptionsHero,
} from "../subscription_components/AllSubscriptions";

import MessagesList, {
  allMessagesHero,
} from "../../pages/contact_pages/AllMessages";

import AllReplies, {
  allRepliesHero,
} from "../../pages/contact_pages/AllReplies";

import ReplyMessage, {
  replyMessageHero,
} from "../../pages/contact_pages/ReplyMessage";

import {
  AuthProvider,
  PrivateRoute,
  AdminRoute,
  PublicRoute,
  RoleRoute,
  useAuth,
} from "../../managers/AuthManager";

import AccountantDashboard from "../../pages/accountant_pages/AccountantDashboard";
import AlumniRelationsDashboard from "../../pages/alumni_relations_pages/AlumniRelationsDashboard";

import AssistantProfessorDashboard from "../../pages/assistant_professor_pages/AssistantProfessorDashboard";
import ProfessorDashboard from "../../pages/professor_pages/ProfessorDashboard";

// faculty pages.
import FacultyDashboard from "../../pages/faculty_pages/FacultyDashboard";
import AllFaculties from "../../pages/faculty_pages/AllFaculties";
import SingleFaculty from "../../pages/faculty_pages/SingleFaculty";
import UpdateFaculty from "../../pages/faculty_pages/UpdateFaculty";
import TeacherDashboard from "../../pages/teacher_pages/TeacherDashboard";

import CourseCoordinatorDashboard from "../../pages/course_coordinator_pages/CourseCoordinatorDashboard";
import DeanDashboard from "../../pages/dean_pages/DeanDashboard";
import DepartmentHeadDashboard from "../../pages/department_head_pages/DepartmentHeadDashboard";
import HodDashboard from "../../pages/hod_pages/HodDashboard";
import ExamControllerDashboard from "../../pages/exam_controller_pages/ExamControllerDashboard";
import RegistrarDashboard from "../../pages/registrar_pages/RegistrarDashboard";
import LibrarianDashboard from "../../pages/librarian_pages/LibrarianDashboard";
import StudentDashboard from "../../pages/student_pages/StudentDashboard";

import BusinessAnalystDashboard from "../../pages/business_analyst_pages/BusinessAnalystDashboard";
import ContentCreatorDashboard from "../../pages/content_creator_pages/ContentCreatorDashboard";
import CustomerSupportDashboard from "../../pages/customer_support_pages/CustomerSupportDashboard";
import DataScientistDashboard from "../../pages/data_scientist_pages/DataScientistDashboard";

import DeveloperLeadDashboard from "../../pages/developer_lead_pages/DeveloperLeadDashboard";
import DeveloperDashboard from "../../pages/developer_pages/DeveloperDashboard";

import QaLeadDashboard from "../../pages/qa_lead_pages/QaLeadDashboard";
import SupportEngineerDashboard from "../../pages/support_engineer_pages/SupportEngineerDashboard";
import TechLeadDashboard from "../../pages/tech_lead_pages/TechLeadDashboard";
import TestEngineerDashboard from "../../pages/test_engineer_pages/TestEngineerDashboard";
import UxUiDesignerDashboard from "../../pages/ux_ui_designer_pages/UxUiDesignerDashboard";

import EventCoordinatorDashboard from "../../pages/event_coordinator_pages/EventCoordinatorDashboard";
import HrManagerDashboard from "../../pages/hr_manager_pages/HrManagerDashboard";
import HrDashboard from "../../pages/hr_pages/HrDashboard";

import InternDashboard from "../../pages/intern_pages/InternDashboard";
import LegalAdvisorDashboard from "../../pages/legal_advisor_pages/LegalAdvisorDashboard";

import MaintenanceStaffDashboard from "../../pages/maintenance_staff_pages/MaintenanceStaffDashboard";
import MarketingManagerDashboard from "../../pages/marketing_manager_pages/MarketingManagerDashboard";
import OperationsManagerDashboard from "../../pages/operations_manager_pages/OperationsManagerDashboard";

import ProductOwnerDashboard from "../../pages/product_owner_pages/ProductOwnerDashboard";
import ProjectManagerDashboard from "../../pages/project_manager_pages/ProjectManagerDashboard";

import RecruiterDashboard from "../../pages/recruiter_pages/RecruiterDashboard";
import ResearcherDashboard from "../../pages/researcher_pages/ResearcherDashboard";
import SalesExecutiveDashboard from "../../pages/sales_executive_pages/SalesExecutiveDashboard";

import CreateFaculty from "../../pages/faculty_pages/CreateFaculty";

// ============================================================================
// TITLE MAP
// ============================================================================

const TITLE_MAP = {
  "/": "Homepage",
  "/home": "Homepage",
  "/homepage": "Homepage",

  "/contact": "Contact",
  "/about": "AboutUs",
  "/about-us": "AboutUs",
  "/solutions": "Solutions",
  "/ai-ml": "AI & ML",
  "/technology": "Technology",
  "/erp": "ERP",
  "/cyber-security": "Cyber Security",
  "/ui-ux-design": "UI UX Design",
  "/digital-transformation": "Digital Transformation",
  "/privacy-policy": "PrivacyPolicy",

  "/login": "Login",
  "/sign-in": "Login",
  "/register": "Register",
  "/forgot-password": "ForgotPassword",
  "/reset-password/:token": "ResetPassword",

  "/user-dashboard": "UserDashboard",
  "/profile": "Profile",
  "/update-profile": "UpdateProfile",
  "/all-users": "AllUsers",
  "/update-role/:id": "UpdateRole",
  "/super-admin-dashboard": "SuperAdminDashboard",
  "/employee-dashboard": "EmployeeDashboard",
  "/dashboard/:role": "RoleDashboard",

  "/accountant-dashboard": "AccountantDashboard",
  "/alumni-relations-dashboard": "AlumniRelationsDashboard",
  "/assistant-professor-dashboard": "AssistantProfessorDashboard",
  "/professor-dashboard": "ProfessorDashboard",
  "/faculty-dashboard": "FacultyDashboard",

  "/create-faculty": "CreateFaculty",
  "/all-faculties": "AllFaculties",
  "/faculty/:id": "Faculty Details",
  "/update-faculty/:id": "Update Faculty Details",
  "/teacher-dashboard": "TeacherDashboard",

  "/business-analyst-dashboard": "BusinessAnalystDashboard",
  "/content-creator-dashboard": "ContentCreatorDashboard",
  "/course-coordinator-dashboard": "CourseCoordinatorDashboard",
  "/customer-support-dashboard": "CustomerSupportDashboard",
  "/data-scientist-dashboard": "DataScientistDashboard",

  "/dean-dashboard": "DeanDashboard",
  "/department-head-dashboard": "DepartmentHeadDashboard",
  "/hod-dashboard": "HodDashboard",

  "/developer-lead-dashboard": "DeveloperLeadDashboard",
  "/developer-dashboard": "DeveloperDashboard",

  "/event-coordinator-dashboard": "EventCoordinatorDashboard",
  "/exam-controller-dashboard": "ExamControllerDashboard",

  "/hr-manager-dashboard": "HrManagerDashboard",
  "/hr-dashboard": "HrDashboard",

  "/intern-dashboard": "InternDashboard",
  "/legal-advisor-dashboard": "LegalAdvisorDashboard",
  "/librarian-dashboard": "LibrarianDashboard",
  "/maintenance-staff-dashboard": "MaintenanceStaffDashboard",

  "/marketing-manager-dashboard": "MarketingManagerDashboard",
  "/operations-manager-dashboard": "OperationsManagerDashboard",
  "/product-owner-dashboard": "ProductOwnerDashboard",
  "/project-manager-dashboard": "ProjectManagerDashboard",

  "/qa-lead-dashboard": "QaLeadDashboard",
  "/recruiter-dashboard": "RecruiterDashboard",
  "/registrar-dashboard": "RegistrarDashboard",
  "/researcher-dashboard": "ResearcherDashboard",
  "/sales-executive-dashboard": "SalesExecutiveDashboard",

  "/student-dashboard": "StudentDashboard",

  "/support-engineer-dashboard": "SupportEngineerDashboard",
  "/tech-lead-dashboard": "TechLeadDashboard",
  "/test-engineer-dashboard": "TestEngineerDashboard",
  "/ux-ui-designer-dashboard": "UxUiDesignerDashboard",

  "/all-subscriptions": "AllSubscriptions",

  "/all-messages": "AllMessages",
  "/all-replies": "AllReplies",
  "/single-reply/:id": "SingleReply",
  "/reply-message/:id": "ReplyMessage",

  "/page-not-found": "404",
  "/404": "404",
};

// ============================================================================
// HELPERS
// ============================================================================

function isBlank(value) {
  return value == null || String(value).trim() === "";
}

function resolveMetaPath(pathname) {
  if (pathname.startsWith("/reset-password/")) {
    return "/reset-password/:token";
  }

  if (pathname.startsWith("/update-role/")) {
    return "/update-role/:id";
  }

  if (pathname.startsWith("/dashboard/")) {
    return "/dashboard/:role";
  }

  if (pathname.startsWith("/single-reply/")) {
    return "/single-reply/:id";
  }

  if (pathname.startsWith("/reply-message/")) {
    return "/reply-message/:id";
  }

  if (pathname.startsWith("/faculty/")) {
    return "/faculty/:id";
  }

  return pathname;
}

// ============================================================================
// LAYOUT
// ============================================================================

function LayoutInner() {
  const location = useLocation();
  const { user } = useAuth();

  const resolvedPath = resolveMetaPath(location.pathname);

  useEffect(() => {
    const pageTitle = TITLE_MAP[resolvedPath];

    document.title = pageTitle ? `Ecoders - ${pageTitle}` : "Ecoders";
  }, [resolvedPath]);

  // ========================================================================
  // HERO CONFIGURATION
  // ========================================================================

  const HERO_BY_PATH = {
    "/": homepageHero,
    "/home": homepageHero,
    "/homepage": homepageHero,

    "/contact": contactHero,
    "/about": aboutUsHero,
    "/about-us": aboutUsHero,
    "/solutions": solutionsHero,
    "/ai-ml": aimlHero,
    "/technology": technologyHero,
    "/erp": erpHero,
    "/cyber-security": cyberSecurityHero,
    "/ui-ux-design": uiuxDesignHero,
    "/digital-transformation": digitalTransformationHero,
    "/privacy-policy": privacyPolicyHero,

    "/login": loginHero,
    "/sign-in": loginHero,
    "/register": registerHero,
    "/forgot-password": forgotPasswordHero,
    "/reset-password/:token": resetPasswordHero,

    "/user-dashboard": userDashboardHero,
    "/profile": profileHero,
    "/update-profile": updateProfileHero,
    "/all-users": allUsersHero,
    "/update-role/:id": updateRoleHero,
    "/super-admin-dashboard": superAdminDashboardHero,
    "/employee-dashboard": employeeDashboardHero,
    "/dashboard/:role": roleDashboardHero,

    "/accountant-dashboard": {
      heroTitle: "Accountant Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/alumni-relations-dashboard": {
      heroTitle: "Alumni Relations Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/assistant-professor-dashboard": {
      heroTitle: "Assistant Professor Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/professor-dashboard": {
      heroTitle: "Professor Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/faculty-dashboard": {
      heroTitle: "Faculty Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/create-faculty": {
      heroTitle: "Create Faculty",
      heroSubtitle: "",
      showHero: false,
    },

    "/all-faculties": {
      heroTitle: "All Faculties",
      heroSubtitle: "",
      showHero: false,
    },

    "/faculty/:id": {
      heroTitle: "Faculty Details",
      heroSubtitle: "",
      showHero: false,
    },

    "/update-faculty/:id": {
      heroTitle: "Update Faculty Details",
      heroSubtitle: "",
      showHero: false,
    },

    "/teacher-dashboard": {
      heroTitle: "Teacher Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/business-analyst-dashboard": {
      heroTitle: "Business Analyst Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/content-creator-dashboard": {
      heroTitle: "Content Creator Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/course-coordinator-dashboard": {
      heroTitle: "Course Coordinator Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/customer-support-dashboard": {
      heroTitle: "Customer Support Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/data-scientist-dashboard": {
      heroTitle: "Data Scientist Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/dean-dashboard": {
      heroTitle: "Dean Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/department-head-dashboard": {
      heroTitle: "Department Head Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/hod-dashboard": {
      heroTitle: "HOD Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/developer-lead-dashboard": {
      heroTitle: "Developer Lead Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/developer-dashboard": {
      heroTitle: "Developer Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/event-coordinator-dashboard": {
      heroTitle: "Event Coordinator Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/exam-controller-dashboard": {
      heroTitle: "Exam Controller Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/hr-manager-dashboard": {
      heroTitle: "HR Manager Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/hr-dashboard": {
      heroTitle: "HR Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/intern-dashboard": {
      heroTitle: "Intern Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/legal-advisor-dashboard": {
      heroTitle: "Legal Advisor Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/librarian-dashboard": {
      heroTitle: "Librarian Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/maintenance-staff-dashboard": {
      heroTitle: "Maintenance Staff Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/marketing-manager-dashboard": {
      heroTitle: "Marketing Manager Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/operations-manager-dashboard": {
      heroTitle: "Operations Manager Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/product-owner-dashboard": {
      heroTitle: "Product Owner Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/project-manager-dashboard": {
      heroTitle: "Project Manager Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/qa-lead-dashboard": {
      heroTitle: "QA Lead Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/recruiter-dashboard": {
      heroTitle: "Recruiter Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/registrar-dashboard": {
      heroTitle: "Registrar Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/researcher-dashboard": {
      heroTitle: "Researcher Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/sales-executive-dashboard": {
      heroTitle: "Sales Executive Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/student-dashboard": {
      heroTitle: "Student Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/support-engineer-dashboard": {
      heroTitle: "Support Engineer Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/tech-lead-dashboard": {
      heroTitle: "Tech Lead Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/test-engineer-dashboard": {
      heroTitle: "Test Engineer Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/ux-ui-designer-dashboard": {
      heroTitle: "UX/UI Designer Dashboard",
      heroSubtitle: "",
      showHero: false,
    },

    "/all-subscriptions": allSubscriptionsHero,

    "/all-messages": allMessagesHero,
    "/all-replies": allRepliesHero,
    "/single-reply/:id": singleReplyHero,
    "/reply-message/:id": replyMessageHero,

    "/page-not-found": pageNotFoundHero,
    "/404": pageNotFoundHero,
  };

  const heroConfig = HERO_BY_PATH[resolvedPath] || {
    heroTitle: "",
    heroSubtitle: "",
    showHero: false,
    heroBg: "",
  };

  const showHeroText =
    heroConfig?.showHero !== false &&
    !(isBlank(heroConfig?.heroTitle) && isBlank(heroConfig?.heroSubtitle));

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header
        currentPath={location.pathname}
        isLoggedIn={!!user}
        user={user || { name: "User", avatarUrl: "" }}
        {...heroConfig}
        showHeroText={showHeroText}
      />

      <div className="w-full overflow-x-hidden">
        <Breadcrumb />

        <Routes>
          {/* ============================================================
              PUBLIC
          ============================================================ */}

          <Route path="/" element={<Homepage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/homepage" element={<Homepage />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/about-us" element={<AboutUs />} />

          <Route path="/solutions" element={<Solutions />} />
          <Route path="/ai-ml" element={<AIML />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/erp" element={<ERP />} />
          <Route path="/cyber-security" element={<CyberSecurity />} />
          <Route path="/ui-ux-design" element={<UIUXDesign />} />

          <Route
            path="/digital-transformation"
            element={<DigitalTransformation />}
          />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* ============================================================
              AUTH
          ============================================================ */}

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/sign-in"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* ============================================================
              COMMON AUTHENTICATED
          ============================================================ */}

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/update-profile"
            element={
              <PrivateRoute>
                <UpdateProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/all-subscriptions"
            element={
              <PrivateRoute>
                <AllSubscriptions />
              </PrivateRoute>
            }
          />

          {/* ============================================================
              USER
          ============================================================ */}

          <Route
            path="/user-dashboard"
            element={
              <RoleRoute allowedRoles={["user"]}>
                <UserDashboard />
              </RoleRoute>
            }
          />

          {/* ============================================================
              SUPER ADMIN
          ============================================================ */}

          <Route
            path="/super-admin-dashboard"
            element={
              <RoleRoute allowedRoles={["superadmin"]}>
                <SuperAdminDashboard />
              </RoleRoute>
            }
          />

          {/* ============================================================
              FACULTY
          ============================================================ */}

          <Route
            path="/assistant-professor-dashboard"
            element={
              <RoleRoute allowedRoles={["assistant_professor"]}>
                <AssistantProfessorDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/professor-dashboard"
            element={
              <RoleRoute allowedRoles={["professor"]}>
                <ProfessorDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/faculty-dashboard"
            element={
              <RoleRoute allowedRoles={["faculty"]}>
                <FacultyDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/create-faculty"
            element={
              <RoleRoute allowedRoles={["superadmin"]}>
                <CreateFaculty />
              </RoleRoute>
            }
          />

          <Route
            path="/all-faculties"
            element={
              <RoleRoute allowedRoles={["superadmin"]}>
                <AllFaculties />
              </RoleRoute>
            }
          />

          <Route
            path="/faculty/:id"
            element={
              <RoleRoute allowedRoles={["superadmin"]}>
                <SingleFaculty />
              </RoleRoute>
            }
          />

          <Route
            path="/update-faculty/:id"
            element={
              <RoleRoute allowedRoles={["superadmin"]}>
                <UpdateFaculty />
              </RoleRoute>
            }
          />

          <Route
            path="/teacher-dashboard"
            element={
              <RoleRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </RoleRoute>
            }
          />

          {/* ============================================================
              OTHER ACADEMIC ROLES
          ============================================================ */}

          <Route
            path="/accountant-dashboard"
            element={
              <RoleRoute allowedRoles={["accountant"]}>
                <AccountantDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/alumni-relations-dashboard"
            element={
              <RoleRoute allowedRoles={["alumni_relations"]}>
                <AlumniRelationsDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/course-coordinator-dashboard"
            element={
              <RoleRoute allowedRoles={["course_coordinator"]}>
                <CourseCoordinatorDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/dean-dashboard"
            element={
              <RoleRoute allowedRoles={["dean"]}>
                <DeanDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/department-head-dashboard"
            element={
              <RoleRoute allowedRoles={["department_head"]}>
                <DepartmentHeadDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/hod-dashboard"
            element={
              <RoleRoute allowedRoles={["hod"]}>
                <HodDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/exam-controller-dashboard"
            element={
              <RoleRoute allowedRoles={["exam_controller"]}>
                <ExamControllerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/registrar-dashboard"
            element={
              <RoleRoute allowedRoles={["registrar"]}>
                <RegistrarDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/librarian-dashboard"
            element={
              <RoleRoute allowedRoles={["librarian"]}>
                <LibrarianDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/student-dashboard"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </RoleRoute>
            }
          />

          {/* ============================================================
              BUSINESS / TECHNOLOGY
          ============================================================ */}

          <Route
            path="/business-analyst-dashboard"
            element={
              <RoleRoute allowedRoles={["business_analyst"]}>
                <BusinessAnalystDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/content-creator-dashboard"
            element={
              <RoleRoute allowedRoles={["content_creator"]}>
                <ContentCreatorDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/customer-support-dashboard"
            element={
              <RoleRoute allowedRoles={["customer_support"]}>
                <CustomerSupportDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/data-scientist-dashboard"
            element={
              <RoleRoute allowedRoles={["data_scientist"]}>
                <DataScientistDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/developer-lead-dashboard"
            element={
              <RoleRoute allowedRoles={["developer_lead"]}>
                <DeveloperLeadDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/developer-dashboard"
            element={
              <RoleRoute allowedRoles={["developer"]}>
                <DeveloperDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/event-coordinator-dashboard"
            element={
              <RoleRoute allowedRoles={["event_coordinator"]}>
                <EventCoordinatorDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/hr-manager-dashboard"
            element={
              <RoleRoute allowedRoles={["hr_manager"]}>
                <HrManagerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/hr-dashboard"
            element={
              <RoleRoute allowedRoles={["hr"]}>
                <HrDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/intern-dashboard"
            element={
              <RoleRoute allowedRoles={["intern"]}>
                <InternDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/legal-advisor-dashboard"
            element={
              <RoleRoute allowedRoles={["legal_advisor"]}>
                <LegalAdvisorDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/maintenance-staff-dashboard"
            element={
              <RoleRoute allowedRoles={["maintenance_staff"]}>
                <MaintenanceStaffDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/marketing-manager-dashboard"
            element={
              <RoleRoute allowedRoles={["marketing_manager"]}>
                <MarketingManagerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/operations-manager-dashboard"
            element={
              <RoleRoute allowedRoles={["operations_manager"]}>
                <OperationsManagerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/product-owner-dashboard"
            element={
              <RoleRoute allowedRoles={["product_owner"]}>
                <ProductOwnerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/project-manager-dashboard"
            element={
              <RoleRoute allowedRoles={["project_manager"]}>
                <ProjectManagerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/qa-lead-dashboard"
            element={
              <RoleRoute allowedRoles={["qa_lead"]}>
                <QaLeadDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/recruiter-dashboard"
            element={
              <RoleRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/researcher-dashboard"
            element={
              <RoleRoute allowedRoles={["researcher"]}>
                <ResearcherDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/sales-executive-dashboard"
            element={
              <RoleRoute allowedRoles={["sales_executive"]}>
                <SalesExecutiveDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/support-engineer-dashboard"
            element={
              <RoleRoute allowedRoles={["support_engineer"]}>
                <SupportEngineerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/tech-lead-dashboard"
            element={
              <RoleRoute allowedRoles={["tech_lead"]}>
                <TechLeadDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/test-engineer-dashboard"
            element={
              <RoleRoute allowedRoles={["test_engineer"]}>
                <TestEngineerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/ux-ui-designer-dashboard"
            element={
              <RoleRoute allowedRoles={["ux_ui_designer"]}>
                <UxUiDesignerDashboard />
              </RoleRoute>
            }
          />

          {/* ============================================================
              LEGACY
          ============================================================ */}

          <Route
            path="/employee-dashboard"
            element={
              <PrivateRoute>
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/:role"
            element={
              <PrivateRoute>
                <RoleDashboard />
              </PrivateRoute>
            }
          />

          {/* ============================================================
              ADMIN
          ============================================================ */}

          <Route
            path="/all-users"
            element={
              <AdminRoute>
                <AllUsers />
              </AdminRoute>
            }
          />

          <Route
            path="/update-role/:id"
            element={
              <AdminRoute>
                <UpdateRole />
              </AdminRoute>
            }
          />

          <Route
            path="/all-messages"
            element={
              <AdminRoute>
                <MessagesList />
              </AdminRoute>
            }
          />

          <Route
            path="/all-replies"
            element={
              <AdminRoute>
                <AllReplies />
              </AdminRoute>
            }
          />

          <Route
            path="/single-reply/:id"
            element={
              <AdminRoute>
                <SingleReply />
              </AdminRoute>
            }
          />

          <Route
            path="/reply-message/:id"
            element={
              <AdminRoute>
                <ReplyMessage />
              </AdminRoute>
            }
          />

          {/* ============================================================
              404
          ============================================================ */}

          <Route path="/page-not-found" element={<PageNotFound />} />
          <Route path="/404" element={<PageNotFound />} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================

export default function MainLayout() {
  return (
    <AuthProvider>
      <Router>
        <LayoutInner />
      </Router>
    </AuthProvider>
  );
}
