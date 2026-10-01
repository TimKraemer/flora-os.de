import { describe, expect, test } from 'bun:test';
import { parseProfile } from '../instagram/api';
import { toMedia } from '../instagram/sync';

const node = (overrides: object) => ({
  id: '1',
  shortcode: 'DddfRDlsJzT',
  __typename: 'GraphImage',
  display_url: 'https://scontent.cdninstagram.com/v/a.jpg',
  taken_at_timestamp: 1789803546,
  accessibility_caption: 'Photo by Café Flora',
  edge_media_to_caption: { edges: [{ node: { text: ' Heute Musik ✨ ' } }] },
  ...overrides,
});

// Aufbau der öffentlichen Profilantwort, auf die genutzten Felder gekürzt.
const response = (edges: object[], extra = {}) => ({
  data: {
    user: {
      username: 'cafe_flora_osnabrueck',
      full_name: 'Café Flora',
      is_private: false,
      profile_pic_url_hd: 'https://scontent.cdninstagram.com/v/p.jpg',
      edge_followed_by: { count: 4150 },
      edge_owner_to_timeline_media: {
        count: 60,
        edges: edges.map((n) => ({ node: n })),
      },
      ...extra,
    },
  },
});

describe('Instagram-Profil', () => {
  test('liest Profil und Beiträge', () => {
    const profile = parseProfile(response([node({})]));
    expect(profile).toMatchObject({
      username: 'cafe_flora_osnabrueck',
      name: 'Café Flora',
      followers: 4150,
      mediaCount: 60,
    });
    expect(profile.posts).toHaveLength(1);
  });

  test('überspringt Beiträge mit unerwartetem Aufbau', () => {
    const profile = parseProfile(response([node({}), { id: 'kaputt' }]));
    expect(profile.posts).toHaveLength(1);
  });

  test('lehnt private Profile ab', () => {
    expect(() =>
      parseProfile(response([node({})], { is_private: true }))
    ).toThrow('privat');
  });

  test('wandelt Beiträge für die Website um', () => {
    const [post] = parseProfile(
      response([node({ __typename: 'GraphSidecar' })])
    ).posts;
    expect(toMedia(post)).toEqual({
      id: '1',
      kind: 'album',
      caption: 'Heute Musik ✨',
      alt: 'Photo by Café Flora',
      permalink: 'https://www.instagram.com/p/DddfRDlsJzT/',
      timestamp: new Date(1789803546 * 1000).toISOString(),
    });
  });

  test('erkennt Videos', () => {
    const [post] = parseProfile(
      response([node({ __typename: 'GraphVideo' })])
    ).posts;
    expect(toMedia(post).kind).toBe('video');
  });
});
