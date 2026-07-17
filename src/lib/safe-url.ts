import { lookup } from "dns/promises";
import { isIP } from "net";

function isPrivateOrLocalIp(ip: string): boolean {
  if (ip === "::1" || ip.startsWith("127.")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true;
  if (ip.startsWith("fe80:")) return true;

  const parts = ip.split(".").map(Number);
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }

  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal"
  );
}

// Bloqueia URLs que apontam pra redes privadas/locais — mitigação básica de
// SSRF quando o dashboard pede leitura de um site informado pelo usuário.
export async function assertSafePublicUrl(rawUrl: string): Promise<string> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Protocolo não permitido");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URL com credenciais não é permitida");
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("Host não permitido");
  }

  if (isIP(parsed.hostname)) {
    if (isPrivateOrLocalIp(parsed.hostname)) {
      throw new Error("IP privado ou local não é permitido");
    }
    return url;
  }

  const { address } = await lookup(parsed.hostname);
  if (isPrivateOrLocalIp(address)) {
    throw new Error("Host resolve para IP privado ou local");
  }

  return url;
}
