export interface ContentItem {
  id: string;
  title: string;
  image: string;
  type?: string;
  streamUrl: string;
  description?: string;
}

// Using Apple's open source HLS test stream for all videos to ensure it plays
const TEST_STREAM = 'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8';
const TEST_STREAM_2 = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // Big Buck Bunny

export const LIVE_CHANNELS: ContentItem[] = [
  { id: 'ch1', title: 'Star Sports 1', image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=300&q=80', type: 'channel', streamUrl: TEST_STREAM },
  { id: 'ch2', title: 'Sony Ten 1', image: 'https://images.unsplash.com/photo-1541252876127-6f8c7e098485?w=300&q=80', type: 'channel', streamUrl: TEST_STREAM_2 },
  { id: 'ch3', title: 'Willow TV', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&q=80', type: 'channel', streamUrl: TEST_STREAM },
  { id: 'ch4', title: 'Sky Sports', image: 'https://images.unsplash.com/photo-1521731978258-2921a97d9193?w=300&q=80', type: 'channel', streamUrl: TEST_STREAM_2 },
  { id: 'ch5', title: 'Fox Sports', image: 'https://images.unsplash.com/photo-1518605368461-1ee7c631e840?w=300&q=80', type: 'channel', streamUrl: TEST_STREAM },
  { id: 'ch6', title: 'ESPN', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80', type: 'channel', streamUrl: TEST_STREAM_2 },
  { id: 'ch7', title: 'BT Sport', image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&q=80', type: 'channel', streamUrl: TEST_STREAM },
];

export const MATCH_HIGHLIGHTS: ContentItem[] = [
  { id: 'hl1', title: 'Kohli 82* vs Pakistan - Thriller Finish', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&q=80', streamUrl: TEST_STREAM_2 },
  { id: 'hl2', title: 'Messi Magic in World Cup Final', image: 'https://images.unsplash.com/photo-1518605368461-1ee7c631e840?w=500&q=80', streamUrl: TEST_STREAM },
  { id: 'hl3', title: 'Djokovic Wins 24th Grand Slam', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&q=80', streamUrl: TEST_STREAM_2 },
  { id: 'hl4', title: 'Lakers vs Warriors - Full Highlights', image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500&q=80', streamUrl: TEST_STREAM },
  { id: 'hl5', title: 'F1 Abu Dhabi Grand Prix Final Lap', image: 'https://images.unsplash.com/photo-1501430654243-c934cec2e1c0?w=500&q=80', streamUrl: TEST_STREAM_2 },
];

export const getStreamById = (id: string): ContentItem | undefined => {
  return [...LIVE_CHANNELS, ...MATCH_HIGHLIGHTS].find(item => item.id === id);
};
