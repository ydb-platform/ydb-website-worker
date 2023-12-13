const cliUrl = new URL('https://storage.yandexcloud.net/yandexcloud-ydb/install.sh');

export default {
  domain: 'ydb.tech',

  blog_location: {
    en: 'https://blog.ydb.tech',
    ru: 'https://habr.com/ru/companies/ydb/articles/'
  },

  install_sh_location: {
    server: new URL('https://binaries.ydb.tech/local_scripts/install.sh'),
    cli: cliUrl,
    cli_win: cliUrl
  },

  production: true,
};
