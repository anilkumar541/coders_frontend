import { useSearchParams, Link } from "react-router-dom";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const verificationStatus = searchParams.get("status");

  const content = {
    success: {
      title: "Email verified!",
      message: "Your email has been verified successfully. You can now log in.",
      type: "success",
    },
    already_verified: {
      title: "Already verified",
      message: "Your email has already been verified. You can log in.",
      type: "info",
    },
    invalid: {
      title: "Invalid link",
      message:
        "This verification link is invalid or has expired. Please request a new one.",
      type: "error",
    },
  };

  const current = content[verificationStatus] || content.invalid;

  const borderColor = {
    success: "border-green-200",
    info: "border-blue-200",
    error: "border-red-200",
  }[current.type];

  const textColor = {
    success: "text-green-700",
    info: "text-blue-700",
    error: "text-red-700",
  }[current.type];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          {current.title}
        </h1>

        <div className={`mb-6 p-4 text-sm ${textColor} border ${borderColor} rounded-lg`}>
          {current.message}
        </div>

        <Link
          to="/login"
          className="inline-block px-6 py-2 text-sm border border-gray-900 text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
