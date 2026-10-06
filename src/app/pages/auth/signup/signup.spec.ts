import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Signup } from './signup';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to a user account with the admin switch disabled', () => {
    const adminSwitch = fixture.nativeElement.querySelector('#admin-role') as HTMLInputElement;

    expect(adminSwitch.checked).toBe(false);
    expect(component.signupForm.controls.role.value).toBe('user');
  });

  it('uses the admin role only while the admin switch is enabled', () => {
    const adminSwitch = fixture.nativeElement.querySelector('#admin-role') as HTMLInputElement;

    adminSwitch.checked = true;
    adminSwitch.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.signupForm.controls.role.value).toBe('admin');

    adminSwitch.checked = false;
    adminSwitch.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.signupForm.controls.role.value).toBe('user');
  });
});
