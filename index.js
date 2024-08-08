const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client();

// Configuration
//###################################################################################################### CONFIGURE TES OPTIONS CI-DESSOUS#
const token = ""; // Mettre le token ici                                                                                                ##
const notificationGroupId = ""; // ID du groupe où notifier les invitations                                                             ##
const leaveMessage = "🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕"; // Message à envoyer avant de quitter              ##
const rmCommand = "!rm"; // Commande pour supprimer les derniers messages [Tu peux mettre le mot que tu veux mais sans effacer le "!"]  ##
const deleteMessageCount = 30; // Nombre de messages à supprimer par défaut [Ne pas depasser 100 pour eviter le ban]                    ##
const deleteDelay = 250; // Délai de suppression en millisecondes                                                                        ##
// Activation ou désactivation des paramètres                                                                                           ##
const silentLeave = true; // Mettre à 'true' pour quitter silencieusement, 'false' pour quitter le canal avec notification              ##
const sendMessage = true; // Mettre à 'true' pour envoyer un message avant de quitter, 'false' pour ne pas envoyer de message           ##
const enableLogs = true; // Mettre à 'true' pour activer les logs, 'false' pour désactiver                                              ##
//########################################################################################################################################

let inviterMap = new Map();
let isProtectionActive = true; // Indicateur pour l'activation de la protection

function loadWhitelist() {
    return fs.readFileSync('whitelist.txt', 'utf-8')
        .split('\n')
        .map(line => line.split('#')[0].trim()) // Ignorer les commentaires et les espaces
        .filter(Boolean); // Filtrer les lignes vides
}

