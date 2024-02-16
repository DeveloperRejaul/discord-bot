import dotenv from "dotenv";
import { Client, Events, GatewayIntentBits ,Collection, REST, Routes, Interaction } from'discord.js';
import { log } from "./log/log";
import { IClint } from "./type/type";
import fs from "fs";
import path from "path";


dotenv.config();


// require envs 
const envs = ["BOT_TOKEN", "PORT", "CLIENT_ID"]

// available envs 
const allEnvs = new Set(Object.keys(process.env))

// check all required env exists
const existsEnvs = envs.every(env => allEnvs.has(env));

// check env exists
if(!existsEnvs){
     log.error("Environment variable missing");
     process.exit(1)
} 

if(existsEnvs) log.info("Environment variable Loaded");



export async function main () {
    log.info("server starting .....");

    const client:IClint = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


        client.once(Events.ClientReady, readyClient => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        });

        // lessen messages and replay
        client.on(Events.MessageCreate, async (message) => {
            console.log(message.content)
            
            if (message.author.bot) return

            if((message.content).toLowerCase() === "hi"){
                message.reply(`Hello ${message.author.displayName}`);
                return;
            };

            if((message.content).toLowerCase() === "who are you?"){
                message.reply(`Hello Mr. ${message.author.displayName}, I am a simple bot created by Mr. Rezaul`);
                return;
            };

            message.reply(`Hello Mr. ${message.author.displayName}, How can i help you? `)
        })

        // handle all slash command
        const rest = new REST().setToken(process.env.BOT_TOKEN!);
        client.commands = new Collection();
        const allCommand:string[] = []

        const foldersPath = path.join(__dirname, "commands")
        const commandFiles = fs.readdirSync(foldersPath).filter(file=> (file.endsWith(".js") || file.endsWith(".ts")))

        for (const folder of commandFiles) {
            const filePath = path.join(foldersPath, folder);
            const command = await import(filePath);

            if('data' in command.default && "execute" in command.default){
                client.commands.set(command.default.data.name, command.default);
                allCommand.push(command.default.data.toJSON())
            }else {
                log.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        const data:any  = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: allCommand });
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    

        client.on(Events.InteractionCreate, async (interaction:Interaction | any) => {
            if (!interaction.isChatInputCommand()) return;  
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                // execute all command
                await command.execute(interaction);

            } catch (error:any) {
                // handle error
                log.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        });


        // login bot
        client.login(process.env.BOT_TOKEN);

}