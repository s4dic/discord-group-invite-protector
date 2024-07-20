const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client();

//###################################################################################################### CONFIGURE TES OPTIONS CI-DESSOUS#
const token = ""; // Mettre le token ici                                                                                                ##
const notificationGroupId = ""; // ID du groupe où notifier les invitations                                                             ##
const leaveMessage = "🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕"; // Message à envoyer avant de quitter              ##
const rmCommand = "!rm"; // Commande pour supprimer les derniers messages [Tu peux mettre le mot que tu veux mais sans effacer le "!"]  ##
const deleteMessageCount = 30; // Nombre de messages à supprimer par défaut [Ne pas depasser 100 pour eviter le ban]                    ##
const deleteDelay = 30; // Délai de suppression en millisecondes                                                                        ##
// Activation ou désactivation des paramètres                                                                                           ##
const silentLeave = true; // Mettre à 'true' pour quitter silencieusement, 'false' pour quitter le canal avec notification              ##
const sendMessage = true; // Mettre à 'true' pour envoyer un message avant de quitter, 'false' pour ne pas envoyer de message           ##
const enableLogs = true; // Mettre à 'true' pour activer les logs, 'false' pour désactiver                                              ##
//########################################################################################################################################

let inviterMap = new Map();

function loadWhitelist() {
    return fs.readFileSync('whitelist.txt', 'utf-8')
        .split('\n')
        .map(line => line.split('#')[0].trim()) // Ignorer les commentaires et les espaces
        .filter(Boolean); // Filtrer les lignes vides
}

function addToWhitelist(id, name = '') {
    fs.appendFileSync('whitelist.txt', `${id} # ${name}\n`, 'utf-8');
}

function removeFromWhitelist(id) {
    const whitelist = fs.readFileSync('whitelist.txt', 'utf-8').split('\n');
    const updatedWhitelist = whitelist.filter(line => !line.startsWith(id));
    fs.writeFileSync('whitelist.txt', updatedWhitelist.join('\n'), 'utf-8');
}

async function deleteMessages(channel, messages) {
    for (const message of messages) {
        try {
            await channel.messages.delete(message.id); // Utiliser l'ID du message
            await new Promise(resolve => setTimeout(resolve, deleteDelay)); // Utiliser le délai de suppression configuré
        } catch (error) {
            console.error(`Failed to delete message: ${error}`);
        }
    }
}

client.on('ready', async () => {
    if (enableLogs) {
        console.log(`Logged in as ${client.user.tag}`);
    }
    client.on('messageCreate', async (message) => {
        if (message.content.startsWith('!wl')) {
            const args = message.content.split(' ').slice(1);
            const id = args[0];
            const name = args.slice(1).join(' ');

            if (id) {
                addToWhitelist(id, name);
                message.channel.send(`Le groupe ${id} a été ajouté à la whitelist avec le nom ${name}.`);
            }
        }

        if (message.content.startsWith('!uwl')) {
            const args = message.content.split(' ').slice(1);
            const id = args[0];

            if (id === notificationGroupId) {
                message.channel.send(`Le groupe ${id} est protégé.`);
            } else if (id) {
                removeFromWhitelist(id);
                message.channel.send(`Le groupe ${id} a été supprimé de la whitelist.`);
            }
        }

        if (message.content.startsWith(rmCommand) && message.author.id === client.user.id) {
            const args = message.content.split(' ').slice(1);
            let count = deleteMessageCount;

            if (args.length > 0) {
                const arg = parseInt(args[0], 10);
                if (!isNaN(arg) && arg > 0) {
                    count = arg;
                } else {
                    message.channel.send(`Argument invalide pour la commande ${rmCommand}`);
                    return;
                }
            }

            const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
            const myMessages = Array.from(fetchedMessages.filter(msg => msg.author.id === client.user.id).values()).slice(0, count);
            await deleteMessages(message.channel, myMessages);
        }

        if (message.channel.type === 'GROUP_DM' && !loadWhitelist().includes(message.channel.id)) {
            if (!inviterMap.has(message.channel.id)) {
                inviterMap.set(message.channel.id, message.author.id);
            }
        }
    });

    setInterval(async () => {
        const exceptions = loadWhitelist();
        client.channels.cache.forEach(async (channel) => {
            if (channel.type === 'GROUP_DM') {
                if (!exceptions.includes(channel.id)) {
                    try {
                        if (sendMessage) {
                            await channel.send(leaveMessage);
                        }
                        await channel.delete(silentLeave);

                        // Notifier dans le groupe spécifié l'ID de la personne qui a invité, la date/heure et l'ID du groupe
                        const inviterId = inviterMap.get(channel.id);
                        const notificationChannel = client.channels.cache.get(notificationGroupId);
                        if (notificationChannel) {
                            const now = new Date();
                            const dateStr = now.toLocaleDateString('fr-FR');
                            const timeStr = now.toLocaleTimeString('fr-FR');
                            let participants = channel.recipients.map(user => `<@${user.id}>`).join(', ');
                            await notificationChannel.send(
                                `\n invitation détectée le: ${dateStr} à ${timeStr},\n` +
                                `Invitation probable du groupe par: <@${inviterId}>\n` +
                                `Participants: ${participants}\n` +
                                `ID du groupe pour whitelist: ${channel.id}`
                            );
                        }
                    } catch (error) {
                        if (enableLogs) {
                            console.error(error);
                        }
                    }
                }
            }
        });
    }, 3500);
});

client.login(token);
