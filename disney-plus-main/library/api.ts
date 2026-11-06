import type { Logo, Media, Video } from "../types";
import { cache } from "react";
import shuffleMedias from "../helpers/shuffle-medias";
import { getSharedVideos } from "./mock-catalog";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_API_URL = process.env.TMDB_API_URL || "https://api.themoviedb.org";

type Group =
  | {
      name: "popular" | "top-rated" | "now-playing" | "upcoming";
      type: "movies";
      page: number;
    }
  | {
      name: "popular" | "top-rated" | "on-the-air" | "airing-today";
      type: "series";
      page: number;
    };

type Time = "day" | "week";
type Type = "movies" | "series" | "all" | string;

const EMPTY_MEDIA: Media = {
  id: "placeholder",
  title: "No Videos Published Yet",
  overview: "The administrator has not published any video streams yet. Ingest titles with multi-language audio in the Admin Command Center.",
  isForAdult: false,
  type: "movies",
  image: {
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
  },
  releasedAt: "",
  language: { original: "en" },
};

const filterCatalog = (type?: string, query?: string) => {
  let list = getSharedVideos();
  if (type && type !== "all") {
    const byType = list.filter(m => m.type === type || (type === "movies" ? m.type === "movies" : m.type === "series"));
    if (byType.length > 0) list = byType;
  }
  if (query) {
    const q = query.toLowerCase();
    const matched = list.filter(m => m.title?.toLowerCase().includes(q) || m.overview?.toLowerCase().includes(q));
    if (matched.length > 0) return matched;
  }
  return list;
};

