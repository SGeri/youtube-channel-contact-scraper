import * as fs from "fs";
import { extractYoutubeChannelDetails } from "./extract";
import { ExtractedDataResult } from "./types";

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
      const details = await extractYoutubeChannelDetails(
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
