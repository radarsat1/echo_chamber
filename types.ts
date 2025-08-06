
export interface Comment {
  id: string;
  author: string;
  body: string;
  url: string;
}

export interface SocialData {
  isFetching?: boolean;
  hn: {
    id: number | null;
    url: string | null;
    comments: Comment[];
    commentCount: number;
    error?: string;
  };
  reddit: {
    url: string | null;
    comments: Comment[];
    commentCount: number;
    error?: string;
  };
}

export interface Article {
  id: string;
  title: string;
  link: string;
  description: string;
  feedName: string;
  feedUrl: string;
  pubDate: string;
  social: SocialData;
}

export interface Feed {
  name: string;
  url: string;
}