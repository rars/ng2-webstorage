var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, InjectionToken, NgModule, NgZone, Optional } from '@angular/core';
import { STORAGE } from './enums/storage';
import { LocalStorageService, SessionStorageService } from './services/index';
import { WebStorageHelper } from './helpers/webStorage';
import { WebstorageConfig } from './interfaces/config';
import { KeyStorageHelper } from './helpers/keyStorage';
import { StorageObserverHelper } from './helpers/storageObserver';
export * from './interfaces/index';
export * from './decorators/index';
export * from './services/index';
export var WEBSTORAGE_CONFIG = new InjectionToken('WEBSTORAGE_CONFIG');
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
        NgModule({
            declarations: [],
            providers: [SessionStorageService, LocalStorageService],
            imports: []
        }),
        __param(1, Optional()), __param(1, Inject(WebstorageConfig)),
        __metadata("design:paramtypes", [NgZone, WebstorageConfig])
    ], Ng2Webstorage);
    return Ng2Webstorage;
}());
export { Ng2Webstorage };
export function provideConfig(config) {
    return new WebstorageConfig(config);
}
//# sourceMappingURL=app.js.map