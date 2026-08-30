import { HostGameApp } from "@/components/game/host-game-app";

export default async function HostPage({ params }: PageProps<"/host/[code]">) {
  const { code } = await params;
  return <HostGameApp roomCode={code.toUpperCase()} />;
}
