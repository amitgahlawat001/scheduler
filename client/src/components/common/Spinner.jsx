export default function Spinner({ full = false, label = 'Loading...' }) {
  const ring = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
      {label && <span className="text-sm text-gray-400">{label}</span>}
    </div>
  );

  if (full) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {ring}
      </div>
    );
  }

  return <div className="p-6 flex justify-center">{ring}</div>;
}
