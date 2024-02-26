import { IncomingWebhook } from "@slack/webhook";
import { env } from "@/env";
import { type RouterOutput } from "@/server/api/types";

type MessageInfoElement = {
  type: "mrkdwn";
  text: string;
};

export const sendSlackDeliveryWarning = async ({
  envelopeId,
  timeframe,
  notificationThreshold,
  chainFrom,
  chainTo,
  decodedMessage,
}: {
  envelopeId: string;
  notificationThreshold: string;
  timeframe: string;
  chainFrom: string;
  chainTo: string;
  decodedMessage?: RouterOutput["envelopes"]["get"]["decodedMessage"];
}) => {
  const webhook = new IncomingWebhook(env.SLACK_WEBHOOK_URL);

  const [firstEight, lastEight] = [
    envelopeId.slice(0, 8),
    envelopeId.slice(-8),
  ];

  const messageInfo: MessageInfoElement[] = decodedMessage
    ? Object.keys(decodedMessage.data).map((key) => {
        if (key === "timestamp") {
          return {
            type: "mrkdwn",
            text: `${key}: *${new Date(
              Number(decodedMessage.data[key]) * 1000,
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}*`,
          };
        }

        return {
          type: "mrkdwn",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          text: `${key}: *${decodedMessage.data[key]}*`,
        };
      })
    : [
        {
          type: "mrkdwn",
          text: "No message data",
        },
      ];

  await webhook.send({
    text: "Envelope wasn't delivered",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "⚠️",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Envelope delivery overdue by ${timeframe}* _(<${notificationThreshold} expected)_ \n\n${chainFrom} → ${chainTo}\n\n\`${firstEight}...${lastEight}\``,
        },
        accessory: {
          type: "image",
          image_url: `https://adi.onaave.com/api/envelope-icon/${envelopeId}?key=${env.ICON_GENERATOR_KEY}`,
          alt_text: "Envelope Icon",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Envelope Details",
              emoji: true,
            },
            style: "primary",
            url: `https://adi.onaave.com/envelope/${envelopeId}`,
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: decodedMessage
              ? `*${decodedMessage.type}*`
              : "*Unknown message type*",
          },
        ],
      },
      {
        type: "context",
        elements: [...messageInfo],
      },
    ],
  });
};
