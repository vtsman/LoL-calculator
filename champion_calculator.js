/**
 * Created by Spencer on 7/11/15.
 */
api_url="http://127.0.0.1:5000/"

app = angular.module('build', []);

$(function() {
    url = "url(bg/" + getRandomInt(1, 1) + ".jpg)"
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

var items = undefined;

app.controller('CalculatorController', function($scope) {
    var calculator = this;
    var current_champion = undefined;
    var current_champion_api = undefined;
    calculator.items = undefined;
    var searched = undefined;

    calculator.init = function(){
        $.ajax({
            method: "GET",
            url: api_url + "api/lol/static-data/na/v1.2/champion/" + getUrlVars()["id"],
            data: {"champData": "all"},
            async: 'true'
        }).done(
            function (data) {
                current_champion_api = JSON.parse(data);
                current_champion = new Champion(current_champion_api, null);
                console.log(current_champion)
                calculator.apply();
                blur();
            }
        ).fail(function (error) {
                console.log(error)
            });

        $.ajax({
            method: "GET",
            url: api_url + "api/lol/static-data/na/v1.2/item",
            data: {"itemListData": "all"},
            async: 'true'
        }).done(
            function (data) {
                calculator.items = JSON.parse(data);
                items = calculator.items
                console.log(calculator.items);
                searched = searchItems("")
                calculator.apply();
            }
        ).fail(function (error) {
                console.log(error)
            });
    }

    calculator.showSearch = function(){
        return searched != undefined;
    }

    calculator.getItemSearchRows = function(){
        return Math.ceil(searched.length / 3);
    }

    calculator.getItemSearchRow = function(row){
        var end = row * 3 + 3;
        if(end > searched.length){
            end = searched.length
        }

        return searched.slice(row * 3, end)
    }

    calculator.update_search = function(){
        searched = searchItems($("#item_search")[0].value)
    }

    var searchItems = function(term){
        if(calculator.items === undefined){
            return;
        }
        var out = [];
        t = normalize(term)
        for(var key in calculator.items.data) {
            var item = calculator.items.data[key]
            if (normalize(item.name).includes(t)) {
                pushItem(item, out)
                continue;
            }
            if(item.colloq != undefined){
                if (normalize(item.colloq).includes(t)) {
                    pushItem(item, out)
                    continue;
                }
            }
            else {
                if(item == undefined){
                    continue;
                }
                if(item.tags == undefined){
                    continue;
                }
                if(item.tags.length == 0){
                    continue;
                }
                item.tags.some(function (tag) {
                    if (t === normalize(tag)) {
                        pushItem(item, out)
                        return true;
                    }
                    return false;
                })
            }
        }
        return out;
    };

    var pushItem = function(item, arr){
        if($.inArray('Trinket', item.tags) > -1){
            return;
        }
        arr.push(item.id);
    }

    var normalize = function(str){
        out = str.split(" ").join();
        out = out.toLowerCase()
        return out;
    }

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

    calculator.active_item = -1

    calculator.item_clicked = function(event){
        var src = event.srcElement || event.target
        clicked = parseInt(src.id.substr(src.id.length - 1))
        if(calculator.active_item != clicked){
            calculator.active_item = clicked;
        }
        else{
            calculator.active_item = -1;
        }
    }

    calculator.set_level = function(){
        current_champion.level = parseInt($("#champion_level")[0].value)
    }

    calculator.apply = function(){
        $scope.$apply();

        var icon = $('#champion_icon');
        var text = $('#champion_header_text');

        icon.height(text.height());
    }

    calculator.should_show_item_popup = function(){
        return calculator.active_item != -1
    }

    var blur = function(){
        $(".blur").blurjs({
            source: 'body',
            overlay: 'rgba(164, 164, 164, .5)',
            cache: true,
            radius: 20
        })

    }

    calculator.getImage = function(image){
        return "https://ddragon.leagueoflegends.com/cdn/5.12.1/img/" + image.group + "/" + image.full;
    }

    calculator.item_click = function(item){
        if(item != undefined){
            if(current_champion != undefined){
                current_champion.state.items[calculator.active_item] = item;
            }
        }
        calculator.active_item = -1
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
