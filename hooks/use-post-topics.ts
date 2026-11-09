"use client";
import { useApiResource } from "./use-api-resource";

export function usePostTopics() {
  return useApiResource<string[]>("/posts/topic-options", []).data;
}
