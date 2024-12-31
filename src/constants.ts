export const BASE_ASSISTANT_MESSAGE = `
Your task is to extract the contact details for a specific youtube channel based on a JSON data. The extracted data should be in a format that contains all contact options available for the channel. Here is an example of the JSON output that you should generate:

There should be a language field in the JSON data that specifies the language of youtube channel. Use the JSON data to get the most suitable language for the channel. This language field will later be used to contact the channel owner in the same language.

Supported contact types are:
- email (business or personal email address)
- discord_server (invite link or custom website)
- discord_user (username#tag or @username or custom website)
- telegram (username or link or custom website)
- vkontakte (username or link or custom website
- twitter (username or link or custom website)

Only include the contact details that are available in the JSON data. If a contact type is not available, do not include it in the output. Here is the JSON data that you should use for extracting the contact details:

Example JSON Output:

{
  "language": "english",
  "contacts": [
    {
        "type": "email",
        "value": "john@doe.com"
    },
    {
        "type": "discord_server",
        "value": "https://discord.gg/johndoe"
    },
    {
        "type": "discord_user",
        "value": "JohnDoe#1234"
    },
    {
        "type": "telegram",
        "value": "https://t.me/johndoe"
    },
    {
        "type": "vkontakte",
        "value": "https://vk.com/johndoe"
    }
  ]
}

The Youtube Channel's JSON data to be used for extracting the contact details is as follows:
`;
