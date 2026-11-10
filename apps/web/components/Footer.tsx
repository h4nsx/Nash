export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-12 text-sm text-text-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">NASH</span>
            <span className="text-border-strong">—</span>
            <span className="text-xs text-text-muted">
              Network · Ability · Skills · Human
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>Verified Skills</span>
            <span className="text-border-strong">•</span>
            <span>Smart Match</span>
            <span className="text-border-strong">•</span>
            <span>Direct Handshake</span>
          </div>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} NASH Platform. Modular Monolith & Clean Architecture.
          </p>
        </div>
      </div>
    </footer>
  );
}
