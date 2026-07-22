export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const colors = {
    info: 'bg-gray-800',
    error: 'bg-red-500',
    success: 'bg-green-600'
  };

  return (
    <div
      className={`fixed bottom-5 right-5 text-white px-4 py-2.5 rounded-md cursor-pointer shadow-lg ${colors[type]}`}
      onClick={onClose}
    >
      {message}
    </div>
  );
}
