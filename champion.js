/**
 * Created by Spencer on 7/14/15.
 */

    //TODO Fix teemo and fiora stats
var Champion = function(riot_json, custom_json){
    this.level = 0;
    this.base = riot_json;

    /*url = "url(http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + this.base.name.split(" ").join("") + "_" + getRandomInt(0, this.base.skins.length - 1) + ".jpg)";
    $("body").css("background-image", url);*/

    this.supp_json = custom_json;

    if($("#champ_stacks").length > 0){
        $("#champ_stacks")[0].value = 0;
    }

    this.add = {};
    this.mult = {};

    this.state = {
        cooldowns: [0, 0, 0, 0],
        buffs: [],
        items: [0, 0, 0, 0, 0, 0],
        levels: [0, 0, 0, 0],
        runes: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        mastery_levels: {}
    }

    this.internal = {
        mast_calc: false,
        passives: [],
        passive_calc: false
    }

    this.resetStats()
}

Champion.prototype.resetStats = function () {
    this.add.armor = 0;
    this.mult.armor = 1;

    this.add.ad = 0;
    this.mult.ad = 1;

    this.add.range = 0;
    this.mult.range = 1;

    this.add.attackSpeed = 0;
    this.mult.attackSpeed = 1;

    this.add.critChance = 0;
    this.mult.critChance = 1;

    this.add.hp = 0;
    this.mult.hp = 1;

    this.add.hpRegen = 0;
    this.mult.hpRegen = 1;

    this.add.speed = 0;
    this.mult.speed = 1;

    this.add.mana = 0;
    this.mult.mana = 1;

    this.add.manaRegen = 0;
    this.mult.manaRegen = 1;

    this.add.mr = 0;
    this.mult.mr = 1;

    this.add.ap = 0;
    this.mult.ap = 1;

    this.add.lifeSteal = 0;
    this.mult.lifeSteal = 1;

    this.add.spellVamp = 0;
    this.mult.spellVamp = 1;

    this.add.magicPen = 0;
    this.mult.magicPen = 1;

    this.add.armorPen = 0;
    this.mult.armorPen = 1;

    this.add.critDamage = 2;
    this.mult.critDamage = 1;

    this.add.damageDealt = 0;
    this.mult.damageDealt = 1;

    this.add.damageTaken = 0;
    this.mult.damageTaken = 1;

    this.add.adDamageTaken = 0;
    this.mult.adDamageTaken = 1;

    this.add.apDamageTaken = 0;
    this.mult.apDamageTaken = 1;

    this.cd = 1;

    this.internal.passives = []
}

Champion.prototype.calculateBuild = function(){
    this.resetStats()
    calculateRunes(this);
    calculateItems(this);
    if(!this.internal.mast_calc){
        calculateMasteries(this);
    }
}

calculateRunes = function(self){
    self.state.runes.forEach(function(id){
        if(id == -1){
            return;
        }
        var rune = runes.data[id];
        if(rune.stats == undefined){
            return;
        }
        for(var key in rune.stats){
            switch (key){
                case "FlatPhysicalDamageMod": self.add.ad += rune.stats[key]; break;
                case "rFlatPhysicalDamageModPerLevel": self.add.ad += rune.stats[key] * (self.level + 1); break;
                case "PercentAttackSpeedMod": self.mult.attackSpeed *= 1 + rune.stats[key]; break;
                case "FlatCritDamageMod": self.add.critDamage += rune.stats[key]; break;
                case "FlatCritChanceMod": self.add.critChance += rune.stats[key]; break;
                case "rFlatArmorPenetrationMod": self.add.armorPen += rune.stats[key]; break;
                case "FlatHPPoolMod": self.add.hp += rune.stats[key]; break;
                case "rFlatHPModPerLevel": self.add.hp += rune.stats[key] * (self.level + 1); break;
                case "FlatArmorMod": self.add.armor += rune.stats[key]; break;
                case "FlatSpellBlockMod": self.add.mr += rune.stats[key]; break;
                case "rFlatSpellBlockModPerLevel": self.add.mr += rune.stats[key] * (self.level + 1); break;
                case "rPercentCooldownMod": self.cdr *= 1 - rune.stats[key]; break;
                case "FlatMagicDamageMod": self.add.ap += rune.stats[key]; break;
                case "rFlatMagicDamageModPerLevel": self.add.ap += rune.stats[key] * (self.level + 1); break;
                case "FlatMPPoolMod": self.add.mana += rune.stats[key]; break;
                case "rFlatMPModPerLevel": self.add.ap += rune.stats[key] * (self.level + 1); break;
                case "FlatMPRegenMod": self.add.manaRegen += rune.stats[key]; break;
                case "rFlatMagicPenetrationMod": self.add.magicPen += rune.stats[key]; break;
                case "PercentMovementSpeedMod": self.mult.speed *= 1 + rune.stats[key]; break;
                case "rFlatArmorModPerLevel": self.add.mr += rune.stats[key] * (self.level + 1); break;
                case "FlatHPRegenMod": self.add.hpRegen *= 1 + rune.stats[key]; break;
                case "rPercentCooldownModPerLevel": self.cd *= 1 - rune.stats[key] * (self.level + 1); break;
                case "rFlatMPRegenModPerLevel": self.add.manaRegen += rune.stats[key] * (self.level + 1); break;
                case "rFlatHPRegenModPerLevel": self.add.hpRegen += rune.stats[key] * (self.level + 1); break;
                case "rPercentTimeDeadMod": break; //TODO implement
                case "rFlatGoldPer10Mod": break; //TODO implement
                case "PercentEXPBonus": break; //TODO implement
                case "FlatEnergyRegenMod": break; //TODO implement
                case "PercentHPPoolMod": self.mult.hp *= 1 + rune.stats[key]; break;
                case "PercentSpellVampMod": break; //TODO implement
                case "PercentLifeStealMod": break; //TODO implement

                default: console.log(key); console.log(rune.stats[key]); break;
            }
        }
    })
}

