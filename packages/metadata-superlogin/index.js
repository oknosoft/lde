/*!
 metadata-superlogin v2.0.33-beta.2, built:2023-03-18
 © 2014-2024 Evgeniy Malyarov and the Oknosoft team http://www.oknosoft.ru
 metadata.js may be freely distributed under the MIT
 To obtain commercial license and technical support, contact info@oknosoft.ru
 */


'use strict';

var axios = require('axios');
var EventEmitter2 = require('events');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var EventEmitter2__default = /*#__PURE__*/_interopDefaultLegacy(EventEmitter2);

const _debug = require('debug');
const debug = {
	log: _debug('superlogin:log'),
	info: _debug('superlogin:info'),
	warn: _debug('superlogin:warn'),
	error: _debug('superlogin:error')
};
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
function parseHostFromUrl(url) {
  try{
    const parsedURL = new URL(url);
    return parsedURL.host;
  }
  catch (e) {
    return location.host;
  }
}
function checkEndpoint(url, endpoints) {
	const host = parseHostFromUrl(url);
	for (let i = 0; i < endpoints.length; i += 1) {
		if (host === endpoints[i]) {
			return true;
		}
	}
	return false;
}
function isStorageAvailable() {
	const mod = '__STORAGE__';
	try {
		localStorage.setItem(mod, mod);
		localStorage.removeItem(mod);
		return true;
	} catch (e) {
		return false;
	}
}
function parseError(err) {
	if (err && err.response && err.response.data) {
		return err.response.data;
	}
	return err;
}
const memoryStorage = {
	setItem: (key, value) => {
		memoryStorage.storage.set(key, value);
	},
	getItem: key => {
		const value = memoryStorage.storage.get(key);
		if (typeof value !== 'undefined') {
			return value;
		}
		return null;
	},
	removeItem: key => {
		memoryStorage.storage.delete(key);
	},
	storage: new Map()
};
class Superlogin extends EventEmitter2__default["default"] {
	constructor() {
		super();
		this._oauthComplete = false;
		this._config = {};
		this._refreshInProgress = false;
		this._http = axios__default["default"].create();
	}
	configure(config = {}) {
		if (config.serverUrl) {
			this._http = axios__default["default"].create({
				baseURL: config.serverUrl,
				timeout: config.timeout
			});
		}
		config.baseUrl = config.baseUrl || '/auth';
		config.baseUrl = config.baseUrl.replace(/\/$/, '');
		config.socialUrl = config.socialUrl || config.baseUrl;
		config.socialUrl = config.socialUrl.replace(/\/$/, '');
		config.local = config.local || {};
		config.local.usernameField = config.local.usernameField || 'username';
		config.local.passwordField = config.local.passwordField || 'password';
		if (!config.endpoints || !(config.endpoints instanceof Array)) {
			config.endpoints = [];
		}
		if (!config.noDefaultEndpoint) {
			let defaultEndpoint = window.location.host;
			if (config.serverUrl) {
				defaultEndpoint = parseHostFromUrl(config.serverUrl);
			}
			config.endpoints.push(defaultEndpoint);
		}
		config.providers = config.providers || [];
		config.timeout = config.timeout || 0;
		if (!isStorageAvailable()) {
			this.storage = memoryStorage;
		} else if (config.storage === 'session') {
			this.storage = window.sessionStorage;
		} else {
			this.storage = window.localStorage;
		}
		this._config = config;
		this._session = JSON.parse(this.storage.getItem('superlogin.session'));
		this._httpInterceptor();
		if (config.checkExpired) {
			this.checkExpired();
			this.validateSession()
				.then(() => {
					this._onLogin(this._session);
				})
				.catch(() => {
				});
		}
	}
	_httpInterceptor() {
		const request = req => {
			const config = this.getConfig();
			const session = this.getSession();
			if (!session || !session.token) {
				return Promise.resolve(req);
			}
			if (req.skipRefresh) {
				return Promise.resolve(req);
			}
			return this.checkRefresh().then(() => {
				if (checkEndpoint(req.url, config.endpoints)) {
					req.headers.Authorization = `Bearer ${session.token}:${session.password}`;
				}
				return req;
			});
		};
		const responseError = error => {
			const config = this.getConfig();
			if (!error || !error.config) {
				return Promise.reject(error);
			}
			if (checkEndpoint(error.config.url, config.endpoints) &&
				error.response && error.response.status === 401 && this.authenticated()) {
				debug.warn('Не авторизован');
				this._onLogout('Сессия устарела');
			}
			return Promise.reject(error);
		};
		this._http.interceptors.request.eject(this._httpRequestInterceptor);
		this._http.interceptors.response.eject(this._httpResponseInterceptor);
		this._httpRequestInterceptor = this._http.interceptors.request.use(request.bind(this));
		this._httpResponseInterceptor = this._http.interceptors.response.use(null, responseError.bind(this));
	}
	authenticated() {
		return !!(this._session && this._session.user_id);
	}
	getConfig() {
		return this._config;
	}
	validateSession() {
		if (!this.authenticated()) {
			return Promise.reject();
		}
		return this._http.get(`${this._config.baseUrl}/session`)
			.catch(err => {
				this._onLogout('Сессия устарела');
				throw parseError(err);
			});
	}
	getSession() {
		if (!this._session) {
			this._session = JSON.parse(this.storage.getItem('superlogin.session'));
		}
		return this._session ? Object.assign(this._session) : null;
	}
	setSession(session) {
		this._session = session;
		this.storage.setItem('superlogin.session', JSON.stringify(this._session));
		debug.info('Установлена новая сессия');
	}
	deleteSession() {
		this.storage.removeItem('superlogin.session');
		this._session = null;
	}
	getDbUrl(dbName) {
		if (this._session.userDBs && this._session.userDBs[dbName]) {
			return this._session.userDBs[dbName];
		}
		return null;
	}
	getHttp() {
		return this._http;
	}
	confirmRole(role) {
		if (!this._session || !this._session.roles || !this._session.roles.length) return false;
		return this._session.roles.indexOf(role) !== -1;
	}
	confirmAnyRole(roles) {
		if (!this._session || !this._session.roles || !this._session.roles.length) return false;
		for (let i = 0; i < roles.length; i += 1) {
			if (this._session.roles.indexOf(roles[i]) !== -1) return true;
		}
		return false;
	}
	confirmAllRoles(roles) {
		if (!this._session || !this._session.roles || !this._session.roles.length) return false;
		for (let i = 0; i < roles.length; i += 1) {
			if (this._session.roles.indexOf(roles[i]) === -1) return false;
		}
		return true;
	}
	checkRefresh() {
		if (this._refreshInProgress) {
			return Promise.resolve();
		}
		if (!this._session || !this._session.user_id) {
			return Promise.reject();
		}
		const refreshed = this._session.refreshed || this._session.issued;
		const expires = this._session.expires;
		const threshold = isNaN(this._config.refreshThreshold) ? 0.5 : this._config.refreshThreshold;
		const duration = expires - refreshed;
		let timeDiff = this._session.serverTimeDiff || 0;
		if (Math.abs(timeDiff) < 5000) {
			timeDiff = 0;
		}
		const estimatedServerTime = Date.now() + timeDiff;
		const elapsed = estimatedServerTime - refreshed;
		const ratio = elapsed / duration;
		if (ratio > threshold) {
			debug.info('Обновление сессии');
			return this.refresh()
				.then(session => {
					debug.log('Сессия успешно обновлена', session);
					return session;
				})
				.catch(err => {
					debug.error('Ошибка при обновлении сессии', err);
					throw err;
				});
		}
		return Promise.resolve();
	}
	checkExpired() {
		if (!this.authenticated()) {
			return;
		}
		const expires = this._session.expires;
		let timeDiff = this._session.serverTimeDiff || 0;
		if (Math.abs(timeDiff) < 5000) {
			timeDiff = 0;
		}
		const estimatedServerTime = Date.now() + timeDiff;
		if (estimatedServerTime > expires) {
			this._onLogout('Сессия устарела');
		}
	}
	refresh() {
		const session = this.getSession();
		this._refreshInProgress = true;
		return this._http.post(`${this._config.baseUrl}/refresh`, {})
			.then(res => {
				this._refreshInProgress = false;
				if (res.data.token && res.data.expires) {
					Object.assign(session, res.data);
					this.setSession(session);
					this._onRefresh(session);
				}
				return session;
			})
			.catch(err => {
				this._refreshInProgress = false;
				throw parseError(err);
			});
	}
	authenticate() {
		return new Promise(resolve => {
			const session = this.getSession();
			if (session) {
				resolve(session);
			} else {
				this.on('login', newSession => {
					resolve(newSession);
				});
			}
		});
	}
	login(credentials) {
		const { usernameField, passwordField } = this._config.local;
		if (!credentials[usernameField] || !credentials[passwordField]) {
			return Promise.reject({ error: 'Не задан логин или пароль...' });
		}
		return this._http.post(`${this._config.baseUrl}/login`, credentials, { skipRefresh: true })
			.then(res => {
				res.data.serverTimeDiff = res.data.issued - Date.now();
				this.setSession(res.data);
				this._onLogin(res.data);
				return res.data;
			})
			.catch(err => {
				this.deleteSession();
				throw parseError(err);
			});
	}
	register(registration) {
		return this._http.post(`${this._config.baseUrl}/register`, registration, { skipRefresh: true })
			.then(res => {
				if (res.data.user_id && res.data.token) {
					res.data.serverTimeDiff = res.data.issued - Date.now();
					this.setSession(res.data);
					this._onLogin(res.data);
				}
				this._onRegister(registration);
				return res.data;
			})
			.catch(err => {
				throw parseError(err);
			});
	}
	logout(msg) {
		return this._http.post(`${this._config.baseUrl}/logout`, {})
			.then(res => {
				this._onLogout(msg || 'Выполнен выход');
				return res.data;
			})
			.catch(err => {
				this._onLogout(msg || 'Выполнен выход');
				if (!err.response || err.response.data.status !== 401) {
					throw parseError(err);
				}
			});
	}
	logoutAll(msg) {
		return this._http.post(`${this._config.baseUrl}/logout-all`, {})
			.then(res => {
				this._onLogout(msg || 'Выполнен выход');
				return res.data;
			})
			.catch(err => {
				this._onLogout(msg || 'Выполнен выход');
				if (!err.response || err.response.data.status !== 401) {
					throw parseError(err);
				}
			});
	}
	logoutOthers() {
		return this._http.post(`${this._config.baseUrl}/logout-others`, {})
			.then(res => res.data)
			.catch(err => {
				throw parseError(err);
			});
	}
	socialAuth(provider) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Провайдер ${provider} не поддержан.` });
		}
		const url = `${this._config.socialUrl}/${provider}`;
		return this._oAuthPopup(url, { windowTitle: `Login with ${capitalizeFirstLetter(provider)}` });
	}
	tokenSocialAuth(provider, accessToken) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Провайдер ${provider} не поддержан.` });
		}
		return this._http.post(`${this._config.baseUrl}/${provider}/token`, { access_token: accessToken })
			.then(res => {
				if (res.data.user_id && res.data.token) {
					res.data.serverTimeDiff = res.data.issued - Date.now();
					this.setSession(res.data);
					this._onLogin(res.data);
				}
				return res.data;
			})
			.catch(err => {
				throw parseError(err);
			});
	}
	tokenLink(provider, accessToken) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Провайдер ${provider} не поддержан.` });
		}
		const linkURL = `${this._config.baseUrl}/${provider}/link/token`;
		return this._http.post(linkURL, { access_token: accessToken })
			.then(res => res.data)
			.catch(err => {
				throw parseError(err);
			});
	}
	link(provider) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Провайдер ${provider} не поддержан.` });
		}
		if (this.authenticated()) {
			const session = this.getSession();
			const token = `bearer_token=${session.token}:${session.password}`;
			const linkURL = `${this._config.socialUrl}/${provider}/link?${token}`;
			const windowTitle = `Link your account to ${capitalizeFirstLetter(provider)}`;
			return this._oAuthPopup(linkURL, { windowTitle });
		}
		return Promise.reject({ error: 'Требуется авторизация' });
	}
	unlink(provider) {
		const providers = this._config.providers;
		if (providers.indexOf(provider) === -1) {
			return Promise.reject({ error: `Провайдер ${provider} не поддержан.` });
		}
		if (this.authenticated()) {
			return this._http.post(`${this._config.baseUrl}/unlink/${provider}`)
				.then(res => res.data)
				.catch(err => {
					throw parseError(err);
				});
		}
		return Promise.reject({ error: 'Требуется авторизация' });
	}
	confirmEmail(token) {
		if (!token || typeof token !== 'string') {
			return Promise.reject({ error: 'Неверный token' });
		}
		return this._http.get(`${this._config.baseUrl}/confirm-email/${token}`)
			.then(res => res.data)
			.catch(err => {
				throw parseError(err);
			});
	}
	forgotPassword(email) {
		return this._http.post(`${this._config.baseUrl}/forgot-password`, { email }, { skipRefresh: true })
			.then(res => res.data)
			.catch(err => {
				throw parseError(err);
			});
	}
	resetPassword(form) {
		return this._http.post(`${this._config.baseUrl}/password-reset`, form, { skipRefresh: true })
			.then(res => {
				if (res.data.user_id && res.data.token) {
					this.setSession(res.data);
					this._onLogin(res.data);
				}
				return res.data;
			})
			.catch(err => {
				throw parseError(err);
			});
	}
	changePassword(form) {
		if (this.authenticated()) {
			return this._http.post(`${this._config.baseUrl}/password-change`, form)
				.then(res => res.data)
				.catch(err => {
					throw parseError(err);
				});
		}
		return Promise.reject({ error: 'Требуется авторизация' });
	}
	changeEmail(newEmail) {
		if (this.authenticated()) {
			return this._http.post(`${this._config.baseUrl}/change-email`, { newEmail })
				.then(res => res.data)
				.catch(err => {
					throw parseError(err);
				});
		}
		return Promise.reject({ error: 'Требуется авторизация' });
	}
	validateUsername(username) {
		return this._http.get(`${this._config.baseUrl}/validate-username/${encodeURIComponent(username)}`)
			.then(() => true)
			.catch(err => {
				throw parseError(err);
			});
	}
	validateEmail(email) {
		return this._http.get(`${this._config.baseUrl}/validate-email/${encodeURIComponent(email)}`)
			.then(() => true)
			.catch(err => {
				throw parseError(err);
			});
	}
	_oAuthPopup(url, options) {
		return new Promise((resolve, reject) => {
			this._oauthComplete = false;
			options.windowName = options.windowTitle ||	'Social Login';
			options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=600';
			const _oauthWindow = window.open(url, options.windowName, options.windowOptions);
			if (!_oauthWindow) {
				reject({ error: 'Окно авторизации заблокировано' });
			}
			const _oauthInterval = setInterval(() => {
				if (_oauthWindow.closed) {
					clearInterval(_oauthInterval);
					if (!this._oauthComplete) {
						this.authComplete = true;
						reject({ error: 'Авторизация отменена' });
					}
				}
			}, 500);
			window.superlogin = {};
			window.superlogin.oauthSession = (error, session, link) => {
				if (!error && session) {
					session.serverTimeDiff = session.issued - Date.now();
					this.setSession(session);
					this._onLogin(session);
					return resolve(session);
				} else if (!error && link) {
					this._onLink(link);
					return resolve(`Установлена связь с ${capitalizeFirstLetter(link)}`);
				}
				this._oauthComplete = true;
				return reject(error);
			};
		});
	}
	_onLogin(msg) {
		debug.info('Login', msg);
		this.emit('login', msg);
	}
	_onLogout(msg) {
		this.deleteSession();
		debug.info('Logout', msg);
		this.emit('logout', msg);
	}
	_onLink(msg) {
		debug.info('Link', msg);
		this.emit('link', msg);
	}
	_onRegister(msg) {
		debug.info('Register', msg);
		this.emit('register', msg);
	}
	_onRefresh(msg) {
		debug.info('Refresh', msg);
		this.emit('refresh', msg);
	}
}
var superlogin = new Superlogin();

