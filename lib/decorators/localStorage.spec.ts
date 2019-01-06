import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { LocalStorage } from './localStorage';
import { LocalStorageService } from '../services/localStorage';
import { StorageObserverHelper } from '../helpers/storageObserver';

@Component({
  selector: 'test',
  template: ``
})
class TestComponent {
  @LocalStorage()
  local_key1 = 'default value';

  @LocalStorage('local_key2')
  key;

  @LocalStorage('local_key3', 'default value')
  default_value_key;
}

describe('decorator:localStorage', () => {
  let component, localS;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent], // declare the test component
      providers: [
        { provide: LocalStorageService, useClass: LocalStorageService }
      ]
    });

    let fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    StorageObserverHelper.initStorage();
    localS = fixture.debugElement.injector.get(LocalStorageService);
  });

  it('should handle the default value', () => {
    expect(component.default_value_key).toEqual('default value');
  });

  it('should override the default value', () => {
    component.default_value_key = 'another value';
    expect(component.default_value_key).toEqual('another value');
  });

  it('should keep the default value', () => {
    expect(component.local_key1).toEqual('default value');
  });

  it('should keep the default value', () => {
    expect(component.local_key1).toEqual('default value');
  });

  it('should update the local_key1 value by the wstorage service', () => {
    let value = 'new value';
    localS.store('local_key1', value);
    expect(component.local_key1).toEqual(value);
  });

  it('should update the local_key1 value by the decorator', () => {
    let value = 'new value';
    component.local_key1 = value;
    expect(localS.retrieve('local_key1')).toEqual(value);
  });

  it('should update the local_key2 value by the wstorage service', () => {
    let value = 'new value';
    localS.store('local_key2', value);
    expect(component.key).toEqual(value);
  });

  it('should update the local_key2 value by the decorator', () => {
    let value = 'new value';
    component.key = value;
    expect(localS.retrieve('local_key2')).toEqual(value);
  });
});
