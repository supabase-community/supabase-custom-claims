# Supabase Custom Claims
Want to know more about Custom Claims?  See the [FAQ](#faq) below.

This is just one way to implement `custom claims` for a Supabase project.  The goal here is simply to add JSON data to the access token that an authenticated user receives when logging into your application.  That token (and thus the `custom claims` contained in that token) can be read and used by both your application and by your PostgreSQL database server.  These `custom claims` are stored in the `raw_app_meta_data` field of the `users` table in the `auth` schema.  (`auth.users.raw_app_meta_data`)

## Installing the Functions
The file [install.sql](./install.sql) contains all the PostgreSQL functions you need to implement and manage custom claims in your Supabase project.  

1. Paste the SQL code from [install.sql](./install.sql) into the [SQL Query Editor](https://app.supabase.io/project/_/sql) of your Supabase project.
2. Click `RUN` to execute the code.
## Uninstalling the Functions

1. Paste the SQL code from [uninstall.sql](./uninstall.sql) into the [SQL Query Editor](https://app.supabase.io/project/_/sql) of your Supabase project.
2. Click `RUN` to execute the code.

### Security Considerations
If you want to tighten security so that custom claims can only be set or deleted from inside the query editor or inside your PostgreSQL functions or triggers, edit the function `is_claims_admin()` to disallow usage by app users (no usage through the API / Postgrest).  Instructions are included in the function.

By default, usage is allowed through your API, but the ability to set or delete claims is restricted to only users who have the `claims_admin` custom claim set to `true`.  This allows you to create an **"admin"** section of your app that allows designated users to modify custom claims for other users of your app.

### Bootstrapping
If the only way to set or delete claims requires the `claims_admin` claim to be set to `true` and no users have that claim, how can I edit custom claims from within my app?

The answer is to **"bootstrap"** a user by running the following command inside your [Supabase Query Editor](https://app.supabase.io/project/_/sql) window:

`select set_claim('03acaa13-7989-45c1-8dfb-6eeb7cf0b92e', 'claims_admin', 'true');`

where `03acaa13-7989-45c1-8dfb-6eeb7cf0b92e` is the `id` of your admin user found in `auth.users`.

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

### Inside an RLS (Row Level Security) Policy
To use custom claims in an RLS Policy, you'll normally use the `get_my_claim` to check a specific claim for the currently logged in user.
#### examples
##### only allow users with userrole "MANAGER"
`get_my_claim('userrole') = '"MANAGER"'`
(which the UI will change into the more formal):
`((get_my_claim('userrole'::text)) = '"MANAGER"'::jsonb)`

##### only allow users with userlevel over 100
`coalesce(get_my_claim('userlevel')::numeric,0) > 100`

##### only allow users with claim_admin = true
`coalesce(get_my_claim('claims_admin')::bool,false)`

### Inside your app (using `.rpc()`)

#### Getting Claims Data from Local Session Data
You can extract claims information from the `session` object you get when the user is logged in.  For example:

```js
		supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
    			console.log(session?.user?.app_metadata) // show custom claims
            }
		})
```

If any claims have changed since your last log in, you may need to log out and back in to see these changes.

#### Getting Claims Data from the Server
You can also query the server to see what claims are set for the current user.

Here are some sample functions that can be used by any authenticated (logged-in) user of your application:

```js
  public get_my_claims = async () => {
    const { data, error } = await supabase
    .rpc('get_my_claims', {});
    return { data, error };
  }
  public get_my_claim = async (claim: string) => {
    const { data, error } = await supabase
    .rpc('get_my_claim', {claim});
    return { data, error };
  }
  public is_claims_admin = async () => {
    const { data, error } = await supabase
    .rpc('is_claims_admin', {});
    return { data, error };
  }
```

The following functions can only be used by a **"claims admin"**, that is, a user who has the `claims_admin` custom claim set to `true`:

(Note: these functions allow you to view, set, and delete claims for any user of your application, so these would be appropriate for an **administrative** branch of your application to be used only by high-level users with the proper security rights (i.e. `claims_admin` level users.))

```js
  public get_claims = async (uid: string) => {
    const { data, error } = await supabase
    .rpc('get_claims', {uid});
    return { data, error };
  }
  public get_claim = async (uid: string, claim: string) => {
    const { data, error } = await supabase
    .rpc('get_claim', {uid, claim});
    return { data, error };
  }
  public set_claim = async (uid: string, claim: string, value: object) => {
    const { data, error } = await supabase
    .rpc('set_claim', {uid, claim, value});
    return { data, error };
  }
  public delete_claim = async (uid: string, claim: string) => {
    const { data, error } = await supabase
    .rpc('delete_claim', {uid, claim});
    return { data, error };
  }
```

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
Performance, mostly.  Custom claims are stored in the security token a user receives when logging in, and these claims are made available to the PostgreSQL database as a configuration parameter, i.e. `current_setting('request.jwt.claims', true)`.  So the database has access to these values immediately without needing to do any disk i/o.

This may sound trivial, but this could have a significant effect on scalability if you use claims in an RLS (Row Level Security) Policy, as it could potentially eliminate thousands (or even millions) of database calls.

### What are the drawbacks to using custom claims?
One drawback is that claims don't get updated automatically, so if you assign a user a new custom claim, they may need to log out and log back in to have the new claim available to them.  The same goes for deleting or changing a claim.  So this is not a good tool for storing data that changes frequently.

You can force a refresh of the current session token by calling `supabase.auth.update({})` on the client, but if a claim is changed by a server process or by a claims adminstrator manually, there's no easy way to notify the user that their claims have changed.  You can provide a "refresh" button or a refresh function inside your app to update the claims at any time, though.

### How can I write a query to find all the users who have a specific custom claim set?
#### examples
##### find all users who have `claims_admin` set to `true`
`select * from auth.users where (auth.users.raw_app_meta_data->'claims_admin')::bool = true;`
##### find all users who have a `userlevel` over 100
`select * from auth.users where (auth.users.raw_app_meta_data->'userleval')::numeric > 100;`
##### find all users whose `userrole` is set to `"MANAGER"`
(note for strings you need to add double-quotes becuase data is data is stored as JSONB)
`select * from auth.users where (auth.users.raw_app_meta_data->'userrole')::text = '"MANAGER"';`

### What's the difference between `auth.users.raw_app_meta_data` and `auth.users.raw_user_meta_data`?
The `auth.users` table used by Supabase Auth (GoTrue) has both `raw_app_meta_data` and a `raw_user_meta_data` fields.

`raw_user_meta_data` is designed for profile data and can be created and modified by a user.  For example, this data can be set when a user signs up: [sign-up-with-additional-user-meta-data](https://supabase.com/docs/reference/javascript/auth-signup#sign-up-with-additional-user-meta-data) or this data can be modified by a user with [auth-update](https://supabase.com/docs/reference/javascript/auth-update)

`raw_app_meta_data` is designed for use by the application layer and is used by GoTrue to handle authentication (For exampple, the `provider` and `providers` claims are used by GoTrue to track authentication providers.)  `raw_app_meta_data` is not accessible to the user by default.

### NOTES:
##### updating claims from a server process or edge function
https://supabase.com/docs/reference/javascript/auth-api-updateuserbyid#updates-a-users-app_metadata

