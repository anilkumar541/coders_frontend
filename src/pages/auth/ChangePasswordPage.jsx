import { useState } from "react";
import { useChangePassword } from "../../hooks/useAuth";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const changeMutation = useChangePassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    changeMutation.mutate(form, {
      onSuccess: () => {
        setForm({ old_password: "", new_password: "", confirm_new_password: "" });
      },
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const errors = changeMutation.error?.response?.data;

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">
        Change password
      </h1>

      {changeMutation.isSuccess && (
        <div className="mb-4 p-3 text-sm text-green-700 border border-green-200 rounded-lg">
          Password changed successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="old_password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Current Password
          </label>
          <input
            id="old_password"
            name="old_password"
            type="password"
            required
            value={form.old_password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter current password"
          />
          {errors?.old_password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.old_password[0]}
            </p>
          )}
        </div>

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
          disabled={changeMutation.isPending}
          className="w-full py-2 px-4 border border-gray-900 text-white bg-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {changeMutation.isPending ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
