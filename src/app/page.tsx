import { Suspense } from 'react';
import { fetchServers } from "@/utils/fetchServers";
import ServerListClient from "@/components/ServerListClient";

export const revalidate = 0;

async function getServers() {
    return await fetchServers();
}

export default async function Home() {
    const initialServers = await getServers();

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ServerListClient initialServers={initialServers} />
        </Suspense>
    );
}