// Nouvelle fonction pour charger la whitelist avec les commentaires
function loadWhitelistWithComments() {
    return fs.readFileSync('whitelist.txt', 'utf-8')
        .split('\n')
        .filter(Boolean); // Ne pas supprimer les commentaires, seulement les lignes vides
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
        if (message.author.bot) return; // Ignorer les messages des bots

        // Commande !ping
        if (message.content.trim() === '!ping' && message.author.id === client.user.id) {
            try {
                await message.channel.send('pong ! Status Script Discord-group-invite-protector: OK');
                if (enableLogs) {
                    console.log('Responded to !ping');
                }
            } catch (error) {
                console.error(`Failed to send pong response: ${error}`);
            }
            return;
        }

        // Commande !help
        if (message.content.trim() === '!help' && message.author.id === client.user.id) {
            const helpMessage = `
**Commandes disponibles :**
- \`!ping\` : Vérifie le statut du script.
- \`!help\` : Affiche ce message d'aide.
- \`!wl <ID> [Nom]\` : Ajoute un groupe à la liste blanche avec un nom optionnel.
- \`!uwl <ID>\` : Supprime un groupe de la liste blanche.
- \`${rmCommand} [count]\` : Supprime vos derniers messages dans le canal, avec un nombre de messages facultatif.
- \`!on\` : Active la protection contre les invitations de groupe.
- \`!off\` : Désactive temporairement la protection contre les invitations de groupe.
- \`!ls\` : Liste le contenu du fichier \`whitelist.txt\`, y compris les commentaires.

**Options configurables :**
- \`token\` : Jeton Discord du self-bot.
- \`notificationGroupId\` : ID du canal pour les notifications.
- \`leaveMessage\` : Message à envoyer avant de quitter un groupe DM.
- \`rmCommand\` : Commande pour supprimer les messages.
- \`deleteMessageCount\` : Nombre par défaut de messages à supprimer.
- \`deleteDelay\` : Délai en millisecondes entre les suppressions de messages.
- \`silentLeave\` : Quitter un groupe DM sans message de notification.
- \`sendMessage\` : Envoyer un message avant de quitter un groupe DM.
- \`enableLogs\` : Activer ou désactiver les logs de la console.

**Résumé des fonctionnalités :**
Ce script protège votre compte Discord en quittant automatiquement les invitations à des groupes non approuvés, en envoyant un message avant de quitter si configuré. Il permet également de gérer une liste blanche de groupes approuvés et de supprimer vos messages selon des commandes spécifiées. Des alertes sont envoyées dans un canal spécifié si le bot est mentionné, vous informant de qui vous a mentionné et où.`;

            try {
                await message.channel.send(helpMessage);
                if (enableLogs) {
                    console.log('Responded to !help');
                }
            } catch (error) {
                console.error(`Failed to send help message: ${error}`);
            }
            return;
        }

        // Commande !wl
        if (message.content.startsWith('!wl') && message.author.id === client.user.id) {
            const args = message.content.split(' ').slice(1);
            const id = args[0];
            const name = args.slice(1).join(' ');

            if (id) {
                addToWhitelist(id, name);
                message.channel.send(`Le groupe ${id} a été ajouté à la whitelist avec le nom ${name}.`);
            } else {
                message.channel.send('ID de groupe manquant pour la commande !wl');
            }
            return;
        }

        // Commande !uwl
        if (message.content.startsWith('!uwl') && message.author.id === client.user.id) {
            const args = message.content.split(' ').slice(1);
            const id = args[0];

            if (id === notificationGroupId) {
                message.channel.send(`Le groupe ${id} est protégé.`);
            } else if (id) {
                removeFromWhitelist(id);
                message.channel.send(`Le groupe ${id} a été supprimé de la whitelist.`);
            } else {
                message.channel.send('ID de groupe manquant pour la commande !uwl');
            }
            return;
        }

        // Commande pour supprimer les messages
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

            try {
                const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
                const myMessages = Array.from(fetchedMessages.filter(msg => msg.author.id === client.user.id).values()).slice(0, count);
                await deleteMessages(message.channel, myMessages);
            } catch (error) {
                console.error(`Failed to delete messages: ${error}`);
            }
            return;
        }

        // Commande !on pour activer la protection
        if (message.content.trim() === '!on' && message.author.id === client.user.id) {
            isProtectionActive = true;
            message.channel.send('Protection contre les invitations de groupe activée.');
            if (enableLogs) {
                console.log('Protection activée.');
            }
            return;
        }

        // Commande !off pour désactiver la protection
        if (message.content.trim() === '!off' && message.author.id === client.user.id) {
            isProtectionActive = false;
            message.channel.send('Protection contre les invitations de groupe désactivée temporairement.');
            if (enableLogs) {
                console.log('Protection désactivée.');
            }
            return;
        }

        // Commande !ls pour lister le contenu de whitelist.txt avec commentaires
        if (message.content.trim() === '!ls' && message.author.id === client.user.id) {
            try {
                const whitelistWithComments = loadWhitelistWithComments();
                const whitelistContent = whitelistWithComments.length > 0 
                    ? whitelistWithComments.join('\n')
                    : 'La liste blanche est vide.';
                await message.channel.send(`**Contenu de la whitelist :**\n${whitelistContent}`);
                if (enableLogs) {
                    console.log('Listed whitelist content with comments');
                }
            } catch (error) {
                console.error(`Failed to list whitelist content: ${error}`);
            }
            return;
        }

        // Détection de mention directe avec @
        if (message.mentions.has(client.user, { ignoreEveryone: true, ignoreRoles: true }) &&
            message.content.includes(`<@${client.user.id}>`) &&
            message.channel.id !== notificationGroupId) {

            console.log(`Mention directe détectée par l'utilisateur: ${message.author.id}`);

            const authorId = message.author.id;
            const channelId = message.channel.id;
            const messageContent = message.content;
            const now = new Date();
            const dateStr = now.toLocaleDateString('fr-FR');
            const alertMessage = `Une personne avec l'ID ${authorId} vous a mentionné directement dans le canal <#${channelId}> le ${dateStr}. Message: "${messageContent}"`;

            try {
                const notificationChannel = client.channels.cache.get(notificationGroupId);
                if (!notificationChannel) {
                    console.error(`Notification channel with ID ${notificationGroupId} not found.`);
                    return;
                }

                await notificationChannel.send(alertMessage);
                console.log(`Alert sent in channel: ${notificationGroupId}`);
            } catch (error) {
                console.error(`Failed to send alert: ${error}`);
            }
        }

        // Gestion des groupes DM non-whitelistés
        if (message.channel.type === 'GROUP_DM' && !loadWhitelist().includes(message.channel.id)) {
            if (!inviterMap.has(message.channel.id)) {
                inviterMap.set(message.channel.id, message.author.id);
            }
        }
    });

    setInterval(async () => {
        if (!isProtectionActive) {
            return; // Ne rien faire si la protection est désactivée
        }
        
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
