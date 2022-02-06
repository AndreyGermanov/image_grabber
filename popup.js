const grabBtn = document.getElementById("grabBtn");
grabBtn.addEventListener("click",() => {    
    // Get active browser tab
    chrome.tabs.query({active: true}, function(tabs) {
        var tab = tabs[0];
        if (tab) {
            execScript(tab);
        } else {
            alert("There are no active tabs")
        }
    })
})

/**
 * Execute a grabImages() function on a web page,
 * opened on specified tab and on all frames of this page
 * @param tab - A tab to execute script on
 */
function execScript(tab) {
    // Execute a function on a page of the current browser tab
    // and process the result of execution
    chrome.scripting.executeScript(
        {
            target:{tabId: tab.id, allFrames: true},
            func:grabImages
        },
        onResult
    )
}

/**
 * Executed on a remote browser page to grab all images
 * and return their URLs
 * 
 *  @return Array of image URLs
 */
function grabImages() {
    const images = document.querySelectorAll("img");
    return Array.from(images).map(image=>image.src);    
}

/**
 * Executed after all grabImages() calls finished on 
 * remote page
 * Combines results and copy a list of image URLs 
 * to clipboard
 * 
 * @param {[]InjectionResult} frames Array 
 * of grabImage() function execution results
 */
function onResult(frames) {
    // If script execution failed on remote end 
    // and could not return results
    if (!frames || !frames.length) { 
        alert("Could not retrieve images from specified page");
        return;
    }
    // Combine arrays of image URLs from 
    // each frame to a single array
    const imageUrls = frames.map(frame=>frame.result)
                            .reduce((r1,r2)=>r1.concat(r2));
    // Copy to clipboard a string of image URLs, delimited by 
    // carriage return symbol  
    window.navigator.clipboard
          .writeText(imageUrls.join("\n"))
          .then(()=>{
             // close the extension popup after data 
             // is copied to the clipboard
             window.close();
          });
}