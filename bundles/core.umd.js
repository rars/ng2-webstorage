(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
    (factory((global.ng2Webstorage = global.ng2Webstorage || {}),global.ng.core));
}(this, (function (exports,_angular_core) { 'use strict';

var STORAGE;
(function (STORAGE) {
    STORAGE[STORAGE["local"] = 0] = "local";
    STORAGE[STORAGE["session"] = 1] = "session";
})(STORAGE || (STORAGE = {}));

var _a;
var LIB_KEY = 'ng2-webstorage';
var LIB_KEY_SEPARATOR = '|';
var LIB_KEY_CASE_SENSITIVE = false;
var STORAGE_NAMES = (_a = {},
    _a[STORAGE.local] = 'local',
    _a[STORAGE.session] = 'session',
    _a);

var CUSTOM_LIB_KEY = LIB_KEY;
var CUSTOM_LIB_KEY_SEPARATOR = LIB_KEY_SEPARATOR;
var CUSTOM_LIB_KEY_CASE_SENSITIVE = LIB_KEY_CASE_SENSITIVE;
function isManagedKey(sKey) {
    return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
}
var KeyStorageHelper = /** @class */ (function () {
    function KeyStorageHelper() {
    }
    KeyStorageHelper.isManagedKey = function (sKey) {
        return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
    };
    KeyStorageHelper.retrieveKeysFromStorage = function (storage) {
        return Object.keys(storage).filter(isManagedKey);
    };
    KeyStorageHelper.genKey = function (raw) {
        if (typeof raw !== 'string')
            throw Error('attempt to generate a storage key with a non string value');
        return "" + CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR + this.formatKey(raw);
    };
    KeyStorageHelper.formatKey = function (raw) {
        var key = raw.toString();
        return CUSTOM_LIB_KEY_CASE_SENSITIVE ? key : key.toLowerCase();
    };
    KeyStorageHelper.setStorageKeyPrefix = function (key) {
        if (key === void 0) { key = LIB_KEY; }
        CUSTOM_LIB_KEY = key;
    };
    KeyStorageHelper.setCaseSensitivity = function (enable) {
        if (enable === void 0) { enable = LIB_KEY_CASE_SENSITIVE; }
        CUSTOM_LIB_KEY_CASE_SENSITIVE = enable;
    };
    KeyStorageHelper.setStorageKeySeparator = function (separator) {
        if (separator === void 0) { separator = LIB_KEY_SEPARATOR; }
        CUSTOM_LIB_KEY_SEPARATOR = separator;
    };
    return KeyStorageHelper;
}());

var StorageObserverHelper = /** @class */ (function () {
    function StorageObserverHelper() {
    }
    StorageObserverHelper.observe = function (sType, sKey) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            return this.observers[oKey];
        return this.observers[oKey] = new _angular_core.EventEmitter();
    };
    StorageObserverHelper.emit = function (sType, sKey, value) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            this.observers[oKey].emit(value);
    };
    StorageObserverHelper.genObserverKey = function (sType, sKey) {
        return sType + '|' + sKey;
    };
    StorageObserverHelper.initStorage = function () {
        StorageObserverHelper.storageInitStream.emit(true);
    };
    StorageObserverHelper.observers = {};
    StorageObserverHelper.storageInitStream = new _angular_core.EventEmitter();
    StorageObserverHelper.storageInit$ = StorageObserverHelper.storageInitStream.asObservable();
    return StorageObserverHelper;
}());

var MockStorageHelper = /** @class */ (function () {
    function MockStorageHelper() {
    }
    MockStorageHelper.isSecuredField = function (field) {
        return !!~MockStorageHelper.securedFields.indexOf(field);
    };
    MockStorageHelper.getStorage = function (sType) {
        if (!this.mockStorages[sType])
            this.mockStorages[sType] = MockStorageHelper.generateStorage();
        return this.mockStorages[sType];
    };
    MockStorageHelper.generateStorage = function () {
        var storage = {};
        Object.defineProperties(storage, {
            setItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key, value) {
                    if (!MockStorageHelper.isSecuredField(key))
                        this[key] = value;
                },
            },
            getItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    return !MockStorageHelper.isSecuredField(key) ? this[key] || null : null;
                },
            },
            removeItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    if (!MockStorageHelper.isSecuredField(key))
                        delete this[key];
                },
            },
            length: {
                enumerable: false,
                configurable: false,
                get: function () {
                    return Object.keys(this).length;
                }
            }
        });
        return storage;
    };
    MockStorageHelper.securedFields = ['setItem', 'getItem', 'removeItem', 'length'];
    MockStorageHelper.mockStorages = {};
    return MockStorageHelper;
}());

