import { Button, FormControl, IconButton, Input, InputAdornment, InputLabel } from "@mui/material";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaUserShield, FaUsers } from "react-icons/fa";
import { GiCow } from "react-icons/gi";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { formatUzPhone, stripPhoneFormatting } from "../../utilties/formatPhone";

type Audience = "worker" | "admin";

function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [audience, setAudience] = useState<Audience>("worker");

  const schema = z.object({
    identifier: z.string().min(3, { message: "Required" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const identifierField = register("identifier");

  const onSubmit = async (data: FieldValues) => {
    setError(null);
    setLoading(true);
    try {
      const identifier =
        audience === "worker" ? stripPhoneFormatting(data.identifier) : data.identifier;
      const res = await authService.login(identifier, data.password);
      setAuth(res.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.loginFailed", { defaultValue: "Login failed" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-error text-2xl text-white">
            <GiCow />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-center">{t("auth.title")}</h2>
          <p className="mt-1 text-center text-sm text-gray-400">
            {t("auth.subtitle", { defaultValue: "Davom etish uchun ma'lumotlaringizni kiriting" })}
          </p>
        </div>

        {/* Audience switch */}
        <div className="mt-7 grid grid-cols-2 gap-1 rounded-xl bg-background p-1">
          {(
            [
              { key: "worker", label: t("auth.workerTab", { defaultValue: "Ishchi" }), icon: <FaUsers /> },
              { key: "admin", label: t("auth.adminTab", { defaultValue: "Admin" }), icon: <FaUserShield /> },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAudience(opt.key)}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
                audience === opt.key
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        <form
            className="mt-6 flex flex-col gap-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <FormControl className="w-full">
              <InputLabel htmlFor="identifier-input">
                {audience === "admin" ? t("auth.email") : t("auth.phone", { defaultValue: "Telefon raqami" })}
              </InputLabel>
              <Input
                id="identifier-input"
                type={audience === "admin" ? "email" : "tel"}
                placeholder={audience === "admin" ? undefined : "+998 90 123 45 67"}
                autoComplete={audience === "admin" ? "email" : "tel"}
                {...identifierField}
                onChange={(e) => {
                  if (audience === "worker") e.target.value = formatUzPhone(e.target.value);
                  identifierField.onChange(e);
                }}
              />
              <span className="mt-1 text-xs text-error">{errors.identifier?.message}</span>
            </FormControl>

            <FormControl className="w-full">
              <InputLabel htmlFor="password-input">{t("auth.password")}</InputLabel>
              <Input
                id="password-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={t(showPassword ? "auth.hidePassword" : "auth.showPassword", {
                        defaultValue: showPassword ? "Hide password" : "Show password",
                      })}
                      edge="end"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <span className="mt-1 text-xs text-error">{errors.password?.message}</span>
            </FormControl>

            {error && (
              <p className="rounded-lg bg-error/5 px-3 py-2 text-center text-sm text-error">
                {error}
              </p>
            )}

            <Button type="submit" variant="contained" color="error" disabled={loading} size="large">
              {loading ? t("common.loading") : t("common.submit")}
            </Button>
          </form>
      </div>
    </div>
  );
}

export default Auth;
