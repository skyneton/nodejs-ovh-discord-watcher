import { Client, Collection, Events, GatewayIntentBits, REST, Routes, MessageFlags } from 'discord.js';
import { loadCommand, getParams } from './utils.js'
import { Checker } from './checker.js';

const { token, clientId, guildId, interval } = await getParams(process.argv);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildWebhooks] });
client.commands = new Collection();
const checker = new Checker();

const commands = [];
await loadCommand('commands', checker, client.commands, commands);

const rest = new REST().setToken(token);
await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
);
console.log('Commands registered.');

client.on(Events.ClientReady, async () => { console.log('Discord Bot running!'); });

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
    }
});

client.login(token);
checker.start(interval);