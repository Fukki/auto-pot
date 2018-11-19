# Autopot
This is same let-me-pot</br>
include slaying mode and reload file function</br>

# Commands
start with "autopot" or "pot"
- pot hp -> Enable and Disable auto use hp pot
- pot mp -> Enable and Disable auto use mp pot *default is always enable
- pot slaying -> Enable and Disable auto use hp pot with slaying mode
- pot reload hp -> reload hp.json file
- pot reload mp -> reload mp.json file
- pot reload config -> reload config.json file

# hp.json
    item id: {
        "name": item name,
        "use_at": percent to use in normal,
        "slay_at": percent to use in slaying,
        "cd": cooldown for item
    }
Example:
    "6552": {
        "name": "Prime Recovery Potable",
        "use_at": 80,
        "slay_at": 30,
        "cd": 10
    }
