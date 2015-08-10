/**
 * Created by Spencer on 7/28/15.
 */
var json_func = function(arr){
    return new Function(arr.join("\n"))()
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}