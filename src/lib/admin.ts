import { envText } from "./env";

const DEFAULT_PIN = "911911";
const PIN = envText("ADMIN_PIN") ?? DEFAULT_PIN;

/** True when nobody set a PIN — the console is on its published default. */
export const usingDefaultPin = PIN === DEFAULT_PIN;

export function checkPin(request: Request): boolean {
  const url = new URL(request.url);
  const supplied =
    request.headers.get("x-admin-pin") ?? url.searchParams.get("pin") ?? "";
  // An empty PIN must never authorise anything, whatever the config says.
  if (supplied === "") return false;
  return supplied === PIN;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "bad pin" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
