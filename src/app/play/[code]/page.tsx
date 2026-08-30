import { PlayerApp } from "@/components/game/player-app";

export default async function PlayPage({ params }: PageProps<"/play/[code]">) {
  const { code } = await params;
  return <PlayerApp roomCode={code.toUpperCase()} />;
}
