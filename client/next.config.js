const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // env: {
  //   BASE_URL: process.env.BASE_URL,
  // },
  async rewrites() {
    return [
      {
        source: "/api/v1/upbit/:path*",
        destination: `https://api.upbit.com/v1/:path*`,
      },
      {
        source: "/asset/upbit/logos/:path*",
        destination: `https://static.upbit.com/logos/:path*`,
      },
    ];
  },
  reactStrictMode: true,
  webpack(conf) {
    conf.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  // Enable figma's wrong mask-type attribute work
                  removeRasterImages: false,
                  removeStyleElement: false,
                  removeUnknownsAndDefaults: false,
                  // Enable svgr's svg to fill the size
                  removeViewBox: false,
                },
              ],
            },
          },
        },
      ],
    });
    // 절대경로
    conf.resolve.modules.push(__dirname);
    return conf;
  },
});
// const nextConfig = {
//   /* config options here */
//   reactStrictMode: true,
// };

// module.exports = nextConfig;
