import { SlashCommandBuilder } from "discord.js";
import SERVERS from "../server.json" with { type: "json" };;

let info = "";
for (const code in SERVERS) {
    if (info) info += '\n';
    info += `\`\`\`${code}\`\`\`: ${SERVERS[code]}`;
}

export default {
    data: new SlashCommandBuilder().setName('servers').setDescription('Show kimsufi server code.'),
    async execute(interaction) {
        await interaction.reply(info);
    }
};