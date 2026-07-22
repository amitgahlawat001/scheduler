export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-brand border border-brand hover:bg-blue-50'
  };

  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