var adapter = (constructor) => {
  const {classes} = constructor;
  classes.AdapterPouch = class AdapterPouchSuperlogin extends classes.AdapterPouch {
    after_init() {
      const {props, local, remote, authorized, $p: {superlogin}} = this;
      const opts = {skip_setup: true, adapter: 'http'};
      const bases = new Map();
      const check = [];
      props.autologin.forEach((name) => {
        if(!remote[name]) {
          bases.set(name, new PouchDB(authorized ? this.dbpath(name) : super.dbpath(name), opts));
          check.push(bases.get(name).info());
        }
      });
      return Promise.all(check)
        .catch(() => {
          const close = [];
          bases.forEach((value) => close.push(value.close()));
          return Promise.all(close)
            .then(() => superlogin.logout())
            .then(() => {
              bases.clear();
              check.length = [];
              props.autologin.forEach((name) => {
                if(!remote[name]) {
                  bases.set(name, new PouchDB(super.dbpath(name), opts));
                  check.push(bases.get(name).info());
                }
              });
            })
            .then(() => Promise.all(check));
        })
        .then(() => {
          bases.forEach((value, key) => remote[key] = value);
        })
        .then(() => {
          if(bases.get('ram')) {
            this.run_sync('ram')
              .then(() => {
                if(local._loading) {
                  return new Promise((resolve, reject) => {
                    this.once('pouch_data_loaded', resolve);
                  });
                }
                else if(!props.user_node) {
                  return this.call_data_loaded();
                }
              });
          }
        })
        .then(() => this.emit_async('pouch_autologin', true));
    }
    recreate(name) {
      if(name === 'doc' || name === 'ram') {
        return;
      }
      const {remote} = this;
      const url = this.dbpath(name);
      if(url && (!remote[name] || remote[name].name !== url)) {
        remote[name] && remote[name].close();
        remote[name] = new PouchDB(url, {skip_setup: true, adapter: 'http'});
      }
    }
    log_in(username, password) {
      const {props, local, remote, $p, authorized} = this;
      const {job_prm, wsql, aes, md, superlogin} = $p;
      const start = authorized ?
        superlogin.refresh()
          .catch(() => {
            superlogin.logout()
              .then(() => superlogin.login({username, password}));
          })
        :
        superlogin.login({username, password})
          .catch((err) => {
            this.emit('user_log_fault', {message: 'custom', text: err.message});
            return Promise.reject(err);
          });
      return start.then((session) => {
        if(!session) {
          const err = new Error('empty login or password');
          this.emit('user_log_fault', err);
          return Promise.reject(err);
        }
        if(this.props._auth) {
          if(this.props._auth.username == username) {
            return Promise.resolve();
          }
          else {
            const err = new Error('need logout first');
            this.emit('user_log_fault', err);
            return Promise.reject(err);
          }
        }
        super.after_init();
        for(const name of props.autologin) {
          this.recreate(name);
        }
        for(const id in session.userDBs) {
          this.recreate(id.replace(/.*_/, ''));
        }
        if(wsql.get_user_param('user_name') != session.user_id) {
          wsql.set_user_param('user_name', session.user_id);
        }
        this.emit_async('user_log_in', session.user_id);
        return this.emit_promise('on_log_in')
          .then(() => this.after_log_in())
          .catch(err => {
            this.emit('user_log_fault', err);
          });
      });
    }
    dbpath(name) {
      if(name === 'pgsql') return super.dbpath(name);
      const isMeta = name === 'meta';
      let {$p: {superlogin}, props: {path, prefix, zone}} = this;
      let url = superlogin.getDbUrl(prefix + (isMeta ? name : (zone + '_' + name)));
      let localhost = 'localhost:5984/' + prefix;
      if(!url) {
        url = superlogin.getDbUrl(name);
        if(url) {
          const regex = new RegExp(prefix + '$');
          path = path.replace(regex, '');
          localhost = localhost.replace(regex, '');
        }
      }
      if(!url) {
        url = superlogin.getDbUrl(prefix + zone + '_doc');
        const pos = url.indexOf(prefix + (isMeta ? name : (zone + '_doc')));
        url = url.substr(0, pos) + prefix + (isMeta ? name : (zone + '_' + name));
        localhost = 'localhost:5984/' + prefix;
      }
      if(url.indexOf(localhost) !== -1) {
        const https = path.indexOf('https://') !== -1;
        if(https){
          url = url.replace('http://', 'https://');
        }
        url = url.replace(localhost, path.substr(https ? 8 : 7));
      }
      return url;
    }
    get authorized() {
      const session = $p.superlogin.getSession();
      return session && session.user_id;
    }
  };
};

