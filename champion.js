/**
 * Created by Spencer on 7/14/15.
 */
var Champion = function(riot_json, custom_json){
    this.level = 0;
    this.base = riot_json;

    this.add = {};
    this.mult = {};

    this.state = {
        cooldowns: [0, 0, 0, 0],
        buffs: [],
        items: [0, 0, 0, 0, 0, 0],
        levels: [0, 0, 0, 0]
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

    this.add.crit = 0;
    this.mult.crit = 1;

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

    this.cdr = [0];
}

Champion.prototype.calculateItems = function(){
    this.resetStats()
    var self = this;
    this.getItems().forEach(function(id){
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
                case "FlatCritChanceMod": self.add.crit += item.stats[key]; break;
                case "FlatMagicDamageMod": self.add.ap += item.stats[key]; break;
                case "FlatMPPoolMod": self.add.mana += item.stats[key]; break;
                case "FlatSpellBlockMod": self.add.mr += item.stats[key]; break;
                case "FlatPhysicalDamageMod": self.add.ad += item.stats[key]; break;
                case "PercentAttackSpeedMod": self.mult.attackSpeed *= 1 + item.stats[key]; break;
                case "PercentLifeStealMod": break; /*FIXME Implement*/
                case "FlatHPRegenMod": self.add.hpRegen += item.stats[key]; break;
                case "FlatMPRegenMod": self.add.manaRegen += item.stats[key]; break;
                case "PercentMovementSpeedMod": self.mult.speed *= 1 + item.stats[key]; break

                default: console.log(key); break;
            }
        }
    })
}

Champion.prototype.getBaseArmor = function(){
    return (this.base.stats.armor + (this.base.stats.armorperlevel * this.level))
}

Champion.prototype.getArmor = function(){
    this.calculateItems();
    return (this.getBaseArmor() + this.add.armor) * this.mult.armor
}

Champion.prototype.getBaseAD = function () {
    return (this.base.stats.attackdamage + (this.base.stats.attackdamageperlevel * this.level))
}

Champion.prototype.getAD = function(){
    this.calculateItems();
    return (this.getBaseAD() + this.add.ad) * this.mult.ad
}

Champion.prototype.getBaseRange = function() {
    return (this.base.stats.attackrange)
}

Champion.prototype.getRange = function(){
    this.calculateItems();
    return (this.getBaseRange() + this.add.range) * this.mult.range
}

Champion.prototype.getBaseAttackSpeed = function(){
    return (((0.625 / (1 + this.base.stats.attackspeedoffset)) * (1 + this.base.stats.attackspeedperlevel * this.level / 100)))
}

Champion.prototype.getAttackSpeed = function(){
    this.calculateItems();
    return (this.getBaseAttackSpeed() + this.add.attackSpeed) * this.mult.attackSpeed
}

Champion.prototype.getBaseCritChance = function(){
    return (this.base.stats.crit + (this.base.stats.critperlevel * this.level))
}

Champion.prototype.getCritChance = function(){
    this.calculateItems();
    return (this.getBaseCritChance() + this.add.crit) * this.mult.crit;
}

Champion.prototype.getBaseHP = function(){
    return (this.base.stats.hp + (this.base.stats.hpperlevel * this.level))
}

Champion.prototype.getHP = function(){
    this.calculateItems();
    return (this.getBaseHP() + this.add.hp) * this.mult.hp
}

Champion.prototype.getBaseHPRegen = function(){
    return (this.base.stats.hpregen + (this.base.stats.hpregenperlevel * this.level))
}

Champion.prototype.getHPRegen = function(){
    this.calculateItems();
    return (this.getBaseHPRegen() + this.add.hpRegen) * this.mult.hpRegen
}

Champion.prototype.getBaseSpeed = function(){
    return (this.base.stats.movespeed)
}

Champion.prototype.getSpeed = function(){
    this.calculateItems();
    return (this.getBaseSpeed() + this.add.speed) * this.mult.speed;
}

Champion.prototype.getBaseMana = function(){
    return (this.base.stats.mp + (this.base.stats.mpperlevel * this.level))
}

Champion.prototype.getMana = function(){
    this.calculateItems();
    return (this.getBaseMana() + this.add.mana) * this.mult.mana;
}

Champion.prototype.getBaseManaRegen = function(){
    this.calculateItems();
    return (this.base.stats.mpregen + (this.base.stats.mpregenperlevel * this.level))
}

Champion.prototype.getManaRegen = function(){
    this.calculateItems();
    return (this.getBaseManaRegen() + this.add.manaRegen) * this.mult.manaRegen
}

Champion.prototype.getBaseMR = function(){
    return (this.base.stats.spellblock + (this.base.stats.spellblockperlevel * this.level))
}

Champion.prototype.getMR = function(){
    this.calculateItems();
    return (this.getBaseMR() + this.add.mr) * this.mult.mr
}

Champion.prototype.getAP = function(){
    this.calculateItems();
    return this.add.ap * this.mult.ap;
}

Champion.prototype.getCD = function(){
    this.calculateItems();
    var cd = 1;
    this.cdr.forEach(function(cdr){
        cd *= (1 - cdr);
    })

    if(cd < .6){cd = .6}
    return cd;
}

Champion.prototype.getSpell = function(index){
    var ret = this.base.spells[index];
    ret.parsed = parse_spell(this, ret);
    return ret;
}

Champion.prototype.getSpells = function(){
    var arr = [];
    for(var i = 0; i < 4; i++){
        arr[i] = this.getSpell(i)
    }
    return arr
}

Champion.prototype.getItems = function(){
    return this.state.items;
}

parse_spell = function(champ, spell){
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
    if(spell.vars != undefined){
        spell.vars.forEach(function(v){
            var value;
            switch(v.link){
                case "spelldamage": value = champ.getAP(); break;
                case "attackdamage":case "@dynamic.attackdamage": value = champ.getAD(); break;
                case "bonusattackdamage": value = champ.getAD() - champ.getBaseAD(); break; /*FIXME Change to OO champion*/
                case "@cooldownchampion": value = champ.getCD(); break;

                default: alert(v.link)
            }
            if(lvl == 0){
                value = 0
            }
            else if(v.coeff.length == 1){
                value *= v.coeff[0]
            }
            else{
                value *= v.coeff[lvl - 1]
            }
            tt_vars[v.key] = Math.round(value);
        })
    }

    var output = spell.sanitizedTooltip

    for(var key in tt_vars){
        output = output.split("{{ " + key + " }}").join(tt_vars[key])
    }

    return output;
}