calculateMasteries = function(self){
    self.internal.mast_calc = true;
    var tempChamp = $.extend(true, {}, self);
    for(var key in self.state.mastery_levels){
        var lvl = self.state.mastery_levels[key];
        if(lvl != 0){
            switch(parseInt(key)){
                case 4111: break; //TODO implement double edged sword
                case 4112: self.mult.attackSpeed *= 1 + (0.0125 * lvl); break;
                case 4113: self.cd *= 1 - (0.0125 * lvl); break;
                case 4114: break; //TODO implement butcher
                case 4121: break; //TODO implement expose weakness
                case 4122: switch(lvl){
                    case 1: self.add.ad += 0.22 * (self.level + 1); break;
                    case 2: self.add.ad += 0.39 * (self.level + 1); break;
                    case 3: self.add.ad += 0.55 * (self.level + 1); break;
                }; break;
                case 4123: switch(lvl){
                    case 1: self.add.ap += 0.33 * (self.level + 1); break;
                    case 2: self.add.ap += 0.61 * (self.level + 1); break;
                    case 3: self.add.ap += 0.89 * (self.level + 1); break;
                }; break;
                case 4124: break; //TODO implement feast
                case 4131: break; //TODO implement spell weaving
                case 4132: self.add.ad += 4; break;
                case 4133: self.add.ap += 6; break;
                case 4134: break; //TODO implement executioner
                case 4141: break; //TODO implement blade weaving
                case 4142: self.add.ad *= 1.005 + 0.015 * lvl; break;
                case 4143: self.mult.ap *= 1.005 + 0.015 * lvl; break;
                case 4144: break; //TODO implement dangerous game
                case 4151: break; //TODO implement frenzy
                case 4152: self.mult.magicPen *= 1 + 0.02 * lvl; self.mult.armorPen *= 1 + 0.02 * lvl; break;
                case 4154: self.add.ad += tempChamp.getAP() / (20); break;
                case 4162: self.mult.ad *= 1.03; self.mult.ap *= 1.03; break;
                //Defense
                case 4211: self.add.adDamageTaken -= lvl;
                case 4212: self.add.hpRegen += lvl / 2;
                case 4213: break; //TODO implement swiftness
                case 4214: break; //TODO implement tough skin
                case 4221: break; //TODO implement unyielding
                case 4222: self.add.hp += 12 * lvl; break;
                case 4224: break; //TODO implement bladed armor
                case 4231: break; //TODO implement tenacious
                case 4232: self.mult.hp *= 1.03; break;
                case 4233: self.add.armor += .5 + 1.5 * lvl; break;
                case 4234: self.add.mr += .5 + 1.5 * lvl; break;
                case 4241: break; //TODO implement perseverance
                case 4242: if(self.getMR() > tempChamp.getArmor()){
                    self.add.armor += 2 * tempChamp.getArmor() / (50 * self.mult.armor);
                } else{
                    self.add.mr += 2 * tempChamp.getMR() / (50 * self.mult.mr);
                }; break; //FIXME removes other mastery effects
                case 4243: break; //TODO implement reinforced armor
                case 4244: break; //TODO implement evasive
                case 4251: break; //TODO implement second wind
                case 4252: self.add.armor += lvl * tempChamp.getArmor() / (40 * self.mult.armor);
                    self.add.mr += lvl * tempChamp.getMR() / (40 * self.mult.mr); break;
                case 4253: break; //TODO implement oppression
                case 4262: break; //TODO implement legendary gaurdian
                //Util
                case 4311: break; //TODO implement phasewalker
                case 4312: self.mult.speed *= 1 + 0.005 * lvl; break;
                case 4313: self.add.mana += 25 * lvl; break;
                case 4314: break; //TODO implement scout
                case 4322: break; //TODO implement Summoner's insight
                case 4323: self.add.hpRegen += tempChamp.getMana() / 300; break;
                case 4324: break; //TODO implement alchemist
                case 4331: break; //TODO implement greed
                case 4332: break; //TODO implement runic affinity
                case 4333: break; //TODO implement vampirism
                case 4334: break; //TODO implement culinary master
                case 4341: break; //TODO implement scavenger
                case 4342: break; //TODO implement wealth
                case 4343: break; //TODO implement meditation
                case 4344: break; //TODO implement inspiration
                case 4352: break; //TODO implement bandit
                case 4353: self.cd *= 1 - 0.005 + 0.015 * lvl; break; //TODO implement item active cdr
                case 4362: break; //TODO implement wanderer
                default: alert(key); break;
            }
        }
    }
    self.internal.mast_calc = false;
}

