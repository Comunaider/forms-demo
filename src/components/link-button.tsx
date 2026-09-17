import Link from "next/link"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

type Props = ComponentProps<typeof Button> & {
  href: string
}

export function LinkButton({ href, children, ...props }: Props) {
  return (
    <Button {...props} nativeButton={false} render={<Link href={href} />}>
      {children}
    </Button>
  )
}
