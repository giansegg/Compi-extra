// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async rewrites() {
//     return [
//       {
//         //source: '/api/:path*',
//         //destination: 'http://localhost:5000/api/:path*',
//         source: '/api/:path*',
//         destination: '/api/:path*',
//       },
//     ]
//   },
//   webpack(config) {
//     // Enable async WASM for @hpcc-js/wasm (Graphviz)
//     config.experiments = {
//       ...config.experiments,
//       asyncWebAssembly: true,
//       layers: true,
//     }
//     return config
//   },
// }

// module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        { source: '/api/:path*', destination: 'http://localhost:5000/api/:path*' },
      ]
    }
    return []
  },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    }
    return config
  },
}

module.exports = nextConfig