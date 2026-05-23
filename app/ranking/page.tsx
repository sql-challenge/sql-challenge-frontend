import { RankingShell } from "./ranking-shell";

async function getRanking() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return [];
  try {
    const res = await fetch(`${baseUrl}/api/user/top?limit=20`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

export default async function RankingPage() {
  const players = await getRanking();
  return <RankingShell initialPlayers={players} />;
}
