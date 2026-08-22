export type AuthMode = "login" | "register";

export function getAuthEndpoint(mode: AuthMode) {
  return mode === "register" ? "/api/auth/register" : "/api/auth/login";
}

export function buildAuthPayload(
  mode: AuthMode,
  form: { name?: string; email: string; password: string },
) {
  if (mode === "register") {
    return {
      name: form.name?.trim() || form.email.split("@")[0],
      email: form.email.trim(),
      password: form.password,
    };
  }

  return {
    email: form.email.trim(),
    password: form.password,
  };
}
