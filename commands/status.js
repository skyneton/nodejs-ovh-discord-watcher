import { SlashCommandBuilder } from "discord.js";
import { getStatus } from "../utils.js";
import SERVERS from "../server.json" with { type: "json" };;

export default {
    data: new SlashCommandBuilder().setName('status').setDescription('Current availability.')
        .addStringOption(option => option.setName('server').setDescription('Target server.').setRequired(true))
        .addStringOption(option => option.setName('region').setDescription('Target region.')),
    async execute(interaction) {
        const server = interaction.options.getString('server')?.toLowerCase();
        const region = interaction.options.getString('region')?.toLowerCase();
        const data = await getStatus(server, region);
        if (data.length == 0)
            return await interaction.reply(`Cannot found server or region.`);

        const planCode = data[0].planCode;
        let info = `## ${SERVERS[planCode] ?? planCode}`;
        for (const service of data) {
            const availabilities = [];
            const unavailablities = [];
            for (const datacenter of service.datacenters) {
                if (datacenter.availability == 'unavailable') {
                    unavailablities.push(datacenter.datacenter);
                    continue;
                }
                availabilities.push(datacenter.datacenter);
            }
            info += `
memory: **\` ${service.memory} \`**
storage: **\` ${service.storage} \`**
availabilities: __**\` ${availabilities.join(',')} \`**__
unavailablities: **\` ${unavailablities.join(',')} \`**
__**　　　　　　　　　　　　　　　　　　　　　　　　　**__`;
        }
        await interaction.reply(info);
    }
};