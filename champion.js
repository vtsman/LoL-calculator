/**
 * Created by Spencer on 7/11/15.
 */
api_url="http://localhost:5000/"

app = angular.module('build', []);
app.controller('ChampionController', function($scope) {
    var champion = this;
    var current_champion = undefined;
    $.ajax({
        method: "GET",
        url: api_url + "api/lol/static-data/na/v1.2/champion/17",
        data: { "champData": "all" },
        async: 'true'
    }).done(
        function(data){
            current_champion = JSON.parse(data);
            console.log(current_champion)
            apply();
        }
    ).fail(function(error){
            console.log(error)
        });

    champion.should_show = function(){
        return current_champion != undefined
    }

    champion.getChampion = function(){
        return current_champion;
    }

    champion.getLevel = function(){
        return $("#champion_level").val()
    }

    champion.getArmor = function(){
        return champion.getChampion().stats.armor + (champion.getChampion().stats.armorperlevel * champion.getLevel())
    }

    champion.getAD = function () {
        return champion.getChampion().stats.attackdamage + (champion.getChampion().stats.attackdamageperlevel * champion.getLevel())
    }

    champion.getRange = function() {
        return champion.getChampion().stats.attackrange
    }

    champion.getAttackSpeed = function(){
        return Math.round(((0.625 / (1 + champion.getChampion().stats.attackspeedoffset)) * (1 + champion.getChampion().stats.attackspeedperlevel * champion.getLevel() / 100)) * 1000) / 1000
    }

    champion.getCritChance = function(){
        return champion.getChampion().stats.crit + (champion.getChampion().stats.critperlevel * champion.getLevel())
    }

    champion.getHP = function(){
        return champion.getChampion().stats.hp + (champion.getChampion().stats.hpperlevel * champion.getLevel())
    }

    champion.getHPRegen = function(){
        return champion.getChampion().stats.hpregen + (champion.getChampion().stats.hpregenperlevel * champion.getLevel())
    }

    champion.getSpeed = function(){
        return champion.getChampion().stats.movespeed
    }

    champion.getMana = function(){
        return champion.getChampion().stats.mp + (champion.getChampion().stats.mpperlevel * champion.getLevel())
    }

    champion.getManaRegen = function(){
        return champion.getChampion().stats.mpregen + (champion.getChampion().stats.mpregenperlevel * champion.getLevel())
    }

    champion.getMR = function(){
        return champion.getChampion().stats.spellblock + (champion.getChampion().stats.spellblockperlevel * champion.getLevel())
    }

    apply = function(){
        $scope.$apply();

        var icon = $('#champion_icon');
        var text = $('#champion_header_text');

        icon.height(text.height());
    }
});
app.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i);
        return input;
    };
});
