export type ProfileLike = {
  name?: string | null
  phone?: string | null
}

export function getMissingProfileFields(user: ProfileLike | null | undefined): string[] {
  if (!user) return ["name", "phone"]

  const missing: string[] = []
  if (!user.name || !user.name.trim()) missing.push("name")
  if (!user.phone || !user.phone.trim()) missing.push("phone")
  return missing
}

export function isProfileComplete(user: ProfileLike | null | undefined): boolean {
  return getMissingProfileFields(user).length === 0
}
