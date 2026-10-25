const API_KEY = "YOUR_API_KEY";
//Stores completed API results
const ratingCache = new Map();

//Stores requests that are currently in progress
const pendingRequests = new Map();

chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
    if(request.type !== "GET_IMDB_RATING"){
        return;
    }

    const title = request.title?.trim();
    const mediaType = request.mediaType || "movie";

    if(!title){
        sendResponse({
            success: false,
            error: "Missing title"
        });
        return;
    }

    //Use title and media as the cache key
    const cacheKey = `${mediaType}:${title.toLowerCase()}`;

    //If we already have result, reuse it
    if(ratingCache.has(cacheKey)){
        sendResponse(ratingCache.get(cacheKey));
        return;
    }

    //Same request is already running, wait for it
    if(pendingRequests.has(cacheKey)){
        pendingRequests.get(cacheKey).then(sendResponse);
        return true;
    }

    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey",API_KEY);
    url.searchParams.set("t",title);
    url.searchParams.set("type",mediaType || "movie");

    //Make one request and share its result with duplicate callers
    const fetchPromise = fetch(url)
        .then(response => response.json())
        .then(data => {
            let result;
            if(data.Response === "True" && data.imdbRating !== "N/A"){
                result = {
                    success: true,
                    title: data.Title,
                    rating: data.imdbRating,
                    imdbID: data.imdbID
                };
                ratingCache.set(cacheKey,result);
            } else {
                result = {
                    success: false,
                    error: data.Error || "IMDb rating unavailable"
                };
            }
            return result;
        })
        .catch(error => ({
            success: false,
            error: error.message 
        }))
        .finally(() => {
            //remove completed request from the pending list
            pendingRequests.delete(cacheKey);
        });
        pendingRequests.set(cacheKey,fetchPromise);
        fetchPromise.then(sendResponse);

        return true;
});
