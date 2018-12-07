# Autopot
This is same let-me-pot</br>
include slaying mode and reload file function</br>

# Commands
start with "autopot" or "pot"
- pot id [item link] -> Get an item id
- pot hp -> Enable and Disable auto use hp pot
- pot mp -> Enable and Disable auto use mp pot *default is always enable
- pot slaying -> Enable and Disable auto use hp pot with slaying mode
- pot reload hp -> reload hp.json file
- pot reload mp -> reload mp.json file
- pot reload config -> reload config.json file

***HP Pot used only in combat***</br>
***MP Pot always used ignore combat***</br>
***All pot not use when contract, mount, battleground***</br>
***config.json, hp.json, mp.json will generate after enter the game***</br>

#Config.json
{</br>
    "enabled": true,  #enable and disable this module</br>
    "hp": false,      #if set true = always use HP pot, false = need in game command for enable</br>
    "mp": true,       #if set true = always use MP pot, false = need in game command for enable</br>
    "notice": false   #if set true = notice your pot left, false = not notice</br>
}</br>

#Noted Commit 30
- added "inCombat" option into hp.json and mp.json make your way setting only used in combat or not</br>
- for old user and lazy to add it with your self just removed hp.json and mp.json then re-login for new generate</br>
