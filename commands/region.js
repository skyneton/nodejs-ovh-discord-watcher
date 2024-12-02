import { SlashCommandBuilder } from "discord.js";
import region from "../region.json" with { type: "json" };

let info = ""
for (const key in region) {
    if (info) info += "\n";
    info += `\`\`\`${key}\`\`\` - ${region[key].description}`;
}

export default {
    data: new SlashCommandBuilder().setName('region').setDescription("Show region list."),
    async execute(interaction) {
        await interaction.reply(info);
    }
};