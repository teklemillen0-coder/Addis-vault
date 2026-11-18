import { AdConfig, DirectSponsorBanner } from '../types';

export const DEFAULT_SPONSOR_BANNERS: DirectSponsorBanner[] = [];

export const DEFAULT_AD_CONFIG: AdConfig = {
  adsEnabled: false,
  showDefaultBanners: false,
  activeSource: 'auto',
  enabledSlots: {
    top_banner: true,
    in_feed: true,
    download_page: true,
    footer_banner: true,
  },
  adsense: {
    publisherId: '',
    slotIds: {
      top_banner: '',
      in_feed: '',
      download_page: '',
      footer_banner: '',
    },
    unitCode: '',
  },
  thirdParty: {
    network: 'adsterra',
    bannerScript: '',
    nativeScript: '',
  },
  directSponsors: DEFAULT_SPONSOR_BANNERS,
  stats: {
    impressions: 0,
    clicks: 0,
  },
};
