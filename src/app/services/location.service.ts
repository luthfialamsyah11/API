import { Injectable, inject } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private api = inject(ApiService);

  private watchId: string | null = null;
  private isTracking = false;
  private lastUpdateTime = 0;

  async startTracking() {
    if (this.isTracking) return;
    this.isTracking = true;
    
    try {
      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        async (position, err) => {
          if (err) {
            console.error('GPS watch error:', err);
            return;
          }
          if (position) {
            const now = Date.now();
            // Prevent spamming the API and freezing the UI (ANR) on emulators
            if (now - this.lastUpdateTime < 10000) return;
            this.lastUpdateTime = now;

            try {
              await this.api.updateLocation(
                position.coords.latitude,
                position.coords.longitude
              );
            } catch (apiErr: any) {
              console.error('Failed to update location to API:', apiErr);
              if (apiErr?.status === 401 || apiErr?.status === 403) {
                console.warn('[LocationService] Authorization error, stopping GPS tracking...');
                this.stopTracking();
              }
            }
          }
        }
      );
    } catch (e) {
      console.error('Failed to start GPS tracking:', e);
      this.isTracking = false;
    }
  }

  async getCurrentPosition() {
    return await Geolocation.getCurrentPosition();
  }

  async stopTracking() {
    if (this.watchId !== null) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.isTracking = false;
  }
}
