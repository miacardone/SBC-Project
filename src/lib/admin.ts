const PIN = process.env.ADMIN_PIN ?? "911911";

export function checkPin(request: Request): boolean {
  const url = new URL(request.url);
  const supplied =
    request.headers.get("x-admin-pin") ?? url.searchParams.get("pin") ?? "";
  return supplied === PIN;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "bad pin" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
