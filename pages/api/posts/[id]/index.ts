import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import { withApiSession } from '@libs/server/withSession';
import client from '@libs/server/client';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
    session: { user }
  } = req;

  if (id) {
    const post = await client.post.findUnique({
      where: {
        id: +id.toString()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        answers: {
          select: {
            answer: true,
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            createdAt: true
          },
          take: 10
        },
        _count: {
          select: {
            answers: true,
            wonderings: true
          }
        }
      }
    });

    const isWondering = Boolean(
      await client.wondering.findFirst({
        where: {
          postId: +id.toString(),
          userId: user?.id
        },
        select: {
          id: true
        }
      })
    );

    res.json({
      ok: true,
      post,
      isWondering
    });
  }
}

export default withApiSession(
  withHandler({
    methods: ['GET'],
    handler
  })
);
