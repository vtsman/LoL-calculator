/**
 * Created by Spencer on 7/11/15.
 */
angular.module('build', [])
    .controller('ChampionController', function($scope) {
        var champion = this;
        current_champion = undefined;
        $.getJSON("./content/json/champions/teemo.json").done(
            function(data){
                current_champion = data;
                apply();
            }
        );

        champion.should_show = function(){
            return current_champion != undefined
        }

        champion.getChampion = function(){
            return current_champion;
        }

        apply = function(){
            $scope.$apply();

            var icon = $('#champion_icon');
            var text = $('#champion_header_text');

            icon.height(text.height());
        }
    });