calculateItems = function(self){
    self.getItems().forEach(function(id, index){
        if(id == 0){
            return;
        }
        var item = items.data[id]
        if(item.stats == undefined){
            return;
        }
        for(var key in item.stats){
            switch(key){
                case "FlatArmorMod": self.add.armor += item.stats[key]; break;
                case "FlatMovementSpeedMod": self.add.speed += item.stats[key]; break;
                case "FlatHPPoolMod": self.add.hp += item.stats[key]; break;
                case "FlatCritChanceMod": self.add.critChance += item.stats[key]; break;
                case "FlatMagicDamageMod": self.add.ap += item.stats[key]; break;
                case "FlatMPPoolMod": self.add.mana += item.stats[key]; break;
                case "FlatSpellBlockMod": self.add.mr += item.stats[key]; break;
                case "FlatPhysicalDamageMod": self.add.ad += item.stats[key]; break;
                case "PercentAttackSpeedMod": self.mult.attackSpeed *= 1 + item.stats[key]; break;
                case "PercentLifeStealMod": self.add.lifeSteal += item.stats[key]; break; /*FIXME Implement*/
                case "FlatHPRegenMod": self.add.hpRegen += item.stats[key]; break;
                case "FlatMPRegenMod": self.add.manaRegen += item.stats[key]; break;
                case "PercentMovementSpeedMod": self.mult.speed *= 1 + item.stats[key]; break

                default: console.log(key); break;
            }
        }
        compute_item_passive(id, self, index);
    })
}

Champion.prototype.getBaseArmor = function(){
    return (this.base.stats.armor + (this.base.stats.armorperlevel * this.level))
}

Champion.prototype.getArmor = function(){
    this.calculateBuild();
    return (this.getBaseArmor() + this.add.armor) * this.mult.armor
}

Champion.prototype.getBaseAD = function () {
    return (this.base.stats.attackdamage + (this.base.stats.attackdamageperlevel * this.level))
}

Champion.prototype.getAD = function(){
    this.calculateBuild();
    return (this.getBaseAD() + this.add.ad) * this.mult.ad
}

Champion.prototype.getBaseRange = function() {
    return (this.base.stats.attackrange)
}

Champion.prototype.getRange = function(){
this.calculateBuild();
    return (this.getBaseRange() + this.add.range) * this.mult.range
}

Champion.prototype.getBaseAttackSpeed = function(){
    return (((0.625 / (1 + this.base.stats.attackspeedoffset)) * (1 + this.base.stats.attackspeedperlevel * this.level / 100)))
}

Champion.prototype.getAttackSpeed = function(){
this.calculateBuild();
    return (this.getBaseAttackSpeed() + this.add.attackSpeed) * this.mult.attackSpeed
}

Champion.prototype.getBaseCritChance = function(){
    return (this.base.stats.crit + (this.base.stats.critperlevel * this.level))
}

