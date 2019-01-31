const path = require('path'); const fs = require('fs');
module.exports = function AutoPOT(mod) {
	const cmd = mod.command || mod.require.command;
	let config = getConfig(), hpPot = getHP(), mpPot = getMP(), inUpdate = false;
	let gPot = null, isReady = false, isSlaying = false, nowHP = 0, nowMP = 0;
	mod.game.initialize(['me', 'contract']);

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
			case 'notice':
				config.notice = !config.notice;
				msg(`Notice has ${config.notice ? 'Enable' : 'Disable'}.`);
				break;
			case 're':
			case 'load':
			case 'reload':
				switch (arg2) {
					case 'hp':
						hpPot = getHP();
						msg(`HP.json has been reloaded.`);
						break;
					case 'mp':
						mpPot = getMP();
						msg(`MP.json has been reloaded.`);
						break;
					case 'config':
						config = getConfig();
						msg(`Config.json has been reloaded.`);
						break;
				}
				break;
			case 'slay':
			case 'slaying':
				isSlaying = !isSlaying;
				msg(`Slaying mode has ${isSlaying ? 'Enable' : 'Disable'}. ${config.hp ? '' : 'HP pot has Enable.'}`);
				if (!config.hp) config.hp = true;
				break;
			case 'hp':
				config.hp = !config.hp;
				msg(`HP pot has ${config.hp ? 'Enable' : 'Disable'}. ${isSlaying ? 'Slaying mode has Disable.' : ''}`);
				if (isSlaying) isSlaying = false;
				break;
			case 'mp':
			case 'mana':
				config.mp = !config.mp;
				msg(`MP pot has ${config.mp ? 'Enable' : 'Disable'}.`);
				break;
			case 'check':
				let data = '\n===== HP Potion =====\n';
				for (let hp = 0; hp < hpPot.length; hp++)
					if (hpPot[hp][1].amount > 0)
						data += `[${hp}] ${hpPot[hp][1].name} - ${hpPot[hp][1].amount.toLocaleString()}\n`;
				data += '===== MP Potion =====\n';
				for (let mp = 0; mp < mpPot.length; mp++)
					if (mpPot[mp][1].amount > 0)
						data += `[${mp}] ${mpPot[mp][1].name} - ${mpPot[mp][1].amount.toLocaleString()}\n`;
				msg(data);
				data = '';
				break;
			default:
				msg(`Wrong command :v`);
				break;
		}
	});
	
	mod.hook('S_INVEN', 17, e => {
		if (!inUpdate) {
			inUpdate = true;
			for(let hp = 0; hp < hpPot.length; hp++) {
				gPot = e.items.filter(item => item.id === Number(hpPot[hp][0]));
				if (gPot.length > 0) hpPot[hp][1].amount = gPot.reduce(function (a, b) {return a + b.amount;}, 0);
			}
			for(let mp = 0; mp < mpPot.length; mp++) {
				gPot = e.items.filter(item => item.id === Number(mpPot[mp][0]));
				if (gPot.length > 0) mpPot[mp][1].amount = gPot.reduce(function (a, b) {return a + b.amount;}, 0);
			}
			inUpdate = false;
		}
	});
	
	mod.hook('S_PLAYER_STAT_UPDATE', 10, e => {
		if (config.enabled) {
			isReady = mod.game.isIngame && !mod.game.isInLoadingScreen && mod.game.me.alive && !mod.game.me.mounted && !mod.game.contract.active;
			if (config.hp && isReady) {
				nowHP = Math.round(parseInt(e.hp) / parseInt(e.maxHp) * 100);
				for (let hp = 0; hp < hpPot.length; hp++) {
					if (!hpPot[hp][1].inCd && hpPot[hp][1].amount > 0 && ((!isSlaying && nowHP <= hpPot[hp][1].use_at && (hpPot[hp][1].inCombat ? mod.game.me.inCombat : true)) || (isSlaying && nowHP <= hpPot[hp][1].slay_at && mod.game.me.inCombat)) && (hpPot[hp][1].inBattleground ? (mod.game.me.inBattleground || mod.game.me.zone === 152) : !mod.game.me.inBattleground)) {
						useItem(hpPot[hp]); hpPot[hp][1].inCd = true; hpPot[hp][1].amount--; setTimeout(function () {hpPot[hp][1].inCd = false;}, hpPot[hp][1].cd * 1000);
						if (config.notice) msg(`Used ${hpPot[hp][1].name}, ${(hpPot[hp][1].amount.toLocaleString())} left.`);
					}
				}
			}
			if (config.mp && isReady) {
				nowMP = Math.round(parseInt(e.mp) / parseInt(e.maxMp) * 100);
				for (let mp = 0; mp < mpPot.length; mp++) {
					if (!mpPot[mp][1].inCd && mpPot[mp][1].amount > 0 && nowMP <= mpPot[mp][1].use_at && (mpPot[mp][1].inCombat ? mod.game.me.inCombat : true) && (mpPot[mp][1].inBattleground ? (mod.game.me.inBattleground || mod.game.me.zone === 152) : !mod.game.me.inBattleground)) {
						useItem(mpPot[mp]); mpPot[mp][1].inCd = true; mpPot[mp][1].amount--; setTimeout(function () {mpPot[mp][1].inCd = false;}, mpPot[mp][1].cd * 1000);
						if (config.notice) msg(`Used ${mpPot[mp][1].name}, ${(mpPot[mp][1].amount.toLocaleString())} left.`);
					}
				}
			}
		}
	});
	
	mod.hook('S_RETURN_TO_LOBBY', 'raw', () => {
		inUpdate = false;
		for (let hp = 0; hp < hpPot.length; hp++)
			hpPot[hp][1].amount = 0;
		for (let mp = 0; mp < mpPot.length; mp++)
			mpPot[mp][1].amount = 0;
	});

	function useItem(itemId) {
		mod.send('C_USE_ITEM', 3, {
			gameId: mod.game.me.gameId,
			id: Number(itemId[0]),
			amount: 1,
			unk4: true
		});
	}
	
	function getConfig() {
		let data = {};
		try {
			data = jsonRequire('./config.json');
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
			data = jsonRequire('./hp.json');
		} catch (e) {
			data[6552] = {
				name: 'Prime Recovery Potable',
				inBattleground: false,
				inCombat: true,
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
			data = jsonRequire('./mp.json');
		} catch (e) {
			data[6562] = {
				name: 'Prime Replenishment Potable',
				inBattleground: false,
				inCombat: false,
				use_at: 50,
				cd: 10
			}
			jsonSave('mp.json', data);
		}
		return jsonSort(data, 'use_at');
	}
	
	function msg(msg) {
		cmd.message(msg);
	}
	
	function jsonRequire(p) {
		delete require.cache[require.resolve(p)];
		return require(p);
	}
	
	function jsonSort(data, sortby){
		let key = Object.keys(data).sort(function(a,b) {return parseFloat(data[b][sortby]) - parseFloat(data[a][sortby])});
		let s2a = []; for(let i = 0; i < key.length; i++) s2a.push([key[i], data[key[i]]]);
		return s2a;
	}
	
	function jsonSave(name,data) {fs.writeFile(path.join(__dirname, name), JSON.stringify(data, null, 4), err => {});}
}