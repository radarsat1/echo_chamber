# Architecture Deep Dive: The CORS Proxy

A key challenge for a client-side-only app like this is the browser's **Same-Origin Policy**. This security feature prevents a web page from making requests to a different domain (an "origin") than the one that served the page. For example, the app running on your local machine cannot directly fetch data from `reddit.com` or `news.ycombinator.com`.

To solve this, the application uses a public **CORS (Cross-Origin Resource Sharing) proxy**.

## How It Works

1.  The app needs data from an external API (e.g., `https://www.reddit.com/search.json?...`).
2.  Instead of making a direct request, it prepends the API URL with the proxy's URL (e.g., `https://corsproxy.io/?https://www.reddit.com/...`).
3.  The browser sends the request to the proxy (`corsproxy.io`), which is allowed.
4.  The proxy server (which is not a browser and has no origin restrictions) then makes the request to the target API on our app's behalf.
5.  The proxy receives the response from the API and forwards it back to our app, adding the necessary `Access-Control-Allow-Origin` headers that tell the browser the response is safe to use.

This allows a fully client-side application to interact with external APIs that don't explicitly support cross-origin requests.

## Limitations of the Public Proxy

The current implementation uses `https://corsproxy.io/`, a free, public service. While convenient for development and personal projects, it has critical limitations:

*   **Reliability:** There is no uptime guarantee (SLA). The service could be slow, temporarily unavailable, or shut down at any time.
*   **Rate Limiting:** To prevent abuse, the proxy enforces rate limits. If you make too many requests in a short period (e.g., by refreshing feeds too often), the proxy may temporarily block your IP address, resulting in failed requests.
*   **Security & Privacy:** The proxy sits between your app and the API. **You should never send sensitive data (API keys, personal information) through a public proxy**, as the proxy owner can see all traffic. This is safe for our app, as we only handle public data.

## Moving to a Self-Hosted Solution

For a more robust and private solution, you should replace the public proxy with your own. You can run an open-source proxy on your own server or as a cheap serverless function (e.g., on Vercel, Netlify, or AWS Lambda).

**Example: Simple Express.js Proxy**

Here is a basic proxy you could deploy:

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3001;

app.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'EchoChamber-Proxy/1.0' } });
    const body = await response.text();
    
    // Forward headers from the target response
    for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
    }
    
    // Add the crucial CORS header
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`CORS proxy listening at http://localhost:${port}`);
});
```

**Frontend Code Change:**

Once your proxy is deployed (e.g., at `https://my-proxy.example.com`), you would update the `constants.ts` file in this project. The query parameter structure might need to change based on your proxy's implementation (e.g., some use `?url=`, others just append the URL).

```typescript
// constants.ts

// Before
export const CORS_PROXY_URL = 'https://corsproxy.io/?';

// After (example for a proxy that uses a `url` query parameter)
// export const CORS_PROXY_URL = 'https://my-proxy.example.com/?url='; 
```

## Notes

Building this app was my first experiment with Google's Gemini Code
Assistant in AI Studio.  It's probably pretty obvious that this was
fully AI generated, so it's been a learning experience.  I am not a
JavaScript engineer, but I made this app in an afternoon, so in that
sense it's a success.

Still, while the first thing it spit out worked quite well, fixing it
up took a lot of back and forth.  In the end the experience did
degrade and I kept thinking of things I wanted to change.  Right now I
am quite happy with it but I noticed problems on Chrome Mobile and the
icons don't display right in Firefox Mobile.  But it's quite usable
for my purposes, so I stop here for now, maybe I'll come back to it
and fix these things next time I want to experiment with agents.

I'm very happy I could generate a whole app like this, to use for my
own purposes, I hope anyone else also finds it useful.  I'll be doing
more of these kind of one-off apps in the future. I know there is a
lot of anti-AI sentiment and it is generally for good reason, but I
think this is one thing that AI really enables and I find it fun to
explore.  I am learning how to use these things, and I think we all
are, so small projects like this make for nice little experiments, and
you get a working tool out of it when you're done!

Enjoy.

Stephen Sinclair <radarsat1@gmail.com>

2025

