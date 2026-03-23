import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin, useResendVerification } from "../hooks/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({ username_or_email: "", password: "" });
  const loginMutation = useLogin();
  const resendMutation = useResendVerification();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(form);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const errorData = loginMutation.error?.response?.data;
  const isUnverified = errorData?.email_not_verified;
  const unverifiedEmail = errorData?.email;

  const errorMessage =
    isUnverified
      ? null
      : errorData?.detail ||
        errorData?.non_field_errors?.[0] ||
        (loginMutation.error ? "Login failed. Please try again." : null);

  const handleResend = () => {
    if (unverifiedEmail) {
      resendMutation.mutate({ email: unverifiedEmail });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">
        Welcome back
      </h1>

      {errorMessage && (
        <div className="mb-4 p-3 text-sm text-red-700 border border-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}

      {isUnverified && (
        <div className="mb-4 p-3 text-sm border border-amber-200 rounded-lg">
          <p className="text-amber-700 mb-2">
            Please verify your email address before logging in.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendMutation.isPending}
            className="text-sm text-gray-900 hover:underline cursor-pointer"
          >
            {resendMutation.isPending
              ? "Sending..."
              : "Resend verification email"}
          </button>
          {resendMutation.isSuccess && (
            <p className="mt-1 text-sm text-green-700">
              Verification email sent!
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username_or_email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username or Email
          </label>
          <input
            id="username_or_email"
            name="username_or_email"
            type="text"
            required
            value={form.username_or_email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter your username or email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-2 px-4 border border-gray-900 text-white bg-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
        <p>
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Forgot your password?
          </Link>
        </p>
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
