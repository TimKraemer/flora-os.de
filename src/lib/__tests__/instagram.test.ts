import { describe, expect, test } from 'bun:test';
import { rawMediaSchema } from '../instagram/api';
import { mediaKind, stillUrl } from '../instagram/sync';

const base = {
  id: '1',
  timestamp: '2026-09-30T08:00:00+0000',
  permalink: 'https://www.instagram.com/p/abc/',
};

describe('Instagram-Medien', () => {
  test('nimmt bei Videos das Vorschaubild', () => {
    const video = rawMediaSchema.parse({
      ...base,
      media_type: 'VIDEO',
      media_url: 'https://cdn.example/video.mp4',
      thumbnail_url: 'https://cdn.example/still.jpg',
    });
    expect(stillUrl(video)).toBe('https://cdn.example/still.jpg');
    expect(mediaKind(video)).toBe('video');
  });

  test('nimmt bei Bildern und Alben media_url', () => {
    const album = rawMediaSchema.parse({
      ...base,
      media_type: 'CAROUSEL_ALBUM',
      media_url: 'https://cdn.example/first.jpg',
    });
    expect(stillUrl(album)).toBe('https://cdn.example/first.jpg');
    expect(mediaKind(album)).toBe('album');
  });

  test('kennt nur die dokumentierten Medientypen', () => {
    expect(
      rawMediaSchema.safeParse({ ...base, media_type: 'REEL' }).success
    ).toBe(false);
  });
});
