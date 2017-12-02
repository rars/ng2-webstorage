import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {NgxWebstorage} from '../../libwrapper';

import {App} from './components/app';
import {AppForm} from './components/appForm';
import {AppView} from './components/appView';
import {CommonModule} from '@angular/common';

@NgModule({
	declarations: [App, AppView, AppForm],
	imports: [
		CommonModule,
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		NgxWebstorage.forRoot({
			separator: '.',
			prefix: 'ahah',
			caseSensitive: true
		}),
		//NgxWebstorage
	],
	bootstrap: [App],
})
export class AppModule {
}
