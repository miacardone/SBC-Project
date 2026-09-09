/**
 * Consumer mailbox providers. Shared by the phone page and the API so a player
 * gets told before they submit, and the server still refuses if they don't.
 *
 * Deliberately consumer providers only — never a corporate or regional ISP that
 * a real business might sit on. A wrong entry here silently deletes a lead.
 */
export const FREE_EMAIL_DOMAINS = new Set([
  // Google / Microsoft / Apple / Yahoo consumer
  "gmail.com", "googlemail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "hotmail.it", "hotmail.es",
  "hotmail.de", "hotmail.com.br", "hotmail.ca",
  "outlook.com", "outlook.es", "outlook.fr", "outlook.de", "outlook.it",
  "outlook.com.br", "live.com", "live.co.uk", "live.nl", "live.fr", "live.it",
  "live.ca", "live.com.au", "msn.com", "passport.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.co.jp", "yahoo.fr", "yahoo.de", "yahoo.it",
  "yahoo.es", "yahoo.ca", "yahoo.com.br", "yahoo.com.au", "yahoo.co.in",
  "ymail.com", "rocketmail.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com", "aim.com",
  // privacy-focused consumer
  "proton.me", "protonmail.com", "protonmail.ch", "pm.me",
  "tutanota.com", "tutanota.de", "tuta.com", "tuta.io",
  "hushmail.com", "mailfence.com", "posteo.de", "disroot.org", "fastmail.com",
  // Europe
  "gmx.com", "gmx.de", "gmx.net", "gmx.at", "gmx.ch",
  "web.de", "t-online.de", "freenet.de", "arcor.de",
  "orange.fr", "wanadoo.fr", "free.fr", "laposte.net", "sfr.fr", "neuf.fr",
  "libero.it", "virgilio.it", "alice.it", "tin.it", "tiscali.it",
  "terra.es", "telefonica.net",
  "sapo.pt", "netcabo.pt",
  "ziggo.nl", "xs4all.nl", "kpnmail.nl", "home.nl",
  "telenet.be", "skynet.be",
  "bluewin.ch", "sunrise.ch",
  "online.no", "broadpark.no", "start.no",
  "telia.com", "bredband.net", "spray.se", "hotmail.se",
  "sol.dk", "mail.dk",
  "suomi24.fi", "luukku.com",
  "wp.pl", "o2.pl", "interia.pl", "onet.pl", "gazeta.pl", "poczta.onet.pl",
  "seznam.cz", "centrum.cz", "email.cz",
  "mail.ru", "inbox.ru", "list.ru", "bk.ru", "internet.ru",
  "yandex.ru", "yandex.com", "ya.ru", "rambler.ru",
  "ukr.net", "i.ua",
  "mynet.com", "superonline.com",
  // UK / Ireland
  "btinternet.com", "sky.com", "virginmedia.com", "talktalk.net",
  "ntlworld.com", "blueyonder.co.uk", "eircom.net",
  // Americas
  "comcast.net", "verizon.net", "att.net", "sbcglobal.net", "bellsouth.net",
  "cox.net", "charter.net", "earthlink.net", "juno.com", "roadrunner.com",
  "shaw.ca", "rogers.com", "telus.net", "sympatico.ca",
  "uol.com.br", "bol.com.br", "terra.com.br", "ig.com.br", "globo.com",
  "prodigy.net.mx",
  // Asia-Pacific
  "qq.com", "163.com", "126.com", "yeah.net", "sina.com", "sina.cn",
  "sohu.com", "aliyun.com", "foxmail.com",
  "naver.com", "hanmail.net", "daum.net", "nate.com",
  "docomo.ne.jp", "ezweb.ne.jp", "softbank.ne.jp", "nifty.com", "biglobe.ne.jp",
  "rediffmail.com", "indiatimes.com",
  "bigpond.com", "bigpond.net.au", "optusnet.com.au", "iinet.net.au",
  "xtra.co.nz",
  "singnet.com.sg",
]);

export function isFreeEmailDomain(domain: string): boolean {
  return FREE_EMAIL_DOMAINS.has(domain.toLowerCase());
}
