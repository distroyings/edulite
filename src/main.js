import './styles/tailwind.css';
import './styles/app.css';
import { Router } from './lib/router.js';
import { LandingPage } from './pages/LandingPage.js';
import { DocumentationPage } from './pages/DocumentationPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ClassesPage } from './pages/ClassesPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { ClassDetailsPage } from './pages/ClassDetailsPage.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { MessagesPage } from './pages/MessagesPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { ChangelogPage } from './pages/ChangelogPage.js';
import { supabase } from './lib/supabase.js';

// Auth Pages (Feature-based)
import { LoginPage } from './features/auth/pages/LoginPage.js';
import { SignupPage } from './features/auth/pages/SignupPage.js';

const routes = {
    '/home': { component: LandingPage },
    '/': { component: LandingPage },
    '/docs': { component: DocumentationPage },
    // `appShell: true` tells the router this public route shares the
    // logged-in app chrome (AppHeader) and shouldn't have it stripped on
    // entry — that strip causes a visible header flash on navigation.
    '/changelog': { component: ChangelogPage, appShell: true },
    '/changelogs': { component: ChangelogPage, appShell: true }, // Alias
    '/profile': { component: ProfilePage, guard: true },
    '/profile/:username': { component: ProfilePage, guard: true },

    // Auth Routes
    '/login': { component: LoginPage },
    '/signup': { component: SignupPage },
    '/forgot-password': { component: () => import('./features/auth/pages/ForgotPasswordPage.js').then(m => m.ForgotPasswordPage()) },

    '/dashboard': { component: DashboardPage, guard: true },
    '/classes': { component: ClassesPage, guard: true },
    '/class/:id': { component: ClassDetailsPage, guard: true },
    '/class/:id/:tab': { component: ClassDetailsPage, guard: true },
    '/calendar': { component: CalendarPage, guard: true },
    '/messages': { component: MessagesPage, guard: true },
    '/messages/:chatId': { component: MessagesPage, guard: true },
    '/settings': { component: SettingsPage, guard: true },
};

const router = new Router(routes);
window.appRouter = router;

// Route categories
const AUTH_ONLY_ROUTES = ['/login', '/signup', '/forgot-password'];
const PUBLIC_ROUTES = ['/', '/home', '/docs', '/changelog', '/changelogs'];

// ── INITIAL ROUTING ──
// Determine if current path needs auth. For public/auth routes,
// render immediately. For guarded routes, wait for Supabase to
// confirm the session (INITIAL_SESSION) before routing, so we
// don't lose deep links.
const initialPath = window.location.pathname;
const isPublicOrAuth = PUBLIC_ROUTES.includes(initialPath) ||
    AUTH_ONLY_ROUTES.includes(initialPath);

if (isPublicOrAuth) {
    // Public routes can render immediately — no auth needed
    router.handleRoute();
}

if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        const path = window.location.pathname;

        // INITIAL_SESSION fires on page load/refresh
        if (event === 'INITIAL_SESSION') {
            if (session) {
                import('./features/auth/services/authService.js').then(m => m.authService.ensureProfile());

                const isOAuthCallback = window.location.hash.includes('access_token') || window.location.search.includes('code=');

                if (isOAuthCallback) {
                    window.history.replaceState(null, '', '/dashboard');
                    router.handleRoute();
                    return;
                }

                if (AUTH_ONLY_ROUTES.includes(path)) {
                    // User is logged in but on login/signup page → go to dashboard
                    router.navigate('/dashboard');
                } else if (!isPublicOrAuth) {
                    // This is a guarded route (e.g., /class/abc/notes, /messages/xyz)
                    // Session is confirmed, NOW we can safely route
                    router.handleRoute();
                }
            } else {
                // No session — if user is on a guarded deep link, send to login
                if (!isPublicOrAuth) {
                    router.navigate('/login');
                }
            }
            return;
        }

        if (event === 'SIGNED_IN') {
            import('./features/auth/services/authService.js').then(m => m.authService.ensureProfile());
            if (AUTH_ONLY_ROUTES.includes(path)) {
                router.navigate('/dashboard');
            }
        }

        if (event === 'SIGNED_OUT') {
            // Drop every cached page so a different user can't see the
            // previous session's data on quick re-login.
            if (typeof router.clearCache === 'function') router.clearCache();

            // Only redirect to login if we are on a guarded route
            const isPublic = PUBLIC_ROUTES.includes(path);
            const isAuth = AUTH_ONLY_ROUTES.includes(path);

            if (!isPublic && !isAuth) {
                window.location.href = '/login';
            }
        }
    });
} else {
    // No Supabase configured — just route immediately
    if (!isPublicOrAuth) {
        router.handleRoute();
    }
}
