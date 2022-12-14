import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import mail from '@sendgrid/mail';

import client from '@libs/server/client';
import withHandler, { ResponseType } from '@libs/server/withHandler';

mail.setApiKey(process.env.SENDGRID_KEY!);
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { phone, email } = req.body;
  const user = !!phone ? { phone } : !!email ? { email } : null;

  if (!user) return res.status(400).json({ ok: false });

  const payload = Math.floor(100000 + Math.random() * 900000) + '';

  const token = await client.token.create({
    data: {
      payload,
      user: {
        connectOrCreate: {
          where: {
            ...user
          },
          create: {
            name: 'Anonymous',
            ...user
          }
        }
      }
    }
  });

  // switch (true) {
  //   case !!phone:
  //     await twilioClient.messages.create({
  //       messagingServiceSid: process.env.TWILIO_MSID,
  //       to: process.env.MY_PHONE!,
  //       from: process.env.COMPANY_PHONE!,
  //       body: `Your login token is ${payload}`
  //     });
  //     break;

  //   case !!email:
  //     await mail.send({
  //       from: process.env.SENDGRID_FROM!,
  //       to: process.env.SENDGRID_TO!,
  //       subject: 'Your Carrot Market Verification Email',
  //       text: `Your token is ${payload}`,
  //       html: `<strong>Your token is ${payload}</strong>`
  //     });
  //     break;
  // }

  return res.json({
    ok: true
  });
}

export default withHandler({ methods: ['POST'], handler, isPrivate: false });
