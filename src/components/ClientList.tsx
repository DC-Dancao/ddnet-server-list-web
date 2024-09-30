import {Client, ServerInfo} from "@/types";
import TeeRenderer from "@/components/TeeRenderer";

const formatTime = (type: string | undefined, time: number) => {
    if (type !== 'time') return time;
    if (time < 0) return '';
    const hours = Math.floor(time / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
};

interface ClientListProps {
    clients: Client[];
    serverInfo: ServerInfo;
}

export default function ClientList({clients, serverInfo}: ClientListProps) {
    const filteredClients = clients.filter(client => !(client.name === "(connecting)" && !client.is_player));

    const sortedClients = [...filteredClients].sort((a, b) => {
        if (serverInfo.client_score_kind === 'time' && a.score > 0 && b.score > 0) {
            return a.score - b.score;
        } else {
            if (a.score !== b.score) {
                return b.score - a.score;
            } else {
                return a.name.localeCompare(b.name);
            }
        }
    });

    return (
        <div className="h-full overflow-y-auto px-4">
            <h3 className="text-xl font-semibold mb-2 pt-4">Players</h3>
            <ul className="divide-y divide-gray-200">
                {sortedClients.map((client) => (
                    <li key={client.name} className="py-2 flex items-center space-x-4">
                        <div className="w-16 text-center">
                            <p className="font-bold">
                                {formatTime(
                                    serverInfo.client_score_kind,
                                    client.score
                                )}
                            </p>
                        </div>
                        <div className="w-16 h-16">
                            <TeeRenderer
                                skinName={client.skin?.name || 'default'}
                                bodyColor={client.skin?.color_body ? client.skin.color_body.toString() : undefined}
                                feetColor={client.skin?.color_feet ? client.skin.color_feet.toString() : undefined}
                                colorFormat="code"
                            />
                        </div>
                        <div className="flex-grow flex flex-col">
                            <div className="font-semibold">{client.name}</div>
                            {client.clan && (
                                <div className="text-gray-600 text-sm">{client.clan}</div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}