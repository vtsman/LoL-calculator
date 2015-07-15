/**
 * Created by Spencer on 7/11/15.
 */
api_url="http://localhost:5000/"

app = angular.module('build', []);

$(function() {
    url = "url(bg/" + getRandomInt(1, 2) + ".jpg)"
    $("body").css("background-image", url);

});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

app.controller('CalculatorController', function($scope) {
    var calculator = this;
    var current_champion = undefined;
    var current_champion_api = undefined;
    $.ajax({
        method: "GET",
        url: api_url + "api/lol/static-data/na/v1.2/champion/" + getUrlVars()["id"],
        data: { "champData": "all" },
        async: 'true'
    }).done(
        function(data){
            current_champion_api = JSON.parse(data);
            current_champion = new Champion(current_champion_api, null);
            console.log(current_champion)
            calculator.apply();
            blur();
        }
    ).fail(function(error){
            console.log(error)
        });

    calculator.should_show = function(){
        return current_champion != undefined
    }

    calculator.getChampion = function(){
        return current_champion;
    }

    calculator.round = function(number){
        return Math.round(number * 1000) / 1000;
    }

    calculator.get_points_used = function(){
        var ability_levels = 0;
        $(".ability_level").each(function(index, level){ability_levels += parseInt(level.value)})
        return ability_levels;
    }

    calculator.apply = function(){
        $scope.$apply();

        var icon = $('#champion_icon');
        var text = $('#champion_header_text');

        icon.height(text.height());
    }

    var blur = function(){
        $(".blur").blurjs({
            overlay: 'rgba(164, 164, 164, .5)',
            radius: 20
        });
    }

    calculator.getImage = function(image){
        return "https://ddragon.leagueoflegends.com/cdn/5.12.1/img/" + image.group + "/" + image.full;
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
