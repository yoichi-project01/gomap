"use client"

import { useEffect } from "react"
import { markAllNotificationsReadAction } from "@/app/actions/notifications"

export function MarkAllReadOnMount({ hasUnread }: { hasUnread: boolean }) {
  useEffect(() => {
    if (hasUnread) markAllNotificationsReadAction()
  }, [hasUnread])
  return null
}
