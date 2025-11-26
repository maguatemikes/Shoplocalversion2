import { LoginForm } from "../components/auth/LoginForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Back to Home */}
      <LoginForm />
    </div>
  );
}

export default LoginPage;
