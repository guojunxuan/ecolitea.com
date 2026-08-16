module.exports = {
  siteUrl: 'https://ecolitea.com',
  exclude: ['/admin*', '/api*', '/preview*', '/thanks-for-subscribing'],
  generateRobotsTxt: true, // (optional)
  robotsTxtOptions: {
    policies: [
      {
        allow: '/',
        disallow: ['/admin/', '/api/', '/preview/'],
        userAgent: '*',
      },
    ],
  },
}
