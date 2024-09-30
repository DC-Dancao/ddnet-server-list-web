export interface Server {
    addresses: string[]; // Or you can keep this as ServerAddress[] if you prefer
    location: string;
    info: ServerInfo;
}

// You can remove ServerAddress if you're using string[] for addresses in Server
// export type ServerAddress = string;

export interface ServerInfo {
    max_clients: number;
    max_players: number;
    passworded: boolean;
    game_type: string;
    name: string;
    map: {
        name: string;
        sha256?: string; // sha256 is optional
        size?: number; // size is optional
    };
    version: string;
    clients: Client[];
    client_score_kind?: string; // client_score_kind is optional
    requires_login?: boolean; // requires_login is optional
    community?: { // community is optional
        id: string;
        icon: string;
        admin: string[]; // admin is an array of strings
        public_key: string;
        signature: string;
    };
    skill_level?: number; // skill_level is optional and a number
    altameda_net?: boolean; // altameda_net is optional
}

export interface Client {
    name: string;
    clan: string;
    country: number;
    score: number;
    is_player: boolean;
    skin?: { // skin is optional
        name: string;
        color_body?: number; // color_body is optional
        color_feet?: number; // color_feet is optional
        body?: { name: string; color: string }; // body is optional
        marking?: { name: string; color: string }; // marking is optional
        decoration?: { name: string; color: string }; // decoration is optional
        hands?: { name: string; color: string }; // hands is optional
        feet?: { name: string; color: string }; // feet is optional
        eyes?: { name: string; color: string }; // eyes is optional
    };
    afk?: boolean; // afk is optional
    team?: number; // team is optional
}