const api = {
  get: {
    medias: {
      search: cache(
        async ({ query, page }: { query: string; page: number }) => {
          if (!TMDB_API_KEY) {
            return filterCatalog(undefined, query);
          }
          try {
            const responseMovies = await fetch(
              `${TMDB_API_URL}/3/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${query}&page=${page}&include_adult=false`,
              { next: { revalidate: 3600 } }
            );
            const data = await responseMovies.json();
            if (!data.results || !Array.isArray(data.results)) {
              return filterCatalog(undefined, query);
            }
            const medias = data.results
              .filter((media: any) => media.poster_path && media.backdrop_path && media.overview)
              .map((media: any) => ({
                id: String(media.id),
                title: media.title ? media.title : media.name,
                isForAdult: media.adult,
                type: media.media_type === "movie" ? "movies" : "series",
                image: {
                  poster: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
                  backdrop: `https://image.tmdb.org/t/p/original${media.backdrop_path}`,
                },
                overview: media.overview,
                releasedAt: media.release_date || media.first_air_date,
                language: { original: media.original_language },
              }));
            return (medias.length > 0 ? medias : filterCatalog(undefined, query)) as Media[];
          } catch {
            return filterCatalog(undefined, query);
          }
        }
      ),
      similar: cache(
        async ({ type, id, page }: { type: Type; id: string; page: number }) => {
          if (!TMDB_API_KEY) {
            return shuffleMedias(filterCatalog(type));
          }
          try {
            const response = await fetch(
              `${TMDB_API_URL}/3/${type === "movies" ? "movie" : "tv"}/${id}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
              { next: { revalidate: 3600 } }
            );
            const data = await response.json();
            if (!data.results || !Array.isArray(data.results)) {
              return shuffleMedias(filterCatalog(type));
            }
            const medias = data.results
              .filter((media: any) => media.poster_path && media.backdrop_path && media.overview)
              .map((media: any) => ({
                id: String(media.id),
                title: media.title ? media.title : media.name,
                isForAdult: media.adult,
                type: type === "movies" ? "movies" : "series",
                image: {
                  poster: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
                  backdrop: `https://image.tmdb.org/t/p/original${media.backdrop_path}`,
                },
                overview: media.overview,
                releasedAt: media.release_date || media.first_air_date,
                language: { original: media.original_language },
              }));
            return shuffleMedias(medias.length > 0 ? medias : filterCatalog(type)) as Media[];
          } catch {
            return shuffleMedias(filterCatalog(type));
          }
        }
      ),
      trending: cache(async ({ type, time }: { type: Type; time: Time }) => {
        if (!TMDB_API_KEY) {
          return shuffleMedias(filterCatalog(type));
        }
        try {
          const response = await fetch(
            `${TMDB_API_URL}/3/trending/${type === "movies" ? "movie" : "tv"}/${time}?api_key=${TMDB_API_KEY}`,
            { next: { revalidate: 3600 } }
          );
          const data = await response.json();
          if (!data.results || !Array.isArray(data.results)) {
            return shuffleMedias(filterCatalog(type));
          }
          const medias = data.results
            .filter((media: any) => media.poster_path && media.backdrop_path && media.overview)
            .map((media: any) => ({
              id: String(media.id),
              title: media.title ? media.title : media.name,
              isForAdult: media.adult,
              type: type === "movies" ? "movies" : "series",
              image: {
                poster: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
                backdrop: `https://image.tmdb.org/t/p/original${media.backdrop_path}`,
              },
              overview: media.overview,
              releasedAt: media.release_date || media.first_air_date,
              language: { original: media.original_language },
            }));
          return shuffleMedias(medias.length > 0 ? medias : filterCatalog(type)) as Media[];
        } catch {
          return shuffleMedias(filterCatalog(type));
        }
      }),
      group: cache(async ({ name, type, page }: Group) => {
        if (!TMDB_API_KEY) {
          return shuffleMedias(filterCatalog(type));
        }
        try {
          const group = name.split("-").join("_");
          const response = await fetch(
            `${TMDB_API_URL}/3/${type === "movies" ? "movie" : "tv"}/${group}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
            { next: { revalidate: 3600 } }
          );
          const data = await response.json();
          if (!data.results || !Array.isArray(data.results)) {
            return shuffleMedias(filterCatalog(type));
          }
          const medias = data.results
            .filter((media: any) => media.poster_path && media.backdrop_path && media.overview)
            .map((media: any) => ({
              id: String(media.id),
              title: media.title ? media.title : media.name,
              isForAdult: media.adult,
              type: type === "movies" ? "movies" : "series",
              image: {
                poster: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
                backdrop: `https://image.tmdb.org/t/p/original${media.backdrop_path}`,
              },
              overview: media.overview,
              releasedAt: media.release_date || media.first_air_date,
              language: { original: media.original_language },
            }));
          return shuffleMedias(medias.length > 0 ? medias : filterCatalog(type)) as Media[];
        } catch {
          return shuffleMedias(filterCatalog(type));
        }
      }),
    },
    media: {
      details: cache(async ({ type, id }: { type: Type; id: string }) => {
        const catalog = getSharedVideos();
        const foundInCatalog = catalog.find(m => m.id === id);
        if (foundInCatalog) return foundInCatalog;

        if (!TMDB_API_KEY) {
          return catalog[0] || EMPTY_MEDIA;
        }
        try {
          const response = await fetch(
            `${TMDB_API_URL}/3/${type === "movies" ? "movie" : "tv"}/${id}?api_key=${TMDB_API_KEY}&language=en-US`,
            { next: { revalidate: 3600 } }
          );
          const media = await response.json();
          if (!media.title && !media.name) return catalog[0] || EMPTY_MEDIA;
          return {
            id: String(media.id),
            title: media.title ? media.title : media.name,
            isForAdult: media.adult,
            type: type as any,
            image: {
              poster: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
              backdrop: `https://image.tmdb.org/t/p/original${media.backdrop_path}`,
            },
            overview: media.overview,
            releasedAt: media.release_date || media.first_air_date,
            language: { original: media.original_language },
          } as Media;
        } catch {
          return catalog[0] || EMPTY_MEDIA;
        }
      }),
      measure: cache(async ({ type, id }: { type: Type; id: string }) => {
        return 0;
      }),
      video: cache(async ({ type, id }: { type: Type; id: string }): Promise<Video | null> => {
        return null;
      }),
      logo: cache(async ({ type, id }: { type: Type; id: string }): Promise<Logo | null> => {
        return null;
      }),
      spotlight: cache(async ({ type }: { type: Type }) => {
        const catalog = getSharedVideos();
        return catalog[0] || EMPTY_MEDIA;
      }),
    },
  },
};

export default api;
