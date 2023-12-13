export default {
  domain: 'ydb.tech',

  blog_location: {
    en: 'https://blog.ydb.tech',
    ru: 'https://habr.com/ru/companies/ydb/articles/'
  },

  install_sh_location: {
    server: new URL('https://binaries.ydb.tech/local_scripts/install.sh'),
    cli: new URL('https://storage.yandexcloud.net/yandexcloud-ydb/install.sh'),
    cli_win: new URL('https://storage.yandexcloud.net/yandexcloud-ydb/install.ps1')
  },

  production: true,
};
