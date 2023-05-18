var spillzy = window.spillzy || {}
(function VideosScopeWrapper($){
    var authToken;
    spillzy.authToken.then(function setAuthToken(token){
        if (token){
            authToken = token
        }
        else{
            window.location.href = "./signIn.html";
        }
    }).catch(function handleError(error){
        alert(error);
        window.location.href = "./signIn.html";
    });
    var region = 'us-east-1'
    var username

    $.ajax({
        method: 'POST',
        url: `https://cognito-idp.${region}.amazonaws.com/`,
        headers: {
            "Content-Type":"application/x-amz-json-1.1",
            "Content-Length": "1162",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser"
        },
        data: JSON.stringify({
            AccessToken: authToken
        }),
        success: function reqSuccess(res){
            username = res.Username
            getURLS(username)
        },
        error: function reqError(error){
            console.log(error)
            window.location.href = '/signIn.html'
        }
    });

    function getURLS(username){
        $.ajax({
            method: 'POST',
            url: 'https://5muja1w78d.execute-api.us-east-1.amazonaws.com/prod' + '/getLinks',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                username: username
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error loading videos: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when loading your videos:\n' + jqXHR.responseText);
            }
        })
    }

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

        spillzy.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        window.setInterval(function(){
            refreshActiveVid()
          }, 1000);
    })



}(jQuery))