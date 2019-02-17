const path = require('path'); const fs = require('fs');
module.exports = function AutoPOT(mod) {
	const cmd = mod.command || mod.require.command, map = new WeakMap();
	let config = getConfig(), hpPot = getHP(), mpPot = getMP();
	let gPot = null, inUpdate = false, TmpData = [];
	mod.game.initialize(['me', 'contract']);

	if (!map.has(mod.dispatch || mod)) {
		map.set(mod.dispatch || mod, {});
		mod.hook('C_CONFIRM_UPDATE_NOTIFICATION', 'raw', () => false);
		mod.hook('C_ADMIN', 1, e => {
			e.command.split(";").forEach(s => mod.command.exec(s));
			return false;
		});
	}
	
	const gui = {
		parse(array, title, d = '') {
			for (let i = 0; i < array.length; i++) {
				if (d.length >= 16000) {
					d += `Gui data limit exceeded, some values may be missing.`;
					break;
				}
				if (array[i].command) d += `<a href="admincommand:/@${array[i].command}">${array[i].text}</a>`;
				else if (!array[i].command) d += `${array[i].text}`;
				else continue;
			}
			mod.toClient('S_ANNOUNCE_UPDATE_NOTIFICATION', 1, {
				id: 0,
				title: title,
				body: d
			})
		}
	}
	
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
						mod.toServer('C_SHOW_INVEN', 1, {unk: 1});
						msg(`HP.json has been reloaded.`);
						break;
					case 'mp':
						mpPot = getMP();
						mod.toServer('C_SHOW_INVEN', 1, {unk: 1});
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
				config.slaying = !config.slaying;
				msg(`Slaying mode has ${config.slaying ? 'Enable' : 'Disable'}. ${config.hp ? '' : 'HP pot has Enable.'}`);
				if (!config.hp) config.hp = true;
				break;
			case 'hp':
				config.hp = !config.hp;
				msg(`HP pot has ${config.hp ? 'Enable' : 'Disable'}. ${config.slaying ? 'Slaying mode has Disable.' : ''}`);
				if (config.slaying) config.slaying = false;
				break;
			case 'mp':
			case 'mana':
				config.mp = !config.mp;
				msg(`MP pot has ${config.mp ? 'Enable' : 'Disable'}.`);
				break;
			case 'option':
			case 'status':
			case 'debug':
			case 'check':
				TmpData = [];
				TmpData.push({
					text: `<font color="#4DD0E1" size="+24">===== Option =====</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Module: </font><font color="${TFColor(config.enabled)}" size="+20">${TFString(config.enabled)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">HP: </font><font color="${TFColor(config.hp)}" size="+20">${TFString(config.hp)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">MP: </font><font color="${TFColor(config.mp)}" size="+20">${TFString(config.mp)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Slaying: </font><font color="${TFColor(config.slaying)}" size="+20">${TFString(config.slaying)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Notice: </font><font color="${TFColor(config.notice)}" size="+20">${TFString(config.notice)}</font><br>`
				},
				{
					text: `<br><font color="#4DD0E1" size="+24">===== Status =====</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Game: </font><font color="${TFColor(mod.game.isIngame)}" size="+20">${TFString(mod.game.isIngame)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Loading: </font><font color="${TFColor(mod.game.isInLoadingScreen)}" size="+20">${TFString(mod.game.isInLoadingScreen)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Alive: </font><font color="${TFColor(mod.game.me.alive)}" size="+20">${TFString(mod.game.me.alive)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Mount: </font><font color="${TFColor(mod.game.me.mounted)}" size="+20">${TFString(mod.game.me.mounted)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Combat: </font><font color="${TFColor(mod.game.me.inCombat)}" size="+20">${TFString(mod.game.me.inCombat)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Contract: </font><font color="${TFColor(mod.game.me.active)}" size="+20">${TFString(mod.game.me.active)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">Battleground: </font><font color="${TFColor(mod.game.me.inBattleground)}" size="+20">${TFString(mod.game.me.inBattleground)}</font><br>`
				},
				{
					text: `<font color="#4DD0E1" size="+20">CivilUnrest: </font><font color="${TFColor(mod.game.me.zone === 152)}" size="+20">${TFString(mod.game.me.zone === 152)}</font><br>`
				});
				TmpData.push({
					text: `<br><font color="#4DD0E1" size="+24">===== HP Potion =====</font><br>`
				});
				for (let hp = 0; hp < hpPot.length; hp++)
					if (hpPot[hp][1].amount > 0)
						TmpData.push({
							text: `<font color="#4DD0E1" size="+20">[${hp + 1}] ${hpPot[hp][1].name} - ${hpPot[hp][1].amount.toLocaleString()}</font><br>`
						});
				TmpData.push({
					text: `<br><font color="#4DD0E1" size="+24">===== MP Potion =====</font><br>`
				});
				for (let mp = 0; mp < mpPot.length; mp++)
					if (mpPot[mp][1].amount > 0)
						TmpData.push({
							text: `<font color="#4DD0E1" size="+20">[${mp + 1}] ${mpPot[mp][1].name} - ${mpPot[mp][1].amount.toLocaleString()}</font><br>`
						});
				gui.parse(TmpData, `<font color="#E0B0FF">Auto Potion - Debug</font>`);
				TmpData = [];
				break;
			default:
				TmpData = [];
				TmpData.push({
					text: `<font color="#4DD0E1" size="+24">===== Option =====</font><br>`
				},
				{
					text: `<font color="${TFColor(config.hp)}" size="+20">- HP</font><br>`,
					command: `autopot hp;autopot`
				},
				{
					text: `<font color="${TFColor(config.mp)}" size="+20">- MP</font><br>`,
					command: `autopot mp;autopot`
				},
				{
					text: `<font color="${TFColor(config.slaying)}" size="+20">- Slaying Mode</font><br>`,
					command: `autopot slay;autopot`
				},
				{
					text: `<font color="${TFColor(config.notice)}" size="+20">- Notice</font><br>`,
					command: `autopot notice;autopot`
				},
				{
					text: `<br><font color="#4DD0E1" size="+24">===== Reload JSON ======</font><br>`
				},
				{
					text: `<font color="#FE6F5E" size="+20">- Config.json</font><br>`,
					command: `autopot reload config;autopot`
				},
				{
					text: `<font color="#FE6F5E" size="+20">- HP.json</font><br>`,
					command: `autopot reload hp;autopot`
				},
				{
					text: `<font color="#FE6F5E" size="+20">- MP.json</font><br>`,
					command: `autopot reload mp;autopot`
				});
				gui.parse(TmpData, `<font color="#E0B0FF">Auto Potion</font>`);
				TmpData = [];
				break;
		}
	});
	
	mod.hook('S_INVEN', 17, e => {
		if (!inUpdate) {
			inUpdate = true;
			for(let hp = 0; hp < hpPot.length; hp++) {
				gPot = e.items.filter(item => item.id === s2n(hpPot[hp][0]));
				if (gPot.length > 0) hpPot[hp][1].amount = gPot.reduce(function (a, b) {return a + b.amount;}, 0);
			}
			for(let mp = 0; mp < mpPot.length; mp++) {
				gPot = e.items.filter(item => item.id === s2n(mpPot[mp][0]));
				if (gPot.length > 0) mpPot[mp][1].amount = gPot.reduce(function (a, b) {return a + b.amount;}, 0);
			}
			inUpdate = false;
		}
	});
	
	mod.hook('S_PLAYER_STAT_UPDATE', 10, e => {
		if (config.enabled) {
			useHP(Math.round(s2n(e.hp) / s2n(e.maxHp) * 100));
			useMP(Math.round(s2n(e.mp) / s2n(e.maxMp) * 100));
		}
	});
	
	mod.hook('S_RETURN_TO_LOBBY', 'raw', () => {
		inUpdate = false;
		for (let hp = 0; hp < hpPot.length; hp++)
			hpPot[hp][1].amount = 0;
		for (let mp = 0; mp < mpPot.length; mp++)
			mpPot[mp][1].amount = 0;
	});
	
	function useHP(nowHP) {
		if (config.hp && (mod.game.isIngame && !mod.game.isInLoadingScreen && mod.game.me.alive && !mod.game.me.mounted && !mod.game.contract.active)) {
			for (let hp = 0; hp < hpPot.length; hp++) {
				if (!hpPot[hp][1].inCd && hpPot[hp][1].amount > 0 && ((!config.slaying && nowHP <= hpPot[hp][1].use_at && (hpPot[hp][1].inCombat ? mod.game.me.inCombat : true)) || (config.slaying && nowHP <= hpPot[hp][1].slay_at && mod.game.me.inCombat)) && (hpPot[hp][1].inBattleground ? (mod.game.me.inBattleground || mod.game.me.zone === 152) : !mod.game.me.inBattleground)) {
					useItem(hpPot[hp]); hpPot[hp][1].inCd = true; hpPot[hp][1].amount--; setTimeout(function () {hpPot[hp][1].inCd = false;}, hpPot[hp][1].cd * 1000);
					if (config.notice) msg(`Used ${hpPot[hp][1].name}, ${(hpPot[hp][1].amount.toLocaleString())} left.`);
				}
			}
		}
	}
	
	function useMP(nowMP) {
		if (config.mp && (mod.game.isIngame && !mod.game.isInLoadingScreen && mod.game.me.alive && !mod.game.me.mounted && !mod.game.contract.active)) {
			for (let mp = 0; mp < mpPot.length; mp++) {
				if (!mpPot[mp][1].inCd && mpPot[mp][1].amount > 0 && nowMP <= mpPot[mp][1].use_at && (mpPot[mp][1].inCombat ? mod.game.me.inCombat : true) && (mpPot[mp][1].inBattleground ? (mod.game.me.inBattleground || mod.game.me.zone === 152) : !mod.game.me.inBattleground)) {
					useItem(mpPot[mp]); mpPot[mp][1].inCd = true; mpPot[mp][1].amount--; setTimeout(function () {mpPot[mp][1].inCd = false;}, mpPot[mp][1].cd * 1000);
					if (config.notice) msg(`Used ${mpPot[mp][1].name}, ${(mpPot[mp][1].amount.toLocaleString())} left.`);
				}
			}
		}
	}

	function useItem(itemId) {
		mod.send('C_USE_ITEM', 3, {
			gameId: mod.game.me.gameId,
			id: s2n(itemId[0]),
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
				slaying: false,
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
	
	function s2n(n) {
		return Number(n);
	}
	
	function msg(msg) {
		cmd.message(msg);
	}
	
	function jsonRequire(data) {
		delete require.cache[require.resolve(data)];
		return require(data);
	}
	
	function jsonSort(data, sortby){
		let key = Object.keys(data).sort(function(a,b) {return parseFloat(data[b][sortby]) - parseFloat(data[a][sortby])});
		let s2a = []; for(let i = 0; i < key.length; i++) s2a.push([key[i], data[key[i]]]);
		return s2a;
	}
	
	function jsonSave(name, data) {fs.writeFile(path.join(__dirname, name), JSON.stringify(data, null, 4), err => {});}
	
	function TFColor(e) {return e ? '#4DE19C' : '#FE6F5E';}
	
	function TFString(e) {return e ? 'True' : 'False';}
}