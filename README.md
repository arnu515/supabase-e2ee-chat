![image](https://user-images.githubusercontent.com/52203828/145706223-72c70924-834e-4418-aba3-1b5e84c7f4e1.png)

# End-to-End Encrypted Chat with Supabase

An end-to-end encrypted chat using public keys and [Supabase](https://supabase.com). Built for Supabase's Holiday-hackdays hackathon.

Available at: <https://chat.arnu515.gq>

[Runner Up](https://supabase.com/blog/2021/12/17/holiday-hackdays-winners-2021#best-realtime-project#runner-up-1) in the "Best Realtime" category!

## How to use

- Sign in using email or github
- Click the + button in the sidebar and enter the ID of your friend. They can see it by visiting the same page.
- Both users **have to be online** to receive chat messages. This is because the chat messages are **NOT** stored on the server. They are stored in the browser's local IndexedDB storage.

## Team

This project was developed by me (@arnu515)! Here are my links:
- Website: https://arnu515.gq
- Dev.To: https://dev.to/arnu515

## How I used Supabase

Supabase was used for all realtime events. All friend requests and chat message events were sent to supabase. Supabase also stored users' profiles. Other features of Supabase that were used were functions and triggers. It was because of supabase that I got into SQL and PLPGSQL. I am thankful to the Supabase team for building an amazing open-source BaaS that helped me dive in to SQL and PostgreSQL.

Other libraries that were used were:
- ReactJS with Craco
- React Router DOM
- TailwindCSS, PostCSS and classnames for styling
- TweetNaCl for encryption
- @supabase/supabase-js for interacting with supabase
- Nanostores so I didn't have to learn Redux
- Formik for forms and yup for validation
- Dexie for providing a promise-based IndexedDB interface

