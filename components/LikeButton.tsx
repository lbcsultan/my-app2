'use client'

import { useState, useTransition } from 'react'
import { Button } from './ui/button'
import { likeProductAction } from '@/lib/actions'

export function LikeButton({
  id,
  initialLikes,
}: {
  id: string
  initialLikes: number
}) {
  const [likes, setLikes] = useState(initialLikes)
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      disabled={isPending}
      size="lg"
      onClick={() => {
        startTransition(async () => {
          const newLikes = await likeProductAction(id)
          setLikes(newLikes)
        })
      }}
    >
      {isPending ? '저장 중...' : `♥♥♥ 좋아요 ${likes}`}
    </Button>
  )
}
