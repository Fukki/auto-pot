# Autopot
This is same let-me-pot</br>
- Support slaying mode.
- Support for who no need use potion only in combat.</br>
- Support Civil Unrest and Battleground potion.</br>
- Reload file with command no need relog or restart.</br>
- Require Caali's Proxy "tera-game-state"</br>
# Commands
start with "autopot" or "pot"
```
- pot id [item link]            #Get an item id <Shift + Left Click>
- pot hp                        #Enable and Disable auto use hp pot
- pot mp                        #Enable and Disable auto use mp pot *default is always enable
- pot slaying                   #Enable and Disable auto use hp pot with slaying mode
- pot reload hp                 #Reload HP.json file
- pot reload mp                 #Reload MP.json file
- pot reload config             #Reload Config.json file
- pot check                     #show module debug
```

***HP Pot slaying mode only use in combat***</br>
***potion will not use when on mount and in contract***</br>
***for battleground potion you need set it by your self***</br>
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
{
    "6552": {                               #Your pot ID
        "name": "Prime Recovery Potable",   #Your pot name for item notice if enable
        "inBattleground": false,            #if true = this pot will use only in CivilUnrest and Battleground
        "inCombat": true,                   #if true = only use in combat, false = always use ignore combat
        "use_at": 80,                       #set use at with x percent
        "slay_at": 30,                      #set use in slaying mode with x percent
        "cd": 10                            #set pot cooldown x sec
    }
}
```
# MP.json
```
{
    "6562": {                                   #Your pot ID
        "name": "Prime Replenishment Potable",  #Your pot name for item notice if enable
        "inBattleground": false,                #if true = this pot will use only in CivilUnrest and Battleground
        "inCombat": false,                      #if true = only use in combat, false = always use ignore combat
        "use_at": 50,                           #set use at with x percent
        "cd": 10                                #set pot cooldown x sec
    }
}
```
# Helpful 
[Something Helpful for new users](https://github.com/Fukki/auto-pot/issues/6)

# Q&A
Q: my *.json got replace after edit.</br>
A: check your syntax before save because *.json will replace if system cant read.</br>

Q: after reload *.json with in game command auto-pot not work.</br>
A: update your inventory by open it one time or use item one time.</br>

A: got the error.</br>
Q: check your proxy and this module has up to date or not.</br>

***Any problem pls open Issues**
