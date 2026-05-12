# claims-demo react app

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## setup

- Make sure you have a Supabase project set up and the site URL is set to `https://localhost:3000`
- Copy the file `.env.sample` to `.env` and insert your own values for `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` - found in the Supabase dashboard here: [Supabase API Settings](https://app.supabase.io/project/_/settings/api)
- Run the contents of [../install.sql](../install.sql) inside your [Supabase Dashboard SQL Editor](https://app.supabase.io/project/_/sql)
- [Bootstrap](https://github.com/supabase-community/supabase-custom-claims#bootstrapping) a user to make them a `claims_admin` user if you want to be able to set or delete claims
- Start the app: `npm start`

### run: `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

