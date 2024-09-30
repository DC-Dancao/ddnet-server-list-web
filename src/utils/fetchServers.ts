export async function fetchServers() {
    const response = await fetch("https://master1.ddnet.org/ddnet/15/servers.json");
    if (!response.ok) {
        throw new Error(`Failed to fetch server data: ${response.statusText}`);
    }
    const data = await response.json();
    return data.servers;
}