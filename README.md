
# Prime IMDb Ratings 🎬

A Chrome extension that displays IMDb ratings directly on movie and TV show cards while browsing Amazon Prime Video, making it easier to discover what to watch without opening each title individually.

## ✨ Features

- **IMDb Ratings:** Displays IMDb ratings directly on Prime Video content cards.
- **Movie and TV Show Support:** Identifies the media type and uses it when querying the API.
- **Dynamic Content Detection:** Detects cards added dynamically as you browse Prime Video.
- **Automatic Title Cleanup:** Removes season suffixes from TV show titles before looking them up.
- **API Request Caching:** Stores successfully fetched ratings in memory to avoid repeated API calls.
- **Duplicate Request Prevention:** Reuses ongoing requests when multiple cards request the same title simultaneously.
- **Error Handling:** Handles unavailable ratings and API request failures.

## 🛠️ Tech Stack

- JavaScript
- Chrome Extensions API (Manifest V3)
- OMDb API
- HTML DOM manipulation
- MutationObserver
- Fetch API

## 🏗️ Project Structure

```text
prime-imdb-ratings/
├── manifest.json
├── content.js
├── background.js
└── README.md
```

### `manifest.json`

Configures the Chrome extension, declares the required host permissions, registers the background service worker, and specifies where the content script runs.

### `content.js`

Runs on Prime Video pages and:
- Finds content cards in the page.
- Extracts and cleans movie or TV show titles.
- Determines the media type.
- Sends messages to the background service worker to request IMDb ratings.
- Adds rating badges to content cards.
- Uses a `MutationObserver` to detect dynamically added content.

### `background.js`

Handles communication with the OMDb API and:
- Constructs API requests using the title and media type.
- Fetches IMDb ratings.
- Processes API responses and errors.
- Caches successful results using a JavaScript `Map`.
- Reuses in-progress requests to prevent duplicate API calls.

## 🚀 Installation

### Prerequisites

- Google Chrome
- An OMDb API key, available from [OMDb API](https://www.omdbapi.com/apikey.aspx)

### Steps

1. Clone or download this repository.
2. Obtain an API key from OMDb.
3. Open `background.js` and replace the placeholder API key with your own:

   ```javascript
   const API_KEY = "YOUR_OMDB_API_KEY";
   ```

4. Open Chrome and navigate to `chrome://extensions`.
5. Enable **Developer mode**.
6. Click **Load unpacked**.
7. Select the project directory containing `manifest.json`.
8. Open [Prime Video](https://www.primevideo.com/) and browse the available titles.

IMDb ratings should appear on supported content cards when the API returns a valid rating.

## ⚙️ How It Works

The extension uses a content script and a background service worker to separate webpage interaction from API communication.

1. **Detect content:** The content script scans Prime Video for movie and TV show cards.
2. **Extract metadata:** It extracts the title and determines whether the content is a movie or a series.
3. **Check for existing requests:** The background script checks whether a request for the same title is already in progress.
4. **Check the cache:** If a successful rating is already cached, it returns that result without making another API call.
5. **Fetch the rating:** On a cache miss, the background script sends a request to the OMDb API.
6. **Process the response:** If a valid IMDb rating is returned, the result is cached and sent back to the content script.
7. **Display the rating:** The content script adds the rating badge to the corresponding content card.
8. **Handle new cards:** A `MutationObserver` detects dynamically added cards and allows them to be processed as well.

## 🧠 Caching and Request Optimization

The extension uses two in-memory Maps:

| Data structure | Purpose |
|---|---|
| `ratingCache` | Stores successfully fetched ratings for reuse. |
| `pendingRequests` | Tracks ongoing requests so duplicate requests can share the same Promise. |

The cache key combines the media type and normalized title:

```javascript
const cacheKey = `${mediaType}:${title.toLowerCase()}`;
```

Including the media type helps distinguish movies from TV shows with similar titles.

Only successful rating results are cached. Failed requests can be retried when requested again.

**Note:** The cache exists in memory and may be cleared when Chrome restarts the extension's background service worker. A new lookup after that may require another API request.

## 🔑 API Reference

This project uses the [OMDb API](https://www.omdbapi.com/).

The extension queries the API using:
- `apikey`: Your OMDb API key.
- `t`: The movie or TV show title.
- `type`: The media type, such as `movie` or `series`.

A successful response provides information including the title, IMDb rating, and IMDb ID.

API availability and request limits depend on your OMDb plan.

## 🐛 Troubleshooting

**Ratings are not appearing**
- Verify that the extension is enabled.
- Check that your OMDb API key is valid.
- Open the extension's service worker console from `chrome://extensions`.
- Inspect the Prime Video page console for content-script errors.
- Confirm that the API returns a valid rating for the title.

**API request limit reached**
- Check your OMDb API plan and usage limits.
- The in-memory cache reduces repeated requests for successfully retrieved titles.
- Avoid unnecessary repeated lookups while testing.

**Some titles are not recognized**
- Verify the extracted title in the console logs.
- Check whether the title or media type sent to OMDb is correct.
- Some titles may not have a rating available through the API.

## 🔒 Security Notes

- Keep your API key private.
- Do not commit a real API key to a public repository.
- Consider loading the key through a local configuration file excluded from version control.
- Remember that a key used by a distributed browser extension cannot be treated as a fully secret credential.

## 🔮 Future Improvements

- Add configurable rating badge styles.
- Improve title matching for alternate titles and ambiguous results.
- Add a manual refresh option for ratings.
- Improve retry handling and API error reporting.
- Explore cache expiration or refresh policies if needed.

## 📄 License

Choose and add a license before distributing this project publicly.

---

Built to make browsing Prime Video a little more informative. 🍿
