import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppProvider } from "./hooks/useAppContext";
import AttendancePage from "./pages/AttendancePage";
import AttendanceReportPage from "./pages/AttendanceReportPage";
import DashboardPage from "./pages/DashboardPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LoginPage from "./pages/LoginPage";
import MeetingsPage from "./pages/MeetingsPage";
import MembersPage from "./pages/MembersPage";
import MessagesPage from "./pages/MessagesPage";
import ReferralsPage from "./pages/ReferralsPage";

const rootRoute = createRootRoute({ component: Outlet });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/members",
  component: () => (
    <ProtectedRoute>
      <MembersPage />
    </ProtectedRoute>
  ),
});

const meetingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/meetings",
  component: () => (
    <ProtectedRoute>
      <MeetingsPage />
    </ProtectedRoute>
  ),
});

const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendance",
  component: () => (
    <ProtectedRoute>
      <AttendancePage />
    </ProtectedRoute>
  ),
});

const referralsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/referrals",
  component: () => (
    <ProtectedRoute>
      <ReferralsPage />
    </ProtectedRoute>
  ),
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: () => (
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  ),
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: () => (
    <ProtectedRoute>
      <LeaderboardPage />
    </ProtectedRoute>
  ),
});

const attendanceReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendance-report",
  component: () => (
    <ProtectedRoute>
      <AttendanceReportPage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  membersRoute,
  meetingsRoute,
  attendanceRoute,
  referralsRoute,
  messagesRoute,
  leaderboardRoute,
  attendanceReportRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
