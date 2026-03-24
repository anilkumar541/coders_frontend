import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useResetPassword } from "../../hooks/useAuth";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const [form, setForm] = useState({
    new_password: "",
    confirm_new_password: "",
  });
  const resetMutation = useResetPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    resetMutation.mutate({ uid, token, ...form });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const errors = resetMutation.error?.response?.data;

  if (resetMutation.isSuccess) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Password reset successful
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Your password has been reset successfully. You can now log in with
          your new password.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2 text-sm border border-gray-900 text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">
        Reset password
      </h1>

      {errors?.uid && (
        <div className="mb-4 p-3 text-sm text-red-700 border border-red-200 rounded-lg">
          Invalid reset link. Please request a new one.
        </div>
      )}

      {errors?.token && (
        <div className="mb-4 p-3 text-sm text-red-700 border border-red-200 rounded-lg">
          This reset link has expired. Please request a new one.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="new_password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            required
            value={form.new_password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter new password"
          />
          {errors?.new_password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.new_password[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm_new_password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm New Password
          </label>
          <input
            id="confirm_new_password"
            name="confirm_new_password"
            type="password"
            required
            value={form.confirm_new_password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Confirm new password"
          />
          {errors?.confirm_new_password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirm_new_password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="w-full py-2 px-4 border border-gray-900 text-white bg-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {resetMutation.isPending ? "Resetting..." : "Reset Password"}
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
