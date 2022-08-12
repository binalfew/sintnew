export function getEnv() {
  return {
    ADMIN_EMAIL: "admin@sintnew.com",
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
