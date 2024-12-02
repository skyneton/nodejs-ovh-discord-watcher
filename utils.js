import { readdirSync, lstatSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline/promises';
import { STATUS_API } from './config.js';
import KIMSUFI from "./reverse-server.json" with { type: "json" };

export async function loadCommand(dir, checker, clientCommands, commands) {
    for (const file of readdirSync(dir)) {
        const p = join(dir, file);
        if (lstatSync(p).isDirectory()) {
            loadCommand(p, checker, clientCommands, commands);
            continue;
        }
        if (!file.endsWith('.js')) continue;
        const { default: command } = await import(`./${p}`);
        if ('data' in command && 'execute' in command) {
            clientCommands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
        if ('check' in command)
            command.check(checker);
    }
}

export async function getParams(args) {
    let token = null;
    let interval = null;
    let clientId = null;
    let guildId = null;
    for (let i = 0; i < args.length; i++) {
        if (args[i].toLowerCase() == "--token")
            token = args[i + 1];
        else if (args[i].toLowerCase() == "--interval")
            interval = parseInt(args[i + 1]);
        else if (args[i].toLowerCase() == "--client-id")
            clientId = args[i + 1];
        else if (args[i].toLowerCase() == "--guild-id")
            guildId = args[i + 1];
    }
    if (!token || !interval) {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        if (!token) {
            const req = await rl.question("discord token: ");
            if (!req) {
                console.error("Please input your token.");
                process.exit(1);
            }
            token = req;
        }
        if (!clientId) {
            const req = await rl.question("client id: ");
            if (!req) {
                console.error("Please input your client id.");
                process.exit(1);
            }
            clientId = req;
        }
        if (!guildId) {
            const req = await rl.question("guild id: ");
            if (!req) {
                console.error("Please input your guild id.");
                process.exit(1);
            }
            guildId = req;
        }
        if (!interval) {
            const req = await rl.question("checking interval seconds(default: 100): ");
            if (!req)
                interval = 100;
            else
                interval = parseInt(req);
        }
    }
    return { token, clientId, guildId, interval };
}

export async function getKimsufiCode(server) {
    return server in KIMSUFI ? KIMSUFI[server] : server;
}

export async function getStatus(server, region) {
    let url = STATUS_API;
    if (!region || region == 'eur')
        url += `planCode=${server}`;
    else
        url += `server=${server}&datacenters=${region}`;

    const data = await fetch(url).then(r => r.json());
    return data;
}

export async function getAvailable(server, region) {
    const data = await getStatus(server, region);
    const availabilities = new Set();

    for (const service of data) {
        for (const datacenter of service.datacenters) {
            if (datacenter.availability == 'unavailable') continue;
            availabilities.add(datacenter.datacenter);
        }
    }
    return availabilities;
}