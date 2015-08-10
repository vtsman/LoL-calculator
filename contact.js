/**
 * Created by Spencer on 8/10/15.
 */
$(function() {
    url = "url(bg/" + getRandomInt(1, 3) + ".jpg)"
    //$.jStorage.set("bg", url)
    $("body").css("background-image", url);

    blur()
});


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