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

    const liveStreams: LiveStream[] = [];

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
