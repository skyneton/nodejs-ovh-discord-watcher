import { SlashCommandBuilder } from "discord.js";
import { getKimsufiCode } from "../utils.js";

export default {
    data: new SlashCommandBuilder().setName('remove').setDescription('Remove checker.')
        .addStringOption(option => option.setName('hook').setDescription('Web hook url.').setRequired(true))
        .addStringOption(option => option.setName('server').setDescription('Target server.').setRequired(true))
        .addStringOption(option => option.setName('region').setDescription('Target region.')),
    check(checker) {
        this.checker = checker;
    },
    async execute(interaction) {
        const webhook = interaction.options.getString('hook');
        const server = interaction.options.getString('server')?.toLowerCase();
        const region = interaction.options.getString('region')?.toLowerCase();
        this.checker.remove(webhook, getKimsufiCode(server), region);
        console.log(`Availability check removed: ${webhook}[${server}/${region}]`);
        await interaction.reply('Removed!');
    }
};