import NextHead from "next/head";
type HeadProps = {
  title?: string;
  themeColor?: string;
  keywords?: string;
  description?: string;
  ogUrl?: string;
  ogLocale?: string;
  ogType?: string;
  ogTitle?: string;
  ogImage?: string;
  ogDescription?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  otherTags?: React.ReactNode;
};

export default function Head({
  title = "sooros",
  description = "거래소별 코인 프리미엄 시세를 볼 수 있습니다.",
  keywords = "코인,블록체인,bitcoin,비트코인,김치프리미엄,김프,프리미엄,실시간",
  ogDescription = "거래소별 코인 프리미엄 시세를 볼 수 있습니다.",
  ogLocale = "ko_KR",
  ogTitle = "",
  ogType = "website",
  ogUrl = "",
  ogImage = "",
  themeColor = "#000000",
  twitterCard = "",
  twitterDescription = "",
  twitterImage = "",
  twitterTitle = "",
  otherTags,
}: HeadProps) {
  return (
    <NextHead>
      <title>{title}</title>
      <link rel="icon" href="/favicon.ico" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content={themeColor} />
      <meta name="keywords" content={keywords} />
      <meta name="description" content={description} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
      {otherTags}
    </NextHead>
  );
}
