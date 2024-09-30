import { ServerInfo as ServerInfoType } from "@/types";

interface ServerInfoProps {
    serverInfo: ServerInfoType;
}

export default function ServerInfo({ serverInfo }: ServerInfoProps) {
    return (
        <div className="p-4 border rounded-md shadow-sm">
            <h2 className="text-lg font-bold mb-2 text-balance">
                {serverInfo.name}
            </h2>
            <p>Game Type: {serverInfo.game_type}</p>
            <p>Map: {serverInfo.map.name}</p>
            <p>Version: {serverInfo.version}</p>
            <p>
                Clients: {serverInfo.clients.length} / {serverInfo.max_clients}
            </p>
        </div>
    );
}