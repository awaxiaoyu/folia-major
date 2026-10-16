import React from 'react';
import i18n from '../i18n/config';

// src/components/AppErrorBoundary.tsx
// Keeps a render-time failure from leaving Electron with a blank window and records the original
// error through the existing console/runtime log pipeline for later diagnosis.

interface AppErrorBoundaryState {
    error: Error | null;
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
    state: AppErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        console.error('[AppErrorBoundary] Renderer crashed:', error, info.componentStack);
    }

    render(): React.ReactNode {
        if (!this.state.error) return this.props.children;

        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
                <section className="flex w-full max-w-md flex-col items-center gap-4 text-center">
                    <h1 className="text-xl font-semibold">{i18n.t('ui.appLoadFailed')}</h1>
                    <p className="text-sm opacity-70">{i18n.t('ui.appLoadFailedDetail')}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                    >
                        {i18n.t('ui.reloadApp')}
                    </button>
                </section>
            </main>
        );
    }
}

export default AppErrorBoundary;