var _a$1;
var _b;
var CACHED = (_a$1 = {}, _a$1[STORAGE.local] = {}, _a$1[STORAGE.session] = {}, _a$1);
var STORAGE_AVAILABILITY = (_b = {}, _b[STORAGE.local] = null, _b[STORAGE.session] = null, _b);
var WebStorageHelper = /** @class */ (function () {
    function WebStorageHelper() {
    }
    WebStorageHelper.store = function (sType, sKey, value) {
        this.getStorage(sType).setItem(sKey, JSON.stringify(value));
        CACHED[sType][sKey] = value;
        StorageObserverHelper.emit(sType, sKey, value);
    };
    WebStorageHelper.retrieve = function (sType, sKey) {
        if (sKey in CACHED[sType])
            return CACHED[sType][sKey];
        var value = WebStorageHelper.retrieveFromStorage(sType, sKey);
        if (value !== null)
            CACHED[sType][sKey] = value;
        return value;
    };
    WebStorageHelper.retrieveFromStorage = function (sType, sKey) {
        var data = null;
        try {
            data = JSON.parse(this.getStorage(sType).getItem(sKey));
        }
        catch (err) {
            console.warn("invalid value for " + sKey);
        }
        return data;
    };
    WebStorageHelper.refresh = function (sType, sKey) {
        if (!KeyStorageHelper.isManagedKey(sKey))
            return;
        var value = WebStorageHelper.retrieveFromStorage(sType, sKey);
        if (value === null) {
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        }
        else if (value !== CACHED[sType][sKey]) {
            CACHED[sType][sKey] = value;
            StorageObserverHelper.emit(sType, sKey, value);
        }
    };
    WebStorageHelper.refreshAll = function (sType) {
        Object.keys(CACHED[sType]).forEach(function (sKey) { return WebStorageHelper.refresh(sType, sKey); });
    };
    WebStorageHelper.clearAll = function (sType) {
        var storage = this.getStorage(sType);
        KeyStorageHelper.retrieveKeysFromStorage(storage)
            .forEach(function (sKey) {
            storage.removeItem(sKey);
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        });
    };
    WebStorageHelper.clear = function (sType, sKey) {
        this.getStorage(sType).removeItem(sKey);
        delete CACHED[sType][sKey];
        StorageObserverHelper.emit(sType, sKey, null);
    };
    WebStorageHelper.getStorage = function (sType) {
        if (this.isStorageAvailable(sType))
            return this.getWStorage(sType);
        else
            return MockStorageHelper.getStorage(sType);
    };
    WebStorageHelper.getWStorage = function (sType) {
        var storage;
        switch (sType) {
            case STORAGE.local:
                storage = localStorage;
                break;
            case STORAGE.session:
                storage = sessionStorage;
                break;
            default:
                throw Error('invalid storage type');
        }
        return storage;
    };
    WebStorageHelper.isStorageAvailable = function (sType) {
        if (typeof STORAGE_AVAILABILITY[sType] === 'boolean')
            return STORAGE_AVAILABILITY[sType];
        var isAvailable = true, storage;
        try {
            storage = this.getWStorage(sType);
            if (typeof storage === 'object') {
                storage.setItem('test-storage', 'foobar');
                storage.removeItem('test-storage');
            }
            else
                isAvailable = false;
        }
        catch (e) {
            isAvailable = false;
        }
        if (!isAvailable)
            console.warn(STORAGE_NAMES[sType] + " storage unavailable, Ng2Webstorage will use a fallback strategy instead");
        return STORAGE_AVAILABILITY[sType] = isAvailable;
    };
    return WebStorageHelper;
}());

var WebStorageService = /** @class */ (function () {
    function WebStorageService(sType) {
        if (sType === void 0) { sType = null; }
        this.sType = sType;
        this.sType = sType;
    }
    WebStorageService.prototype.store = function (raw, value) {
        var sKey = KeyStorageHelper.genKey(raw);
        WebStorageHelper.store(this.sType, sKey, value);
    };
    WebStorageService.prototype.retrieve = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return WebStorageHelper.retrieve(this.sType, sKey);
    };
    WebStorageService.prototype.clear = function (raw) {
        if (raw)
            WebStorageHelper.clear(this.sType, KeyStorageHelper.genKey(raw));
        else
            WebStorageHelper.clearAll(this.sType);
    };
    WebStorageService.prototype.observe = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return StorageObserverHelper.observe(this.sType, sKey);
    };
    WebStorageService.prototype.isStorageAvailable = function () {
        return WebStorageHelper.isStorageAvailable(this.sType);
    };
    return WebStorageService;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LocalStorageService = /** @class */ (function (_super) {
    __extends(LocalStorageService, _super);
    function LocalStorageService() {
        return _super.call(this, STORAGE.local) || this;
    }
    LocalStorageService = __decorate$1([
        _angular_core.Injectable(),
        __metadata$1("design:paramtypes", [])
    ], LocalStorageService);
    return LocalStorageService;
}(WebStorageService));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$2 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SessionStorageService = /** @class */ (function (_super) {
    __extends$1(SessionStorageService, _super);
    function SessionStorageService() {
        return _super.call(this, STORAGE.session) || this;
    }
    SessionStorageService = __decorate$2([
        _angular_core.Injectable(),
        __metadata$2("design:paramtypes", [])
    ], SessionStorageService);
    return SessionStorageService;
}(WebStorageService));

var WebstorageConfig = /** @class */ (function () {
    function WebstorageConfig(config) {
        this.prefix = LIB_KEY;
        this.separator = LIB_KEY_SEPARATOR;
        this.caseSensitive = LIB_KEY_CASE_SENSITIVE;
        if (config && config.prefix !== undefined) {
            this.prefix = config.prefix;
        }
        if (config && config.separator !== undefined) {
            this.separator = config.separator;
        }
        if (config && config.caseSensitive !== undefined) {
            this.caseSensitive = config.caseSensitive;
        }
    }
    return WebstorageConfig;
}());

function WebStorage(webSKey, sType, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, sType, targetedClass, raw, defaultValue);
    };
}
function WebStorageDecorator(webSKey, sType, targetedClass, raw, defaultValue) {
    var key = webSKey || raw;
    Object.defineProperty(targetedClass, raw, {
        get: function () {
            var sKey = KeyStorageHelper.genKey(key);
            return WebStorageHelper.retrieve(sType, sKey);
        },
        set: function (value) {
            var sKey = KeyStorageHelper.genKey(key);
            this[sKey] = value;
            WebStorageHelper.store(sType, sKey, value);
        }
    });
    if (targetedClass[raw] === null && defaultValue !== undefined) {
        var sub_1 = StorageObserverHelper.storageInit$.subscribe(function () {
            targetedClass[raw] = defaultValue;
            sub_1.unsubscribe();
        });
    }
}

function LocalStorage(webSKey, defaultValue) {
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.local, targetedClass, raw, defaultValue);
    };
}

function SessionStorage(webSKey, defaultValue) {
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.session, targetedClass, raw, defaultValue);
    };
}

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WEBSTORAGE_CONFIG = new _angular_core.InjectionToken('WEBSTORAGE_CONFIG');
var Ng2Webstorage = /** @class */ (function () {
    function Ng2Webstorage(ngZone, config) {
        this.ngZone = ngZone;
        if (config) {
            KeyStorageHelper.setStorageKeyPrefix(config.prefix);
            KeyStorageHelper.setStorageKeySeparator(config.separator);
            KeyStorageHelper.setCaseSensitivity(config.caseSensitive);
        }
        this.initStorageListener();
        StorageObserverHelper.initStorage();
    }
    Ng2Webstorage_1 = Ng2Webstorage;
    Ng2Webstorage.forRoot = function (config) {
        return {
            ngModule: Ng2Webstorage_1,
            providers: [
                {
                    provide: WEBSTORAGE_CONFIG,
                    useValue: config
                },
                {
                    provide: WebstorageConfig,
                    useFactory: provideConfig,
                    deps: [
                        WEBSTORAGE_CONFIG
                    ]
                }
            ]
        };
    };
    Ng2Webstorage.prototype.initStorageListener = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', function (event) { return _this.ngZone.run(function () {
                var storage = window.sessionStorage === event.storageArea ? STORAGE.session : STORAGE.local;
                if (event.key === null)
                    WebStorageHelper.refreshAll(storage);
                else
                    WebStorageHelper.refresh(storage, event.key);
            }); });
        }
    };
    var Ng2Webstorage_1;
    Ng2Webstorage = Ng2Webstorage_1 = __decorate([
        _angular_core.NgModule({
            declarations: [],
            providers: [SessionStorageService, LocalStorageService],
            imports: []
        }),
        __param(1, _angular_core.Optional()), __param(1, _angular_core.Inject(WebstorageConfig)),
        __metadata("design:paramtypes", [_angular_core.NgZone, WebstorageConfig])
    ], Ng2Webstorage);
    return Ng2Webstorage;
}());
function provideConfig(config) {
    return new WebstorageConfig(config);
}

