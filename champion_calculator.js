/**
 * Created by Spencer on 7/11/15.
 */
api_url="http://127.0.0.1:5000/"

app = angular.module('build', ['ngAnimate']);

$(function() {
    url = "url(bg/" + getRandomInt(1, 2) + ".jpg)"
    $("body").css("background-image", url);
});

var mouse_loc = {x: 0, y: 0}

$(document).on('mousemove', function(e){
    mouse_loc.x = e.pageX;
    mouse_loc.y = e.pageY;
    $('.tooltip').each(function(index, tt){
        t = $(tt)
        if(t.css("display") == "none"){
            return;
        }
        if(t.attr("id") == "champion_tooltip"){
            t.css({
                left: e.pageX + 13,
                top: e.pageY + 10
            });
            return
        }
        t.css({
            left: e.pageX - t.width() - 13,
            top: e.pageY + 10
        });
    })
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
var runes = undefined;

app.controller('CalculatorController', function($scope) {
    var calculator = this;
    var current_champion = undefined;
    var current_champion_api = undefined;
    calculator.items = undefined;
    calculator.runes = undefined;
    calculator.champion_list = undefined;
    var searched = undefined;
    var searched_runes = undefined;
    calculator.searched_champs = undefined;
    champKeys = undefined;
    calculator.rune_coords = undefined;
    calculator.active_rune = -1;

    var loadChamp = function(id){
        $.ajax({
            method: "GET",
            url: api_url + "api/lol/static-data/na/v1.2/champion/" + id,
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
    }
    calculator.init = function(){
        loadChamp(17)
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
        $.getJSON( "champKeys.json", function( data ) {
            champKeys = data;
            $.ajax({
                method: "GET",
                url: api_url + "api/lol/static-data/na/v1.2/champion?champData=image,tags",
                async: 'true'
            }).done(
                function (data) {
                    calculator.champion_list = JSON.parse(data).data;
                    calculator.searched_champs = searchChamps("")
                    console.log(calculator.searched_champs)
                    calculator.apply();
                }
            ).fail(function (error) {
                    console.log(error)
                });
        });

        $.getJSON( "rune_coords.json", function( data ) {
            calculator.rune_coords = data;
            console.log(data)
        });

        $.ajax({
            method: "GET",
            url: api_url + "api/lol/static-data/na/v1.2/rune",
            data: {"runeListData": "all"},
            async: 'true'
        }).done(
            function (data) {
                calculator.runes = JSON.parse(data);
                runes = calculator.runes
                calculator.apply();
            }
        ).fail(function (error) {
                console.log(error)
            });


    }

    calculator.switchChamp = function(champ){
        loadChamp(champ.id)
        popup_active = -1;
    }

    calculator.showSearch = function(){
        return searched != undefined;
    }

    calculator.showChampSearch = function() {
        return calculator.searched_champs != undefined;
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

    cCol = 3;

    calculator.getChampSearchRows = function(){
        return Math.ceil(calculator.searched_champs.length / cCol);
    }

    calculator.getChampSearchRow = function(row){
        var end = row * cCol + cCol;
        if(end > calculator.searched_champs.length){
            end = calculator.searched_champs.length
        }

        return calculator.searched_champs.slice(row * cCol, end)
    }

    calculator.update_search = function(){
        searched = searchItems($("#item_search")[0].value)
    }

    calculator.update_champion_search = function(){
        calculator.searched_champs = searchChamps($("#champion_search")[0].value)
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

    var searchChamps = function(term){
        if(calculator.champion_list === undefined){
            return;
        }
        var out = [];
        t = normalize(term)

        cList = jQuery.extend(true, {}, calculator.champion_list);

        for(var key in champKeys){
            if(t.includes(key)){
                for(var c in champKeys[key]){
                    k = champKeys[key][c];
                    out.push(cList[k]);
                    delete cList[k];
                }
            }
        }

        for(var key in cList) {
            var champ = calculator.champion_list[key]
            if (normalize(champ.name).includes(t)) {
                out.push(champ)
                continue;
            }
            else {
                if(champ == undefined){
                    continue;
                }
                if(champ.tags == undefined){
                    continue;
                }
                if(champ.tags.length == 0){
                    continue;
                }
                champ.tags.some(function (tag) {
                    if (t === normalize(tag)) {
                        out.push(champ)
                        return true;
                    }
                    return false;
                })
            }
        }
        return out;
    };

    var searchRunes = function(term, mand_key){
        if(calculator.runes === undefined){
            return;
        }
        var out = [];
        t = normalize(term)
        for(var key in calculator.runes.data) {
            var rune = calculator.runes.data[key]
            if(rune == undefined){
                continue;
            }
            if (normalize(rune.name).includes(t)) {
                pushRune(rune, out, mand_key)
                continue;
            }
            if(rune.tags == undefined){
                continue;
            }
            if(rune.tags.length == 0){
                continue;
            }
            rune.tags.some(function (tag) {
                if (t === normalize(tag)) {
                    pushRune(rune, out, mand_key)
                    return true;
                }
                return false;
            })
        }
        return out;
    };

    var pushItem = function(item, arr){
        if($.inArray('Trinket', item.tags) > -1){
            return;
        }
        arr.push(item.id);
    }

    var pushRune = function(rune, arr, key){
        if($.inArray(key, rune.tags) > -1){
            arr.push(rune.id);
        }
    }

    var normalize = function(str){
        out = str.split(" ").join("");
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
        return +(number.toFixed(3));
    }

    calculator.get_points_used = function(){
        var ability_levels = 0;
        $(".ability_level").each(function(index, level){ability_levels += parseInt(level.value) + 1})
        console.log(ability_levels);
        return ability_levels;
    }

    calculator.active_item = -1

    calculator.item_clicked = function(event){
        var src = event.srcElement || event.target
        clicked = parseInt(src.id.substr(src.id.length - 1))
        if(calculator.active_item != clicked){
            calculator.active_item = clicked;
            setTimeout(function(){$("#item_search")[0].focus();}, 10);
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

    var popup_active = -1;

    calculator.champ_popup_toggle = function(){
        popup_active *= -1

        if(popup_active != -1){
            setTimeout(function(){$("#champion_search")[0].focus();}, 10);
        }
    }

    calculator.should_show_champion_popup = function(){
        return popup_active != -1
    }

    var blur = function(){
        $(".blur").blurjs({
            source: 'body',
            overlay: 'rgba(164, 164, 164, .5)',
            //cache: true,
            //cacheKeyPrefix: 'blurjs-main-',
            radius: 20
        })
        $('.light_blur').blurjs({
            source: 'body',
            radius: 20,
            //overlay: 'rgba(75, 75, 75, .5)',
            overlay: 'rgba(225, 225, 225, .5)',
            //cacheKeyPrefix: 'blurjs-popup-',
           // cache: false
        });
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

    var item_hover_id = -1;

    calculator.setItemHover = function(id){
        item_hover_id = id
    }

    calculator.getItemHover = function(){
        return item_hover_id;
    }

    calculator.showTooltip = function(){
        return item_hover_id != -1;
    }

    var champ_hover = undefined;

    calculator.setChampHover = function(champ){
        champ_hover = champ
    }

    calculator.getChampHover = function(){
        return champ_hover;
    }

    calculator.showChampTooltip = function(){
        return champ_hover != undefined;
    }

    var rune_hover_id = -1;

    calculator.setRuneHover = function(id){
        rune_hover_id = id
    }

    calculator.getRuneHover = function(){
        return rune_hover_id;
    }

    calculator.showRuneTooltip = function(){
        return rune_hover_id != -1;
    }

    calculator.getRuneStyle = function(index, rune){
        if(index === undefined){
            return "";
        }
        if(calculator.rune_coords === undefined){
            return "";
        }
        var xoff = 59;
        var yoff = 0;
        if(rune != -1){
            if($.inArray("quintessence" ,calculator.runes.data[rune].tags) > -1){
                xoff = 60;
                yoff = 5;
            }
            else{
                console.log("here")
                xoff = 55;
                yoff = 20;
            }
        }
        var style = "top: " + (calculator.rune_coords[index].y + yoff) + "px; right: -" + (calculator.rune_coords[index].x + xoff) + "px"
        return style;
    }


    calculator.rune_click = function(rune){
        t = $("#rune_popup");
        if(calculator.active_rune == rune){
            calculator.active_rune = -1;
        }
        else{
            calculator.active_rune = rune;
            t.css({
                left: mouse_loc.x - t.width() - 13,
                top: mouse_loc.y + 10
            });
            update_rune_search_common($("#rune_search")[0].value)
            setTimeout(function(){$("#rune_search")[0].focus();}, 10);
        }
    }

    calculator.rune_select = function(rune){
        calculator.getChampion().state.runes[calculator.active_rune] = rune;
        calculator.active_rune = -1;
    }

    calculator.should_show_rune_popup = function(){
        return calculator.active_rune != -1;
    }

    calculator.update_rune_search = function(){
        update_rune_search_common($("#rune_search")[0].value)
    }

    update_rune_search_common = function(term){
        var key = undefined;
        if(calculator.active_rune != -1){
            if(0 <= calculator.active_rune && calculator.active_rune < 9){
                key = "mark"
            }
            if(9 <= calculator.active_rune && calculator.active_rune < 18){
                key = "seal"
            }
            if(18 <= calculator.active_rune && calculator.active_rune < 27){
                key = "glyph"
            }
            if(27 <= calculator.active_rune && calculator.active_rune < 30){
                key = "quintessence"
            }
        }
        searched_runes = searchRunes(term, key)
    }

    calculator.showRuneSearch = function(){
        return searched_runes != undefined;
    }

    calculator.getRuneSearchRows = function() {
        return Math.ceil(searched_runes.length / cCol);
    }

    calculator.getRuneSearchRow = function(row){
        var end = row * cCol + cCol;
        if(end > searched_runes.length){
            end = searched_runes.length
        }

        return searched_runes.slice(row * cCol, end)
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