import axios from "axios";
import * as fs from "fs";
import OpenAI from "openai";

interface ExtractedContactDetail {
  type: string;
  value: string;
}

interface ExtractedDataResult {
  language: string;
  contacts: ExtractedContactDetail[];
}

const OPENAI_KEY = process.env.OPENAI_KEY || "";
const RAPID_API_KEY = process.env.RAPID_API_KEY || "";

const BASE_ASSISTANT_MESSAGE = `
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

const openai = new OpenAI({ apiKey: OPENAI_KEY });

async function extractChannelDetails(
  youtubeChannelUrl: string,
  channelIndex: number,
  maxChannels: number
): Promise<ExtractedDataResult | null> {
  const youtubeChannel = youtubeChannelUrl.split("/").pop() || "";
  console.log(`Starting to parse channel details for: ${youtubeChannel}`);

  const url = `https://the-better-youtube-channel-details.p.rapidapi.com/GetChannelDetails?UrlOrUsername=${encodeURIComponent(
    youtubeChannelUrl
  )}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": "the-better-youtube-channel-details.p.rapidapi.com",
      },
    });

    const dataJson = response.data;
    const messages = [
      {
        role: "assistant",
        content: BASE_ASSISTANT_MESSAGE + JSON.stringify(dataJson),
      } as const,
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0].message.content;
    const counter = `(${channelIndex + 1}/${maxChannels})`;
    console.log(
      `Finished parsing channel details for: ${youtubeChannel} ${counter} \n\n`
    );

    return JSON.parse(content) as ExtractedDataResult;
  } catch (error) {
    console.error(`Error parsing details for ${youtubeChannel}:`, error);
    return null;
  }
}

async function main() {
  try {
    // Read input.txt file - each line is a YouTube channel URL
    const youtubeChannels = fs
      .readFileSync("input.txt", "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const channelDetails: Record<string, ExtractedDataResult | null> = {};

    for (let i = 0; i < youtubeChannels.length; i++) {
      const youtubeChannel = youtubeChannels[i];
      const details = await extractChannelDetails(
        youtubeChannel,
        i,
        youtubeChannels.length
      );
      channelDetails[youtubeChannel] = details;
    }

    // Write output to output.txt
    const output = youtubeChannels
      .map((channel) => {
        const details = channelDetails[channel];
        if (!details) return `${channel}\n  - Error fetching details`;

        const contacts = details.contacts
          .map((contact) => `  - ${contact.type}: ${contact.value}`)
          .join("\n");

        return `${channel} (${details.language})\n${contacts}`;
      })
      .join("\n\n");

    fs.writeFileSync("output.txt", output);

    console.log("Finished writing output to output.txt");
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
