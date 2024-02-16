import { SlashCommandBuilder,CommandInteraction } from "discord.js";
import { log } from "../log/log";
import { IJokeData } from "../type/type";
export default {
	data: new SlashCommandBuilder().setName('joke').setDescription('This command will tell you jokes!'),
	execute : async (interaction:CommandInteraction) =>  {
		try {
			const result = await fetch("https://v2.jokeapi.dev/joke/Any?type=single")
			const jokeRes:IJokeData | any = await result.json();
			await interaction.reply(`${jokeRes?.joke}`);
		} catch (error) {
			log.error(error)
			await interaction.reply('Failed to load jokes');
		}
	},
};