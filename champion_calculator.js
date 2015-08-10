/**
 * Created by Spencer on 7/11/15.
 */
api_url="http://127.0.0.1:5000/"

app = angular.module('build', ['ngAnimate', 'ngSanitize']);

$(function() {
    url = "url(bg/" + getRandomInt(1, 3) + ".jpg)"
    //$.jStorage.set("bg", url)
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

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

var items = undefined;
var runes = undefined;

var calc = undefined;

app.controller('CalculatorController', ['$scope', '$sce', function($scope, $sce) {
    var calculator = this;
    calc = this;
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
    calculator.masteries = undefined;
    var current_version = "5.14.1";

    var loadChamp = function(id){
        console.log($sce)
        $.ajax({
            method: "GET",
            url: api_url + "api/lol/static-data/na/v1.2/champion/" + id,
            data: {"champData": "all"},
            async: 'true'
        }).done(
            function (data) {
                current_champion_api = JSON.parse(data);
                $.getJSON("data/champions/" + current_champion_api.key.toLowerCase() + ".json", function(cust){
                    current_champion = new Champion(current_champion_api, cust);
                    console.log(current_champion);
                    $.ajax({
                        method: "GET",
                        url: api_url + "api/lol/static-data/na/v1.2/mastery",
                        data: {"masteryListData": "all"},
                        async: 'true'
                    }).done(
                        function (data) {
                            calculator.masteries = JSON.parse(data);
                            for(var key in calculator.masteries.data){
                                calculator.getChampion().state.mastery_levels[key] = 0;
                            }

                            for(var key in calculator.masteries.data){
                                var prereq = parseInt(calculator.masteries.data[key].prereq);
                                if(prereq > 0){
                                    calculator.masteries.data[prereq].req = key;
                                }
                            }
                            console.log(calculator.masteries)
                            calculator.apply();
                            blur();
                        }
                    ).fail(function (error) {
                            console.log(error)
                        });
                })
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

        $.ajax({
            method: "GET",
            url: api_url + "api/lol/static-data/na/v1.2/versions",
            async: 'true'
        }).done(
            function (data) {
                current_version = JSON.parse(data)[0]
                console.log(current_version)
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
        return out.sort(function(a, b){
            return calculator.items.data[b].gold.total - calculator.items.data[a].gold.total
        });
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

        return out.sort(function(a, b){
            if(a.name.toLowerCase() > b.name.toLowerCase()){
                return 1;
            }
            return -1;
        });
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
            $("#item_button" + calculator.active_item).removeClass("selected");
            calculator.active_item = clicked;
            $("#item_button" + clicked).addClass("selected");
            setTimeout(function(){$("#item_search")[0].focus();}, 10);
        }
        else{
            $("#item_button" + clicked).removeClass("selected");
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
        if(image.group == "gray_mastery"){
            image.group = "mastery";
        }
        return "https://ddragon.leagueoflegends.com/cdn/" + current_version + "/img/" + image.group + "/" + image.full;
    }

    calculator.item_click = function(item){
        if(item != undefined){
            if(current_champion != undefined){
                current_champion.state.items[calculator.active_item] = item;
            }
        }
        $("#item_button" + calculator.active_item).removeClass("selected");
        calculator.active_item = -1
    }

    calculator.getItemDesc = function(item){
        if(item == undefined){
            return;
        }

        if(calculator.items == undefined){
            return;
        }

        if(calculator.items.data[item] == undefined){
            return;
        }

        return calculator.items.data[item].description;
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

    var mastery_hover = -1;

    calculator.setMasteryHover = function(mastery){
        mastery_hover = mastery
    }

    calculator.getMasteryHover = function(){
        return mastery_hover;
    }

    calculator.showMasteryTooltip = function(){
        return mastery_hover != -1;
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

    calculator.getTree = function(name){
        return calculator.masteries.tree[name];
    }

    calculator.showMasteries = function(){
        return calculator.masteries != undefined;
    }

    calculator.incMastery = function(id){
        if(calculator.get_mastery_points() == 30){
            return;
        }
        if(calculator.getChampion().state.mastery_levels[id] < calculator.masteries.data[id].ranks){
            if(calculator.mastery_avail(id)){
                calculator.getChampion().state.mastery_levels[id]++;
            }
        }
    }

    calculator.decMastery = function(id){
        if(calculator.getChampion().state.mastery_levels[id] > 0){
            var tree = calculator.masteries.data[id].masteryTree;
            if(!calculator.check_mast_dec(id)){
                return;
            }
            if(calculator.masteries.data[id].req != undefined){
                if(calculator.getChampion().state.mastery_levels[calculator.masteries.data[id].req] > 0){
                    return;
                }
            }
            calculator.getChampion().state.mastery_levels[id]--;
        }
    }

    calculator.check_mast_dec = function(id){
        var change_tier = calculator.get_mastery_tier(id);
        var curr_tier = calculator.get_last_mastery_tier(calculator.masteries.data[id].masteryTree);
        if(change_tier == curr_tier){
            return true;
        }
        if(Math.floor((calculator.sum_masteries_to_tier(calculator.masteries.data[id].masteryTree, curr_tier - 1) - 1) / 4) >= curr_tier){
            return true;
        }
        return false;
    }

    calculator.get_last_mastery_tier = function(tr){
        var tree = calculator.masteries.tree[tr];
        var out = 0;
        for(var key in tree){
            row = tree[key].masteryTreeItems
            var rTot = 0;
            for(var mKey in row){
                m = row[mKey];
                if(m == null){
                    continue;
                }
                rTot += calculator.getChampion().state.mastery_levels[m.masteryId]
            }
            if(rTot == 0){
                return out - 1;
            }
            if(out == 5){
                return 5;
            }
            out++;
        }
    }

    calculator.sum_masteries_to_tier = function(tr, tier){
        var tree = calculator.masteries.tree[tr];
        var out = 0;
        var r = 0;
        for(var key in tree){
            row = tree[key].masteryTreeItems;
            for(var mKey in row){
                m = row[mKey];
                if(m == null){
                    continue;
                }
                out += calculator.getChampion().state.mastery_levels[m.masteryId]
            }
            if(r == tier){
                return out;
            }
            r++;
        }
    }

    calculator.get_mastery_tree_points = function(tree){
        var out = 0;
        //debugger;
        for(var key in calculator.getChampion().state.mastery_levels){
            if(calculator.masteries.data[key].masteryTree == tree)
                out += calculator.getChampion().state.mastery_levels[key];
        }
        return out;
    }

    calculator.mastery_avail = function(mastery){
        if(calculator.get_mastery_points() == 30){
            return false;
        }
        if(calculator.get_mastery_tier(mastery) * 4 > calculator.get_mastery_tree_points(calculator.masteries.data[mastery].masteryTree)){
            return false;
        }
        var prereq = parseInt(calculator.masteries.data[mastery].prereq);
        if(prereq != 0){
            if(calculator.masteries.data[prereq].ranks != calculator.getChampion().state.mastery_levels[prereq]){
                return false;
            }
        }
        return true;
    }

    calculator.get_mast_class_string = function(id){
        var out = "mastery clickable";
        if(calculator.getChampion().state.mastery_levels[id] == 0){
            if(calculator.mastery_avail(id)){
                out += " partsat"
            }
            else{
                out += " desat"
            }
        }
        return out;
    }

    calculator.get_mastery_tier = function(id){
        if(calculator.masteries == undefined){
            return -1;
        }
        if(calculator.masteries.data[id] == undefined){
            return -1;
        }
        if(calculator.masteries.data[id].tier != undefined){
            return calculator.masteries.data[id].tier;
        }
        /*var treeName = calculator.masteries.data[id].masteryTree;
        var tree = calculator.masteries.tree[treeName];
        var out = 0;
        for(var key in tree){
            row = tree[key].masteryTreeItems;
            for(var mKey in row){
                m = row[mKey];
                if(m == null){
                    continue;
                }
                if(m.masteryId == id){
                    calculator.masteries.data[id].tier = out;
                    return out;
                }
            }
            out++;
        }*/
        //TODO see if this is all that hacky
        return parseInt(id.toString().substr(2, 1)) - 1
    }

    calculator.get_mastery_points = function(){
        var out = 0;
        for(var key in calculator.getChampion().state.mastery_levels){
            out += calculator.getChampion().state.mastery_levels[key];
        }
        return out;
    }

    calculator.getMasteryDesc = function(id){
        if(calculator.masteries == undefined){
            return "";
        }
        if(id == -1){
            return;
        }
        if(calculator.getChampion().state.mastery_levels[id] == 0){
            return "";
        }
        if(calculator.masteries.data[id] == undefined){
            return "";
        }
        return calculator.masteries.data[id].sanitizedDescription[calculator.getChampion().state.mastery_levels[id] - 1];
    }

    calculator.getChampStacks = function(){
        return parseInt($("#champ_stacks")[0].value);
    }

    calculator.lol_login = function(){
        var name = $("#summ_name")[0].value;
        if(name == ""){
            return;
        }
        $.ajax({
            method: "GET",
            url: api_url + "api/lol/na/v1.4/summoner/by-name/" + name,
            async: 'true'
        }).done(
            function (data) {
                var id = JSON.parse(data)[name.split(" ").join("")].id;
                $.ajax({
                    method: "GET",
                    url: api_url + "api/lol/na/v1.4/summoner/" + id + "/masteries",
                    async: 'true'
                }).done(
                    function (data) {
                        calculator.summ_masteries = JSON.parse(data)[id].pages;
                        $.ajax({
                            method: "GET",
                            url: api_url + "api/lol/na/v1.4/summoner/" + id + "/runes",
                            async: 'true'
                        }).done(
                            function (data) {
                                calculator.summ_runes = JSON.parse(data)[id].pages;
                                $scope.$apply();
                            }
                        ).fail(function (error) {
                                console.log(error)
                            });
                    }
                ).fail(function (error) {
                        console.log(error)
                    });
            }
        ).fail(function (error) {
                console.log(error)
            });
    }

    calculator.login_keypress = function(event){
        keyCode = event.which || event.keyCode;
        if (keyCode === 13) {
            calculator.lol_login()
        }
    }

    calculator.summ_logged = function(){
        return calculator.summ_runes != undefined;
    }

    calculator.apply_runes = function(){
        var val = $("#rune_select")[0].value - 1;
        if(val == -1){
            calculator.getChampion().state.runes = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
        }
        else{
            for(var index in calculator.summ_runes[val].slots){
                var slot = calculator.summ_runes[val].slots[index].runeSlotId - 1;
                calculator.getChampion().state.runes[slot] = calculator.summ_runes[val].slots[index].runeId;
            }
        }
    }

    calculator.apply_masteries = function(){
        var val = $("#mastery_select")[0].value - 1;
        if(val == -1){
            for(var key in calculator.masteries.data){
                calculator.getChampion().state.mastery_levels[key] = 0;
            }
        }
        else{
            for(var index in calculator.summ_masteries[val].masteries){
                var mast = calculator.summ_masteries[val].masteries[index];
                calculator.getChampion().state.mastery_levels[mast.id] = mast.rank;
            }
        }
    }
}]);

app.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i);
        return input;
    };
});

app.directive('mastery', function($compile) {
    return {
        restrict: 'E',
        transclude : true,
        scope : {
            tree : '=',
        },
        templateUrl: 'mastery.html',
        link: function($scope, $element, attr){
            $($element.find("div")[0]).attr({
                'id': attr.tree.toLowerCase() + "_grid"
            })

            $element.find("table").attr({
                'id': attr.tree.toLowerCase() + "_mastery_table"
            })

            $element.find("img").attr({
                'src': "{{calculator.getImage(calculator.masteries.data[mastery.masteryId].image)}}"
            })

            $element.find("tr").attr({
                'ng-repeat':"row in calculator.getTree('" + attr.tree + "')"
            });

            $element.find("td").attr({
                'ng-repeat':"mastery in row.masteryTreeItems"
            });

            $element.find("img").attr({
                'ng-click': "calculator.incMastery(mastery.masteryId)",
                'ng-right-click': "calculator.decMastery(mastery.masteryId)",
                'class': "{{calculator.get_mast_class_string(mastery.masteryId)}}",
                'ng-mouseenter': "calculator.setMasteryHover(mastery.masteryId)",
                'ng-mouseleave': "calculator.setMasteryHover(-1)"
            });

            $(".mastery_section").attr({
                'ng-if':"mastery != null"
            })

            $(".mastery_counter").text("{{calculator.getChampion().state.mastery_levels[mastery.masteryId] + '/' + calculator.masteries.data[mastery.masteryId].ranks}}")

            var pt_counter = $($($element.children()[0]).children()[1]);

            pt_counter.text("{{" + "'" + attr.tree + ": '" + " + calculator.get_mastery_tree_points(" + '"' + attr.tree + '"' + ")}}")

            $compile(pt_counter)($scope.$parent);
            $compile($element.find("tr"))($scope.$parent);
        }
    }
});

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});