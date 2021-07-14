module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['placekitten.com']
  },
  webpack: config => {
    // required by zbar.wasm
    config.module.rules.push({
      test: /\.bin$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext][query]'
      }
    })
    return config
  }
}
