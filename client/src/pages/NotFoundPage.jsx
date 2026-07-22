export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-br from-brand-light/20 via-blue-50 to-brand/5 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-cardIn">
        <span className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl mb-4 mx-auto">
          🔍
        </span>
        <h2 className="text-lg font-semibold text-gray-800">Link not found</h2>
        <p className="text-gray-500 mt-2">This booking link doesn't exist or is no longer active.</p>
      </div>
    </div>
  );
}
