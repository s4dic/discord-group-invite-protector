# Discord Group Invite Protector
Permet de vous protéger des raclures qui vous invitent dans des groupes Discord sans votre accord et même lorsque votre client discord est fermé.

# Fonctionnalités
- Commande pour whitelister un group (avec l'id du groupe): `!wl 1253688591557857341 groupe de travail`
- Commande pour supprimer un whitelist (avec l'id du groupe): `!uwl 1253688591557857341`
- Commande "BONUS" : Supprimer un chat `!rm` ou `!rm 10`
![image](https://github.com/user-attachments/assets/71357c7e-89a0-40a1-9264-c970e0f69b12)
![image](https://github.com/user-attachments/assets/e24bcdf9-18c5-45fd-b58d-63629027c518)
- Ajout de !ping pour verifier que le script est en fonctionnement
- Ajout de !help qui permet de voir toutes les options possibles
- Ajout d'une fonctionnalité de détection qui enregistre automatiquement les pings reçus, même lorsque votre Discord est fermé.
- Ajout de la fonctionnalité `!on` et `!off` permettant d'activer ou désactiver la fonctionnalité de suppression des groupes.
- Ajout de la fonctionnalité `!ls` permettant de lister le contenu des groupes protégés dans le fichier whitelist.txt.

## Demonstations
### Message+Déconnexion Silencieuse :
![BlackBox-4610462346](https://github.com/user-attachments/assets/1692253e-4eae-4221-8c8f-f3ebfd403a98)

### Exemple de la gestion des logs:
![image](https://github.com/user-attachments/assets/5020ef0b-a139-4477-b91a-5a18e3b4cebd)

# Installation:

- 1 : suivez les instruction d'installation:<br>
  ```curl -fsSL https://deb.nodesource.com/setup_22.x | bash -```<br>
  ```apt install -y nodejs```<br>
  Une autre méthode moins fiable est disponible [ICI](https://nodejs.org/en/download)
- 2 : Clonner/Télécharger ce repository git sur votre machine (idéallement un serveur linux 🤓)
- 3 : Commencer par creer un groupe sur discord qui vous permettra de log tous les évènements et noter l'id du groupe (clique droit copier l'identifiant du salon), si vous ne pouvez pas copier l'identifiant du salon vous devez activer l'option développeur de discord dans les options
- 4 : rajoutez maintenant l'id du canal dans le dossier whitelist.txt et rajouter tous les groupes que vous souhaitez garder comme actif, vous pouvez mettre des commentaires avec `#`:<br>
![image](https://github.com/user-attachments/assets/3d563e30-5e51-41dc-ad49-f43fabf3b2aa)
- 5 : Éditez le fichier "index.js"<br>
    - Vous devez ajouter votre token, vous pouvez avoir votre token via betterdiscord(telechargez et installer betterdiscord au préalable), puis activer le menu developpeur:<br>
    ![image](https://github.com/user-attachments/assets/608b5038-f3e3-4a03-a5e9-61764f1dc3e4)
      - Executez le raccourci clavier "ctrl+shift+i"
      - Ecrivez "allow pasting" pour autoriser la copie d'une commande, puis coller la commande suivante:
  ```bash
  window.webpackChunkdiscord_app.push([
    [Math.random()],
    {},
    req => {
      if (!req.c) return;
      for (const m of Object.keys(req.c)
        .map(x => req.c[x].exports)
        .filter(x => x)) {
        if (m.default && m.default.getToken !== undefined) {
          return copy(m.default.getToken());
        }
        if (m.getToken !== undefined) {
          return copy(m.getToken());
        }
      }
    },
  ]);
  console.log('%cWorked!', 'font-size: 50px');
  console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px');
  ```
    - Votre token est maintenant dans votre copier/coller
  - Dans l'index.js collez votre "token"<br>
  - Dans "notificationGroupId", mettez l'ID de votre groupe permettant de visionner les logs.<br>
  - Dans "leaveMessage", mettez le message qui sera envoyé dans le groupe qui vous a invité.<br>
  - Dans "rmCommand", vous pouvez personnaliser votre commande de suppression de message.
  - Dans "deleteMessageCount", vous pouvez definir le nombre de message à supprimer lorsque vous appelez la commande de suppression.
  - Dans "deleteDelay", il s'agit du delai de suppression entre chaque message exprimé en milliseconde.
  - Activez ensuite les options désirées en utilisant "True" pour activer et "False" pour désactiver.
- 6: faites un chmod +x sur le fichier start.sh et demarrez le service : ```./start.sh```<br>
![image](https://github.com/user-attachments/assets/7cfd4992-0fa0-488a-9046-b841b1ac5aa9)
- 7: Si vous le désirez, vous pouvez mettre le processus dans un "screen" Linux pour que la commande ne se ferme pas a lorsque vous quittez le terminal.
