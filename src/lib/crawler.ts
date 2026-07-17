import * as cheerio from "cheerio";
import { assertSafePublicUrl } from "@/lib/safe-url";

// RAG simplificado v1: em vez de indexar o site inteiro com embeddings e
// busca vetorial, a gente busca a home, tira o HTML, e joga o texto puro
// como contexto direto no system prompt (veja src/lib/prompt.ts). Funciona
// bem pra sites pequenos/institucionais. Limitação conhecida: só a home,
// não segue links internos ainda — próxima melhoria natural é rastrear
// algumas páginas (ex: /sobre, /produto, /preços) e, se o volume crescer,
// migrar pra embeddings + pgvector.

const MAX_CHARS = 8000;

export interface CrawlResult {
  text: string;
  status: "done" | "failed";
}

export async function fetchSiteKnowledge(siteUrl: string): Promise<CrawlResult> {
  try {
    const url = await assertSafePublicUrl(siteUrl);
    const res = await fetch(url, {
      headers: { "User-Agent": "CaleadBot/0.1 (+https://calead.app)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { text: "", status: "failed" };

    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, svg, nav, footer").remove();

    const title = $("title").first().text().trim();
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const combined = [title && `Título: ${title}`, metaDescription && `Descrição: ${metaDescription}`, bodyText]
      .filter(Boolean)
      .join("\n\n");

    return { text: combined.slice(0, MAX_CHARS), status: "done" };
  } catch (err) {
    console.error("[crawler] falha ao ler site:", err);
    return { text: "", status: "failed" };
  }
}
