"use client";

import { useState, useEffect } from "react";
import { fetchServers } from "@/utils/fetchServers";
import ServerList from "@/components/ServerList";
import ClientList from "@/components/ClientList";
import { Server } from "@/types";
import { debounce } from "lodash";

export default function ServerListClient({
                                             initialServers,
                                         }: {
    initialServers: Server[];
}) {
    const [servers, setServers] = useState<Server[]>(initialServers);
    const [selectedServer, setSelectedServer] = useState<Server | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [excludeQuery, setExcludeQuery] = useState("");
    const [filteredServers, setFilteredServers] = useState(initialServers);
    const [serverAddress, setServerAddress] = useState("");

    const handleServerSelect = (server: Server) => {
        setSelectedServer(server);
        const [ip, port] = server.addresses[0].match(/(\d+\.\d+\.\d+\.\d+):(\d+)/)!.slice(1);
        setServerAddress(`${ip}:${port}`);
    };

    const handleRefresh = debounce(async () => {
        try {
            const serverData = await fetchServers();
            setServers(serverData);
        } catch (error) {
            console.error("Error fetching server data:", error);
        }
    }, 500);

    useEffect(() => {
        const debouncedFilter = debounce(() => {
            const filtered = servers.filter((server) => {
                let serverNameMatch = true;
                let clientNameMatch = true;
                let excludeMatch = false;

                if (searchQuery) {
                    serverNameMatch = server.info.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    clientNameMatch = server.info.clients.some((client) =>
                        client.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                }

                if (excludeQuery) {
                    excludeMatch = server.info.name
                        .toLowerCase()
                        .includes(excludeQuery.toLowerCase());
                }

                if (excludeMatch) {
                    return false;
                }

                return serverNameMatch || clientNameMatch;
            });

            setFilteredServers(filtered);
        }, 500);

        debouncedFilter();

        return () => {
            debouncedFilter.cancel();
        };
    }, [servers, searchQuery, excludeQuery]);

    const totalPlayers = servers.reduce(
        (total, server) => total + server.info.clients.length,
        0
    );

    const filteredPlayers = filteredServers.reduce(
        (total, server) => total + server.info.clients.length,
        0
    );

    return (
        <div className="container mx-auto p-8 flex h-screen">
            <div className="flex flex-col w-full lg:w-3/4 mr-4 overflow-y-auto overflow-x-auto">
                <ServerList
                    servers={filteredServers}
                    onSelect={handleServerSelect}
                />
                <div className="mt-4 bg-white p-4 border-t grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center mb-2">
                            <label htmlFor="search" className="mr-2 text-gray-600 w-20">Search:</label>
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    id="search"
                                    className="border rounded-md px-2 py-1 w-full pr-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center mb-2">
                            <label htmlFor="exclude" className="mr-2 text-gray-600 w-20">Exclude:</label>
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    id="exclude"
                                    className="border rounded-md px-2 py-1 w-full pr-8"
                                    value={excludeQuery}
                                    onChange={(e) => setExcludeQuery(e.target.value)}
                                />
                                {excludeQuery && (
                                    <button
                                        onClick={() => setExcludeQuery("")}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="serverAddress" className="mr-2 text-gray-600 w-20">Address:</label>
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    id="serverAddress"
                                    className="border rounded-md px-2 py-1 w-full pr-8"
                                    value={serverAddress}
                                    onChange={(e) => setServerAddress(e.target.value)}
                                />
                                {serverAddress && (
                                    <button
                                        onClick={() => setServerAddress("")}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                    <div className="text-right">
                        <div className="mb-2">
                            Players: {filteredPlayers} / {totalPlayers}
                        </div>
                        <div className="mb-2">
                            Servers: {filteredServers.length} / {servers.length}
                        </div>
                        <div className="flex justify-end items-center">
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
                            >
                                Refresh
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-md"
                                onClick={() => {
                                    if (serverAddress) {
                                        const [ip, port] = serverAddress.split(":");
                                        window.location.href = `ddnet://${ip}:${port}`;
                                    }
                                }}
                            >
                                Join Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-1/4 h-full overflow-y-auto">
                {selectedServer && (
                    <ClientList
                        clients={selectedServer.info.clients}
                        serverInfo={selectedServer.info}
                    />
                )}
            </div>
        </div>
    );
}