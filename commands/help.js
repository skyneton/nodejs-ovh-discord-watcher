import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder().setName('help').setDescription('Show commands.'),
    async execute(interaction) {
        await interaction.reply(`- \`\`\`/help\`\`\` - Show commands.
- \`\`\`/region\`\`\` - Show region list.
- \`\`\`/check <server> [region]\`\`\` - When <server> [region] is available, notified.
- \`\`\`/status <server> [region]\`\`\` - Current availability.`);
    }
};