# VTuber LiveStreaming with LiveKit

![Sample Gif](https://github.com/livekit-examples/vtuber/assets/8453967/0a38eb99-61bd-429e-924d-e6890485ba8f)

This is a demo of a vtuber live streaming app using LiveKit. The app uses your webcam to track your face and posture, applies face and posture data to a 3D avatar, and streams the WebGL canvas to Twitch and/or YouTube.

## Online demo

You can try an online demo right now at <https://vtuber-demo.livekit.io/>.

## Running locally

Clone the repo and install dependencies:

```bash
git clone git@github.com:livekit-examples/vtuber.git
cd vtuber
yarn
```

Create a new LiveKit project at <http://cloud.livekit.io>. Then create a new key in your [project settings](https://cloud.livekit.io/projects/p_/settings/keys).

Create a new file at `.env.development` and add your new API key and secret as well as your project's WebSocket URL (found at the top of <http://cloud.livekit.io>):

```
LIVEKIT_API_KEY=<your api key>
LIVEKIT_API_SECRET=<your api secret>
LIVEKIT_WS_URL=wss://<your-project>.livekit.cloud
```

(Note: this file is in `.gitignore`. Never commit your API secret to git.)

Then run the development server:

```bash
yarn dev
```

You can test it by opening <http://localhost:3000> in a browser.

## Deploying for production

This demo is a Next.js app. You can deploy to your Vercel account with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flivekit-examples%2Fvtuber&env=LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_WS_URL&envDescription=Get%20these%20from%20your%20cloud%20livekit%20project.&envLink=https%3A%2F%2Fcloud.livekit.io&project-name=my-vtuber-app)

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more about deploying to a production environment.
