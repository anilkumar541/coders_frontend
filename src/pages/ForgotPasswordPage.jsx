import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const forgotMutation = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotMutation.mutate({ email });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
        Forgot password
      </h1>
      <p className="text-sm text-gray-600 text-center mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {forgotMutation.isSuccess && (
        <div className="mb-4 p-3 text-sm text-green-700 border border-green-200 rounded-lg">
          {forgotMutation.data?.data?.detail ||
            "If an account with that email exists, a reset link has been sent."}
        </div>
      )}

      {forgotMutation.error && (
        <div className="mb-4 p-3 text-sm text-red-700 border border-red-200 rounded-lg">
          Something went wrong. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <button
          type="submit"
          disabled={forgotMutation.isPending}
          className="w-full py-2 px-4 border border-gray-900 text-white bg-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/login" className="text-gray-900 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
