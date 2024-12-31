# Platformer Telegram Launcher

A launcher for running **Platformer** applications directly inside Telegram.

## Usage

To start using the launcher, take its base
URL (`https://platformer-hq.github.io/platformer-tg-launcher/`) and append the following query
parameters:

| Name           | Type     | Description                                                                                                                                                                                                                                                             |
|----------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `app_id`       | `number` | Your Platformer application identifier.                                                                                                                                                                                                                                 |
| `api_base_url` | `string` | _Optional_. Platformer API base URL. Useful for development purposes.                                                                                                                                                                                                   |
| `fallback_url` | `string` | _Optional_. URL to use if something goes wrong with Platformer. Ensures the user can still access the application even if Platformer is unavailable.                                                                                                                    |
| `init_timeout` | `number` | _Optional_. Time in milliseconds to load data from Platformer. If the timeout is reached, the launcher uses the `fallback_url` to display the application. If the fallback URL is not specified, the load error page will be displayed. Defaults to `5000` (5 seconds). |
| `load_timeout` | `number` | _Optional_. Time in milliseconds for **your** application to load. If the specified time runs out, the launcher displays a load error. Defaults to `10000` (10 seconds).                                                                                                |

For an application with the identifier `10`, the base URL without additional parameters would be:

```
https://platformer-hq.github.io/platformer-tg-launcher/?app_id=10
```

Once you have the final URL, use it when creating a Mini App
in [@BotFather](https://t.me/botfather).

## Environment Support

[//]: # (TODO)
TBA