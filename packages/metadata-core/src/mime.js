/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */

/**
 * ### Модификатор конструктора MetaEngine
 * Вызывается в контексте экземпляра MetaEngine
 */
function constructor() {
  Object.defineProperties(this.utils, {

    mime_db: {
      value: {
        'application/andrew-inset': {
          'extensions': ['ez'],
        },
        'application/applixware': {
          'extensions': ['aw'],
        },
        'application/atom+xml': {
          'compressible': true,
          'extensions': ['atom'],
        },
        'application/atomcat+xml': {
          'extensions': ['atomcat'],
        },
        'application/atomsvc+xml': {
          'extensions': ['atomsvc'],
        },
        'application/bdoc': {
          'compressible': false,
          'extensions': ['bdoc'],
        },
        'application/ccxml+xml': {
          'extensions': ['ccxml'],
        },
        'application/cdmi-capability': {
          'extensions': ['cdmia'],
        },
        'application/cdmi-container': {
          'extensions': ['cdmic'],
        },
        'application/cdmi-domain': {
          'extensions': ['cdmid'],
        },
        'application/cdmi-object': {
          'extensions': ['cdmio'],
        },
        'application/cdmi-queue': {
          'extensions': ['cdmiq'],
        },
        'application/cu-seeme': {
          'extensions': ['cu'],
        },
        'application/dash+xml': {
          'extensions': ['mpd'],
        },
        'application/davmount+xml': {
          'extensions': ['davmount'],
        },
        'application/docbook+xml': {
          'extensions': ['dbk'],
        },
        'application/dssc+der': {
          'extensions': ['dssc'],
        },
        'application/dssc+xml': {
          'extensions': ['xdssc'],
        },
        'application/ecmascript': {
          'compressible': true,
          'extensions': ['ecma'],
        },
        'application/emma+xml': {
          'extensions': ['emma'],
        },
        'application/epub+zip': {
          'extensions': ['epub'],
        },
        'application/exi': {
          'extensions': ['exi'],
        },
        'application/font-tdpfr': {
          'extensions': ['pfr'],
        },
        'application/font-woff': {
          'compressible': false,
          'extensions': ['woff'],
        },
        'application/font-woff2': {
          'compressible': false,
          'extensions': ['woff2'],
        },
        'application/gml+xml': {
          'extensions': ['gml'],
        },
        'application/gpx+xml': {
          'extensions': ['gpx'],
        },
        'application/gxf': {
          'extensions': ['gxf'],
        },
        'application/hyperstudio': {
          'extensions': ['stk'],
        },
        'application/inkml+xml': {
          'extensions': ['ink', 'inkml'],
        },
        'application/ipfix': {
          'extensions': ['ipfix'],
        },
        'application/java-archive': {
          'compressible': false,
          'extensions': ['jar', 'war', 'ear'],
        },
        'application/java-serialized-object': {
          'compressible': false,
          'extensions': ['ser'],
        },
        'application/java-vm': {
          'compressible': false,
          'extensions': ['class'],
        },
        'application/javascript': {
          'charset': 'UTF-8',
          'compressible': true,
          'extensions': ['js'],
        },
        'application/json': {
          'charset': 'UTF-8',
          'compressible': true,
          'extensions': ['json', 'map'],
        },
        'application/json-patch+json': {
          'compressible': true,
        },
        'application/json5': {
          'extensions': ['json5'],
        },
        'application/jsonml+json': {
          'compressible': true,
          'extensions': ['jsonml'],
        },
        'application/ld+json': {
          'compressible': true,
          'extensions': ['jsonld'],
        },
        'application/lost+xml': {
          'extensions': ['lostxml'],
        },
        'application/mac-binhex40': {
          'extensions': ['hqx'],
        },
        'application/mac-compactpro': {
          'extensions': ['cpt'],
        },
        'application/mads+xml': {
          'extensions': ['mads'],
        },
        'application/manifest+json': {
          'charset': 'UTF-8',
          'compressible': true,
          'extensions': ['webmanifest'],
        },
        'application/marc': {
          'extensions': ['mrc'],
        },
        'application/marcxml+xml': {
          'extensions': ['mrcx'],
        },
        'application/mathematica': {
          'extensions': ['ma', 'nb', 'mb'],
        },
        'application/mathml+xml': {
          'extensions': ['mathml'],
        },
        'application/mbox': {
          'extensions': ['mbox'],
        },
        'application/mediaservercontrol+xml': {
          'extensions': ['mscml'],
        },
        'application/metalink+xml': {
          'extensions': ['metalink'],
        },
        'application/metalink4+xml': {
          'extensions': ['meta4'],
        },
        'application/mets+xml': {
          'extensions': ['mets'],
        },
        'application/mods+xml': {
          'extensions': ['mods'],
        },
        'application/mp21': {
          'extensions': ['m21', 'mp21'],
        },
        'application/mp4': {
          'extensions': ['mp4s', 'm4p'],
        },
        'application/msword': {
          'compressible': false,
          'extensions': ['doc', 'dot'],
        },
        'application/mxf': {
          'extensions': ['mxf'],
        },
        'application/octet-stream': {
          'compressible': false,
          'extensions': ['bin', 'dms', 'lrf', 'mar', 'so', 'dist', 'distz', 'pkg', 'bpk', 'dump', 'elc', 'deploy', 'exe', 'dll', 'deb', 'dmg', 'iso', 'img', 'msi', 'msp', 'msm', 'buffer'],
        },
        'application/oda': {
          'extensions': ['oda'],
        },
        'application/oebps-package+xml': {
          'extensions': ['opf'],
        },
        'application/ogg': {
          'compressible': false,
          'extensions': ['ogx'],
        },
        'application/omdoc+xml': {
          'extensions': ['omdoc'],
        },
        'application/onenote': {
          'extensions': ['onetoc', 'onetoc2', 'onetmp', 'onepkg'],
        },
        'application/oxps': {
          'extensions': ['oxps'],
        },
        'application/patch-ops-error+xml': {
          'extensions': ['xer'],
        },
        'application/pdf': {
          'compressible': false,
          'extensions': ['pdf'],
        },
        'application/pgp-encrypted': {
          'compressible': false,
          'extensions': ['pgp'],
        },
        'application/pgp-signature': {
          'extensions': ['asc', 'sig'],
        },
        'application/pics-rules': {
          'extensions': ['prf'],
        },
        'application/pkcs10': {
          'extensions': ['p10'],
        },
        'application/pkcs7-mime': {
          'extensions': ['p7m', 'p7c'],
        },
        'application/pkcs7-signature': {
          'extensions': ['p7s'],
        },
        'application/pkcs8': {
          'extensions': ['p8'],
        },
        'application/pkix-attr-cert': {
          'extensions': ['ac'],
        },
        'application/pkix-cert': {
          'extensions': ['cer'],
        },
        'application/pkix-crl': {
          'extensions': ['crl'],
        },
        'application/pkix-pkipath': {
          'extensions': ['pkipath'],
        },
        'application/pkixcmp': {
          'extensions': ['pki'],
        },
        'application/pls+xml': {
          'extensions': ['pls'],
        },
        'application/postscript': {
          'compressible': true,
          'extensions': ['ai', 'eps', 'ps'],
        },
        'application/prs.cww': {
          'extensions': ['cww'],
        },
        'application/pskc+xml': {
          'extensions': ['pskcxml'],
        },
        'application/rdf+xml': {
          'compressible': true,
          'extensions': ['rdf'],
        },
        'application/reginfo+xml': {
          'extensions': ['rif'],
        },
        'application/relax-ng-compact-syntax': {
          'extensions': ['rnc'],
        },
        'application/resource-lists+xml': {
          'extensions': ['rl'],
        },
        'application/resource-lists-diff+xml': {
          'extensions': ['rld'],
        },
        'application/rls-services+xml': {
          'extensions': ['rs'],
        },
        'application/rpki-ghostbusters': {
          'extensions': ['gbr'],
        },
        'application/rpki-manifest': {
          'extensions': ['mft'],
        },
        'application/rpki-roa': {
          'extensions': ['roa'],
        },
        'application/rsd+xml': {
          'extensions': ['rsd'],
        },
        'application/rss+xml': {
          'compressible': true,
          'extensions': ['rss'],
        },
        'application/rtf': {
          'compressible': true,
          'extensions': ['rtf'],
        },
        'application/sbml+xml': {
          'extensions': ['sbml'],
        },
        'application/scvp-cv-request': {
          'extensions': ['scq'],
        },
        'application/scvp-cv-response': {
          'extensions': ['scs'],
        },
        'application/scvp-vp-request': {
          'extensions': ['spq'],
        },
        'application/scvp-vp-response': {
          'extensions': ['spp'],
        },
        'application/sdp': {
          'extensions': ['sdp'],
        },
        'application/set-payment-initiation': {
          'extensions': ['setpay'],
        },
        'application/set-registration-initiation': {
          'extensions': ['setreg'],
        },
        'application/shf+xml': {
          'extensions': ['shf'],
        },
        'application/smil+xml': {
          'extensions': ['smi', 'smil'],
        },
        'application/sparql-query': {
          'extensions': ['rq'],
        },
        'application/sparql-results+xml': {
          'extensions': ['srx'],
        },
        'application/srgs': {
          'extensions': ['gram'],
        },
        'application/srgs+xml': {
          'extensions': ['grxml'],
        },
        'application/sru+xml': {
          'extensions': ['sru'],
        },
        'application/ssdl+xml': {
          'extensions': ['ssdl'],
        },
        'application/ssml+xml': {
          'extensions': ['ssml'],
        },
        'application/tei+xml': {
          'extensions': ['tei', 'teicorpus'],
        },
        'application/thraud+xml': {
          'extensions': ['tfi'],
        },
        'application/timestamped-data': {
          'extensions': ['tsd'],
        },
        'application/vnd.3gpp.pic-bw-large': {
          'extensions': ['plb'],
        },
        'application/vnd.3gpp.pic-bw-small': {
          'extensions': ['psb'],
        },
        'application/vnd.3gpp.pic-bw-var': {
          'extensions': ['pvb'],
        },
        'application/vnd.3gpp2.tcap': {
          'extensions': ['tcap'],
        },
        'application/vnd.3m.post-it-notes': {
          'extensions': ['pwn'],
        },
        'application/vnd.accpac.simply.aso': {
          'extensions': ['aso'],
        },
        'application/vnd.accpac.simply.imp': {
          'extensions': ['imp'],
        },
        'application/vnd.acucobol': {
          'extensions': ['acu'],
        },
        'application/vnd.acucorp': {
          'extensions': ['atc', 'acutc'],
        },
        'application/vnd.adobe.air-application-installer-package+zip': {
          'extensions': ['air'],
        },
        'application/vnd.adobe.formscentral.fcdt': {
          'extensions': ['fcdt'],
        },
        'application/vnd.adobe.fxp': {
          'extensions': ['fxp', 'fxpl'],
        },
        'application/vnd.adobe.xdp+xml': {
          'extensions': ['xdp'],
        },
        'application/vnd.adobe.xfdf': {
          'extensions': ['xfdf'],
        },
        'application/vnd.ahead.space': {
          'extensions': ['ahead'],
        },
        'application/vnd.airzip.filesecure.azf': {
          'extensions': ['azf'],
        },
        'application/vnd.airzip.filesecure.azs': {
          'extensions': ['azs'],
        },
        'application/vnd.amazon.ebook': {
          'extensions': ['azw'],
        },
        'application/vnd.americandynamics.acc': {
          'extensions': ['acc'],
        },
        'application/vnd.amiga.ami': {
          'extensions': ['ami'],
        },
        'application/vnd.android.package-archive': {
          'compressible': false,
          'extensions': ['apk'],
        },
        'application/vnd.anser-web-certificate-issue-initiation': {
          'extensions': ['cii'],
        },
        'application/vnd.anser-web-funds-transfer-initiation': {
          'extensions': ['fti'],
        },
        'application/vnd.antix.game-component': {
          'extensions': ['atx'],
        },
        'application/vnd.apple.installer+xml': {
          'extensions': ['mpkg'],
        },
        'application/vnd.apple.mpegurl': {
          'extensions': ['m3u8'],
        },
        'application/vnd.apple.pkpass': {
          'compressible': false,
          'extensions': ['pkpass'],
        },
        'application/vnd.aristanetworks.swi': {
          'extensions': ['swi'],
        },
        'application/vnd.astraea-software.iota': {
          'extensions': ['iota'],
        },
        'application/vnd.audiograph': {
          'extensions': ['aep'],
        },
        'application/vnd.blueice.multipass': {
          'extensions': ['mpm'],
        },
        'application/vnd.bmi': {
          'extensions': ['bmi'],
        },
        'application/vnd.businessobjects': {
          'extensions': ['rep'],
        },
        'application/vnd.chemdraw+xml': {
          'extensions': ['cdxml'],
        },
        'application/vnd.chipnuts.karaoke-mmd': {
          'extensions': ['mmd'],
        },
        'application/vnd.cinderella': {
          'extensions': ['cdy'],
        },
        'application/vnd.claymore': {
          'extensions': ['cla'],
        },
        'application/vnd.cloanto.rp9': {
          'extensions': ['rp9'],
        },
        'application/vnd.clonk.c4group': {
          'extensions': ['c4g', 'c4d', 'c4f', 'c4p', 'c4u'],
        },
        'application/vnd.cluetrust.cartomobile-config': {
          'extensions': ['c11amc'],
        },
        'application/vnd.cluetrust.cartomobile-config-pkg': {
          'extensions': ['c11amz'],
        },
        'application/vnd.commonspace': {
          'extensions': ['csp'],
        },
        'application/vnd.contact.cmsg': {
          'extensions': ['cdbcmsg'],
        },
        'application/vnd.cosmocaller': {
          'extensions': ['cmc'],
        },
        'application/vnd.crick.clicker': {
          'extensions': ['clkx'],
        },
        'application/vnd.crick.clicker.keyboard': {
          'extensions': ['clkk'],
        },
        'application/vnd.crick.clicker.palette': {
          'extensions': ['clkp'],
        },
        'application/vnd.crick.clicker.template': {
          'extensions': ['clkt'],
        },
        'application/vnd.crick.clicker.wordbank': {
          'extensions': ['clkw'],
        },
        'application/vnd.criticaltools.wbs+xml': {
          'extensions': ['wbs'],
        },
        'application/vnd.ctc-posml': {
          'extensions': ['pml'],
        },
        'application/vnd.cups-ppd': {
          'extensions': ['ppd'],
        },
        'application/vnd.curl.car': {
          'extensions': ['car'],
        },
        'application/vnd.curl.pcurl': {
          'extensions': ['pcurl'],
        },
        'application/vnd.dart': {
          'compressible': true,
          'extensions': ['dart'],
        },
        'application/vnd.data-vision.rdz': {
          'extensions': ['rdz'],
        },
        'application/vnd.dece.data': {
          'extensions': ['uvf', 'uvvf', 'uvd', 'uvvd'],
        },
        'application/vnd.dece.ttml+xml': {
          'extensions': ['uvt', 'uvvt'],
        },
        'application/vnd.dece.unspecified': {
          'extensions': ['uvx', 'uvvx'],
        },
        'application/vnd.dece.zip': {
          'extensions': ['uvz', 'uvvz'],
        },
        'application/vnd.denovo.fcselayout-link': {
          'extensions': ['fe_launch'],
        },
        'application/vnd.dna': {
          'extensions': ['dna'],
        },
        'application/vnd.dolby.mlp': {
          'extensions': ['mlp'],
        },
        'application/vnd.dpgraph': {
          'extensions': ['dpg'],
        },
        'application/vnd.dreamfactory': {
          'extensions': ['dfac'],
        },
        'application/vnd.ds-keypoint': {
          'extensions': ['kpxx'],
        },
        'application/vnd.dvb.ait': {
          'extensions': ['ait'],
        },
        'application/vnd.dvb.service': {
          'extensions': ['svc'],
        },
        'application/vnd.dynageo': {
          'extensions': ['geo'],
        },
        'application/vnd.ecowin.chart': {
          'extensions': ['mag'],
        },
        'application/vnd.enliven': {
          'extensions': ['nml'],
        },
        'application/vnd.epson.esf': {
          'extensions': ['esf'],
        },
        'application/vnd.epson.msf': {
          'extensions': ['msf'],
        },
        'application/vnd.epson.quickanime': {
          'extensions': ['qam'],
        },
        'application/vnd.epson.salt': {
          'extensions': ['slt'],
        },
        'application/vnd.epson.ssf': {
          'extensions': ['ssf'],
        },
        'application/vnd.eszigno3+xml': {
          'extensions': ['es3', 'et3'],
        },
        'application/vnd.ezpix-album': {
          'extensions': ['ez2'],
        },
        'application/vnd.ezpix-package': {
          'extensions': ['ez3'],
        },
        'application/vnd.fdf': {
          'extensions': ['fdf'],
        },
        'application/vnd.fdsn.mseed': {
          'extensions': ['mseed'],
        },
        'application/vnd.fdsn.seed': {
          'extensions': ['seed', 'dataless'],
        },
        'application/vnd.flographit': {
          'extensions': ['gph'],
        },
        'application/vnd.fluxtime.clip': {
          'extensions': ['ftc'],
        },
        'application/vnd.framemaker': {
          'extensions': ['fm', 'frame', 'maker', 'book'],
        },
        'application/vnd.frogans.fnc': {
          'extensions': ['fnc'],
        },
        'application/vnd.frogans.ltf': {
          'extensions': ['ltf'],
        },
        'application/vnd.fsc.weblaunch': {
          'extensions': ['fsc'],
        },
        'application/vnd.fujitsu.oasys': {
          'extensions': ['oas'],
        },
        'application/vnd.fujitsu.oasys2': {
          'extensions': ['oa2'],
        },
        'application/vnd.fujitsu.oasys3': {
          'extensions': ['oa3'],
        },
        'application/vnd.fujitsu.oasysgp': {
          'extensions': ['fg5'],
        },
        'application/vnd.fujitsu.oasysprs': {
          'extensions': ['bh2'],
        },
        'application/vnd.fujixerox.ddd': {
          'extensions': ['ddd'],
        },
        'application/vnd.fujixerox.docuworks': {
          'extensions': ['xdw'],
        },
        'application/vnd.fujixerox.docuworks.binder': {
          'extensions': ['xbd'],
        },
        'application/vnd.fuzzysheet': {
          'extensions': ['fzs'],
        },
        'application/vnd.genomatix.tuxedo': {
          'extensions': ['txd'],
        },
        'application/vnd.geogebra.file': {
          'extensions': ['ggb'],
        },
        'application/vnd.geogebra.tool': {
          'extensions': ['ggt'],
        },
        'application/vnd.geometry-explorer': {
          'extensions': ['gex', 'gre'],
        },
        'application/vnd.geonext': {
          'extensions': ['gxt'],
        },
        'application/vnd.geoplan': {
          'extensions': ['g2w'],
        },
        'application/vnd.geospace': {
          'extensions': ['g3w'],
        },
        'application/vnd.gmx': {
          'extensions': ['gmx'],
        },
        'application/vnd.google-apps.document': {
          'compressible': false,
          'extensions': ['gdoc'],
        },
        'application/vnd.google-apps.presentation': {
          'compressible': false,
          'extensions': ['gslides'],
        },
        'application/vnd.google-apps.spreadsheet': {
          'compressible': false,
          'extensions': ['gsheet'],
        },
        'application/vnd.google-earth.kml+xml': {
          'compressible': true,
          'extensions': ['kml'],
        },
        'application/vnd.google-earth.kmz': {
          'compressible': false,
          'extensions': ['kmz'],
        },
        'application/vnd.grafeq': {
          'extensions': ['gqf', 'gqs'],
        },
        'application/vnd.groove-account': {
          'extensions': ['gac'],
        },
        'application/vnd.groove-help': {
          'extensions': ['ghf'],
        },
        'application/vnd.groove-identity-message': {
          'extensions': ['gim'],
        },
        'application/vnd.groove-injector': {
          'extensions': ['grv'],
        },
        'application/vnd.groove-tool-message': {
          'extensions': ['gtm'],
        },
        'application/vnd.groove-tool-template': {
          'extensions': ['tpl'],
        },
        'application/vnd.groove-vcard': {
          'extensions': ['vcg'],
        },
        'application/vnd.hal+xml': {
          'extensions': ['hal'],
        },
        'application/vnd.handheld-entertainment+xml': {
          'extensions': ['zmm'],
        },
        'application/vnd.hbci': {
          'extensions': ['hbci'],
        },
        'application/vnd.hhe.lesson-player': {
          'extensions': ['les'],
        },
        'application/vnd.hp-hpgl': {
          'extensions': ['hpgl'],
        },
        'application/vnd.hp-hpid': {
          'extensions': ['hpid'],
        },
        'application/vnd.hp-hps': {
          'extensions': ['hps'],
        },
        'application/vnd.hp-jlyt': {
          'extensions': ['jlt'],
        },
        'application/vnd.hp-pcl': {
          'extensions': ['pcl'],
        },
        'application/vnd.hp-pclxl': {
          'extensions': ['pclxl'],
        },
        'application/vnd.hydrostatix.sof-data': {
          'extensions': ['sfd-hdstx'],
        },
        'application/vnd.ibm.minipay': {
          'extensions': ['mpy'],
        },
        'application/vnd.ibm.modcap': {
          'extensions': ['afp', 'listafp', 'list3820'],
        },
        'application/vnd.ibm.rights-management': {
          'extensions': ['irm'],
        },
        'application/vnd.ibm.secure-container': {
          'extensions': ['sc'],
        },
        'application/vnd.iccprofile': {
          'extensions': ['icc', 'icm'],
        },
        'application/vnd.igloader': {
          'extensions': ['igl'],
        },
        'application/vnd.immervision-ivp': {
          'extensions': ['ivp'],
        },
        'application/vnd.immervision-ivu': {
          'extensions': ['ivu'],
        },
        'application/vnd.insors.igm': {
          'extensions': ['igm'],
        },
        'application/vnd.intercon.formnet': {
          'extensions': ['xpw', 'xpx'],
        },
        'application/vnd.intergeo': {
          'extensions': ['i2g'],
        },
        'application/vnd.intu.qbo': {
          'extensions': ['qbo'],
        },
        'application/vnd.intu.qfx': {
          'extensions': ['qfx'],
        },
        'application/vnd.ipunplugged.rcprofile': {
          'extensions': ['rcprofile'],
        },
        'application/vnd.irepository.package+xml': {
          'extensions': ['irp'],
        },
        'application/vnd.is-xpr': {
          'extensions': ['xpr'],
        },
        'application/vnd.isac.fcs': {
          'extensions': ['fcs'],
        },
        'application/vnd.jam': {
          'extensions': ['jam'],
        },
        'application/vnd.jcp.javame.midlet-rms': {
          'extensions': ['rms'],
        },
        'application/vnd.jisp': {
          'extensions': ['jisp'],
        },
        'application/vnd.joost.joda-archive': {
          'extensions': ['joda'],
        },
        'application/vnd.kahootz': {
          'extensions': ['ktz', 'ktr'],
        },
        'application/vnd.kde.karbon': {
          'extensions': ['karbon'],
        },
        'application/vnd.kde.kchart': {
          'extensions': ['chrt'],
        },
        'application/vnd.kde.kformula': {
          'extensions': ['kfo'],
        },
        'application/vnd.kde.kivio': {
          'extensions': ['flw'],
        },
        'application/vnd.kde.kontour': {
          'extensions': ['kon'],
        },
        'application/vnd.kde.kpresenter': {
          'extensions': ['kpr', 'kpt'],
        },
        'application/vnd.kde.kspread': {
          'extensions': ['ksp'],
        },
        'application/vnd.kde.kword': {
          'extensions': ['kwd', 'kwt'],
        },
        'application/vnd.kenameaapp': {
          'extensions': ['htke'],
        },
        'application/vnd.kidspiration': {
          'extensions': ['kia'],
        },
        'application/vnd.kinar': {
          'extensions': ['kne', 'knp'],
        },
        'application/vnd.koan': {
          'extensions': ['skp', 'skd', 'skt', 'skm'],
        },
        'application/vnd.kodak-descriptor': {
          'extensions': ['sse'],
        },
        'application/vnd.las.las+xml': {
          'extensions': ['lasxml'],
        },
        'application/vnd.llamagraphics.life-balance.desktop': {
          'extensions': ['lbd'],
        },
        'application/vnd.llamagraphics.life-balance.exchange+xml': {
          'extensions': ['lbe'],
        },
        'application/vnd.lotus-1-2-3': {
          'extensions': ['123'],
        },
        'application/vnd.lotus-approach': {
          'extensions': ['apr'],
        },
        'application/vnd.lotus-freelance': {
          'extensions': ['pre'],
        },
        'application/vnd.lotus-notes': {
          'extensions': ['nsf'],
        },
        'application/vnd.lotus-organizer': {
          'extensions': ['org'],
        },
        'application/vnd.lotus-screencam': {
          'extensions': ['scm'],
        },
        'application/vnd.lotus-wordpro': {
          'extensions': ['lwp'],
        },
        'application/vnd.macports.portpkg': {
          'extensions': ['portpkg'],
        },
        'application/vnd.mcd': {
          'extensions': ['mcd'],
        },
        'application/vnd.medcalcdata': {
          'extensions': ['mc1'],
        },
        'application/vnd.mediastation.cdkey': {
          'extensions': ['cdkey'],
        },
        'application/vnd.mfer': {
          'extensions': ['mwf'],
        },
        'application/vnd.mfmp': {
          'extensions': ['mfm'],
        },
        'application/vnd.micrografx.flo': {
          'extensions': ['flo'],
        },
        'application/vnd.micrografx.igx': {
          'extensions': ['igx'],
        },
        'application/vnd.mif': {
          'extensions': ['mif'],
        },
        'application/vnd.mobius.daf': {
          'extensions': ['daf'],
        },
        'application/vnd.mobius.dis': {
          'extensions': ['dis'],
        },
        'application/vnd.mobius.mbk': {
          'extensions': ['mbk'],
        },
        'application/vnd.mobius.mqy': {
          'extensions': ['mqy'],
        },
        'application/vnd.mobius.msl': {
          'extensions': ['msl'],
        },
        'application/vnd.mobius.plc': {
          'extensions': ['plc'],
        },
        'application/vnd.mobius.txf': {
          'extensions': ['txf'],
        },
        'application/vnd.mophun.application': {
          'extensions': ['mpn'],
        },
        'application/vnd.mophun.certificate': {
          'extensions': ['mpc'],
        },
        'application/vnd.mozilla.xul+xml': {
          'compressible': true,
          'extensions': ['xul'],
        },
        'application/vnd.ms-cab-compressed': {
          'extensions': ['cab'],
        },
        'application/vnd.ms-excel': {
          'compressible': false,
          'extensions': ['xls', 'xlm', 'xla', 'xlc', 'xlt', 'xlw'],
        },
        'application/vnd.ms-excel.addin.macroenabled.12': {
          'extensions': ['xlam'],
        },
        'application/vnd.ms-excel.sheet.binary.macroenabled.12': {
          'extensions': ['xlsb'],
        },
        'application/vnd.ms-excel.sheet.macroenabled.12': {
          'extensions': ['xlsm'],
        },
        'application/vnd.ms-excel.template.macroenabled.12': {
          'extensions': ['xltm'],
        },
        'application/vnd.ms-fontobject': {
          'compressible': true,
          'extensions': ['eot'],
        },
        'application/vnd.ms-htmlhelp': {
          'extensions': ['chm'],
        },
        'application/vnd.ms-ims': {
          'extensions': ['ims'],
        },
        'application/vnd.ms-lrm': {
          'extensions': ['lrm'],
        },
        'application/vnd.ms-officetheme': {
          'extensions': ['thmx'],
        },
        'application/vnd.ms-opentype': {
          'compressible': true,
        },
        'application/vnd.ms-pki.seccat': {
          'extensions': ['cat'],
        },
        'application/vnd.ms-pki.stl': {
          'extensions': ['stl'],
        },
        'application/vnd.ms-powerpoint': {
          'compressible': false,
          'extensions': ['ppt', 'pps', 'pot'],
        },
        'application/vnd.ms-powerpoint.addin.macroenabled.12': {
          'extensions': ['ppam'],
        },
        'application/vnd.ms-powerpoint.presentation.macroenabled.12': {
          'extensions': ['pptm'],
        },
        'application/vnd.ms-powerpoint.slide.macroenabled.12': {
          'extensions': ['sldm'],
        },
        'application/vnd.ms-powerpoint.slideshow.macroenabled.12': {
          'extensions': ['ppsm'],
        },
        'application/vnd.ms-powerpoint.template.macroenabled.12': {
          'extensions': ['potm'],
        },
        'application/vnd.ms-project': {
          'extensions': ['mpp', 'mpt'],
        },
        'application/vnd.ms-word.document.macroenabled.12': {
          'extensions': ['docm'],
        },
        'application/vnd.ms-word.template.macroenabled.12': {
          'extensions': ['dotm'],
        },
        'application/vnd.ms-works': {
          'extensions': ['wps', 'wks', 'wcm', 'wdb'],
        },
        'application/vnd.ms-wpl': {
          'extensions': ['wpl'],
        },
        'application/vnd.ms-xpsdocument': {
          'compressible': false,
          'extensions': ['xps'],
        },
        'application/vnd.mseq': {
          'extensions': ['mseq'],
        },
        'application/vnd.musician': {
          'extensions': ['mus'],
        },
        'application/vnd.muvee.style': {
          'extensions': ['msty'],
        },
        'application/vnd.mynfc': {
          'extensions': ['taglet'],
        },
        'application/vnd.neurolanguage.nlu': {
          'extensions': ['nlu'],
        },
        'application/vnd.nitf': {
          'extensions': ['ntf', 'nitf'],
        },
        'application/vnd.noblenet-directory': {
          'extensions': ['nnd'],
        },
        'application/vnd.noblenet-sealer': {
          'extensions': ['nns'],
        },
        'application/vnd.noblenet-web': {
          'extensions': ['nnw'],
        },
        'application/vnd.nokia.n-gage.data': {
          'extensions': ['ngdat'],
        },
        'application/vnd.nokia.n-gage.symbian.install': {
          'extensions': ['n-gage'],
        },
        'application/vnd.nokia.radio-preset': {
          'extensions': ['rpst'],
        },
        'application/vnd.nokia.radio-presets': {
          'extensions': ['rpss'],
        },
        'application/vnd.novadigm.edm': {
          'extensions': ['edm'],
        },
        'application/vnd.novadigm.edx': {
          'extensions': ['edx'],
        },
        'application/vnd.novadigm.ext': {
          'extensions': ['ext'],
        },
        'application/vnd.oasis.opendocument.chart': {
          'extensions': ['odc'],
        },
        'application/vnd.oasis.opendocument.chart-template': {
          'extensions': ['otc'],
        },
        'application/vnd.oasis.opendocument.database': {
          'extensions': ['odb'],
        },
        'application/vnd.oasis.opendocument.formula': {
          'extensions': ['odf'],
        },
        'application/vnd.oasis.opendocument.formula-template': {
          'extensions': ['odft'],
        },
        'application/vnd.oasis.opendocument.graphics': {
          'compressible': false,
          'extensions': ['odg'],
        },
        'application/vnd.oasis.opendocument.graphics-template': {
          'extensions': ['otg'],
        },
        'application/vnd.oasis.opendocument.image': {
          'extensions': ['odi'],
        },
        'application/vnd.oasis.opendocument.image-template': {
          'extensions': ['oti'],
        },
        'application/vnd.oasis.opendocument.presentation': {
          'compressible': false,
          'extensions': ['odp'],
        },
        'application/vnd.oasis.opendocument.presentation-template': {
          'extensions': ['otp'],
        },
        'application/vnd.oasis.opendocument.spreadsheet': {
          'compressible': false,
          'extensions': ['ods'],
        },
        'application/vnd.oasis.opendocument.spreadsheet-template': {
          'extensions': ['ots'],
        },
        'application/vnd.oasis.opendocument.text': {
          'compressible': false,
          'extensions': ['odt'],
        },
        'application/vnd.oasis.opendocument.text-master': {
          'extensions': ['odm'],
        },
        'application/vnd.oasis.opendocument.text-template': {
          'extensions': ['ott'],
        },
        'application/vnd.oasis.opendocument.text-web': {
          'extensions': ['oth'],
        },
        'application/vnd.olpc-sugar': {
          'extensions': ['xo'],
        },
        'application/vnd.oma.dd2+xml': {
          'extensions': ['dd2'],
        },
        'application/vnd.openofficeorg.extension': {
          'extensions': ['oxt'],
        },
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
          'compressible': false,
          'extensions': ['pptx'],
        },
        'application/vnd.openxmlformats-officedocument.presentationml.slide': {
          'extensions': ['sldx'],
        },
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow': {
          'extensions': ['ppsx'],
        },
        'application/vnd.openxmlformats-officedocument.presentationml.template': {
          'extensions': ['potx'],
        },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
          'compressible': false,
          'extensions': ['xlsx'],
        },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template': {
          'extensions': ['xltx'],
        },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
          'compressible': false,
          'extensions': ['docx'],
        },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template': {
          'extensions': ['dotx'],
        },
        'application/vnd.osgeo.mapguide.package': {
          'extensions': ['mgp'],
        },
        'application/vnd.osgi.dp': {
          'extensions': ['dp'],
        },
        'application/vnd.osgi.subsystem': {
          'extensions': ['esa'],
        },
        'application/vnd.palm': {
          'extensions': ['pdb', 'pqa', 'oprc'],
        },
        'application/vnd.pawaafile': {
          'extensions': ['paw'],
        },
        'application/vnd.pg.format': {
          'extensions': ['str'],
        },
        'application/vnd.pg.osasli': {
          'extensions': ['ei6'],
        },
        'application/vnd.picsel': {
          'extensions': ['efif'],
        },
        'application/vnd.pmi.widget': {
          'extensions': ['wg'],
        },
        'application/vnd.pocketlearn': {
          'extensions': ['plf'],
        },
        'application/vnd.powerbuilder6': {
          'extensions': ['pbd'],
        },
        'application/vnd.previewsystems.box': {
          'extensions': ['box'],
        },
        'application/vnd.proteus.magazine': {
          'extensions': ['mgz'],
        },
        'application/vnd.publishare-delta-tree': {
          'extensions': ['qps'],
        },
        'application/vnd.pvi.ptid1': {
          'extensions': ['ptid'],
        },
        'application/vnd.quark.quarkxpress': {
          'extensions': ['qxd', 'qxt', 'qwd', 'qwt', 'qxl', 'qxb'],
        },
        'application/vnd.realvnc.bed': {
          'extensions': ['bed'],
        },
        'application/vnd.recordare.musicxml': {
          'extensions': ['mxl'],
        },
        'application/vnd.recordare.musicxml+xml': {
          'extensions': ['musicxml'],
        },
        'application/vnd.rig.cryptonote': {
          'extensions': ['cryptonote'],
        },
        'application/vnd.rim.cod': {
          'extensions': ['cod'],
        },
        'application/vnd.rn-realmedia': {
          'extensions': ['rm'],
        },
        'application/vnd.rn-realmedia-vbr': {
          'extensions': ['rmvb'],
        },
        'application/vnd.route66.link66+xml': {
          'extensions': ['link66'],
        },
        'application/vnd.sailingtracker.track': {
          'extensions': ['st'],
        },
        'application/vnd.seemail': {
          'extensions': ['see'],
        },
        'application/vnd.sema': {
          'extensions': ['sema'],
        },
        'application/vnd.semd': {
          'extensions': ['semd'],
        },
        'application/vnd.semf': {
          'extensions': ['semf'],
        },
        'application/vnd.shana.informed.formdata': {
          'extensions': ['ifm'],
        },
        'application/vnd.shana.informed.formtemplate': {
          'extensions': ['itp'],
        },
        'application/vnd.shana.informed.interchange': {
          'extensions': ['iif'],
        },
        'application/vnd.shana.informed.package': {
          'extensions': ['ipk'],
        },
        'application/vnd.simtech-mindmapper': {
          'extensions': ['twd', 'twds'],
        },
        'application/vnd.smaf': {
          'extensions': ['mmf'],
        },
        'application/vnd.smart.teacher': {
          'extensions': ['teacher'],
        },
        'application/vnd.solent.sdkm+xml': {
          'extensions': ['sdkm', 'sdkd'],
        },
        'application/vnd.spotfire.dxp': {
          'extensions': ['dxp'],
        },
        'application/vnd.spotfire.sfs': {
          'extensions': ['sfs'],
        },
        'application/vnd.stardivision.calc': {
          'extensions': ['sdc'],
        },
        'application/vnd.stardivision.draw': {
          'extensions': ['sda'],
        },
        'application/vnd.stardivision.impress': {
          'extensions': ['sdd'],
        },
        'application/vnd.stardivision.math': {
          'extensions': ['smf'],
        },
        'application/vnd.stardivision.writer': {
          'extensions': ['sdw', 'vor'],
        },
        'application/vnd.stardivision.writer-global': {
          'extensions': ['sgl'],
        },
        'application/vnd.stepmania.package': {
          'extensions': ['smzip'],
        },
        'application/vnd.stepmania.stepchart': {
          'extensions': ['sm'],
        },
        'application/vnd.sun.xml.calc': {
          'extensions': ['sxc'],
        },
        'application/vnd.sun.xml.calc.template': {
          'extensions': ['stc'],
        },
        'application/vnd.sun.xml.draw': {
          'extensions': ['sxd'],
        },
        'application/vnd.sun.xml.draw.template': {
          'extensions': ['std'],
        },
        'application/vnd.sun.xml.impress': {
          'extensions': ['sxi'],
        },
        'application/vnd.sun.xml.impress.template': {
          'extensions': ['sti'],
        },
        'application/vnd.sun.xml.math': {
          'extensions': ['sxm'],
        },
        'application/vnd.sun.xml.writer': {
          'extensions': ['sxw'],
        },
        'application/vnd.sun.xml.writer.global': {
          'extensions': ['sxg'],
        },
        'application/vnd.sun.xml.writer.template': {
          'extensions': ['stw'],
        },
        'application/vnd.sus-calendar': {
          'extensions': ['sus', 'susp'],
        },
        'application/vnd.svd': {
          'extensions': ['svd'],
        },
        'application/vnd.symbian.install': {
          'extensions': ['sis', 'sisx'],
        },
        'application/vnd.syncml+xml': {
          'extensions': ['xsm'],
        },
        'application/vnd.syncml.dm+wbxml': {
          'extensions': ['bdm'],
        },
        'application/vnd.syncml.dm+xml': {
          'extensions': ['xdm'],
        },
        'application/vnd.tao.intent-module-archive': {
          'extensions': ['tao'],
        },
        'application/vnd.tcpdump.pcap': {
          'extensions': ['pcap', 'cap', 'dmp'],
        },
        'application/vnd.tmobile-livetv': {
          'extensions': ['tmo'],
        },
        'application/vnd.trid.tpt': {
          'extensions': ['tpt'],
        },
        'application/vnd.triscape.mxs': {
          'extensions': ['mxs'],
        },
        'application/vnd.trueapp': {
          'extensions': ['tra'],
        },
        'application/vnd.ufdl': {
          'extensions': ['ufd', 'ufdl'],
        },
        'application/vnd.uiq.theme': {
          'extensions': ['utz'],
        },
        'application/vnd.umajin': {
          'extensions': ['umj'],
        },
        'application/vnd.unity': {
          'extensions': ['unityweb'],
        },
        'application/vnd.uoml+xml': {
          'extensions': ['uoml'],
        },
        'application/vnd.vcx': {
          'extensions': ['vcx'],
        },
        'application/vnd.visio': {
          'extensions': ['vsd', 'vst', 'vss', 'vsw'],
        },
        'application/vnd.visionary': {
          'extensions': ['vis'],
        },
        'application/vnd.vsf': {
          'extensions': ['vsf'],
        },
        'application/vnd.wap.wbxml': {
          'extensions': ['wbxml'],
        },
        'application/vnd.wap.wmlc': {
          'extensions': ['wmlc'],
        },
        'application/vnd.wap.wmlscriptc': {
          'extensions': ['wmlsc'],
        },
        'application/vnd.webturbo': {
          'extensions': ['wtb'],
        },
        'application/vnd.wolfram.player': {
          'extensions': ['nbp'],
        },
        'application/vnd.wordperfect': {
          'extensions': ['wpd'],
        },
        'application/vnd.wqd': {
          'extensions': ['wqd'],
        },
        'application/vnd.wt.stf': {
          'extensions': ['stf'],
        },
        'application/vnd.xara': {
          'extensions': ['xar'],
        },
        'application/vnd.xfdl': {
          'extensions': ['xfdl'],
        },
        'application/vnd.yamaha.hv-dic': {
          'extensions': ['hvd'],
        },
        'application/vnd.yamaha.hv-script': {
          'extensions': ['hvs'],
        },
        'application/vnd.yamaha.hv-voice': {
          'extensions': ['hvp'],
        },
        'application/vnd.yamaha.openscoreformat': {
          'extensions': ['osf'],
        },
        'application/vnd.yamaha.openscoreformat.osfpvg+xml': {
          'extensions': ['osfpvg'],
        },
        'application/vnd.yamaha.smaf-audio': {
          'extensions': ['saf'],
        },
        'application/vnd.yamaha.smaf-phrase': {
          'extensions': ['spf'],
        },
        'application/vnd.yellowriver-custom-menu': {
          'extensions': ['cmp'],
        },
        'application/vnd.zul': {
          'extensions': ['zir', 'zirz'],
        },
        'application/vnd.zzazz.deck+xml': {
          'extensions': ['zaz'],
        },
        'application/voicexml+xml': {
          'extensions': ['vxml'],
        },
        'application/widget': {
          'extensions': ['wgt'],
        },
        'application/winhlp': {
          'extensions': ['hlp'],
        },
        'application/wsdl+xml': {
          'extensions': ['wsdl'],
        },
        'application/wspolicy+xml': {
          'extensions': ['wspolicy'],
        },
        'application/x-7z-compressed': {
          'compressible': false,
          'extensions': ['7z'],
        },
        'application/x-abiword': {
          'extensions': ['abw'],
        },
        'application/x-ace-compressed': {
          'extensions': ['ace'],
        },
        'application/x-apple-diskimage': {
          'extensions': ['dmg'],
        },
        'application/x-authorware-bin': {
          'extensions': ['aab', 'x32', 'u32', 'vox'],
        },
        'application/x-authorware-map': {
          'extensions': ['aam'],
        },
        'application/x-authorware-seg': {
          'extensions': ['aas'],
        },
        'application/x-bcpio': {
          'extensions': ['bcpio'],
        },
        'application/x-bdoc': {
          'compressible': false,
          'extensions': ['bdoc'],
        },
        'application/x-bittorrent': {
          'extensions': ['torrent'],
        },
        'application/x-blorb': {
          'extensions': ['blb', 'blorb'],
        },
        'application/x-bzip': {
          'compressible': false,
          'extensions': ['bz'],
        },
        'application/x-bzip2': {
          'compressible': false,
          'extensions': ['bz2', 'boz'],
        },
        'application/x-cbr': {
          'extensions': ['cbr', 'cba', 'cbt', 'cbz', 'cb7'],
        },
        'application/x-cdlink': {
          'extensions': ['vcd'],
        },
        'application/x-cfs-compressed': {
          'extensions': ['cfs'],
        },
        'application/x-chat': {
          'extensions': ['chat'],
        },
        'application/x-chess-pgn': {
          'extensions': ['pgn'],
        },
        'application/x-chrome-extension': {
          'extensions': ['crx'],
        },
        'application/x-cocoa': {
          'source': 'nginx',
          'extensions': ['cco'],
        },
        'application/x-conference': {
          'extensions': ['nsc'],
        },
        'application/x-cpio': {
          'extensions': ['cpio'],
        },
        'application/x-csh': {
          'extensions': ['csh'],
        },
        'application/x-debian-package': {
          'extensions': ['deb', 'udeb'],
        },
        'application/x-dgc-compressed': {
          'extensions': ['dgc'],
        },
        'application/x-director': {
          'extensions': ['dir', 'dcr', 'dxr', 'cst', 'cct', 'cxt', 'w3d', 'fgd', 'swa'],
        },
        'application/x-doom': {
          'extensions': ['wad'],
        },
        'application/x-dtbncx+xml': {
          'extensions': ['ncx'],
        },
        'application/x-dtbook+xml': {
          'extensions': ['dtb'],
        },
        'application/x-dtbresource+xml': {
          'extensions': ['res'],
        },
        'application/x-dvi': {
          'compressible': false,
          'extensions': ['dvi'],
        },
        'application/x-envoy': {
          'extensions': ['evy'],
        },
        'application/x-eva': {
          'extensions': ['eva'],
        },
        'application/x-font-bdf': {
          'extensions': ['bdf'],
        },
        'application/x-font-ghostscript': {
          'extensions': ['gsf'],
        },
        'application/x-font-linux-psf': {
          'extensions': ['psf'],
        },
        'application/x-font-otf': {
          'compressible': true,
          'extensions': ['otf'],
        },
        'application/x-font-pcf': {
          'extensions': ['pcf'],
        },
        'application/x-font-snf': {
          'extensions': ['snf'],
        },
        'application/x-font-ttf': {
          'compressible': true,
          'extensions': ['ttf', 'ttc'],
        },
        'application/x-font-type1': {
          'extensions': ['pfa', 'pfb', 'pfm', 'afm'],
        },
        'application/x-freearc': {
          'extensions': ['arc'],
        },
        'application/x-futuresplash': {
          'extensions': ['spl'],
        },
        'application/x-gca-compressed': {
          'extensions': ['gca'],
        },
        'application/x-glulx': {
          'extensions': ['ulx'],
        },
        'application/x-gnumeric': {
          'extensions': ['gnumeric'],
        },
        'application/x-gramps-xml': {
          'extensions': ['gramps'],
        },
        'application/x-gtar': {
          'extensions': ['gtar'],
        },
        'application/x-hdf': {
          'extensions': ['hdf'],
        },
        'application/x-httpd-php': {
          'compressible': true,
          'extensions': ['php'],
        },
        'application/x-install-instructions': {
          'extensions': ['install'],
        },
        'application/x-iso9660-image': {
          'extensions': ['iso'],
        },
        'application/x-java-archive-diff': {
          'source': 'nginx',
          'extensions': ['jardiff'],
        },
        'application/x-java-jnlp-file': {
          'compressible': false,
          'extensions': ['jnlp'],
        },
        'application/x-latex': {
          'compressible': false,
          'extensions': ['latex'],
        },
        'application/x-lua-bytecode': {
          'extensions': ['luac'],
        },
        'application/x-lzh-compressed': {
          'extensions': ['lzh', 'lha'],
        },
        'application/x-makeself': {
          'source': 'nginx',
          'extensions': ['run'],
        },
        'application/x-mie': {
          'extensions': ['mie'],
        },
        'application/x-mobipocket-ebook': {
          'extensions': ['prc', 'mobi'],
        },
        'application/x-ms-application': {
          'extensions': ['application'],
        },
        'application/x-ms-shortcut': {
          'extensions': ['lnk'],
        },
        'application/x-ms-wmd': {
          'extensions': ['wmd'],
        },
        'application/x-ms-wmz': {
          'extensions': ['wmz'],
        },
        'application/x-ms-xbap': {
          'extensions': ['xbap'],
        },
        'application/x-msaccess': {
          'extensions': ['mdb'],
        },
        'application/x-msbinder': {
          'extensions': ['obd'],
        },
        'application/x-mscardfile': {
          'extensions': ['crd'],
        },
        'application/x-msclip': {
          'extensions': ['clp'],
        },
        'application/x-msdos-program': {
          'extensions': ['exe'],
        },
        'application/x-msdownload': {
          'extensions': ['exe', 'dll', 'com', 'bat', 'msi'],
        },
        'application/x-msmediaview': {
          'extensions': ['mvb', 'm13', 'm14'],
        },
        'application/x-msmetafile': {
          'extensions': ['wmf', 'wmz', 'emf', 'emz'],
        },
        'application/x-msmoney': {
          'extensions': ['mny'],
        },
        'application/x-mspublisher': {
          'extensions': ['pub'],
        },
        'application/x-msschedule': {
          'extensions': ['scd'],
        },
        'application/x-msterminal': {
          'extensions': ['trm'],
        },
        'application/x-mswrite': {
          'extensions': ['wri'],
        },
        'application/x-netcdf': {
          'extensions': ['nc', 'cdf'],
        },
        'application/x-ns-proxy-autoconfig': {
          'compressible': true,
          'extensions': ['pac'],
        },
        'application/x-nzb': {
          'extensions': ['nzb'],
        },
        'application/x-perl': {
          'source': 'nginx',
          'extensions': ['pl', 'pm'],
        },
        'application/x-pilot': {
          'source': 'nginx',
          'extensions': ['prc', 'pdb'],
        },
        'application/x-pkcs12': {
          'compressible': false,
          'extensions': ['p12', 'pfx'],
        },
        'application/x-pkcs7-certificates': {
          'extensions': ['p7b', 'spc'],
        },
        'application/x-pkcs7-certreqresp': {
          'extensions': ['p7r'],
        },
        'application/x-rar-compressed': {
          'compressible': false,
          'extensions': ['rar'],
        },
        'application/x-redhat-package-manager': {
          'source': 'nginx',
          'extensions': ['rpm'],
        },
        'application/x-research-info-systems': {
          'extensions': ['ris'],
        },
        'application/x-sea': {
          'source': 'nginx',
          'extensions': ['sea'],
        },
        'application/x-sh': {
          'compressible': true,
          'extensions': ['sh'],
        },
        'application/x-shar': {
          'extensions': ['shar'],
        },
        'application/x-shockwave-flash': {
          'compressible': false,
          'extensions': ['swf'],
        },
        'application/x-silverlight-app': {
          'extensions': ['xap'],
        },
        'application/x-sql': {
          'extensions': ['sql'],
        },
        'application/x-stuffit': {
          'compressible': false,
          'extensions': ['sit'],
        },
        'application/x-stuffitx': {
          'extensions': ['sitx'],
        },
        'application/x-subrip': {
          'extensions': ['srt'],
        },
        'application/x-sv4cpio': {
          'extensions': ['sv4cpio'],
        },
        'application/x-sv4crc': {
          'extensions': ['sv4crc'],
        },
        'application/x-t3vm-image': {
          'extensions': ['t3'],
        },
        'application/x-tads': {
          'extensions': ['gam'],
        },
        'application/x-tar': {
          'compressible': true,
          'extensions': ['tar'],
        },
        'application/x-tcl': {
          'extensions': ['tcl', 'tk'],
        },
        'application/x-tex': {
          'extensions': ['tex'],
        },
        'application/x-tex-tfm': {
          'extensions': ['tfm'],
        },
        'application/x-texinfo': {
          'extensions': ['texinfo', 'texi'],
        },
        'application/x-tgif': {
          'extensions': ['obj'],
        },
        'application/x-ustar': {
          'extensions': ['ustar'],
        },
        'application/x-wais-source': {
          'extensions': ['src'],
        },
        'application/x-web-app-manifest+json': {
          'compressible': true,
          'extensions': ['webapp'],
        },
        'application/x-x509-ca-cert': {
          'extensions': ['der', 'crt', 'pem'],
        },
        'application/x-xfig': {
          'extensions': ['fig'],
        },
        'application/x-xliff+xml': {
          'extensions': ['xlf'],
        },
        'application/x-xpinstall': {
          'compressible': false,
          'extensions': ['xpi'],
        },
        'application/x-xz': {
          'extensions': ['xz'],
        },
        'application/x-zmachine': {
          'extensions': ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8'],
        },
        'application/xaml+xml': {
          'extensions': ['xaml'],
        },
        'application/xcap-diff+xml': {
          'extensions': ['xdf'],
        },
        'application/xenc+xml': {
          'extensions': ['xenc'],
        },
        'application/xhtml+xml': {
          'compressible': true,
          'extensions': ['xhtml', 'xht'],
        },
        'application/xml': {
          'compressible': true,
          'extensions': ['xml', 'xsl', 'xsd', 'rng'],
        },
        'application/xml-dtd': {
          'compressible': true,
          'extensions': ['dtd'],
        },
        'application/xop+xml': {
          'compressible': true,
          'extensions': ['xop'],
        },
        'application/xproc+xml': {
          'extensions': ['xpl'],
        },
        'application/xslt+xml': {
          'extensions': ['xslt'],
        },
        'application/xspf+xml': {
          'extensions': ['xspf'],
        },
        'application/xv+xml': {
          'extensions': ['mxml', 'xhvml', 'xvml', 'xvm'],
        },
        'application/yang': {
          'extensions': ['yang'],
        },
        'application/yin+xml': {
          'extensions': ['yin'],
        },
        'application/zip': {
          'compressible': false,
          'extensions': ['zip'],
        },
        'audio/3gpp': {
          'compressible': false,
          'extensions': ['3gpp'],
        },
        'audio/adpcm': {
          'extensions': ['adp'],
        },
        'audio/basic': {
          'compressible': false,
          'extensions': ['au', 'snd'],
        },
        'audio/midi': {
          'extensions': ['mid', 'midi', 'kar', 'rmi'],
        },
        'audio/mp4': {
          'compressible': false,
          'extensions': ['m4a', 'mp4a'],
        },
        'audio/mpeg': {
          'compressible': false,
          'extensions': ['mpga', 'mp2', 'mp2a', 'mp3', 'm2a', 'm3a'],
        },
        'audio/ogg': {
          'compressible': false,
          'extensions': ['oga', 'ogg', 'spx'],
        },
        'audio/s3m': {
          'extensions': ['s3m'],
        },
        'audio/silk': {
          'extensions': ['sil'],
        },
        'audio/vnd.dece.audio': {
          'extensions': ['uva', 'uvva'],
        },
        'audio/vnd.digital-winds': {
          'extensions': ['eol'],
        },
        'audio/vnd.dra': {
          'extensions': ['dra'],
        },
        'audio/vnd.dts': {
          'extensions': ['dts'],
        },
        'audio/vnd.dts.hd': {
          'extensions': ['dtshd'],
        },
        'audio/vnd.lucent.voice': {
          'extensions': ['lvp'],
        },
        'audio/vnd.ms-playready.media.pya': {
          'extensions': ['pya'],
        },
        'audio/vnd.nuera.ecelp4800': {
          'extensions': ['ecelp4800'],
        },
        'audio/vnd.nuera.ecelp7470': {
          'extensions': ['ecelp7470'],
        },
        'audio/vnd.nuera.ecelp9600': {
          'extensions': ['ecelp9600'],
        },
        'audio/vnd.rip': {
          'extensions': ['rip'],
        },
        'audio/wav': {
          'compressible': false,
          'extensions': ['wav'],
        },
        'audio/wave': {
          'compressible': false,
          'extensions': ['wav'],
        },
        'audio/webm': {
          'compressible': false,
          'extensions': ['weba'],
        },
        'audio/x-aac': {
          'compressible': false,
          'extensions': ['aac'],
        },
        'audio/x-aiff': {
          'extensions': ['aif', 'aiff', 'aifc'],
        },
        'audio/x-caf': {
          'compressible': false,
          'extensions': ['caf'],
        },
        'audio/x-flac': {
          'extensions': ['flac'],
        },
        'audio/x-m4a': {
          'source': 'nginx',
          'extensions': ['m4a'],
        },
        'audio/x-matroska': {
          'extensions': ['mka'],
        },
        'audio/x-mpegurl': {
          'extensions': ['m3u'],
        },
        'audio/x-ms-wax': {
          'extensions': ['wax'],
        },
        'audio/x-ms-wma': {
          'extensions': ['wma'],
        },
        'audio/x-pn-realaudio': {
          'extensions': ['ram', 'ra'],
        },
        'audio/x-pn-realaudio-plugin': {
          'extensions': ['rmp'],
        },
        'audio/x-realaudio': {
          'source': 'nginx',
          'extensions': ['ra'],
        },
        'audio/x-wav': {
          'extensions': ['wav'],
        },
        'audio/xm': {
          'extensions': ['xm'],
        },
        'chemical/x-cdx': {
          'extensions': ['cdx'],
        },
        'chemical/x-cif': {
          'extensions': ['cif'],
        },
        'chemical/x-cmdf': {
          'extensions': ['cmdf'],
        },
        'chemical/x-cml': {
          'extensions': ['cml'],
        },
        'chemical/x-csml': {
          'extensions': ['csml'],
        },
        'chemical/x-xyz': {
          'extensions': ['xyz'],
        },
        'font/opentype': {
          'compressible': true,
          'extensions': ['otf'],
        },
        'image/bmp': {
          'compressible': true,
          'extensions': ['bmp'],
        },
        'image/cgm': {
          'extensions': ['cgm'],
        },
        'image/g3fax': {
          'extensions': ['g3'],
        },
        'image/gif': {
          'compressible': false,
          'extensions': ['gif'],
        },
        'image/ief': {
          'extensions': ['ief'],
        },
        'image/jpeg': {
          'compressible': false,
          'extensions': ['jpeg', 'jpg', 'jpe'],
        },
        'image/ktx': {
          'extensions': ['ktx'],
        },
        'image/png': {
          'compressible': false,
          'extensions': ['png'],
        },
        'image/prs.btif': {
          'extensions': ['btif'],
        },
        'image/sgi': {
          'extensions': ['sgi'],
        },
        'image/svg+xml': {
          'compressible': true,
          'extensions': ['svg', 'svgz'],
        },
        'image/tiff': {
          'compressible': false,
          'extensions': ['tiff', 'tif'],
        },
        'image/vnd.adobe.photoshop': {
          'compressible': true,
          'extensions': ['psd'],
        },
        'image/vnd.dece.graphic': {
          'extensions': ['uvi', 'uvvi', 'uvg', 'uvvg'],
        },
        'image/vnd.djvu': {
          'extensions': ['djvu', 'djv'],
        },
        'image/vnd.dvb.subtitle': {
          'extensions': ['sub'],
        },
        'image/vnd.dwg': {
          'extensions': ['dwg'],
        },
        'image/vnd.dxf': {
          'extensions': ['dxf'],
        },
        'image/vnd.fastbidsheet': {
          'extensions': ['fbs'],
        },
        'image/vnd.fpx': {
          'extensions': ['fpx'],
        },
        'image/vnd.fst': {
          'extensions': ['fst'],
        },
        'image/vnd.fujixerox.edmics-mmr': {
          'extensions': ['mmr'],
        },
        'image/vnd.fujixerox.edmics-rlc': {
          'extensions': ['rlc'],
        },
        'image/vnd.ms-modi': {
          'extensions': ['mdi'],
        },
        'image/vnd.ms-photo': {
          'extensions': ['wdp'],
        },
        'image/vnd.net-fpx': {
          'extensions': ['npx'],
        },
        'image/vnd.wap.wbmp': {
          'extensions': ['wbmp'],
        },
        'image/vnd.xiff': {
          'extensions': ['xif'],
        },
        'image/webp': {
          'extensions': ['webp'],
        },
        'image/x-3ds': {
          'extensions': ['3ds'],
        },
        'image/x-cmu-raster': {
          'extensions': ['ras'],
        },
        'image/x-cmx': {
          'extensions': ['cmx'],
        },
        'image/x-freehand': {
          'extensions': ['fh', 'fhc', 'fh4', 'fh5', 'fh7'],
        },
        'image/x-icon': {
          'compressible': true,
          'extensions': ['ico'],
        },
        'image/x-jng': {
          'source': 'nginx',
          'extensions': ['jng'],
        },
        'image/x-mrsid-image': {
          'extensions': ['sid'],
        },
        'image/x-ms-bmp': {
          'source': 'nginx',
          'compressible': true,
          'extensions': ['bmp'],
        },
        'image/x-pcx': {
          'extensions': ['pcx'],
        },
        'image/x-pict': {
          'extensions': ['pic', 'pct'],
        },
        'image/x-portable-anymap': {
          'extensions': ['pnm'],
        },
        'image/x-portable-bitmap': {
          'extensions': ['pbm'],
        },
        'image/x-portable-graymap': {
          'extensions': ['pgm'],
        },
        'image/x-portable-pixmap': {
          'extensions': ['ppm'],
        },
        'image/x-rgb': {
          'extensions': ['rgb'],
        },
        'image/x-tga': {
          'extensions': ['tga'],
        },
        'image/x-xbitmap': {
          'extensions': ['xbm'],
        },
        'image/x-xpixmap': {
          'extensions': ['xpm'],
        },
        'image/x-xwindowdump': {
          'extensions': ['xwd'],
        },
        'message/rfc822': {
          'compressible': true,
          'extensions': ['eml', 'mime'],
        },
        'model/iges': {
          'compressible': false,
          'extensions': ['igs', 'iges'],
        },
        'model/mesh': {
          'compressible': false,
          'extensions': ['msh', 'mesh', 'silo'],
        },
        'model/vnd.collada+xml': {
          'extensions': ['dae'],
        },
        'model/vnd.dwf': {
          'extensions': ['dwf'],
        },
        'model/vnd.gdl': {
          'extensions': ['gdl'],
        },
        'model/vnd.gtw': {
          'extensions': ['gtw'],
        },
        'model/vnd.mts': {
          'extensions': ['mts'],
        },
        'model/vnd.vtu': {
          'extensions': ['vtu'],
        },
        'model/vrml': {
          'compressible': false,
          'extensions': ['wrl', 'vrml'],
        },
        'model/x3d+binary': {
          'compressible': false,
          'extensions': ['x3db', 'x3dbz'],
        },
        'model/x3d+vrml': {
          'compressible': false,
          'extensions': ['x3dv', 'x3dvz'],
        },
        'model/x3d+xml': {
          'compressible': true,
          'extensions': ['x3d', 'x3dz'],
        },
        'text/cache-manifest': {
          'compressible': true,
          'extensions': ['appcache', 'manifest'],
        },
        'text/calendar': {
          'extensions': ['ics', 'ifb'],
        },
        'text/coffeescript': {
          'extensions': ['coffee', 'litcoffee'],
        },
        'text/css': {
          'compressible': true,
          'extensions': ['css'],
        },
        'text/csv': {
          'compressible': true,
          'extensions': ['csv'],
        },
        'text/hjson': {
          'extensions': ['hjson'],
        },
        'text/html': {
          'compressible': true,
          'extensions': ['html', 'htm', 'shtml'],
        },
        'text/jade': {
          'extensions': ['jade'],
        },
        'text/jsx': {
          'compressible': true,
          'extensions': ['jsx'],
        },
        'text/less': {
          'extensions': ['less'],
        },
        'text/mathml': {
          'source': 'nginx',
          'extensions': ['mml'],
        },
        'text/n3': {
          'compressible': true,
          'extensions': ['n3'],
        },
        'text/plain': {
          'compressible': true,
          'extensions': ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
        },
        'text/prs.lines.tag': {
          'extensions': ['dsc'],
        },
        'text/richtext': {
          'compressible': true,
          'extensions': ['rtx'],
        },
        'text/rtf': {
          'compressible': true,
          'extensions': ['rtf'],
        },
        'text/sgml': {
          'extensions': ['sgml', 'sgm'],
        },
        'text/slim': {
          'extensions': ['slim', 'slm'],
        },
        'text/stylus': {
          'extensions': ['stylus', 'styl'],
        },
        'text/tab-separated-values': {
          'compressible': true,
          'extensions': ['tsv'],
        },
        'text/troff': {
          'extensions': ['t', 'tr', 'roff', 'man', 'me', 'ms'],
        },
        'text/turtle': {
          'extensions': ['ttl'],
        },
        'text/uri-list': {
          'compressible': true,
          'extensions': ['uri', 'uris', 'urls'],
        },
        'text/vcard': {
          'compressible': true,
          'extensions': ['vcard'],
        },
        'text/vnd.curl': {
          'extensions': ['curl'],
        },
        'text/vnd.curl.dcurl': {
          'extensions': ['dcurl'],
        },
        'text/vnd.curl.mcurl': {
          'extensions': ['mcurl'],
        },
        'text/vnd.curl.scurl': {
          'extensions': ['scurl'],
        },
        'text/vnd.dvb.subtitle': {
          'extensions': ['sub'],
        },
        'text/vnd.fly': {
          'extensions': ['fly'],
        },
        'text/vnd.fmi.flexstor': {
          'extensions': ['flx'],
        },
        'text/vnd.graphviz': {
          'extensions': ['gv'],
        },
        'text/vnd.in3d.3dml': {
          'extensions': ['3dml'],
        },
        'text/vnd.in3d.spot': {
          'extensions': ['spot'],
        },
        'text/vnd.sun.j2me.app-descriptor': {
          'extensions': ['jad'],
        },
        'text/vnd.wap.wml': {
          'extensions': ['wml'],
        },
        'text/vnd.wap.wmlscript': {
          'extensions': ['wmls'],
        },
        'text/vtt': {
          'charset': 'UTF-8',
          'compressible': true,
          'extensions': ['vtt'],
        },
        'text/x-asm': {
          'extensions': ['s', 'asm'],
        },
        'text/x-c': {
          'extensions': ['c', 'cc', 'cxx', 'cpp', 'h', 'hh', 'dic'],
        },
        'text/x-component': {
          'source': 'nginx',
          'extensions': ['htc'],
        },
        'text/x-fortran': {
          'extensions': ['f', 'for', 'f77', 'f90'],
        },
        'text/x-handlebars-template': {
          'extensions': ['hbs'],
        },
        'text/x-java-source': {
          'extensions': ['java'],
        },
        'text/x-lua': {
          'extensions': ['lua'],
        },
        'text/x-markdown': {
          'compressible': true,
          'extensions': ['markdown', 'md', 'mkd'],
        },
        'text/x-nfo': {
          'extensions': ['nfo'],
        },
        'text/x-opml': {
          'extensions': ['opml'],
        },
        'text/x-pascal': {
          'extensions': ['p', 'pas'],
        },
        'text/x-processing': {
          'compressible': true,
          'extensions': ['pde'],
        },
        'text/x-sass': {
          'extensions': ['sass'],
        },
        'text/x-scss': {
          'extensions': ['scss'],
        },
        'text/x-setext': {
          'extensions': ['etx'],
        },
        'text/x-sfv': {
          'extensions': ['sfv'],
        },
        'text/x-suse-ymp': {
          'compressible': true,
          'extensions': ['ymp'],
        },
        'text/x-uuencode': {
          'extensions': ['uu'],
        },
        'text/x-vcalendar': {
          'extensions': ['vcs'],
        },
        'text/x-vcard': {
          'extensions': ['vcf'],
        },
        'text/xml': {
          'source': 'iana',
          'compressible': true,
          'extensions': ['xml'],
        },
        'text/yaml': {
          'extensions': ['yaml', 'yml'],
        },
        'video/3gpp': {
          'extensions': ['3gp', '3gpp'],
        },
        'video/3gpp2': {
          'extensions': ['3g2'],
        },
        'video/h261': {
          'extensions': ['h261'],
        },
        'video/h263': {
          'extensions': ['h263'],
        },
        'video/h264': {
          'extensions': ['h264'],
        },
        'video/jpeg': {
          'extensions': ['jpgv'],
        },
        'video/jpm': {
          'extensions': ['jpm', 'jpgm'],
        },
        'video/mj2': {
          'extensions': ['mj2', 'mjp2'],
        },
        'video/mp2t': {
          'extensions': ['ts'],
        },
        'video/mp4': {
          'compressible': false,
          'extensions': ['mp4', 'mp4v', 'mpg4'],
        },
        'video/mpeg': {
          'compressible': false,
          'extensions': ['mpeg', 'mpg', 'mpe', 'm1v', 'm2v'],
        },
        'video/ogg': {
          'compressible': false,
          'extensions': ['ogv'],
        },
        'video/quicktime': {
          'compressible': false,
          'extensions': ['qt', 'mov'],
        },
        'video/vnd.dece.hd': {
          'extensions': ['uvh', 'uvvh'],
        },
        'video/vnd.dece.mobile': {
          'extensions': ['uvm', 'uvvm'],
        },
        'video/vnd.dece.pd': {
          'extensions': ['uvp', 'uvvp'],
        },
        'video/vnd.dece.sd': {
          'extensions': ['uvs', 'uvvs'],
        },
        'video/vnd.dece.video': {
          'extensions': ['uvv', 'uvvv'],
        },
        'video/vnd.dvb.file': {
          'extensions': ['dvb'],
        },
        'video/vnd.fvt': {
          'extensions': ['fvt'],
        },
        'video/vnd.mpegurl': {
          'extensions': ['mxu', 'm4u'],
        },
        'video/vnd.ms-playready.media.pyv': {
          'extensions': ['pyv'],
        },
        'video/vnd.uvvu.mp4': {
          'extensions': ['uvu', 'uvvu'],
        },
        'video/vnd.vivo': {
          'extensions': ['viv'],
        },
        'video/webm': {
          'compressible': false,
          'extensions': ['webm'],
        },
        'video/x-f4v': {
          'extensions': ['f4v'],
        },
        'video/x-fli': {
          'extensions': ['fli'],
        },
        'video/x-flv': {
          'compressible': false,
          'extensions': ['flv'],
        },
        'video/x-m4v': {
          'extensions': ['m4v'],
        },
        'video/x-matroska': {
          'compressible': false,
          'extensions': ['mkv', 'mk3d', 'mks'],
        },
        'video/x-mng': {
          'extensions': ['mng'],
        },
        'video/x-ms-asf': {
          'extensions': ['asf', 'asx'],
        },
        'video/x-ms-vob': {
          'extensions': ['vob'],
        },
        'video/x-ms-wm': {
          'extensions': ['wm'],
        },
        'video/x-ms-wmv': {
          'compressible': false,
          'extensions': ['wmv'],
        },
        'video/x-ms-wmx': {
          'extensions': ['wmx'],
        },
        'video/x-ms-wvx': {
          'extensions': ['wvx'],
        },
        'video/x-msvideo': {
          'extensions': ['avi'],
        },
        'video/x-sgi-movie': {
          'extensions': ['movie'],
        },
        'video/x-smv': {
          'extensions': ['smv'],
        },
        'x-conference/x-cooltalk': {
          'extensions': ['ice'],
        },
      },
    },

    mime_lookup: {
      value: function(ext) {

        if(!ext) {
          return 'application/octet-stream';
        }

        ext = ext.toLowerCase();

        for (const mtype in this.mime_db) {
          if (this.mime_db[mtype].extensions && this.mime_db[mtype].extensions.indexOf(ext) !== -1)
            return mtype;
        }

        return 'application/octet-stream';
      },
    },
  });
}

/**
 * Экспортируем объект-плагин, добавляющий методы в utils
 */
export default {constructor};
