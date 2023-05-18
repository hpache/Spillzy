(function scopeWrapper($){
    function completeRequest(res){
        var links = res.links
        genHTMLObjects(links)
    }

    function genHTMLObjects(links){
        var head = $("#videos")

        for (let index = 0; index < links.length; index++) {
            var carouselItem;
            var link = links[index]
            if (index==0){
                carouselItem = $("<div class='carousel-item active'>")
            }
            else{
                carouselItem = $("<div class='carousel-item'>")
            }
            var img = $(`<img src=${link} class="d-block w-100">`)
            img.appendTo(carouselItem)
            carouselItem.appendTo(head)
        }
    }

    function refreshActiveVid(){
        var img = $('.carousel-item.active')[0].children[0]
        img.src = `${img.src}?random=${new Date().getTime()}`;
    }

    $(function onDocReady(){
        var res = {links: ["http://92.154.48.50:8083/record/current.jpg", "http://61.214.197.204:1024/-wvhttp-01-/GetOneShot"]}
        completeRequest(res)

        window.setInterval(function(){
            refreshActiveVid()
          }, 1000);
    })
}(jQuery))