import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName('status').setDescription('Current availability.')
        .addStringOption(option => option.setName('hook').setDescription('Web hook url.').setRequired(true))
        .addStringOption(option => option.setName('server').setDescription('Wonder server.').setRequired(true))
        .addStringOption(option => option.setName('region').setDescription('Wonder region.')),
    check(checker) {
        this.checker = checker;
    },
    async execute(interaction) {
        const webhook = interaction.options.getString('hook');
        const server = interaction.options.getString('server');
        const region = interaction.options.getString('region');
        this.checker.update(webhook, server, region);
        console.log(`Availability check added: ${webhook}[${server}/${region}]`);
        await interaction.reply('Added!');
    }
};