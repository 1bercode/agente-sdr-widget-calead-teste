import * as cheerio from "cheerio";
import { assertSafePublicUrl } from "@/lib/safe-url";

// RAG simplificado v1: busca a home + páginas comuns (preços, serviços,
// sobre) e injeta texto puro no system prompt.

const MAX_CHARS_TOTAL = 12000;
const MAX_PAGES = 4;

export interface CrawlResult {
  text: string;
  status: "done" | "failed";
}

const EXTRA_PATHS = [
  "/precos",
  "/preços",
  "/pricing",
  "/servicos",
  "/serviços",
  "/services",
  "/sobre",
  "/about",
  "/contato",
  "/contact",
];

function normalizeBaseUrl(siteUrl: string): string {
  let url = siteUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}`;
}

function extractPageText(html: string, pageLabel: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, iframe").remove();

  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1 = $("h1").first().text().trim();
  const bodyText = $("main, article, [role='main'], body")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return [
    `--- ${pageLabel} ---`,
    title && `Título: ${title}`,
    h1 && h1 !== title && `H1: ${h1}`,
    metaDescription && `Descrição: ${metaDescription}`,
    bodyText,
  ]
    .filter(Boolean)
    .join("\n");
}

async function fetchPageText(url: string, label: string): Promise<string | null> {
  try {
    const safeUrl = await assertSafePublicUrl(url);
    const res = await fetch(safeUrl, {
      headers: { "User-Agent": "CaleadBot/0.1 (+https://calead.app)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = extractPageText(html, label);
    return text.length > 80 ? text : null;
  } catch {
    return null;
  }
}

function discoverLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const found = new Set<string>();
  const keywords = /prec[oõ]|pricing|servi[cç]|service|sobre|about|contato|contact|planos|packages/i;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const absolute = new URL(href, baseUrl).toString();
      const path = new URL(absolute).pathname;
      const linkText = $(el).text().trim();
      if (keywords.test(path) || keywords.test(linkText)) {
        found.add(absolute.split("#")[0]);
      }
    } catch {
      // ignora URLs inválidas
    }
  });

  return [...found].slice(0, MAX_PAGES - 1);
}

export async function fetchSiteKnowledge(siteUrl: string): Promise<CrawlResult> {
  try {
    const baseUrl = normalizeBaseUrl(siteUrl);
    const homeUrl = await assertSafePublicUrl(siteUrl);

    const homeRes = await fetch(homeUrl, {
      headers: { "User-Agent": "CaleadBot/0.1 (+https://calead.app)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!homeRes.ok) return { text: "", status: "failed" };

    const homeHtml = await homeRes.text();
    const chunks: string[] = [];
    const homeText = extractPageText(homeHtml, "Home");
    if (homeText) chunks.push(homeText);

    const candidateUrls = new Set<string>();

    for (const path of EXTRA_PATHS) {
      candidateUrls.add(`${baseUrl}${path}`);
    }
    for (const link of discoverLinks(homeHtml, baseUrl)) {
      candidateUrls.add(link);
    }

    for (const url of candidateUrls) {
      if (chunks.length >= MAX_PAGES) break;
      if (url.replace(/\/$/, "") === homeUrl.replace(/\/$/, "")) continue;

      const path = new URL(url).pathname || "/";
      const pageText = await fetchPageText(url, path);
      if (pageText) chunks.push(pageText);
    }

    if (chunks.length === 0) return { text: "", status: "failed" };

    return {
      text: chunks.join("\n\n").slice(0, MAX_CHARS_TOTAL),
      status: "done",
    };
  } catch (err) {
    console.error("[crawler] falha ao ler site:", err);
    return { text: "", status: "failed" };
  }
}
