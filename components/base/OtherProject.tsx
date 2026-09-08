import { IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'
import React from 'react'

const OtherProject = () => {
  return (
    <div className="font-medium  text-muted-foreground text-sm">
      <span>
        I made tons of projects other than these, you can always check them on{' '}
        <Link
          href="/project"
          className="inline-flex items-center gap-1  bg-neutral-600 text-white rounded-sm px-2"
        >
          other projects
          <IconArrowUpRight className="size-4" />
        </Link>
      </span>
    </div>
  )
}

export default OtherProject
