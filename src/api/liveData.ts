export interface LiveStream {
  id: string;
  title: string;
  image: string;
  type: string;
  streamUrl: string;
  category?: string;
  country?: string;
}

// Fallback image for channels that don't have a logo
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=300&q=80';

// Curated reliable 24/7 streams for a premium experience
const PREMIUM_STREAMS: LiveStream[] = [
  { id: 'premium-rb', title: 'Red Bull TV', image: 'https://images.unsplash.com/photo-1541252876127-6f8c7e098485?w=300&q=80', type: 'channel', streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8', category: 'Sports' },
  { id: 'premium-bb', title: 'Bloomberg TV', image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&q=80', type: 'channel', streamUrl: 'https://live.bloomberg.tv/btv/us/master.m3u8', category: 'News' },
  { id: 'premium-aje', title: 'Al Jazeera', image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&q=80', type: 'channel', streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8', category: 'News' },
  { id: 'premium-sky', title: 'Sky News', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=300&q=80', type: 'channel', streamUrl: 'https://skynewsau-live.akamaized.net/hls/live/2002689/skynewsau-extra1/master.m3u8', category: 'News' },
  { id: 'premium-cbs', title: 'CBS News', image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=300&q=80', type: 'channel', streamUrl: 'https://cbsn-us.cbsnstream.cbsnews.com/out/v1/55a8648e8f134e82a470f83d562deeca/master.m3u8', category: 'News' },
];

// Global cache to avoid refetching
let channelsCache: LiveStream[] = [];

/**
 * Fetches real live TV channels from the iptv-org API.
 * Uses environment variables for the endpoints.
 */
export const fetchLiveChannels = async (): Promise<LiveStream[]> => {
  if (channelsCache.length > 0) return channelsCache;

  try {
    const channelsUrl = import.meta.env.VITE_API_CHANNELS_URL || 'https://iptv-org.github.io/api/channels.json';
    const streamsUrl = import.meta.env.VITE_STREAMS_API_URL || 'https://iptv-org.github.io/api/streams.json';

    // Fetch both datasets in parallel
    const [channelsRes, streamsRes] = await Promise.all([
      fetch(channelsUrl),
      fetch(streamsUrl)
    ]);

    const channels = await channelsRes.json();
    const streams = await streamsRes.json();

    // Create a map of active streams
    const streamMap = new Map();
    streams.forEach((stream: any) => {
      // Prioritize active, working streams
      if (stream.status !== 'error' && stream.url) {
        streamMap.set(stream.channel, stream.url);
      }
    });

    const liveStreams: LiveStream[] = [...PREMIUM_STREAMS];

    // Combine channels with their active streams
    for (const channel of channels) {
      const streamUrl = streamMap.get(channel.id);
      if (streamUrl) {
        liveStreams.push({
          id: channel.id,
          title: channel.name,
          image: channel.logo || FALLBACK_IMAGE,
          type: 'channel',
          streamUrl: streamUrl,
          category: channel.categories?.[0] || 'General',
          country: channel.country || 'Unknown'
        });
      }
      
      // Limit to 200 channels for performance in this UI clone
      if (liveStreams.length >= 200) break;
    }

    channelsCache = liveStreams;
    return liveStreams;
  } catch (error) {
    console.error('Failed to fetch live channels:', error);
    return [];
  }
};

/**
 * Helper to get a specific stream by ID
 */
export const getLiveStreamById = async (id: string): Promise<LiveStream | undefined> => {
  const channels = await fetchLiveChannels();
  return channels.find(c => c.id === id);
};

/**
 * Get channels by category (e.g. 'sports', 'news')
 */
export const getChannelsByCategory = async (category: string): Promise<LiveStream[]> => {
  const channels = await fetchLiveChannels();
  return channels.filter(c => c.category?.toLowerCase() === category.toLowerCase());
};
