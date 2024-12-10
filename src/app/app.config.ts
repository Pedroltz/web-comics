import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideFirebaseApp(() => initializeApp({"projectId":"comc-reader","appId":"1:721743171403:web:a01c59fa3df94e9e7122ce","storageBucket":"comc-reader.firebasestorage.app","apiKey":"AIzaSyBtaySQ0xD6W7UdFmir9rauSzag0BUa4OY","authDomain":"comc-reader.firebaseapp.com","messagingSenderId":"721743171403","measurementId":"G-NNRTLXKDH4"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase())]
};
