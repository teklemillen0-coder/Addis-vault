import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Addis-Vault client render failed.", error, errorInfo);
  }

  override render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold text-foreground">This page didn&apos;t load</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Something went wrong while loading the app. Refresh the page to try again.
            </p>
            <section
              aria-label="Error details"
              className="mt-4 max-h-72 overflow-auto rounded-md border border-border bg-muted p-3 text-left"
            >
              <p className="break-words font-mono text-xs text-foreground">
                {this.state.error.message}
              </p>
              <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                {this.state.error.stack ?? "Stack trace unavailable."}
              </pre>
            </section>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Refresh page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
