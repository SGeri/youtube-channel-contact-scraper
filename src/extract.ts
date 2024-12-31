import axios from "axios";
import OpenAI from "openai";
import { BASE_ASSISTANT_MESSAGE } from "./constants";
import { ExtractedDataResult } from "./types";

const OPENAI_KEY = process.env.OPENAI_KEY || "";
const RAPID_API_KEY = process.env.RAPID_API_KEY || "";

const openai = new OpenAI({ apiKey: OPENAI_KEY });

export async function extractYoutubeChannelDetails(
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
