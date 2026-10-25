import { SITE_URL } from "@/lib/seo";

const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Meta-ExternalAgent",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
];

const NOTICE = [
  "# ---------------------------------------------",
  "# llms.txt dosyası hakkında bilgi",
  "# Radyo ÖzÜ'nün herkese açık sayfaları ve içerikleri LLM'ler tarafından kullanılabilir.",
  `# Ayrıntılar: ${SITE_URL}/llms.txt`,
  "# ---------------------------------------------",
];

const DISALLOW = ["/admin", "/api"];

export function GET() {
  const rules = ["*", ...AI_BOTS].flatMap((userAgent) => [
    `User-Agent: ${userAgent}`,
    "Allow: /",
    ...DISALLOW.map((path) => `Disallow: ${path}`),
    "",
  ]);

  const body = [...NOTICE, "", ...rules, `Sitemap: ${SITE_URL}/sitemap.xml`, ""].join(
    "\n",
  );

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
