chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var popupArrayResponse = [];

        var imageArray = document.getElementsByTagName("img");

        //Add og:image
        var ogImage = document.querySelector("meta[property='og:image']");

        if (ogImage) {
            popupArrayResponse.push(ogImage.content);
        }

        var imageArrayLen = imageArray.length;

        for(var i = 0; i < imageArrayLen; i++){

            var imageURLArray = [
                imageArray[i].src,
                imageArray[i].dataset.src,
                imageArray[i].dataset.lazyLoadImage
            ];

            var uniqueURLArray = formatArray(imageURLArray);

            for(var j = 0; j < uniqueURLArray.length; j++){
                popupArrayResponse.push({
                    url: uniqueURLArray[j]
                });
            }
        }

        var styleArray = document.getElementsByTagName("style");
        var styleArrayLen = styleArray.length;

        for(var i = 0; i < styleArrayLen; i++){
            var styleURLArray = styleArray[i].textContent.match(/url\(([^;\)])*\)/gm);
            var uniqueURLArray = formatArray(styleURLArray);

            if(uniqueURLArray.length > 0){
                for(var j = 0; j < uniqueURLArray.length; j++){
                    var uniqueURL = uniqueURLArray[j];
                    if(uniqueURL && !uniqueURL.startsWith("data")){
                        if(uniqueURL.startsWith("url(")){
                            //removes "url(" and ")" from beginning and end
                            uniqueURL = uniqueURL.slice(4, -1);
                        }

                        if(uniqueURL.startsWith("\"") || uniqueURL.startsWith("'")){
                            uniqueURL = uniqueURL.slice(1, -1);
                        }

                        if(uniqueURL.slice(-1) === "\"" || uniqueURL.slice(-1) === "'"){
                            uniqueURL = uniqueURL.slice(0, -2);
                        }

                        popupArrayResponse.push({
                            url: uniqueURL
                        });
                    }
                }
            }
        }

        for (var i=popupArrayResponse.length; i--;) {
            if (popupArrayResponse[i].indexOf("bat.bing")>=0){
                popupArrayResponse.splice(i, 1)
                break;
            }
        }

        chrome.runtime.sendMessage({ 
            action: "show", 
            imgsArray: popupArrayResponse
        });
        
        return true;
    }
);

function formatArray(array){
    //remove duplicate urls from different sources
    if(!array || array.length < 1){
        return [];
    }

    var uniqueArray = [];
    for(var j = 0; j < array.length; j++){
        if(uniqueArray.indexOf(array[j]) == -1){
            uniqueArray.push(array[j])
        }
    }

    //remove undefined's
    uniqueArray = uniqueArray.filter(function( element ) {
        if(element == undefined){
            return false;
        }

        if(element.trim() === ""){
            return false;
        }

        if(element.includes("data:image/")){
            return false;
        }

        if(element.includes(".woff2") || element.includes(".woff")){
            return false;
        }

        return true;
    });

    return uniqueArray;
}

function removeURLParameters(url){
    if(url){
        if(url.indexOf('?') > 0){
            return url.substring(0, url.indexOf('?'))
        }
    }
    else {
        return null
    }
}