exports.WEBSTORAGE_CONFIG = WEBSTORAGE_CONFIG;
exports.Ng2Webstorage = Ng2Webstorage;
exports.provideConfig = provideConfig;
exports.WebstorageConfig = WebstorageConfig;
exports.LocalStorage = LocalStorage;
exports.SessionStorage = SessionStorage;
exports.WebStorage = WebStorage;
exports.WebStorageDecorator = WebStorageDecorator;
exports.WebStorageService = WebStorageService;
exports.LocalStorageService = LocalStorageService;
exports.SessionStorageService = SessionStorageService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2Rpc3QvZW51bXMvc3RvcmFnZS5qcyIsIi4uL2Rpc3QvY29uc3RhbnRzL2xpYi5qcyIsIi4uL2Rpc3QvaGVscGVycy9rZXlTdG9yYWdlLmpzIiwiLi4vZGlzdC9oZWxwZXJzL3N0b3JhZ2VPYnNlcnZlci5qcyIsIi4uL2Rpc3QvaGVscGVycy9tb2NrU3RvcmFnZS5qcyIsIi4uL2Rpc3QvaGVscGVycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy9sb2NhbFN0b3JhZ2UuanMiLCIuLi9kaXN0L3NlcnZpY2VzL3Nlc3Npb25TdG9yYWdlLmpzIiwiLi4vZGlzdC9pbnRlcmZhY2VzL2NvbmZpZy5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9kZWNvcmF0b3JzL2xvY2FsU3RvcmFnZS5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy9zZXNzaW9uU3RvcmFnZS5qcyIsIi4uL2Rpc3QvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB2YXIgU1RPUkFHRTtcclxuKGZ1bmN0aW9uIChTVE9SQUdFKSB7XHJcbiAgICBTVE9SQUdFW1NUT1JBR0VbXCJsb2NhbFwiXSA9IDBdID0gXCJsb2NhbFwiO1xyXG4gICAgU1RPUkFHRVtTVE9SQUdFW1wic2Vzc2lvblwiXSA9IDFdID0gXCJzZXNzaW9uXCI7XHJcbn0pKFNUT1JBR0UgfHwgKFNUT1JBR0UgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdG9yYWdlLmpzLm1hcCIsInZhciBfYTtcclxuaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xyXG5leHBvcnQgdmFyIExJQl9LRVkgPSAnbmcyLXdlYnN0b3JhZ2UnO1xyXG5leHBvcnQgdmFyIExJQl9LRVlfU0VQQVJBVE9SID0gJ3wnO1xyXG5leHBvcnQgdmFyIExJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgPSBmYWxzZTtcclxuZXhwb3J0IHZhciBTVE9SQUdFX05BTUVTID0gKF9hID0ge30sXHJcbiAgICBfYVtTVE9SQUdFLmxvY2FsXSA9ICdsb2NhbCcsXHJcbiAgICBfYVtTVE9SQUdFLnNlc3Npb25dID0gJ3Nlc3Npb24nLFxyXG4gICAgX2EpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1saWIuanMubWFwIiwiaW1wb3J0IHsgTElCX0tFWSwgTElCX0tFWV9DQVNFX1NFTlNJVElWRSwgTElCX0tFWV9TRVBBUkFUT1IgfSBmcm9tICcuLi9jb25zdGFudHMvbGliJztcclxudmFyIENVU1RPTV9MSUJfS0VZID0gTElCX0tFWTtcclxudmFyIENVU1RPTV9MSUJfS0VZX1NFUEFSQVRPUiA9IExJQl9LRVlfU0VQQVJBVE9SO1xyXG52YXIgQ1VTVE9NX0xJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgPSBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFO1xyXG5leHBvcnQgZnVuY3Rpb24gaXNNYW5hZ2VkS2V5KHNLZXkpIHtcclxuICAgIHJldHVybiBzS2V5LmluZGV4T2YoQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IpID09PSAwO1xyXG59XHJcbnZhciBLZXlTdG9yYWdlSGVscGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gS2V5U3RvcmFnZUhlbHBlcigpIHtcclxuICAgIH1cclxuICAgIEtleVN0b3JhZ2VIZWxwZXIuaXNNYW5hZ2VkS2V5ID0gZnVuY3Rpb24gKHNLZXkpIHtcclxuICAgICAgICByZXR1cm4gc0tleS5pbmRleE9mKENVU1RPTV9MSUJfS0VZICsgQ1VTVE9NX0xJQl9LRVlfU0VQQVJBVE9SKSA9PT0gMDtcclxuICAgIH07XHJcbiAgICBLZXlTdG9yYWdlSGVscGVyLnJldHJpZXZlS2V5c0Zyb21TdG9yYWdlID0gZnVuY3Rpb24gKHN0b3JhZ2UpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoc3RvcmFnZSkuZmlsdGVyKGlzTWFuYWdlZEtleSk7XHJcbiAgICB9O1xyXG4gICAgS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkgPSBmdW5jdGlvbiAocmF3KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiByYXcgIT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignYXR0ZW1wdCB0byBnZW5lcmF0ZSBhIHN0b3JhZ2Uga2V5IHdpdGggYSBub24gc3RyaW5nIHZhbHVlJyk7XHJcbiAgICAgICAgcmV0dXJuIFwiXCIgKyBDVVNUT01fTElCX0tFWSArIENVU1RPTV9MSUJfS0VZX1NFUEFSQVRPUiArIHRoaXMuZm9ybWF0S2V5KHJhdyk7XHJcbiAgICB9O1xyXG4gICAgS2V5U3RvcmFnZUhlbHBlci5mb3JtYXRLZXkgPSBmdW5jdGlvbiAocmF3KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IHJhdy50b1N0cmluZygpO1xyXG4gICAgICAgIHJldHVybiBDVVNUT01fTElCX0tFWV9DQVNFX1NFTlNJVElWRSA/IGtleSA6IGtleS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfTtcclxuICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0U3RvcmFnZUtleVByZWZpeCA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICBpZiAoa2V5ID09PSB2b2lkIDApIHsga2V5ID0gTElCX0tFWTsgfVxyXG4gICAgICAgIENVU1RPTV9MSUJfS0VZID0ga2V5O1xyXG4gICAgfTtcclxuICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0Q2FzZVNlbnNpdGl2aXR5ID0gZnVuY3Rpb24gKGVuYWJsZSkge1xyXG4gICAgICAgIGlmIChlbmFibGUgPT09IHZvaWQgMCkgeyBlbmFibGUgPSBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFOyB9XHJcbiAgICAgICAgQ1VTVE9NX0xJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgPSBlbmFibGU7XHJcbiAgICB9O1xyXG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5U2VwYXJhdG9yID0gZnVuY3Rpb24gKHNlcGFyYXRvcikge1xyXG4gICAgICAgIGlmIChzZXBhcmF0b3IgPT09IHZvaWQgMCkgeyBzZXBhcmF0b3IgPSBMSUJfS0VZX1NFUEFSQVRPUjsgfVxyXG4gICAgICAgIENVU1RPTV9MSUJfS0VZX1NFUEFSQVRPUiA9IHNlcGFyYXRvcjtcclxuICAgIH07XHJcbiAgICByZXR1cm4gS2V5U3RvcmFnZUhlbHBlcjtcclxufSgpKTtcclxuZXhwb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1rZXlTdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG52YXIgU3RvcmFnZU9ic2VydmVySGVscGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gU3RvcmFnZU9ic2VydmVySGVscGVyKCkge1xyXG4gICAgfVxyXG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmUgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcclxuICAgICAgICB2YXIgb0tleSA9IHRoaXMuZ2VuT2JzZXJ2ZXJLZXkoc1R5cGUsIHNLZXkpO1xyXG4gICAgICAgIGlmIChvS2V5IGluIHRoaXMub2JzZXJ2ZXJzKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZlcnNbb0tleV07XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2JzZXJ2ZXJzW29LZXldID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gICAgfTtcclxuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5LCB2YWx1ZSkge1xyXG4gICAgICAgIHZhciBvS2V5ID0gdGhpcy5nZW5PYnNlcnZlcktleShzVHlwZSwgc0tleSk7XHJcbiAgICAgICAgaWYgKG9LZXkgaW4gdGhpcy5vYnNlcnZlcnMpXHJcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzW29LZXldLmVtaXQodmFsdWUpO1xyXG4gICAgfTtcclxuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5nZW5PYnNlcnZlcktleSA9IGZ1bmN0aW9uIChzVHlwZSwgc0tleSkge1xyXG4gICAgICAgIHJldHVybiBzVHlwZSArICd8JyArIHNLZXk7XHJcbiAgICB9O1xyXG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmluaXRTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5zdG9yYWdlSW5pdFN0cmVhbS5lbWl0KHRydWUpO1xyXG4gICAgfTtcclxuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5vYnNlcnZlcnMgPSB7fTtcclxuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5zdG9yYWdlSW5pdFN0cmVhbSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5zdG9yYWdlSW5pdCQgPSBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuc3RvcmFnZUluaXRTdHJlYW0uYXNPYnNlcnZhYmxlKCk7XHJcbiAgICByZXR1cm4gU3RvcmFnZU9ic2VydmVySGVscGVyO1xyXG59KCkpO1xyXG5leHBvcnQgeyBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgfTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RvcmFnZU9ic2VydmVyLmpzLm1hcCIsInZhciBNb2NrU3RvcmFnZUhlbHBlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE1vY2tTdG9yYWdlSGVscGVyKCkge1xyXG4gICAgfVxyXG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuaXNTZWN1cmVkRmllbGQgPSBmdW5jdGlvbiAoZmllbGQpIHtcclxuICAgICAgICByZXR1cm4gISF+TW9ja1N0b3JhZ2VIZWxwZXIuc2VjdXJlZEZpZWxkcy5pbmRleE9mKGZpZWxkKTtcclxuICAgIH07XHJcbiAgICBNb2NrU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vY2tTdG9yYWdlc1tzVHlwZV0pXHJcbiAgICAgICAgICAgIHRoaXMubW9ja1N0b3JhZ2VzW3NUeXBlXSA9IE1vY2tTdG9yYWdlSGVscGVyLmdlbmVyYXRlU3RvcmFnZSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vY2tTdG9yYWdlc1tzVHlwZV07XHJcbiAgICB9O1xyXG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuZ2VuZXJhdGVTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzdG9yYWdlID0ge307XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3RvcmFnZSwge1xyXG4gICAgICAgICAgICBzZXRJdGVtOiB7XHJcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIU1vY2tTdG9yYWdlSGVscGVyLmlzU2VjdXJlZEZpZWxkKGtleSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0SXRlbToge1xyXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIU1vY2tTdG9yYWdlSGVscGVyLmlzU2VjdXJlZEZpZWxkKGtleSkgPyB0aGlzW2tleV0gfHwgbnVsbCA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZW1vdmVJdGVtOiB7XHJcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghTW9ja1N0b3JhZ2VIZWxwZXIuaXNTZWN1cmVkRmllbGQoa2V5KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNba2V5XTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGxlbmd0aDoge1xyXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMpLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzdG9yYWdlO1xyXG4gICAgfTtcclxuICAgIE1vY2tTdG9yYWdlSGVscGVyLnNlY3VyZWRGaWVsZHMgPSBbJ3NldEl0ZW0nLCAnZ2V0SXRlbScsICdyZW1vdmVJdGVtJywgJ2xlbmd0aCddO1xyXG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIubW9ja1N0b3JhZ2VzID0ge307XHJcbiAgICByZXR1cm4gTW9ja1N0b3JhZ2VIZWxwZXI7XHJcbn0oKSk7XHJcbmV4cG9ydCB7IE1vY2tTdG9yYWdlSGVscGVyIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1vY2tTdG9yYWdlLmpzLm1hcCIsInZhciBfYSwgX2I7XHJcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcclxuaW1wb3J0IHsgU3RvcmFnZU9ic2VydmVySGVscGVyIH0gZnJvbSAnLi9zdG9yYWdlT2JzZXJ2ZXInO1xyXG5pbXBvcnQgeyBLZXlTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9rZXlTdG9yYWdlJztcclxuaW1wb3J0IHsgTW9ja1N0b3JhZ2VIZWxwZXIgfSBmcm9tICcuL21vY2tTdG9yYWdlJztcclxuaW1wb3J0IHsgU1RPUkFHRV9OQU1FUyB9IGZyb20gJy4uL2NvbnN0YW50cy9saWInO1xyXG52YXIgQ0FDSEVEID0gKF9hID0ge30sIF9hW1NUT1JBR0UubG9jYWxdID0ge30sIF9hW1NUT1JBR0Uuc2Vzc2lvbl0gPSB7fSwgX2EpO1xyXG52YXIgU1RPUkFHRV9BVkFJTEFCSUxJVFkgPSAoX2IgPSB7fSwgX2JbU1RPUkFHRS5sb2NhbF0gPSBudWxsLCBfYltTVE9SQUdFLnNlc3Npb25dID0gbnVsbCwgX2IpO1xyXG52YXIgV2ViU3RvcmFnZUhlbHBlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFdlYlN0b3JhZ2VIZWxwZXIoKSB7XHJcbiAgICB9XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLnN0b3JlID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5LCB2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuZ2V0U3RvcmFnZShzVHlwZSkuc2V0SXRlbShzS2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xyXG4gICAgICAgIENBQ0hFRFtzVHlwZV1bc0tleV0gPSB2YWx1ZTtcclxuICAgICAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuZW1pdChzVHlwZSwgc0tleSwgdmFsdWUpO1xyXG4gICAgfTtcclxuICAgIFdlYlN0b3JhZ2VIZWxwZXIucmV0cmlldmUgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcclxuICAgICAgICBpZiAoc0tleSBpbiBDQUNIRURbc1R5cGVdKVxyXG4gICAgICAgICAgICByZXR1cm4gQ0FDSEVEW3NUeXBlXVtzS2V5XTtcclxuICAgICAgICB2YXIgdmFsdWUgPSBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlRnJvbVN0b3JhZ2Uoc1R5cGUsIHNLZXkpO1xyXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbClcclxuICAgICAgICAgICAgQ0FDSEVEW3NUeXBlXVtzS2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlRnJvbVN0b3JhZ2UgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG51bGw7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UodGhpcy5nZXRTdG9yYWdlKHNUeXBlKS5nZXRJdGVtKHNLZXkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJpbnZhbGlkIHZhbHVlIGZvciBcIiArIHNLZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2ggPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcclxuICAgICAgICBpZiAoIUtleVN0b3JhZ2VIZWxwZXIuaXNNYW5hZ2VkS2V5KHNLZXkpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIHZhbHVlID0gV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZUZyb21TdG9yYWdlKHNUeXBlLCBzS2V5KTtcclxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgZGVsZXRlIENBQ0hFRFtzVHlwZV1bc0tleV07XHJcbiAgICAgICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0KHNUeXBlLCBzS2V5LCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmFsdWUgIT09IENBQ0hFRFtzVHlwZV1bc0tleV0pIHtcclxuICAgICAgICAgICAgQ0FDSEVEW3NUeXBlXVtzS2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuZW1pdChzVHlwZSwgc0tleSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2hBbGwgPSBmdW5jdGlvbiAoc1R5cGUpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyhDQUNIRURbc1R5cGVdKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5KSB7IHJldHVybiBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2goc1R5cGUsIHNLZXkpOyB9KTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyQWxsID0gZnVuY3Rpb24gKHNUeXBlKSB7XHJcbiAgICAgICAgdmFyIHN0b3JhZ2UgPSB0aGlzLmdldFN0b3JhZ2Uoc1R5cGUpO1xyXG4gICAgICAgIEtleVN0b3JhZ2VIZWxwZXIucmV0cmlldmVLZXlzRnJvbVN0b3JhZ2Uoc3RvcmFnZSlcclxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKHNLZXkpIHtcclxuICAgICAgICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKHNLZXkpO1xyXG4gICAgICAgICAgICBkZWxldGUgQ0FDSEVEW3NUeXBlXVtzS2V5XTtcclxuICAgICAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFdlYlN0b3JhZ2VIZWxwZXIuY2xlYXIgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcclxuICAgICAgICB0aGlzLmdldFN0b3JhZ2Uoc1R5cGUpLnJlbW92ZUl0ZW0oc0tleSk7XHJcbiAgICAgICAgZGVsZXRlIENBQ0hFRFtzVHlwZV1bc0tleV07XHJcbiAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xyXG4gICAgfTtcclxuICAgIFdlYlN0b3JhZ2VIZWxwZXIuZ2V0U3RvcmFnZSA9IGZ1bmN0aW9uIChzVHlwZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzU3RvcmFnZUF2YWlsYWJsZShzVHlwZSkpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFdTdG9yYWdlKHNUeXBlKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiBNb2NrU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlKHNUeXBlKTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLmdldFdTdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlKSB7XHJcbiAgICAgICAgdmFyIHN0b3JhZ2U7XHJcbiAgICAgICAgc3dpdGNoIChzVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFNUT1JBR0UubG9jYWw6XHJcbiAgICAgICAgICAgICAgICBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgU1RPUkFHRS5zZXNzaW9uOlxyXG4gICAgICAgICAgICAgICAgc3RvcmFnZSA9IHNlc3Npb25TdG9yYWdlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignaW52YWxpZCBzdG9yYWdlIHR5cGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0b3JhZ2U7XHJcbiAgICB9O1xyXG4gICAgV2ViU3RvcmFnZUhlbHBlci5pc1N0b3JhZ2VBdmFpbGFibGUgPSBmdW5jdGlvbiAoc1R5cGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIFNUT1JBR0VfQVZBSUxBQklMSVRZW3NUeXBlXSA9PT0gJ2Jvb2xlYW4nKVxyXG4gICAgICAgICAgICByZXR1cm4gU1RPUkFHRV9BVkFJTEFCSUxJVFlbc1R5cGVdO1xyXG4gICAgICAgIHZhciBpc0F2YWlsYWJsZSA9IHRydWUsIHN0b3JhZ2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgc3RvcmFnZSA9IHRoaXMuZ2V0V1N0b3JhZ2Uoc1R5cGUpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHN0b3JhZ2UgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICBzdG9yYWdlLnNldEl0ZW0oJ3Rlc3Qtc3RvcmFnZScsICdmb29iYXInKTtcclxuICAgICAgICAgICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbSgndGVzdC1zdG9yYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgaXNBdmFpbGFibGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaXNBdmFpbGFibGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpc0F2YWlsYWJsZSlcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFNUT1JBR0VfTkFNRVNbc1R5cGVdICsgXCIgc3RvcmFnZSB1bmF2YWlsYWJsZSwgTmcyV2Vic3RvcmFnZSB3aWxsIHVzZSBhIGZhbGxiYWNrIHN0cmF0ZWd5IGluc3RlYWRcIik7XHJcbiAgICAgICAgcmV0dXJuIFNUT1JBR0VfQVZBSUxBQklMSVRZW3NUeXBlXSA9IGlzQXZhaWxhYmxlO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBXZWJTdG9yYWdlSGVscGVyO1xyXG59KCkpO1xyXG5leHBvcnQgeyBXZWJTdG9yYWdlSGVscGVyIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdlYlN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciwgV2ViU3RvcmFnZUhlbHBlciwgU3RvcmFnZU9ic2VydmVySGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9pbmRleCc7XHJcbnZhciBXZWJTdG9yYWdlU2VydmljZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFdlYlN0b3JhZ2VTZXJ2aWNlKHNUeXBlKSB7XHJcbiAgICAgICAgaWYgKHNUeXBlID09PSB2b2lkIDApIHsgc1R5cGUgPSBudWxsOyB9XHJcbiAgICAgICAgdGhpcy5zVHlwZSA9IHNUeXBlO1xyXG4gICAgICAgIHRoaXMuc1R5cGUgPSBzVHlwZTtcclxuICAgIH1cclxuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5zdG9yZSA9IGZ1bmN0aW9uIChyYXcsIHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShyYXcpO1xyXG4gICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIuc3RvcmUodGhpcy5zVHlwZSwgc0tleSwgdmFsdWUpO1xyXG4gICAgfTtcclxuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5yZXRyaWV2ZSA9IGZ1bmN0aW9uIChyYXcpIHtcclxuICAgICAgICB2YXIgc0tleSA9IEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KHJhdyk7XHJcbiAgICAgICAgcmV0dXJuIFdlYlN0b3JhZ2VIZWxwZXIucmV0cmlldmUodGhpcy5zVHlwZSwgc0tleSk7XHJcbiAgICB9O1xyXG4gICAgV2ViU3RvcmFnZVNlcnZpY2UucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKHJhdykge1xyXG4gICAgICAgIGlmIChyYXcpXHJcbiAgICAgICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIuY2xlYXIodGhpcy5zVHlwZSwgS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkocmF3KSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyQWxsKHRoaXMuc1R5cGUpO1xyXG4gICAgfTtcclxuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5vYnNlcnZlID0gZnVuY3Rpb24gKHJhdykge1xyXG4gICAgICAgIHZhciBzS2V5ID0gS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkocmF3KTtcclxuICAgICAgICByZXR1cm4gU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmUodGhpcy5zVHlwZSwgc0tleSk7XHJcbiAgICB9O1xyXG4gICAgV2ViU3RvcmFnZVNlcnZpY2UucHJvdG90eXBlLmlzU3RvcmFnZUF2YWlsYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gV2ViU3RvcmFnZUhlbHBlci5pc1N0b3JhZ2VBdmFpbGFibGUodGhpcy5zVHlwZSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFdlYlN0b3JhZ2VTZXJ2aWNlO1xyXG59KCkpO1xyXG5leHBvcnQgeyBXZWJTdG9yYWdlU2VydmljZSB9O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWJTdG9yYWdlLmpzLm1hcCIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbnZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn07XHJcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xyXG59O1xyXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcclxuaW1wb3J0IHsgV2ViU3RvcmFnZVNlcnZpY2UgfSBmcm9tICcuL3dlYlN0b3JhZ2UnO1xyXG52YXIgTG9jYWxTdG9yYWdlU2VydmljZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhMb2NhbFN0b3JhZ2VTZXJ2aWNlLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gTG9jYWxTdG9yYWdlU2VydmljZSgpIHtcclxuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgU1RPUkFHRS5sb2NhbCkgfHwgdGhpcztcclxuICAgIH1cclxuICAgIExvY2FsU3RvcmFnZVNlcnZpY2UgPSBfX2RlY29yYXRlKFtcclxuICAgICAgICBJbmplY3RhYmxlKCksXHJcbiAgICAgICAgX19tZXRhZGF0YShcImRlc2lnbjpwYXJhbXR5cGVzXCIsIFtdKVxyXG4gICAgXSwgTG9jYWxTdG9yYWdlU2VydmljZSk7XHJcbiAgICByZXR1cm4gTG9jYWxTdG9yYWdlU2VydmljZTtcclxufShXZWJTdG9yYWdlU2VydmljZSkpO1xyXG5leHBvcnQgeyBMb2NhbFN0b3JhZ2VTZXJ2aWNlIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvY2FsU3RvcmFnZS5qcy5tYXAiLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG52YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59O1xyXG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcclxufTtcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XHJcbmltcG9ydCB7IFdlYlN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi93ZWJTdG9yYWdlJztcclxudmFyIFNlc3Npb25TdG9yYWdlU2VydmljZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhTZXNzaW9uU3RvcmFnZVNlcnZpY2UsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBTZXNzaW9uU3RvcmFnZVNlcnZpY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9zdXBlci5jYWxsKHRoaXMsIFNUT1JBR0Uuc2Vzc2lvbikgfHwgdGhpcztcclxuICAgIH1cclxuICAgIFNlc3Npb25TdG9yYWdlU2VydmljZSA9IF9fZGVjb3JhdGUoW1xyXG4gICAgICAgIEluamVjdGFibGUoKSxcclxuICAgICAgICBfX21ldGFkYXRhKFwiZGVzaWduOnBhcmFtdHlwZXNcIiwgW10pXHJcbiAgICBdLCBTZXNzaW9uU3RvcmFnZVNlcnZpY2UpO1xyXG4gICAgcmV0dXJuIFNlc3Npb25TdG9yYWdlU2VydmljZTtcclxufShXZWJTdG9yYWdlU2VydmljZSkpO1xyXG5leHBvcnQgeyBTZXNzaW9uU3RvcmFnZVNlcnZpY2UgfTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2Vzc2lvblN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgTElCX0tFWSwgTElCX0tFWV9DQVNFX1NFTlNJVElWRSwgTElCX0tFWV9TRVBBUkFUT1IgfSBmcm9tICcuLi9jb25zdGFudHMvbGliJztcclxudmFyIFdlYnN0b3JhZ2VDb25maWcgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBXZWJzdG9yYWdlQ29uZmlnKGNvbmZpZykge1xyXG4gICAgICAgIHRoaXMucHJlZml4ID0gTElCX0tFWTtcclxuICAgICAgICB0aGlzLnNlcGFyYXRvciA9IExJQl9LRVlfU0VQQVJBVE9SO1xyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZSA9IExJQl9LRVlfQ0FTRV9TRU5TSVRJVkU7XHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcucHJlZml4ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVmaXggPSBjb25maWcucHJlZml4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5zZXBhcmF0b3IgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlcGFyYXRvciA9IGNvbmZpZy5zZXBhcmF0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmNhc2VTZW5zaXRpdmUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhc2VTZW5zaXRpdmUgPSBjb25maWcuY2FzZVNlbnNpdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gV2Vic3RvcmFnZUNvbmZpZztcclxufSgpKTtcclxuZXhwb3J0IHsgV2Vic3RvcmFnZUNvbmZpZyB9O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25maWcuanMubWFwIiwiaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciwgV2ViU3RvcmFnZUhlbHBlciB9IGZyb20gJy4uL2hlbHBlcnMvaW5kZXgnO1xyXG5pbXBvcnQgeyBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL3N0b3JhZ2VPYnNlcnZlcic7XHJcbmV4cG9ydCBmdW5jdGlvbiBXZWJTdG9yYWdlKHdlYlNLZXksIHNUeXBlLCBkZWZhdWx0VmFsdWUpIHtcclxuICAgIGlmIChkZWZhdWx0VmFsdWUgPT09IHZvaWQgMCkgeyBkZWZhdWx0VmFsdWUgPSBudWxsOyB9XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldGVkQ2xhc3MsIHJhdykge1xyXG4gICAgICAgIFdlYlN0b3JhZ2VEZWNvcmF0b3Iod2ViU0tleSwgc1R5cGUsIHRhcmdldGVkQ2xhc3MsIHJhdywgZGVmYXVsdFZhbHVlKTtcclxuICAgIH07XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIFdlYlN0b3JhZ2VEZWNvcmF0b3Iod2ViU0tleSwgc1R5cGUsIHRhcmdldGVkQ2xhc3MsIHJhdywgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICB2YXIga2V5ID0gd2ViU0tleSB8fCByYXc7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0ZWRDbGFzcywgcmF3LCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBzS2V5ID0gS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkoa2V5KTtcclxuICAgICAgICAgICAgcmV0dXJuIFdlYlN0b3JhZ2VIZWxwZXIucmV0cmlldmUoc1R5cGUsIHNLZXkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShrZXkpO1xyXG4gICAgICAgICAgICB0aGlzW3NLZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIuc3RvcmUoc1R5cGUsIHNLZXksIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGlmICh0YXJnZXRlZENsYXNzW3Jhd10gPT09IG51bGwgJiYgZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB2YXIgc3ViXzEgPSBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuc3RvcmFnZUluaXQkLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRhcmdldGVkQ2xhc3NbcmF3XSA9IGRlZmF1bHRWYWx1ZTtcclxuICAgICAgICAgICAgc3ViXzEudW5zdWJzY3JpYmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWJTdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IFdlYlN0b3JhZ2VEZWNvcmF0b3IgfSBmcm9tICcuL3dlYlN0b3JhZ2UnO1xyXG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XHJcbmV4cG9ydCBmdW5jdGlvbiBMb2NhbFN0b3JhZ2Uod2ViU0tleSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldGVkQ2xhc3MsIHJhdykge1xyXG4gICAgICAgIFdlYlN0b3JhZ2VEZWNvcmF0b3Iod2ViU0tleSwgU1RPUkFHRS5sb2NhbCwgdGFyZ2V0ZWRDbGFzcywgcmF3LCBkZWZhdWx0VmFsdWUpO1xyXG4gICAgfTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1sb2NhbFN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgV2ViU3RvcmFnZURlY29yYXRvciB9IGZyb20gJy4vd2ViU3RvcmFnZSc7XHJcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcclxuZXhwb3J0IGZ1bmN0aW9uIFNlc3Npb25TdG9yYWdlKHdlYlNLZXksIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXRlZENsYXNzLCByYXcpIHtcclxuICAgICAgICBXZWJTdG9yYWdlRGVjb3JhdG9yKHdlYlNLZXksIFNUT1JBR0Uuc2Vzc2lvbiwgdGFyZ2V0ZWRDbGFzcywgcmF3LCBkZWZhdWx0VmFsdWUpO1xyXG4gICAgfTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXNzaW9uU3RvcmFnZS5qcy5tYXAiLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59O1xyXG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcclxufTtcclxudmFyIF9fcGFyYW0gPSAodGhpcyAmJiB0aGlzLl9fcGFyYW0pIHx8IGZ1bmN0aW9uIChwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59O1xyXG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGlvblRva2VuLCBOZ01vZHVsZSwgTmdab25lLCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi9lbnVtcy9zdG9yYWdlJztcclxuaW1wb3J0IHsgTG9jYWxTdG9yYWdlU2VydmljZSwgU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9pbmRleCc7XHJcbmltcG9ydCB7IFdlYlN0b3JhZ2VIZWxwZXIgfSBmcm9tICcuL2hlbHBlcnMvd2ViU3RvcmFnZSc7XHJcbmltcG9ydCB7IFdlYnN0b3JhZ2VDb25maWcgfSBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcclxuaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9IGZyb20gJy4vaGVscGVycy9rZXlTdG9yYWdlJztcclxuaW1wb3J0IHsgU3RvcmFnZU9ic2VydmVySGVscGVyIH0gZnJvbSAnLi9oZWxwZXJzL3N0b3JhZ2VPYnNlcnZlcic7XHJcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJmYWNlcy9pbmRleCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZGVjb3JhdG9ycy9pbmRleCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vc2VydmljZXMvaW5kZXgnO1xyXG5leHBvcnQgdmFyIFdFQlNUT1JBR0VfQ09ORklHID0gbmV3IEluamVjdGlvblRva2VuKCdXRUJTVE9SQUdFX0NPTkZJRycpO1xyXG52YXIgTmcyV2Vic3RvcmFnZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5nMldlYnN0b3JhZ2Uobmdab25lLCBjb25maWcpIHtcclxuICAgICAgICB0aGlzLm5nWm9uZSA9IG5nWm9uZTtcclxuICAgICAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgICAgICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0U3RvcmFnZUtleVByZWZpeChjb25maWcucHJlZml4KTtcclxuICAgICAgICAgICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5U2VwYXJhdG9yKGNvbmZpZy5zZXBhcmF0b3IpO1xyXG4gICAgICAgICAgICBLZXlTdG9yYWdlSGVscGVyLnNldENhc2VTZW5zaXRpdml0eShjb25maWcuY2FzZVNlbnNpdGl2ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5pdFN0b3JhZ2VMaXN0ZW5lcigpO1xyXG4gICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5pbml0U3RvcmFnZSgpO1xyXG4gICAgfVxyXG4gICAgTmcyV2Vic3RvcmFnZV8xID0gTmcyV2Vic3RvcmFnZTtcclxuICAgIE5nMldlYnN0b3JhZ2UuZm9yUm9vdCA9IGZ1bmN0aW9uIChjb25maWcpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuZ01vZHVsZTogTmcyV2Vic3RvcmFnZV8xLFxyXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlOiBXRUJTVE9SQUdFX0NPTkZJRyxcclxuICAgICAgICAgICAgICAgICAgICB1c2VWYWx1ZTogY29uZmlnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IFdlYnN0b3JhZ2VDb25maWcsXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUNvbmZpZyxcclxuICAgICAgICAgICAgICAgICAgICBkZXBzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdFQlNUT1JBR0VfQ09ORklHXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbiAgICBOZzJXZWJzdG9yYWdlLnByb3RvdHlwZS5pbml0U3RvcmFnZUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7IHJldHVybiBfdGhpcy5uZ1pvbmUucnVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdG9yYWdlID0gd2luZG93LnNlc3Npb25TdG9yYWdlID09PSBldmVudC5zdG9yYWdlQXJlYSA/IFNUT1JBR0Uuc2Vzc2lvbiA6IFNUT1JBR0UubG9jYWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIucmVmcmVzaEFsbChzdG9yYWdlKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2goc3RvcmFnZSwgZXZlbnQua2V5KTtcclxuICAgICAgICAgICAgfSk7IH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB2YXIgTmcyV2Vic3RvcmFnZV8xO1xyXG4gICAgTmcyV2Vic3RvcmFnZSA9IE5nMldlYnN0b3JhZ2VfMSA9IF9fZGVjb3JhdGUoW1xyXG4gICAgICAgIE5nTW9kdWxlKHtcclxuICAgICAgICAgICAgZGVjbGFyYXRpb25zOiBbXSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlLCBMb2NhbFN0b3JhZ2VTZXJ2aWNlXSxcclxuICAgICAgICAgICAgaW1wb3J0czogW11cclxuICAgICAgICB9KSxcclxuICAgICAgICBfX3BhcmFtKDEsIE9wdGlvbmFsKCkpLCBfX3BhcmFtKDEsIEluamVjdChXZWJzdG9yYWdlQ29uZmlnKSksXHJcbiAgICAgICAgX19tZXRhZGF0YShcImRlc2lnbjpwYXJhbXR5cGVzXCIsIFtOZ1pvbmUsIFdlYnN0b3JhZ2VDb25maWddKVxyXG4gICAgXSwgTmcyV2Vic3RvcmFnZSk7XHJcbiAgICByZXR1cm4gTmcyV2Vic3RvcmFnZTtcclxufSgpKTtcclxuZXhwb3J0IHsgTmcyV2Vic3RvcmFnZSB9O1xyXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUNvbmZpZyhjb25maWcpIHtcclxuICAgIHJldHVybiBuZXcgV2Vic3RvcmFnZUNvbmZpZyhjb25maWcpO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC5qcy5tYXAiXSwibmFtZXMiOlsiRXZlbnRFbWl0dGVyIiwiX2EiLCJ0aGlzIiwiX19kZWNvcmF0ZSIsIl9fbWV0YWRhdGEiLCJJbmplY3RhYmxlIiwiX19leHRlbmRzIiwiSW5qZWN0aW9uVG9rZW4iLCJOZ01vZHVsZSIsIk9wdGlvbmFsIiwiSW5qZWN0IiwiTmdab25lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBTyxJQUFJLE9BQU8sQ0FBQztBQUNuQixDQUFDLFVBQVUsT0FBTyxFQUFFO0lBQ2hCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0NBQy9DLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLEdB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QyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsSixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDakUsQ0FBQztBQUNGLElBQUksVUFBVSxHQUFHLENBQUNBLFNBQUksSUFBSUEsU0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUMxRCxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLE9BQU8sQ0FBQyxRQUFRLEtBQUssVUFBVSxFQUFFLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDNUcsQ0FBQztBQUNGLElBQUksT0FBTyxHQUFHLENBQUNBLFNBQUksSUFBSUEsU0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFVBQVUsVUFBVSxFQUFFLFNBQVMsRUFBRTtJQUNyRSxPQUFPLFVBQVUsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUU7Q0FDeEUsQ0FBQztBQUNGLEFBQ0EsQUFDQSxBQUNBLEFBQ0EsQUFDQSxBQUNBLEFBQ0EsQUFDQSxBQUNBLEFBQ0EsQUFBTyxJQUFJLGlCQUFpQixHQUFHLElBQUlLLDRCQUFjLENBQUMsbUJBQW1CLENB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