Champion.prototype.getCritChance = function(){
this.calculateBuild();
    return (this.getBaseCritChance() + this.add.critChance) * this.mult.critChance;
}

Champion.prototype.getBaseHP = function(){
    return (this.base.stats.hp + (this.base.stats.hpperlevel * this.level))
}

Champion.prototype.getHP = function(){
this.calculateBuild();
    return (this.getBaseHP() + this.add.hp) * this.mult.hp
}

Champion.prototype.getBaseHPRegen = function(){
    return (this.base.stats.hpregen + (this.base.stats.hpregenperlevel * this.level))
}

Champion.prototype.getHPRegen = function(){
this.calculateBuild();
    return (this.getBaseHPRegen() + this.add.hpRegen) * this.mult.hpRegen
}

Champion.prototype.getBaseSpeed = function(){
    return (this.base.stats.movespeed)
}

Champion.prototype.getSpeed = function(){
this.calculateBuild();
    return (this.getBaseSpeed() + this.add.speed) * this.mult.speed;
}

Champion.prototype.getBaseMana = function(){
    return (this.base.stats.mp + (this.base.stats.mpperlevel * this.level))
}

Champion.prototype.getMana = function(){
this.calculateBuild();
    return (this.getBaseMana() + this.add.mana) * this.mult.mana;
}

Champion.prototype.getBaseManaRegen = function(){
    this.calculateBuild();
    return (this.base.stats.mpregen + (this.base.stats.mpregenperlevel * this.level))
}

Champion.prototype.getManaRegen = function(){
    this.calculateBuild();
    return (this.getBaseManaRegen() + this.add.manaRegen) * this.mult.manaRegen
}

Champion.prototype.getBaseMR = function(){
    return (this.base.stats.spellblock + (this.base.stats.spellblockperlevel * this.level))
}

Champion.prototype.getMR = function(){
    this.calculateBuild();
    return (this.getBaseMR() + this.add.mr) * this.mult.mr
}

Champion.prototype.getAP = function(){
    this.calculateBuild();
    return this.add.ap * this.mult.ap;
}

Champion.prototype.getCD = function(){
    this.calculateBuild();
    return this.cd > .6 ? this.cd:.6;
}

Champion.prototype.getLifeSteal = function(){
    return this.add.lifeSteal * this.mult.lifeSteal;
}

Champion.prototype.getSpellVamp = function(){
    return this.add.spellVamp * this.mult.spellVamp;
}

Champion.prototype.getMagicPen = function(){
    return this.add.magicPen * this.mult.magicPen;
}

Champion.prototype.getArmorPen = function(){
    return this.add.armorPen * this.mult.armorPen;
}

Champion.prototype.getCritDamage = function(){
    return this.add.critDamage * this.mult.critDamage;
}

Champion.prototype.getSpell = function(index){
    var ret = this.base.spells[index];
    ret.parsed = parse_spell(this, ret, index);
    return ret;
}

Champion.prototype.getSpells = function(){
    var arr = [];
    for(var i = 0; i < this.base.spells.length; i++){
        arr[i] = this.getSpell(i)
    }
    return arr
}

Champion.prototype.getItems = function(){
    return this.state.items;
}

Champion.prototype.getBuildPrice = function(){
    var price = 0;
    this.getItems().forEach(function(id){
        if(id == 0){
            return;
        }
        item = items.data[id];
        price += item.gold.total;
    })

    return price;
}

Champion.prototype.getAbilityLevel = function(index){
    spell = this.base.spells[index]
    lvl = 0;
    if($("#ability_level_" + spell.key)[0]!= undefined){
        lvl = parseInt($("#ability_level_" + spell.key)[0].value);
    }
    return lvl;
}

Champion.prototype.getMaxStacks = function(){
    if(this.supp_json.maxStacks != undefined){
        return this.supp_json.maxStacks;
    }
    return 1000000;
}

