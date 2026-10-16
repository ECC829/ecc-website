# Saving website sign-ups to Google Sheets

The Internal Tournament sign-up form saves each response as a row in a Google
Sheet owned by the club account. Setup takes about 5 minutes and only needs to
be done once.

## 1. Create the Sheet

1. Sign in to Google as **eccevents.columbus@gmail.com** (or whichever account
   should own the responses).
2. Go to <https://sheets.new> and name the sheet **ECC Website Responses**.

## 2. Add the script

1. In the Sheet, open **Extensions → Apps Script**.
2. Delete the sample `function myFunction() {}` code.
3. Copy everything in `scripts/google-sheets-apps-script.gs` from this project
   and paste it in.
4. Click the **Save** icon and name the project **ECC website forms**.

## 3. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set:
   - **Description:** ECC website forms
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, then **Authorize access**. Choose the club account.
   Google will warn that the app isn't verified — click **Advanced → Go to ECC
   website forms (unsafe)** → **Allow**. (It's your own script, so this is
   expected.)
5. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy.../exec`.

To check it's live, open that URL in a browser. You should see
`{"ok":true,"message":"ECC form endpoint is running."}`.

## 4. Connect the website

Open `src/data/forms.js` and paste the URL between the quotes:

```js
export const googleSheetEndpoint = "https://script.google.com/macros/s/AKfy.../exec";
```

Then run `npm run build` and deploy.

## 5. Test

Submit the Internal Tournament form once on the live site. A new tab called
**Internal Tournament 2026** appears in the Sheet with the response. Delete the
test row afterwards.

## Using the responses

- **Headcount / number of teams:** count the rows (minus the header) and divide
  by 7.
- **Captain lottery:** filter the "Captain nomination" column to **Yes**.
- **Auction pool:** filter it to **No**.

## If you change the script later

Use **Deploy → Manage deployments → Edit (pencil) → Version: New version →
Deploy**. This keeps the same URL, so the website doesn't need changing.
Creating a *new* deployment gives a new URL, which you'd then have to paste
into `src/data/forms.js` again.

## Live sign-up count

The Internal Tournament page and the homepage banner show how many players have
signed up and how many nominated themselves as captain. The website asks the
script for counts only (`?sheet=Internal Tournament 2026`) — names, emails and
phone numbers never leave the Sheet.

To check it, open the web app URL with `?sheet=Internal%20Tournament%202026`
added to the end. You should see something like
`{"ok":true,"count":12,"captains":4}`.

If you delete test rows, the count updates the next time the page loads.

## Duplicate sign-ups

The script ignores a sign-up if the same phone number (last 10 digits) or the
same email is already in the tab, so each player is counted once. The website
also remembers a sign-up on that device and shows "You're already signed up"
instead of the form.
