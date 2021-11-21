chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        var popupArrayResponse = [];

        var imageArray = document.getElementsByTagName("img");
        for(var i = 0; i < imageArray.length; i++){
            
            var imageURL = imageArray[i].src;

            if(imageURL === ''){
                imageURL = imageArray[i].dataset.src
            }
            
            await fetch(imageURL)
                .then(response => {
                    var responseSize = response.headers.get("content-length")/1024;
                    responseSize = Math.ceil(responseSize);
                    
                    popupArrayResponse.push({
                        url: imageURL,
                        index: (i+1),
                        size: responseSize
                    });
                });
        }

        chrome.runtime.sendMessage({ 
            action: "show", 
            imgsArray: popupArrayResponse
        });
        
        return true;
    }
  );