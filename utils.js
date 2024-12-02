import { readdirSync, lstatSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';
import { STATUS_API } from './config.js';
import REGION from './commands/region.js';

export async function loadCommand(dir, checker) {
    for (const file of readdirSync(dir)) {
        const p = join(dir, file);
        if (lstatSync(p).isDirectory()) {
            loadCommand(p, checker);
            continue;
        }
        if (!file.endsWith('.js')) continue;
        const command = await import(`./${p}`);
        console.log(command);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        if ('check' in command)
            command.check(checker);
    }
}

export async function getParams(args) {
    let token = args[0];
    let interval = args[1];
    if (!token || !interval) {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        if (!token) {
            const reqToken = rl.question("discord token: ");
            if (!reqToken) {
                console.error("Please input your token.");
                process.exit(1);
            }
            token = reqToken;
        }
        if (!interval) {
            const reqInterval = rl.question("checking interval seconds(default: 100): ");
            if (!reqInterval)
                interval = 100;
            else
                interval = reqInterval;
        }
    }
    return [token, interval];
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
    const data = getStatus(server, region);
    const availabilities = new Set();

    for (const service of data) {
        for (const datacenter of service.datacenter) {
            if (datacenter.availability == 'unavailable') continue;
            availabilities.add(datacenter.datacenter);
        }
    }
    return availabilities;
}