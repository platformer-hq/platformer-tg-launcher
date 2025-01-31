# Platformer Telegram Launcher

A launcher for running [Platformer](https://t.me/platformer_hq) applications directly inside
Telegram.

## Options

The list of options you may use to configure the launcher. All options should be passed as a list of
query parameters to the launcher's base URL.

| Name           | Type     | Description                                                                                                                                                                                                                                                             |
|----------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `app_id`       | `number` | Your Platformer application identifier you can get in the admin panel.                                                                                                                                                                                                  |
| `api_base_url` | `string` | _Optional_. Platformer API base URL. It will be used to communicate with Platformer functionality.                                                                                                                                                                      |
| `fallback_url` | `string` | _Optional_. URL to use if something goes wrong with Platformer. Ensures the user can still access the application even if Platformer is unavailable.                                                                                                                    |
| `init_timeout` | `number` | _Optional_. Time in milliseconds to load data from Platformer. If the timeout is reached, the launcher uses the `fallback_url` to display the application. If the fallback URL is not specified, the load error page will be displayed. Defaults to `5000` (5 seconds). |
| `load_timeout` | `number` | _Optional_. Time in milliseconds for **your** application to load. If the specified time runs out, the launcher displays a load error. Defaults to `10000` (10 seconds).                                                                                                |

## Usage

To start using the launcher, take its base
URL (`https://platformer-hq.github.io/platformer-tg-launcher/`) and append the
following [options](#options) as a list of query parameters.

For example, if you have a Platformer application with the identifier `10` and a `fallback_url` set
to `https://walletbot.me/app`, the complete URL would be:

```
https://platformer-hq.github.io/platformer-tg-launcher/?app_id=10&fallback_url=https%3A%2F%2Fwalletbot.me%2Fapp
```

Once you have the final URL, use it when creating a Mini App
in [@BotFather](https://t.me/botfather). When opening your application, the Telegram client will
load the URL specified above.

## How It Works

The launcher workflow is straightforward.

### 1. Read and Validate [Options](#options)

The launcher reads and validates the options, ensuring they are correct. If something is invalid,
the launcher will display an error page.

### 2. Authenticate the User

The launcher extracts the user's Platformer authorization token to communicate with its API. If the
token is missing, it performs the authentication process and saves the token locally.

### 3. Retrieve Application Data

The launcher retrieves the application information using the `app_id` option.

Once the data is retrieved, it displays one of the following screens:

1. A message indicating that the application is unavailable on the current platform.
2. The application itself, if a URL was returned.

### 4. Render the Application

The launcher inserts an `iframe` with the URL returned from Platformer. This URL represents the one
you set in the admin panel, along with the launch parameters originally passed to the Mini App.

After inserting the iframe, the launcher waits for the number of milliseconds specified in
the `load_timeout` option before calling
the [web_app_ready](https://docs.telegram-mini-apps.com/platform/methods#web-app-ready) method.

To prevent uncontrollable behavior, Platformer does not automatically display the application when
all assets are loaded (unlike Telegram). Therefore, calling the `web_app_ready` method is required.

## Environment Support

[//]: # (TODO)
TBA