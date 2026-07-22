export function BrandText({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      Mountain{" "}
      <span className="bg-gradient-to-r from-emerald-400 via-(--sage) to-indigo-500 bg-clip-text font-extrabold text-transparent">
        Run
      </span>
    </span>
  );
}
