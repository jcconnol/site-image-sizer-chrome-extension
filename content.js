chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var popupArrayResponse = [];

        var imageArray = document.getElementsByTagName("img");
        var imageArrayLen = imageArray.length;

        for(var i = 0; i < imageArrayLen; i++){
            
            var imageURLArray = [
                imageArray[i].src,
                imageArray[i].dataset.src,
                imageArray[i].dataset.lazyLoadImage
            ]

            //remove duplicate urls from different sources
            var uniqueURLArray = [];
            for(var j = 0; j < imageURLArray.length; j++){
                if(uniqueURLArray.indexOf(imageURLArray[j]) == -1){
                    uniqueURLArray.push(imageURLArray[j])
                }
            }

            //remove undefined's
            uniqueURLArray = uniqueURLArray.filter(function( element ) {
                return element !== undefined;
            });

            for(var j = 0; j < uniqueURLArray.length; j++){
                popupArrayResponse.push({
                    url: uniqueURLArray[j]
                });
            }
        }

        chrome.runtime.sendMessage({ 
            action: "show", 
            imgsArray: popupArrayResponse
        });
        
        return true;
    }
  );