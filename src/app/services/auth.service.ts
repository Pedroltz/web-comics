import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
  User as FirebaseUser
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userState$: Observable<FirebaseUser | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.userState$ = user(this.auth);
  }

  getCurrentUser() {
    return this.userState$;
  }

  async login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async register(email: string, password: string, displayName: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Criar o perfil do usuário após o registro bem-sucedido
      await this.createUserProfile({
        uid: result.user.uid,
        email,
        displayName,
        favoritos: [],
        historico: []
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createUserProfile(user: User) {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    return setDoc(userRef, user);
  }

  async logout() {
    return signOut(this.auth);
  }
}