import { Component, inject } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private platform = inject(Platform);
  private router = inject(Router);
  private location = inject(Location);
  private toastCtrl = inject(ToastController);
  
  private lastTimeBackPress = 0;
  private timePeriodToExit = 2000;

  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Register Android back button / swipe gesture
      this.platform.backButton.subscribeWithPriority(10, async (processNextHandler) => {
        const currentUrl = this.router.url;
        
        // Define root pages where back button should exit the app
        const rootUrls = ['/dashboard', '/login'];
        
        // If current page is a root page
        if (rootUrls.some(url => currentUrl.includes(url)) || currentUrl === '/') {
          if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
            App.exitApp();
          } else {
            const toast = await this.toastCtrl.create({
              message: 'Tekan/Geser kembali sekali lagi untuk keluar',
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();
            this.lastTimeBackPress = new Date().getTime();
          }
        } else {
          // If not a root page, let normal back navigation happen
          this.location.back();
        }
      });
    });
  }
}
