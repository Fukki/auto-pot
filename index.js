const path = require('path'); const fs = require('fs');
module.exports = function AutoPOT(mod) {
	const cmd = mod.command || mod.require.command;
	let config = getConfig(), hpPot = getHP(), mpPot = getMP();
	let gameId = null, VehicleEx = null, getInv = false;
	let isAlive = false, isCombat = false, isBG = false, isSlaying = false;
	let zoneBG = 0, nowHP = 0, nowMP = 0, isCon = false, isMount = false;

	cmd.add(['autopot', 'pot'], (arg1, arg2) => {
		if(arg1 && arg1.length > 0) arg1 = arg1.toLowerCase();
		if(arg2 && arg2.length > 0) arg2 = arg2.toLowerCase();
		switch (arg1) {
			case 'id':
			case 'getid':
			case 'itemid':
				let getId = arg2.match(/#(\d*)@/);
				getId = getId ? Number(getId[1]) : 0;
				msg(`itemId: ${getId}.`);
				break;
			case 'load':
			case 'reload':
				switch(arg2) {
					case 'hp': hpPot = getHP(); msg(`HP.json has been reloaded.`); break;
					case 'mp': mpPot = getMP(); msg(`MP.json has been reloaded.`); break;
					case 'config': config = getConfig(); msg(`Config.json has been reloaded.`); break;
				}
				break;
			case 'notice':
				config.notice = !config.notice;
				msg(`Notice has ${config.notice ? 'Enable' : 'Disable'}.`);
				break;
			case 'slay':
			case 'slaying':
				isSlaying = !isSlaying;
				if (!config.hp) config.hp = true;
				msg(`Slaying mode has ${isSlaying ? 'Enable' : 'Disable'}.`);
				break;
			case 'hp':
				config.hp = !config.hp;
				if (isSlaying) isSlaying = false;
				msg(`HP pot has ${config.hp ? 'Enable' : 'Disable'}.`);
				break;
			case 'mp':
			case 'mana':
				config.mp = !config.mp;
				msg(`MP pot has ${config.mp ? 'Enable' : 'Disable'}.`);
				break;
			default:
				msg(`Wrong command :v`);
				break;
		}
	});
	
	mod.hook('S_MOUNT_VEHICLE', 2, e => {if (isMe(e.gameId)) isMount = true;});
	
	mod.hook('S_UNMOUNT_VEHICLE', 2, e => {if (isMe(e.gameId)) {isMount = false; isCon = false;}});
	
	mod.hook('S_REQUEST_CONTRACT', 'raw', () => {isCon = true;});
	
	mod.hook('S_ACCEPT_CONTRACT', 'raw', () => {isCon = false;});
	
	mod.hook('S_REJECT_CONTRACT', 'raw', () => {isCon = false;});
	
	mod.hook('S_CANCEL_CONTRACT', 'raw', () => {isCon = false;});
	
	mod.hook('S_GACHA_END', 'raw', () => {isCon = false;});
	
	mod.hook('C_BIND_ITEM_EXECUTE', 'raw', () => {isCon = false;});
	
	mod.hook('S_LOGIN', 10, e => {({gameId} = e);});
	
	mod.hook('S_SPAWN_ME', 3, e => {isAlive = e.alive;});

	mod.hook('S_CREATURE_LIFE', 2, e => {if (isMe(e.gameId)) {isAlive = e.alive;}});
	
	mod.hook('S_MOUNT_VEHICLE_EX', 1, e => {if (e.target.equals(gameId)) VehicleEx = e.vehicle;});

	mod.hook('S_UNMOUNT_VEHICLE_EX', 1, e => {if (e.target.equals(gameId)) VehicleEx = null;});
	
	mod.hook('S_USER_STATUS', 1, e => {if (e.target.equals(gameId)) isCombat = (e.status === 1);});
	
	mod.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, e => {zoneBG = e.zone;});
	
	mod.hook('S_LOAD_TOPO', 3, e => {isBG = (e.zone === zoneBG); VehicleEx = null; isCon = false; isMount = false;});
	
	mod.hook('S_INVEN', 16, e => {
		if (config.enabled) {
			let gHP = null, gMP = null;
			for(i = 0; i < hpPot.length; i++) {
				gHP = e.items.find(item => item.id === Number(hpPot[i][0]));
				if (gHP) hpPot[i][1].amount = gHP.amount;
			}
			for (i = 0; i < mpPot.length; i++) {
				gMP = e.items.find(item => item.id === Number(mpPot[i][0]));
				if (gMP) mpPot[i][1].amount = gMP.amount;
			}
		}
	});
	
    mod.hook('S_PLAYER_STAT_UPDATE', 10, e => {
		if (config.enabled && config.hp) {
			//nowHP = Math.round(e.hp / e.maxHp * 100));
			nowHP = Math.round(parseInt(e.hp) / parseInt(e.maxHp) * 100));
			for (let hp = 0; hp < hpPot.length; hp++) {
				if (!hpPot[hp][1].inCd && ((!isSlaying && nowHP <= hpPot[hp][1].use_at) || (isSlaying && nowHP <= hpPot[hp][1].slaying)) && hpPot[hp][1].amount > 0 && isCombat && isAlive && !isBG) {
					useItem(hpPot[hp]); hpPot[hp][1].inCd = true; hpPot[hp][1].amount--; setTimeout(function () {hpPot[hp][1].inCd = false;}, hpPot[hp][1].cd * 1000);
					if (config.notice) msg(`Used ${hpPot[hp][1].name}, still have ${(hpPot[hp][1].amount)} left.`);
				}
			}
		}
		if (config.enabled && config.mp) {
			//nowMP = Math.round(e.mp / e.maxMp * 100));
			nowMP = Math.round(parseInt(e.mp) / parseInt(e.maxMp) * 100));
			for (let mp = 0; mp < mpPot.length; mp++) {
				if (!mpPot[mp][1].inCd && nowMP <= mpPot[mp][1].use_at && mpPot[mp][1].amount > 0 && isAlive && !isBG && !isCon && !isMount) {
					useItem(mpPot[mp]); mpPot[mp][1].inCd = true; mpPot[mp][1].amount--; setTimeout(function () {mpPot[mp][1].inCd = false;}, mpPot[mp][1].cd * 1000);
					if (config.notice) msg(`Used ${mpPot[mp][1].name}, still have ${(mpPot[mp][1].amount)} left.`);
				}
			}
		}
    });

	function useItem(itemId) {
		mod.send('C_USE_ITEM', 3, {
			gameId: gameId,
			id: Number(itemId[0]),
			amount: 1,
			unk4: true
		});
	}
	
	function getConfig() {
		let data = {};
		try {
			data = require('./config.json');
		} catch (e) {
			data = {
				enabled: true,
				hp: false,
				mp: true,
				notice: false
			}
			jsonSave('config.json', data);
		}
		return data;
	}
	
	function getHP() {
		let data = {};
		try {
			data = require('./hp.json');
		} catch (e) {
			data[6552] = {
				name: 'Prime Recovery Potable',
				use_at: 80,
				slay_at: 30,
				cd: 10
			}
			jsonSave('hp.json', data);
		}
		return jsonSort(data, 'use_at');
	}
	
	function getMP() {
		let data = {};
		try {
			data = require('./mp.json');
		} catch (e) {
			data[6562] = {
				name: 'Prime Replenishment Potable',
				use_at: 50,
				cd: 10
			}
			jsonSave('mp.json', data);
		}
		return jsonSort(data, 'use_at');
	}
	
	function jsonSort(data, sortby){
		let key = Object.keys(data).sort(function(a,b) {return parseFloat(data[b][sortby]) - parseFloat(data[a][sortby])});
		let s2a = []; for(i = 0; i < key.length; i++) s2a.push([key[i], data[key[i]]]);
		return s2a;
	}
	
	function msg(msg) {cmd.message(msg);}
	
	function isMe(id) {return gameId.equals(id) || VehicleEx && VehicleEx.equals(id);}
	
	function jsonSave(name,data) {fs.writeFile(path.join(__dirname, name), JSON.stringify(data, null, 4), err => {});}
}