var default_config = {
  baseUrl: 'http://localhost:3000/auth/',
  endpoints: ['api.example.com'],
  noDefaultEndpoint: false,
  storage: 'local',
  providers: ['google', 'yandex', 'github', 'facebook'],
  checkExpired: false,
  refreshThreshold: 0.5
};

const {metaActions} = require('metadata-redux');
function needAuth() {
  return Promise.reject({error: 'Требуется авторизация'});
}
function postWithAuth(url, body) {
  return superlogin.authenticated() ?
    superlogin._http.post(url, body)
      .then(res => res.data && superlogin.refresh_profile(res.data))
    :
    needAuth();
}
function attach($p) {
  const {cat, utils, wsql, adapters: {pouch}} = $p;
  superlogin.on('login', function (event, session) {
  });
  superlogin.on('logout', function (event, message) {
  });
  superlogin.on('refresh', function (event, newSession) {
  });
  superlogin.on('link', function (event, provider) {
  });
  superlogin.create_user = function () {
    const session = this.getSession();
    if(session) {
      const attr = {
        id: session.user_id,
        ref: session.profile && session.profile.ref ? session.profile.ref : utils.generate_guid(),
        name: session.profile && session.profile.name ? session.profile.name : session.user_id,
      };
      return cat.users.create(attr, false, true);
    }
  };
  superlogin.change_name = function (newName) {
    if(this.authenticated()) {
      const session = this.getSession();
      return session.profile.name == newName ?
        Promise.resolve() :
        this._http.post(`/user/change-name`, {newName})
          .then(res => {
            session.profile.name = newName;
            this.setSession(session);
            return res.data;
          });
    }
    return needAuth();
  };
  superlogin.change_subscription = function (subscription) {
    if(this.authenticated()) {
      const session = this.getSession();
      return session.profile.subscription == subscription ?
        Promise.resolve() :
        this._http.post(`/user/change-subscription`, {subscription})
          .then(res => {
            session.profile.subscription = subscription;
            this.setSession(session);
            return res.data;
          });
    }
    return needAuth();
  };
  superlogin.refresh_profile = function(profile) {
    const session = superlogin.getSession();
    if(session) {
      Object.assign(session, {profile});
      return superlogin.setSession(session);
    }
  };
  superlogin.create_db = function (name) {
    return postWithAuth('/user/create-db', {name});
  };
  superlogin.add_user = function (name) {
    return postWithAuth('/user/add-user', {name});
  };
  superlogin.rm_user = function (name) {
    return postWithAuth('/user/rm-user', {name});
  };
  superlogin.shared_users = function () {
    return superlogin._http.post('/user/shared-users', {});
  };
  superlogin.share_db = function (name, db) {
    return postWithAuth('/user/share-db', {name, db});
  };
  superlogin.unshare_db = function (name, db) {
    return postWithAuth('/user/unshare-db', {name, db});
  };
  function handleSocialAuth(provider) {
    return function (dispatch, getState) {
      if(superlogin.authenticated()) {
        return superlogin.link(provider)
          .then((res) => {
          })
          .catch((err) => {
          });
      }
      dispatch({
        type: metaActions.types.USER_TRY_LOG_IN,
        payload: {name: 'oauth', provider: provider}
      });
      return superlogin.socialAuth(provider)
        .then((session) => {
          return pouch.log_in(session.token, session.password);
        })
        .catch((err) => {
          return pouch.log_out()
            .then(() => {
              if(typeof err === 'string' && err.indexOf('newAccount') !== -1) {
                const text = `Пользователь '${err.substr(11)}' провайдера '${provider}' не связан с пользователем сервиса.
                Для авторизации oAuth, зарегистрируйтесь через логин/пароль и свяжите учётную запись сервиса с провайдером социальной сети`;
                dispatch(metaActions.USER_LOG_ERROR({message: 'custom', text}));
              }
            });
        });
    };
  }
  function handleLogin(login, password) {
    return metaActions.USER_TRY_LOG_IN(pouch, login, password);
  }
  function handleLogOut() {
    return function (dispatch, getState) {
      pouch.log_out()
        .then(() => superlogin.logout())
        .then(() => dispatch({
          type: metaActions.types.USER_LOG_OUT,
          payload: {name: getState().meta.user.name}
        }));
    };
  }
  function handleRegister(registration) {
    return function (dispatch) {
      const {username, email, password, confirmPassword} = registration;
      if(!password || password.length < 6) {
        return dispatch(metaActions.USER_LOG_ERROR({message: 'custom', text: 'Длина пароля должна быть не менее 6 символов'}));
      }
      else if(password !== confirmPassword) {
        return dispatch(metaActions.USER_LOG_ERROR({message: 'custom', text: 'Не совпадают пароль и подтверждение пароля'}));
      }
      return superlogin.validateUsername(username)
        .catch((err) => {
          dispatch(metaActions.USER_LOG_ERROR(
            err.message && err.message.match(/(time|network)/i) ? err : {message: 'custom', text: err.error ? err.error : 'Ошибка при проверке имени пользователя'}
          ));
        })
        .then((ok) => ok && superlogin.validateEmail(email))
        .catch((err) => {
          dispatch(metaActions.USER_LOG_ERROR(
            err.message && err.message.match(/(time|network)/i) ? err : {message: 'custom', text: err.error ? err.error : 'Email error'}
          ));
        })
        .then((ok) => ok && superlogin.register(registration))
        .then((reg) => {
          if(reg) {
            if(reg.success) {
              if(superlogin.getConfig().email.requireEmailConfirm) {
                dispatch(metaActions.USER_LOG_ERROR({message: 'custom', text: 'info:Создана учетная запись. Проверьте почтовый ящик для активации'}));
              }
              else {
                return superlogin.authenticated() ? superlogin.getSession() :
                  superlogin.login({username, password}).then((session) => {
                    return superlogin.getSession();
                  });
              }
            }
            else {
              dispatch(metaActions.USER_LOG_ERROR({message: 'custom', text: reg.error ? reg.error : 'Registration error'}));
            }
          }
        })
        .then((session) => {
          return session && pouch.log_in(session.username, session.password);
        })
        .catch((err) => {
          const {validationErrors} = err;
          if(validationErrors) {
            err.error = validationErrors[Object.keys(validationErrors)[0]];
          }
          dispatch(metaActions.USER_LOG_ERROR({message: 'custom', text: err.error ? err.error : 'Registration error'}));
        });
    };
  }
  function handleForgotPassword() {
    return superlogin.forgotPassword(email)
      .then(function () {
        toasty('Check your email!');
      }, function (err) {
        if(err) {
          console.error(err);
        }
      });
  }
  function handleCheckUsername(name) {
  }
  function handlecheckEmail(email) {
  }
  function handleSetPrm(attr) {
    for (const key in attr) {
      wsql.set_user_param(key, attr[key]);
    }
    return metaActions.PRM_CHANGE(attr);
  }
  Object.defineProperty($p, 'superlogin', {
    get: function () {
      return superlogin;
    }
  });
  superlogin._actions = {
    handleSocialAuth,
    handleLogin,
    handleLogOut,
    handleRegister,
    handleForgotPassword,
    handleCheckUsername,
    handlecheckEmail,
    handleSetPrm,
  };
  superlogin._init = function (store) {
    pouch.on('superlogin_log_in', () => {
      const user_name = superlogin.getSession().user_id;
      if(cat.users) {
        cat.users.find_rows_remote({
          _view: 'doc/number_doc',
          _key: {
            startkey: ['cat.users', 0, user_name],
            endkey: ['cat.users', 0, user_name]
          }
        }).then(function (res) {
          if(res.length) {
            return res[0];
          }
          else {
            let user = cat.users.create({
              ref: utils.generate_guid(),
              id: user_name
            });
            return user.save();
          }
        })
          .then(function () {
            store.dispatch(metaActions.USER_LOG_IN(user_name));
          });
      }
      else {
        store.dispatch(metaActions.USER_LOG_IN(user_name));
      }
    });
  };
}
function plugin(config = default_config) {
  return {
    proto(constructor) {
      adapter(constructor);
    },
    constructor() {
      const baseUrl = this.wsql.get_user_param('superlogin_path', 'string');
      if(baseUrl){
        config.baseUrl = baseUrl;
      }
      superlogin.configure(config);
      attach(this);
    }
  };
}

module.exports = plugin;
//# sourceMappingURL=index.js.map
