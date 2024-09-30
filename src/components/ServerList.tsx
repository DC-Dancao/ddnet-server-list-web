import { useState } from "react";
import { Server } from "@/types";

interface ServerListProps {
    servers: Server[];
    onSelect: (server: Server) => void;
}

export default function ServerList({ servers, onSelect }: ServerListProps) {
    const [sortColumn, setSortColumn] = useState<string>("clients");
    const [sortDirection, setSortDirection] = useState<string>("desc");

    const handleServerSelect = (server: Server) => {
        onSelect(server);
    };

    const handleSort = (column: string) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const sortedServers = [...servers].sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        switch (sortColumn) {
            case "name":
                aValue = a.info.name;
                bValue = b.info.name;
                break;
            case "type":
                aValue = a.info.game_type;
                bValue = b.info.game_type;
                break;
            case "map":
                aValue = a.info.map.name;
                bValue = b.info.map.name;
                break;
            case "clients":
                aValue = a.info.clients.length;
                bValue = b.info.clients.length;
                break;
            case "location":
                aValue = a.location;
                bValue = b.location;
                break;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
            return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        } else {
            if (typeof aValue === "number") return sortDirection === "asc" ? 1 : -1;
            if (typeof bValue === "number") return sortDirection === "asc" ? -1 : 1;
            return 0;
        }
    });

    return (
        <div className="overflow-y-auto flex-grow">
            <table className="w-full table-auto">
                <thead>
                <tr>
                    <th
                        onClick={() => handleSort("name")}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                        Name {sortColumn === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                        onClick={() => handleSort("type")}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                        Type {sortColumn === "type" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                        onClick={() => handleSort("map")}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                        Map {sortColumn === "map" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                        onClick={() => handleSort("clients")}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                        Players {sortColumn === "clients" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                        onClick={() => handleSort("location")}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                        Location {sortColumn === "location" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                </tr>
                </thead>
                <tbody>
                {sortedServers.map((server) => (
                    <tr
                        key={`${server.info.name}-${server.addresses[0]}`}
                        onClick={() => handleServerSelect(server)}
                        className="hover:bg-gray-100 cursor-pointer"
                    >
              <td className="border px-4 py-2 text-balance">{server.info.name}</td>
              <td className="border px-4 py-2 text-balance">{server.info.game_type}</td>
              <td className="border px-4 py-2 max-w-64 truncate text-balance">{server.info.map.name}</td>
              <td className="border px-4 py-2 text-center text-balance">
                            {server.info.clients.length} / {server.info.max_clients}
                        </td>
                        <td className="border px-4 py-2">{server.location}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}