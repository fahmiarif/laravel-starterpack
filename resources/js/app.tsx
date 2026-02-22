import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <QueryClientProvider client={queryClient}>
                    <Toaster position="top-right" richColors closeButton />
                    <App {...props} />
                </QueryClientProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
