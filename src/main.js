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
    '/changelog': { component: ChangelogPage },
    '/changelogs': { component: ChangelogPage }, // Alias
    '/profile': { component: ProfilePage, guard: true },
    '/profile/:username': { component: ProfilePage, guard: true },

    // Auth Routes
    '/login': { component: LoginPage },
    '/signup': { component: SignupPage },
    '/forgot-password': { component: () => import('./features/auth/pages/ForgotPasswordPage.js').then(m => m.ForgotPasswordPage()) },

    '/dashboard': { component: DashboardPage, guard: true },
    '/classes': { component: ClassesPage, guard: true },
    '/class/:id': { component: ClassDetailsPage, guard: true },
    '/calendar': { component: CalendarPage, guard: true },
    '/messages': { component: MessagesPage, guard: true },
    '/settings': { component: SettingsPage, guard: true },
};

const router = new Router(routes);

// Route categories
const AUTH_ONLY_ROUTES = ['/login', '/signup', '/forgot-password'];
const PUBLIC_ROUTES = ['/', '/home', '/docs', '/changelog', '/changelogs'];

if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        const path = window.location.pathname;

        // INITIAL_SESSION fires on page load/refresh
        if (event === 'INITIAL_SESSION' && session) {
            import('./features/auth/services/authService.js').then(m => m.authService.ensureProfile());

            const isOAuthCallback = window.location.hash.includes('access_token') || window.location.search.includes('code=');

            if (isOAuthCallback) {
                window.history.replaceState(null, '', '/dashboard');
                router.handleRoute();
                return;
            }

            if (AUTH_ONLY_ROUTES.includes(path)) {
                router.navigate('/dashboard');
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
            // Only redirect to login if we are on a guarded route
            // (not public, and not already an auth page)
            const isPublic = PUBLIC_ROUTES.includes(path);
            const isAuth = AUTH_ONLY_ROUTES.includes(path);

            if (!isPublic && !isAuth) {
                window.location.href = '/login';
            }
        }
    });
}


