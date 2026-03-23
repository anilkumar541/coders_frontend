import { useState } from "react";
import { Link } from "react-router-dom";
import { useSignup } from "../hooks/useAuth";

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const signupMutation = useSignup();

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation.mutate(form);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const errors = signupMutation.error?.response?.data;

  if (signupMutation.isSuccess) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Check your email
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          We&apos;ve sent a verification link to{" "}
          <span className="font-medium text-gray-900">{form.email}</span>.
          Please click the link to verify your account.
        </p>
        <p className="text-sm text-gray-600">
          Already verified?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">
        Create an account
      </h1>

      {errors?.non_field_errors && (
        <div className="mb-4 p-3 text-sm text-red-700 border border-red-200 rounded-lg">
          {errors.non_field_errors[0]}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={form.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Choose a username"
          />
          {errors?.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username[0]}</p>
          )}
        </div>

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
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter your email"
          />
          {errors?.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
          )}
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
            placeholder="Create a password"
          />
          {errors?.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm_password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            value={form.confirm_password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Confirm your password"
          />
          {errors?.confirm_password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirm_password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full py-2 px-4 border border-gray-900 text-white bg-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {signupMutation.isPending ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}
