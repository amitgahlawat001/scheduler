import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import PasswordInput from '../components/common/PasswordInput';
import FieldError from '../components/common/FieldError';
import { validateEmail, validatePassword, validateConfirmPassword, validateRequired } from '../utils/validation';

const inputClass =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-shadow';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clearFieldError = (field) => setFieldErrors((f) => ({ ...f, [field]: '' }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {
      name: validateRequired(name, 'Name'),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword)
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Signup failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-br from-brand-light/30 via-blue-50 to-brand/10 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-cardIn">
        <div className="flex flex-col items-center mb-6">
          <span className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-2xl mb-3">
            📅
          </span>
          <h2 className="text-xl font-semibold text-gray-800">Create your account</h2>
          <p className="text-sm text-gray-500 mt-1">Start managing your schedule</p>
        </div>
        <form onSubmit={submit} noValidate className="flex flex-col gap-3">
          <div>
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError('name');
              }}
              className={inputClass}
            />
            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              className={inputClass}
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <PasswordInput
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              className={inputClass}
            />
            <FieldError message={fieldErrors.password} />
            {!fieldErrors.password && (
              <p className="text-gray-400 text-xs mt-1">
                Min 8 characters, with an uppercase letter, a number, and a special character.
              </p>
            )}
          </div>

          <div>
            <PasswordInput
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError('confirmPassword');
              }}
              className={inputClass}
            />
            <FieldError message={fieldErrors.confirmPassword} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting ? 'Signing up…' : 'Sign up'}
          </Button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
