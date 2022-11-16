const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // env: {
  //   BASE_URL: process.env.BASE_URL,
  // },
  async rewrites() {
    const rewrites = [
      {
        source: '/asset/upbit/logos/:path*',
        destination: 'https://static.upbit.com/logos/:path*'
      },
      {
        source: '/api/upbit/forex/recent',
        destination: 'https://quotation-api-cdn.dunamu.com/v1/forex/recent'
      },
      {
        source: '/api/upbit/:path*',
        destination: 'https://api.upbit.com/v1/:path*'
      },
      {
        source: '/api/binance/:path*',
        destination: 'https://www.binance.com/api/v3/:path*'
      }
    ];

    if (process.env.NEXT_PUBLIC_BASE_API_PROXY_ORIGIN) {
      rewrites.push({
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_BASE_API_PROXY_ORIGIN}/:path*`
      });
    }

    return rewrites;
  },
  reactStrictMode: true,
  webpack(conf) {
    conf.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  // Enable figma's wrong mask-type attribute work
                  removeRasterImages: false,
                  removeStyleElement: false,
                  removeUnknownsAndDefaults: false,
                  // Enable svgr's svg to fill the size
                  removeViewBox: false
                }
              ]
            }
          }
        }
      ]
    });
    // 절대경로
    conf.resolve.modules.push(__dirname);
    return conf;
  }
});
// const nextConfig = {
//   /* config options here */
//   reactStrictMode: true,
// };

// module.exports = nextConfig;
