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

***Pot will not use when contract, mount, battleground***</br>
***config.json, hp.json, mp.json will generate after enter the game***</br>

# Config.json
```
{
    "enabled": true,  #enable and disable this module
    "hp": false,      #if set true = enable auto HP pot, false = need in game command for enable
    "mp": true,       #if set true = enable auto MP pot, false = need in game command for enable
    "notice": false   #if set true = notice your pot left, false = not notice
}
```
# HP.json
```
{</br>
    "6552": { #Your pot ID</br>
        "name": "Prime Recovery Potable", #Your pot name for item notice if enable
        "inCombat": false, #if true = only use in combat, false = always use ignore combat
        "use_at": 80, #set use at with percent
        "slay_at": 30, #set use in slaying mode with percent
        "cd": 10 #set pot cooldown x sec
    }</br>
}</br>
```
# MP.json
```
{</br>
    "6562": { #Your pot ID
        "name": "Prime Replenishment Potable", #Your pot name for item notice if enable
        "inCombat": false, #if true = only use in combat, false = always use ignore combat
        "use_at": 50, #set use at with percent
        "cd": 10 #set pot cooldown x sec
    }</br>
}</br>
```
# Noted Commit 30
- added "inCombat" option into hp.json and mp.json make your way setting only used in combat or not</br>
- for old user and lazy to add it with your self just removed hp.json and mp.json then re-login for new generate</br>
