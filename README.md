# Supabase Custom Claims
## Installing the Functions
The file [install.sql](./install.sql) contains all the PostgreSQL functions you need to implement and manage custom claims in your Supabase project.  

1. Paste the SQL code from [install.sql](./install.sql) into the SQL Query Editor of your Supabase project.
2. Click `RUN` to execute the code.
## Uninstalling the Functions

1. Paste the SQL code from [uninstall.sql](./uninstall.sql) into the SQL Query Editor of your Supabase project.
2. Click `RUN` to execute the code.

## Usage


## FAQ
### What are custom claims?
Custom Claims are special attributes attached to a user that you can use to control access to portions of your application.  

For example:
```
plan: "TRIAL"
user_level: 100
group_name: "Super Guild!"
joined_on: "2022-05-20T14:28:18.217Z"
group_manager: false
items: ["toothpick", "string", "ring"]
```
### What type of data can I store in a custom claim?
Any valid JSON data can be stored in a claim.  You can store a string, number, boolean, date (as a string), array, or even a complex, nested, complete JSON object.

### Where are these custom claims stored?
Custom claims are stored in the `auth.users` table, in the `raw_app_meta_data` column for a user.

### Are there any naming restrictions?
The Supabase Auth System (GoTrue) currently uses the following custom claims: `provider` and `providers`, so DO NOT use these.  Any other valid string should be ok as the name for your custom claim(s), though.

### Why use custom claims instead of just creating a table?
Performance, mostly.  Custom claims are stored the security token a user receives when logging in, and these claims are made available to the PostgreSQL database as a configuration parameter, i.e. `current_setting('request.jwt.claims', true)`.  So the database has access to these values immediately without needing to do any disk i/o.

This may sound trivial, but this could have a significant effect on scalability if you use claims in an RLS (Row Level Security) Policy, as it could potentially free up thousands (or even millions) of database calls.

### What are the drawbacks to using custom claims?
One drawback is that claims don't get updated automatically, so if you assign a user a new custom claim, they may need to log out and log back in to have the new claim available to them.  The same goes for deleting or changing a claim.  So this is not a good tool for storing data that changes frequently.

### NOTES:
##### updating claims from a server process or edge function
https://supabase.com/docs/reference/javascript/auth-api-updateuserbyid#updates-a-users-app_metadata

