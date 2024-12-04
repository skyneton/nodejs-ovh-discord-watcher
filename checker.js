import REGION from "./region.json" with { type: "json" };
import { writeFileSync, existsSync } from "fs";
import { getAvailable } from "./utils.js";
import { WebhookClient } from "discord.js";
import SERVERS from "./server.json" with { type: "json" };;

export class Checker {
    id = 0;
    data = {};
    notified = {};
    constructor() {
        this.load();
    }

    sendChannels(server, webhooks, regions) {
        let info = `## ${SERVERS[server] ?? server}
\navailable notify: __**\`\`\`${regions}\`\`\`**__`;
        for (const webhook of webhooks) {
            const key = `${server}.${webhook}`;
            if (Date.now() - (this.notified[key] ?? 0) >= 30 * 60 * 1000) {
                const hook = new WebhookClient({ url: webhook });
                hook.send(info);
            }
        }
    }

    stop() {
        clearInterval(this.id);
    }

    async work() {
        const delServerList = [];
        for (const serverKey in this.data) {
            const server = this.data[serverKey];
            const regionList = new Set(Object.keys(server));
            if (regionList.size == 0) {
                delServerList.add(serverKey);
                continue;
            }
            if (regionList.has("eur") && regionList.size > 1) {
                regionList.add("gra");
                regionList.add("sbg");
                regionList.add("rbx");
                regionList.add("bhs");
                regionList.add("waw");
                regionList.add("fra");
                regionList.add("lon");
                regionList.delete("eur");
            }
            const delRegionList = [];
            const availabilities = await getAvailable(serverKey, Array.from(regionList).join(','));
            for (const regionKey in server) {
                if (regionKey.size == 0) delRegionList.push(regionKey);
                if (regionKey == 'eur') {
                    let eur = "";
                    if (availabilities.has("gra")) eur += ",gra";
                    if (availabilities.has("sbg")) eur += ",sbg";
                    if (availabilities.has("rbx")) eur += ",rbx";
                    if (availabilities.has("bhs")) eur += ",bhs";
                    if (availabilities.has("waw")) eur += ",waw";
                    if (availabilities.has("fra")) eur += ",fra";
                    if (availabilities.has("lon")) eur += ",lon";
                    if(eur)
                        this.sendChannels(serverKey, server[regionKey], eur.substring(1));

                    continue;
                }
                if (availabilities.has(regionKey)) this.sendChannels(serverKey, server[regionKey], regionKey);
            }
            for (const region of delRegionList) {
                delete server[region];
            }
        }
        for (const server of delServerList) {
            delete this.data[server];
        }
    }

    start(interval) {
        this.id = setInterval(async () => {
            try {
                await work();
            } catch (e) {
                console.error(e);
            }
        }, interval * 1000);
    }

    update(webhook, server, region) {
        if (!region || !(region in REGION)) region = 'eur';
        if (!(server in this.data)) this.data[server] = {};
        if (!(region in this.data[server])) this.data[server][region] = new Set();
        this.data[server][region].add(webhook);
        this.save();
    }

    remove(webhook, server, region) {
        if (!region || !(region in REGION)) region = 'eur';
        if (!(server in this.data)) return;
        if (!(region in this.data[server])) return;
        this.data[server][region].delete(webhook);
        this.save();
    }

    save() {
        const raw = {};
        for (const serverKey in this.data) {
            const server = this.data[serverKey];
            if (Object.keys(server) == 0) continue;
            raw[serverKey] = {};
            for (const regionKey in server) {
                const region = server[regionKey];
                if (region.size == 0) continue;
                raw[serverKey][regionKey] = Array.from(region);
            }
        }
        writeFileSync("data.json", JSON.stringify(raw, null, 4));
    }

    async load() {
        if (!existsSync("data.json")) return;
        const { default: raw } = await import("./data.json", { with: { type: "json" } });
        for (const serverKey in raw) {
            const server = raw[serverKey];
            if (Object.keys(server) == 0) continue;
            this.data[serverKey] = {};
            for (const regionKey in server) {
                const region = server[regionKey];
                if (region.length == 0) continue;
                this.data[serverKey][regionKey] = new Set(region);
            }
        }
    }
}