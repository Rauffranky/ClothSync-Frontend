import { useEffect, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../Components/UI/Button";
import Input from "../../Components/UI/Input";
import { usePageMeta } from "../../Hooks/usePageMeta";
import { applyThemeMode, getThemeMode } from "../../Utils/themeMode";
import Card from "../../Components/UI/Card";

const SuperAdminLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  usePageMeta({
    title: "Super Admin Login | RFID Laundry",
    meta: [
      {
        name: "description",
        content: "Separate Super Admin login for RFID Laundry management.",
      },
    ],
  });

  useEffect(() => {
    applyThemeMode(getThemeMode());
  }, []);

  const handleFieldChange = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/superadmin/dashboard");
  };

  return (
    <>
      <main className="relative flex min-h-screen items-center justify-center ">
        <Card padding="30px">
          <form
            className="w-100 max-w-full"
            onSubmit={handleSubmit}
          >
            <div className="mb-6 flex items-start justify-center gap-4">
              <div>
                <h2 className="m-0  text-3xl font-black text-(--theme-text-primary)">
                  Super Admin Login
                </h2>
              </div>
            </div>

            <div className="grid gap-4">
              <Input
                label="Email"
                leftIcon={<Mail size={18} />}
                onChange={handleFieldChange("email")}
                placeholder="Enter super admin email"
                required
                type="email"
                value={form.email}
              />
              <Input
                label="Password"
                leftIcon={<LockKeyhole size={18} />}
                onChange={handleFieldChange("password")}
                placeholder="Enter password"
                required
                type="password"
                value={form.password}
              />
            </div>

            <Button className="mt-6" fullWidth size="lg" type="submit">
              Enter Dashboard
            </Button>

            <p className="m-0 mt-5 text-center text-sm font-semibold text-(--theme-text-secondary)">
              Business or laundry user?{" "}
              <Link
                className="text-(--color-aurora-teal) hover:underline"
                to="/business/login"
              >
                Use portal login
              </Link>
            </p>
          </form>
        </Card>
      </main>
    </>
  );
};

export default SuperAdminLoginPage;