parse_spell = function(champ, spell, ind){
    var tt_vars = {};
    var lvl = 0;
    if($("#ability_level_" + spell.key)[0]!= undefined){
        lvl = parseInt($("#ability_level_" + spell.key)[0].value);
    }
    var index = 0;
    spell.effect.forEach(function(arr){
        if(arr != null){
            if(lvl == 0){
                tt_vars["e" + index] = 0
            }
            else{
                tt_vars["e" + index] = arr[lvl - 1]
            }
        }
        index++;
    })
    var vars = [];
    if(spell.vars != undefined){
        vars = spell.vars.slice();
    }
    var cust = champ.supp_json.abilities[ind];
    for(var k in cust.vars){
        if(k !== "__comment__") {
            var f = json_func(cust.vars[k]);
            var p = {
                link: "const",
                value: f(champ, lvl),
                key: k
            };
            if (p.value === undefined) {
                p.link = "none";
            }
            vars.push(p)
        }
    }
    if(vars.length > 0){
        vars.forEach(function(v){
            var value;
            var co = true;
            switch(v.link){
                case "const": value = v.value; break;
                case "spelldamage":case "@dynamic.abilitypower": value = champ.getAP(); break;
                case "attackdamage":case "@dynamic.attackdamage": value = champ.getAD(); break;
                case "bonusattackdamage": value = champ.getAD() - champ.getBaseAD(); break;
                case "@cooldownchampion": value = champ.getCD(); break;
                case "health": value = champ.getHP(); break;
                case "bonushealth": value = champ.getHP() - champ.getBaseHP(); break;
                case "@special.nautilusq": break; /*FIXME Implement*/
                case "@text":
                    if(v.ranksWith == "KarmaMantra"){
                        var l = champ.getAbilityLevel(3);
                        if(l > 0){
                            value = v.coeff[l - 1];
                        }
                        else{
                            value = 0;
                        }

                        co = false;
                    }
                    if(v.coeff.length == spell.maxrank){
                    if(lvl = 0){
                        value = 0;
                    }
                    else{
                        value = v.coeff[lvl-1]
                    }
                };
                    if(v.coeff.length == 18){
                        value = v.coeff[champ.level]
                    };
                    break;
                case "@special.jaxrarmor": value = 10 + 20 * lvl + (champ.getAD() - champ.getBaseAD()) * .5; co = false; break;
                case "@special.jaxrmr": value = 10 + 20 * lvl + (champ.getAP()) * .2; co = false; break;
                case "armor": value = champ.getArmor(); break;
                case "none": value = ""; break;
                case "@special.BraumWArmor": value = 12.5 + (2.5 * lvl) + (.085 + .015 * lvl) * (champ.getArmor() - champ.getBaseArmor()); co = false; break;
                case "@special.BraumWMR": value = 12.5 + (2.5 * lvl) + (.085 + .015 * lvl) * (champ.getMR() - champ.getBaseMR()); co = false; break;
                case "@special.jaycew": value = 62 + 8 * lvl; co = false; break;
                case "bonusarmor": value = champ.getArmor() - champ.getBaseArmor(); break;
                case "bonusspellblock": value = champ.getMR() - champ.getBaseMR(); break;
                case "@stacks": value = calc.getChampStacks(); break;
                case "@special.dariusr3": value = calc.getChampStacks(); break; //TODO implement darius stacks
                case "@special.viw": value = Math.floor((champ.getAD() - champ.getBaseAD()) / 35); break;
                default: alert(v.link)
            }
            if(lvl == 0){
                value = 0
            }
            else if(v.link == "@text" || v.link == "const" || v.link == "none"){

            }
            else if(co){
                if(v.coeff.length == 1){
                    value *= v.coeff[0]
                }
                else{
                    value *= v.coeff[lvl - 1]
                }
            }
            if(v.link == "none"){
                tt_vars[v.key] = "";
            }
            else{
                tt_vars[v.key] = Math.round(value);
            }
        })
    }

    var output = spell.sanitizedTooltip

    for(var key in tt_vars){
        output = output.split("{{ " + key + " }}").join(tt_vars[key])
    }

    return output;
}

var passives = {};
var inprog = {};

var compute_item_passive = function(id, champ, slot) {
    if(champ.internal.passive_calc){
        return;
    }
    champ.internal.passive_calc = true;
    if (passives[id] !== undefined) {
        var p = passives[id];
        if (p === null) {
            return;
        }
        for (var ind in p) {
            var pass = p[ind];
            if ($.inArray(pass.name, champ.internal.passives) > -1 && pass.unique) {
                return;
            }
            else {
                json_func(pass.code)(champ, slot);
                champ.internal.passives.push(pass.name);
            }
        }
    }
    else if(inprog[id] == undefined){
        inprog[id] = true;
        $.getJSON( "data/items/" + id + ".json", function( data ) {
            console.log(data)
            calc.item_json[id] = data;
            passives[id] = data.passives;
            inprog[id] = undefined;
            calc.apply()
        }).fail(function(){
            passives[id] = null;
            inprog[id] = undefined;
        });
    }
    else{
        console.log("here");
    }
    champ.internal.passive_calc = false;
}