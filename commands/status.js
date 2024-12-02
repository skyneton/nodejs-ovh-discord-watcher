import { SlashCommandBuilder } from "discord.js";
import { getStatus } from "../utils";
import SERVERS from "../server.json";

export default {
    data: new SlashCommandBuilder().setName('status').setDescription('Current availability.')
        .addStringOption(option => option.setName('server').setDescription('Wonder server.').setRequired(true))
        .addStringOption(option => option.setName('region').setDescription('Wonder region.')),
    async execute(interaction) {
        const server = interaction.options.getString('server');
        const region = interaction.options.getString('region');
        const data = getStatus(server, region);
        if (Object.keys(data).length == 0)
            return await interaction.reply(`Cannot found server or region.`);

        const planCode = data[0].planCode;
        let info = `### ${SERVERS[planCode] ?? planCode}`;
        for (const service of data) {
            const availabilities = [];
            const unavailablities = [];
            for (const datacenter of service.datacenter) {
                if (datacenter.availability == 'unavailable') {
                    unavailablities.push(datacenter.datacenter);
                    continue;
                }
                availabilities.push(datacenter.datacenter);
            }
            info += `
memory: \`\`\`${service.memory}\`\`\`
storage: \`\`\`${service.storage}\`\`\`
availabilities: \`\`\`${availabilities.join(',')}\`\`\`
unavailablities: \`\`\`${unavailablities.join(',')}\`\`\`
**-----------------**`;
        }
        await interaction.reply(info);
    }
};