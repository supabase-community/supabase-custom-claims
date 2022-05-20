# Supabase Custom Claims
## Installing the Functions
The file [install.sql](./install.sql) contains all the PostgreSQL functions you need to implement and manage custom claims in your Supabase project.  

1. Paste the SQL code from [install.sql](./install.sql) into the SQL Query Editor of your Supabase project.
2. Click `RUN` to execute the code.
## Uninstalling the Functions

1. Paste the SQL code from [uninstall.sql](./uninstall.sql) into the SQL Query Editor of your Supabase project.
2. Click `RUN` to execute the code.

## Usage
### Inside the Query Editor
You can get, set, and delete claims for any user based on the user's `id` (uuid) with the following functions:

#### `get_claims(uid uuid)` returns jsonb
##### example
`select get_claims('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e');`
##### result
```
| get_claims                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {"provider": "email", "userrole": "MANAGER", "providers": ["email"], "userlevel": 100, "useractive": true, "userjoined": "2022-05-20T14:07:27.742Z", "claims_admin": true} |
```

#### `get_claim(uid uuid, claim text)` returns jsonb
##### example
`select get_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'userlevel');`
##### result
```
| get_claim |
| --------- |
| 100       |
```

#### `set_claim(uid uuid, claim text, value jsonb) `returns text
##### example
Set a **number** value.  (Note `value` is passed as a `jsonb` value, so to set a number we need to pass it as a simple string.)
`select set_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'userlevel', '200');`

Set a **text** value.  (Note `value` is passed as a `jsonb` value, so to set a number we need to pass it with double-quotes.)
`select set_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'userrole', '"MANAGER"');`

**Common Mistake**: If you forget the double-quotes for a string, and try to do this: `select set_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'userrole', 'MANAGER');`, the result will be an error: `invalid input syntax for type json`

Set a **boolean** value.
`select set_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'useractive', 'true');`

Set an **array** value.
`select set_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'items', '["bread", "cheese", "butter"]');`

Set a complex, nested **json** / **object** value.
`select set_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'gamestate', '{"level": 5, "items": ["knife", "gun"], "position":{"x": 15, "y": 22}}');`

##### result (for any of the above)
```
| set_claim |
| --------- |
| OK        |
```

#### `delete_claim(uid uuid, claim text)` returns text
##### example
`select delete_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'gamestate');`
##### result
```
| delete_claim |
| ------------ |
| OK           |
```


### Inside PostgreSQL Functions and Triggers
When using custom claims from inside a PostgreSQL function or trigger, you can use any of the functions shown in the section above: `Inside the Query Editor`.

In addition, you can use the following functions that are specific to the currently logged-in user:

#### `is_claims_admin()` returns bool
##### example
`select is_claims_admin();`
##### result
```
| is_claims_admin |
| --------------- |
| true            |
```

#### `get_my_claims()` returns jsonb
##### example
`select get_my_claims();`
##### result
```
| get_my_claims                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {"provider": "email", "userrole": "MANAGER", "providers": ["email"], "userlevel": 100, "useractive": true, "userjoined": "2022-05-20T14:07:27.742Z", "claims_admin": true} |
```

#### `get_my_claim(claim TEXT)` returns jsonb
##### example
`select get_my_claim('userlevel');`
##### result
```
| get_my_claim |
| ------------ |
| 100          |
```

### Inside your app (using `.rpc()`)
tbd
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

