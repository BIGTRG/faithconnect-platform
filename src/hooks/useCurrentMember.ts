import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentMember() {
  const member = useQuery(api.members.getCurrentMember) ?? null;
  return member;
}
