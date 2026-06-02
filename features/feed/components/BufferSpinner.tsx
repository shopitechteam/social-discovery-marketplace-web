export function BufferSpinner() {
  return (
    <div className="relative w-12 h-12">
      <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "1.4s" }} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="white" strokeOpacity="0.15" strokeWidth="4" />
        <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="30 96" />
      </svg>
      <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "0.8s", animationDirection: "reverse" }} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="12" stroke="rgb(var(--brand-primary))" strokeOpacity="0.3" strokeWidth="3" />
        <circle cx="24" cy="24" r="12" stroke="rgb(var(--brand-primary))" strokeWidth="3" strokeLinecap="round" strokeDasharray="16 59" />
      </svg>
    </div>
  );
}
