import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const SKINS_DIR = path.join(process.cwd(), 'public', 'skins');

async function checkLocalFile(filepath: string): Promise<Buffer | null> {
    try {
        return await fs.readFile(filepath);
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function fetchRemoteFile(url: string): Promise<ArrayBuffer | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.arrayBuffer();
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return null;
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { name } = req.query;
    if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Invalid name parameter' });
    }

    const locations = [
        { type: 'local', path: path.join(SKINS_DIR, `${name}.png`) },
        { type: 'remote', url: `https://skins.ddnet.org/skin/community/${name}.png` },
        { type: 'remote', url: `https://skins.ddnet.org/skin/${name}.png` },
        { type: 'local', path: path.join(SKINS_DIR, 'default.png') },
    ];

    for (const location of locations) {
        let data: Buffer | ArrayBuffer | null = null;
        if (location.type === 'local' && location.path) {
            data = await checkLocalFile(location.path);
        } else if (location.type === 'remote' && location.url) {
            data = await fetchRemoteFile(location.url);
        }

        if (data) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('Content-Type', 'image/png');
            return res.send(Buffer.from(data));
        }
    }

    console.error('Failed to fetch skin image from all sources');
    res.status(500).json({ error: 'Failed to fetch skin image' });
}