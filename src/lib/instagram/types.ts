export type InstagramMedia = {
  id: string;
  kind: 'image' | 'video' | 'album';
  caption: string;
  /** Bildbeschreibung von Instagram (automatisch oder vom Konto gesetzt) */
  alt: string;
  permalink: string;
  timestamp: string;
  /** Dateiname im Medien-Cache, Bild in voller Breite (1080 px) */
  image: string;
  /** kleineres Vorschaubild (640 px) */
  thumb: string;
};

export type InstagramProfile = {
  username: string;
  name: string;
  picture?: string;
  followers?: number;
  mediaCount?: number;
};

export type InstagramFeed = {
  updatedAt: string;
  profile: InstagramProfile;
  posts: InstagramMedia[];
};
