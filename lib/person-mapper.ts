import { initials } from "@/lib/api";
import type { ApiPerson } from "@/lib/api-types";
import type { Person } from "@/types";

// Converts an API person into the shape the UI components render.
export function toPerson(person: ApiPerson): Person {
  return {
    ...person,
    initials: initials(person.name),
    imageUrl: person.profileImageUrl,
    coverUrl: person.coverImageUrl,
    color: "blue",
    detail: person.openToWork ? "Open to work" : "",
  };
}
