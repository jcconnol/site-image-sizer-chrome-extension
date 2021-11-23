window.addEventListener('load', function(event){
    chrome.tabs.executeScript(null,
        {file: 'content.js'},
        sendMessage
    )
});

//TODO listen for image array once code in content.js is done executing
function sendMessage(){
    var getImageInfoButton = document.getElementsByClassName('get-image-info-button')[0];

    getImageInfoButton.addEventListener('click', function() {

        getImageInfoButton.disabled = true;

        var params = {
            active: true,
            currentWindow: true
        }

        var messageTo = {
            subject: "DOMInfo",
            from: "imgs"
        }

        chrome.tabs.query(params, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, messageTo);
        });

    }, false);
  
}

chrome.runtime.onMessage.addListener(
    async function(request, sender) {
        var getImageInfoButton = document.getElementsByClassName('get-image-info-button')[0];
        
        if(sender.tab.active === true){
            //TODO save to browser
            var data = request.imgsArray
            
            var imageTable = "<table><thead><tr class=\"image-table-header\">";
            imageTable += `<th class="sorting"></th>`;
            imageTable += `<th class="sorting">URL</th>`;
            imageTable += `<th class="sorting">Size (kb)</th>`;
            imageTable += "</tr></thead><tbody><tr>";

            for(var i = 0; i < data.length; i++){
                var value = data[i];

                if(value.url.substring(0, 4) !== "data"){
                    
                    //image grabbing with get call
                    await fetch(value.url)
                        .then(response => {

                            //SVGs are returned as readable stream, handled in next "then"
                            if(value.url.includes(".svg")){
                                return response.text();
                            }

                            var responseSize = response.headers.get("content-length")/1024;
                            responseSize = Math.ceil(responseSize);

                            if(responseSize < 1){
                                console.log(responseSize + " | " + value.url);
                            }
                            
                            if(!isNaN(responseSize)){
                                imageTable += `<td>${i}</td>`;
                                imageTable += `<td>${value.url}</td>`;
                                imageTable += `<td>${responseSize}</td>`;
                            }
                            else{
                                console.log(responseSize + " | " + value.url);
                                imageTable += `<td>${i}</td>`;
                                imageTable += `<td>${value.url}</td>`;
                                imageTable += `<td> error</td>`;
                            }
                        }).then(function(data) {
                            //SVG handling, comes in as text
                            var svgSize = new Blob([data]).size / 1024;
                            svgSize = Math.ceil(svgSize);

                            if(value.url.includes(".svg")){
                                imageTable += `<td>${i}</td>`;
                                imageTable += `<td>${value.url}</td>`;
                                imageTable += `<td>${svgSize}</td>`;
                            }
                        })
                        .catch(error => {
                            console.log(error);                            
                            imageTable += `<td>${i}</td>`;
                            imageTable += `<td>${value.url}</td>`;
                            imageTable += `<td> error</td>`;
                        });                
                    
                    if ((i+1) != data.length) { 
                        imageTable += "</tr><tr>"; 
                    }
                }
            }

            imageTable += "</tr><tbody></table>";
            document.getElementById("image-list-container").innerHTML = imageTable;
        }

        var numericRegExp = new RegExp('^((?:NaN|-?(?:(?:\\d+|\\d*\\.\\d+)(?:[E|e][+|-]?\\d+)?|Infinity)))$')

        

        initSortTable(document.querySelector('table'))

        getImageInfoButton.disabled = false;
    

        //Helper functions for sorting
        function isNumeric (value) {
            return numericRegExp.test(String(value))
        }

        function toArray (value) {
            if (!value) {
                return []
            }
            
            if (Array.isArray(value)) {
                return value
            }
            
            if (value instanceof window.NodeList || value instanceof window.HTMLCollection) {
                return Array.prototype.slice.call(value)
            }
            
            return [ value ]
        }

        function sortTable (table, ordering) {
            var thead = table.querySelector('thead')
            var tbody = table.querySelector('tbody')
            var rows = toArray(tbody.rows)
            var headers = toArray(thead.rows[0].cells)

            var current = toArray(thead.querySelectorAll('.sorting_desc, .sorting_asc'))
            
            current.filter(function (item) { return !!item }).forEach(function (item) {
                item.classList.remove('sorting_desc')
                item.classList.remove('sorting_asc')
            })
            
            headers.filter(function (item) { return !!item }).forEach(function (header) {
                header.classList.remove('sorting_desc')
                header.classList.remove('sorting_asc')
            })
            
            ordering.forEach(function (order) {
                var index = order.idx
                var direction = order.dir || 'asc'
                
                var header = headers[index]
                header.classList.add('sorting_' + direction)
            })
            
            rows.sort(function sorter (a, b) {
                var i = 0
                var order = ordering[i]
                var length = ordering.length
                var aText
                var bText
                var result = 0
                var dir
                
                while (order && result === 0) {
                    dir = order.dir === 'desc' ? -1 : 1

                    aText = a.cells[order.idx].textContent
                    bText = b.cells[order.idx].textContent

                    if (isNumeric(aText) && isNumeric(bText)) {
                        result = dir * (parseFloat(aText) - parseFloat(bText))
                    } else {
                        result = dir * aText.localeCompare(bText)
                    }
                    
                    i += 1
                    order = ordering[i]
                }
                
                return result
            }).forEach(function each (row) {
                tbody.appendChild(row)
            })
        }

        function find (array, predicate) {
            return toArray(array).filter(predicate)[0]
        }

        function initSortTable (table) {
            var thead = table.querySelector('thead')
            var ordering = [{idx:2,dir:'asc'},{idx:1,dir:'asc'}]
            
            sortTable(table, ordering)
            table.__ordering = ordering
            
            thead.addEventListener('click', function onClick (event) {
                var src = event.target || event.srcElement
                var tagName = src.tagName.toLowerCase()
                
                if (tagName !== 'th') {
                return
                }
                
                if (!event.shiftKey) {
                table.__ordering = [
                    {
                    idx: src.cellIndex,
                    dir: src.classList.contains('sorting_asc') ? 'desc' : 'asc'
                    }
                ]
                } else {
                var order = find(table.__ordering, function (item) {
                    return item.idx === src.cellIndex
                })
                
                if (order) {
                    order.dir = order.dir === 'asc' ? 'desc' : 'asc'
                } else {
                    table.__ordering.push({
                    idx: src.cellIndex,
                    dir: 'asc'
                    })
                }
                }
                
                sortTable(table, table.__ordering)
            }, false)
        }
    }
);