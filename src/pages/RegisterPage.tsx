import { RegisterForm } from "../components/auth/RegisterForm";

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Back to Home */}

      <RegisterForm />
    </div>
  );
}

export default RegisterPage;
