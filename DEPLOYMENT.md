# VentureX deployment

This repository is configured for one Render web service that serves the React site and Express API from the same address. Profile photos use a persistent disk so they survive restarts and redeploys.

## Before creating the service

1. Create or choose a MongoDB Atlas database intended for the hosted app. Use its connection string for Render; do not paste it into GitHub or this file.
2. Have these values ready for Render's private environment settings: `MONGO_URI`, a strong random `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID`, `EMAIL_USER`, `EMAIL_PASS`, `ZEGO_APP_ID`, and `ZEGO_SERVER_SECRET`. `FRONTEND_URL` is optional; set it if you use a custom frontend domain.
3. Use the same Google OAuth client ID for `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`. After Render creates the app URL, add that URL as an authorized JavaScript origin in Google Cloud Console. Password reset emails use Render's `RENDER_EXTERNAL_URL` by default; set `FRONTEND_URL` to your custom domain if you add one.

## Create the Render service

1. In Render, choose **New → Blueprint** and connect the VentureX GitHub repository.
2. Render reads `render.yaml`. Keep the Starter plan and the 1 GB `/var/data` disk for persistent profile photos.
3. Enter the environment values when Render asks, then create the service. Keep all values in Render's environment settings, not in Git.
4. When the deploy finishes, open the service URL and check that the page loads. The `/health` endpoint should return a status of `ok`.

The Starter service is a paid always-on plan. Render currently lists it at about $7/month; the 1 GB persistent disk is about $0.25/month, before taxes or usage beyond included amounts. Render's free web services sleep when idle, cannot use persistent disks, and block SMTP ports used by the current Gmail mailer, so the free plan is unsuitable for the app's complete sign-up and photo-upload flow.
